/**
 * Copy Trade Execution Engine
 * Handles the flow: Signal → AI Analysis → User Confirmation → Execute via Jupiter/Jito
 * 
 * NON-CUSTODIAL: Users sign transactions with their own wallet
 */

import { Connection, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { getQuote, executeSwap, TOKENS, solToLamports } from './jupiter';
import { sendJitoBundle, createTipInstruction, calculateOptimalTip } from './jito';
import { createServerClient, Database } from '../supabase/client';
import { analyzeToken, getTokenDataFromDexScreener, TokenAnalysis } from '../api/openai';
import { getTokenMetadata } from '../api/helius';

export interface CopyTradeConfig {
    maxSolPerTrade: number;      // Max SOL to spend per trade
    aiScoreThreshold: number;    // Min AI score to proceed (0-100)
    slippageBps: number;         // Slippage tolerance in basis points
    useJito: boolean;            // Use Jito bundles for MEV protection
}

export interface CopyTradeResult {
    success: boolean;
    signalId?: string;
    tradeId?: string;
    txHash?: string;
    bundleId?: string;
    aiScore?: number;
    aiReasoning?: string;
    error?: string;
}

export interface PreparedTrade {
    signalId: string;
    tokenMint: string;
    tokenSymbol: string;
    tokenName: string;
    whaleLabel: string;
    solAmount: number;
    aiScore: number;
    aiReasoning: string;
    riskLevel: string;
    recommendation: string;
    quote: any;
}

const DEFAULT_CONFIG: CopyTradeConfig = {
    maxSolPerTrade: 0.1,       // 0.1 SOL max for safety
    aiScoreThreshold: 80,      // Only trade if AI score >= 80
    slippageBps: 100,          // 1% slippage
    useJito: true,             // Use Jito by default
};

/**
 * Process a whale signal and prepare for user execution
 * This DOES NOT execute - it prepares a trade for the user to confirm
 */
export async function processSignalForCopyTrade(
    signalId: string,
    config: Partial<CopyTradeConfig> = {}
): Promise<{ prepared: PreparedTrade | null; skipped: boolean; reason?: string }> {
    const cfg = { ...DEFAULT_CONFIG, ...config };
    const supabase = createServerClient();

    try {
        // 1. Fetch the signal
        const { data: signal, error: signalError } = await supabase
            .from('signals')
            .select('*, whales(*)')
            .eq('id', signalId)
            .single();

        if (signalError || !signal) {
            return { prepared: null, skipped: true, reason: 'Signal not found' };
        }

        // Only process BUY signals
        if (signal.type !== 'BUY') {
            return { prepared: null, skipped: true, reason: 'Only BUY signals are copy-traded' };
        }

        // 2. Get token data for AI analysis
        const tokenData = await getTokenDataFromDexScreener(signal.token_address);

        // 3. Run AI analysis
        const analysis = await analyzeToken(
            { mintAddress: signal.token_address, ...tokenData },
            signal.whales?.label
        );

        // 4. Update signal with AI score
        await supabase
            .from('signals')
            .update({
                ai_score: analysis.score,
                ai_reasoning: analysis.reasoning,
                status: analysis.score >= cfg.aiScoreThreshold ? 'PENDING' : 'SKIPPED',
            })
            .eq('id', signalId);

        // 5. Check if AI score meets threshold
        if (analysis.score < cfg.aiScoreThreshold) {
            return {
                prepared: null,
                skipped: true,
                reason: `AI score ${analysis.score} below threshold ${cfg.aiScoreThreshold}`,
            };
        }

        // 6. Get Jupiter quote for the trade
        const solAmount = Math.min(cfg.maxSolPerTrade, signal.sol_amount || cfg.maxSolPerTrade);
        const lamports = solToLamports(solAmount);

        const quote = await getQuote(
            TOKENS.SOL,
            signal.token_address,
            lamports,
            cfg.slippageBps
        );

        if (!quote) {
            return { prepared: null, skipped: true, reason: 'Failed to get Jupiter quote' };
        }

        // 7. Return prepared trade for user confirmation
        return {
            prepared: {
                signalId,
                tokenMint: signal.token_address,
                tokenSymbol: signal.token_symbol || tokenData.symbol || '???',
                tokenName: signal.token_name || tokenData.name || 'Unknown',
                whaleLabel: signal.whales?.label || 'Unknown Whale',
                solAmount,
                aiScore: analysis.score,
                aiReasoning: analysis.reasoning,
                riskLevel: analysis.riskLevel,
                recommendation: analysis.recommendation,
                quote,
            },
            skipped: false,
        };
    } catch (error: any) {
        console.error('[CopyTrade] Error processing signal:', error);
        return { prepared: null, skipped: true, reason: error.message };
    }
}

/**
 * Execute a prepared copy trade
 * Called when user confirms the trade - uses their connected wallet
 */
export async function executeCopyTrade(
    connection: Connection,
    wallet: any, // Wallet adapter
    preparedTrade: PreparedTrade,
    userId: string,
    useJito: boolean = true
): Promise<CopyTradeResult> {
    const supabase = createServerClient();

    try {
        // 1. Create trade record in pending state
        const { data: trade, error: insertError } = await supabase
            .from('executed_trades')
            .insert({
                user_id: userId,
                signal_id: preparedTrade.signalId,
                token_address: preparedTrade.tokenMint,
                token_symbol: preparedTrade.tokenSymbol,
                type: 'BUY',
                amount_in_sol: preparedTrade.solAmount,
                entry_price: preparedTrade.quote.priceImpactPct,
                status: 'PENDING',
            })
            .select()
            .single();

        if (insertError || !trade) {
            return { success: false, error: 'Failed to create trade record' };
        }

        // 2. Execute the swap
        const swapResult = await executeSwap(
            connection,
            wallet,
            preparedTrade.quote,
            useJito ? 50000 : 100000 // Higher priority if not using Jito
        );

        // 3. Update trade record with result
        if (swapResult.success) {
            await supabase
                .from('executed_trades')
                .update({
                    tx_hash: swapResult.signature,
                    tokens_received: parseFloat(swapResult.outputAmount || '0'),
                    status: 'SUCCESS',
                })
                .eq('id', trade.id);

            // Update signal status
            await supabase
                .from('signals')
                .update({ status: 'EXECUTED' })
                .eq('id', preparedTrade.signalId);

            return {
                success: true,
                signalId: preparedTrade.signalId,
                tradeId: trade.id,
                txHash: swapResult.signature,
                aiScore: preparedTrade.aiScore,
                aiReasoning: preparedTrade.aiReasoning,
            };
        } else {
            await supabase
                .from('executed_trades')
                .update({
                    status: 'FAILED',
                    error_message: swapResult.error,
                })
                .eq('id', trade.id);

            return {
                success: false,
                signalId: preparedTrade.signalId,
                tradeId: trade.id,
                error: swapResult.error,
            };
        }
    } catch (error: any) {
        console.error('[CopyTrade] Execution error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get all active whales for tracking
 */
export async function getActiveWhales(): Promise<string[]> {
    const supabase = createServerClient();

    const { data: whales } = await supabase
        .from('whales')
        .select('address')
        .eq('is_active', true);

    return whales?.map(w => w.address) || [];
}

/**
 * Get recent signals for display
 */
export async function getRecentSignals(limit: number = 50) {
    const supabase = createServerClient();

    const { data: signals } = await supabase
        .from('signals')
        .select('*, whales(label, win_rate)')
        .order('created_at', { ascending: false })
        .limit(limit);

    return signals || [];
}

/**
 * Get user's trade history
 */
export async function getUserTradeHistory(userId: string, limit: number = 50) {
    const supabase = createServerClient();

    const { data: trades } = await supabase
        .from('executed_trades')
        .select('*, signals(token_symbol, token_name), whales(label)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    return trades || [];
}
