/**
 * Trading API - Execute Copy Trades
 * Called when user clicks "Copy Trade" button on a signal
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Connection, PublicKey } from '@solana/web3.js';
import { getQuote, TOKENS, solToLamports } from '@/lib/solana/jupiter';

// Create Supabase admin client
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createClient(url, key);
}

export async function POST(request: NextRequest) {
    const supabase = getSupabaseAdmin();

    try {
        const { signalId, walletAddress, amount } = await request.json();

        if (!signalId || !walletAddress) {
            return NextResponse.json(
                { error: 'Missing signalId or walletAddress' },
                { status: 400 }
            );
        }

        // 1. Get the signal
        const { data: signal, error: signalError } = await supabase
            .from('signals')
            .select('*, whales(label)')
            .eq('id', signalId)
            .single();

        if (signalError || !signal) {
            return NextResponse.json(
                { error: 'Signal not found' },
                { status: 404 }
            );
        }

        // Check if already executed
        if (signal.status === 'EXECUTED') {
            return NextResponse.json(
                { error: 'Signal already executed' },
                { status: 400 }
            );
        }

        // 2. Get user profile
        const { data: profiles } = await supabase
            .from('profiles')
            .select('*')
            .eq('wallet_address', walletAddress)
            .limit(1);

        const profile = profiles?.[0];
        const maxSol = amount || profile?.sol_balance_limit || parseFloat(process.env.MAX_BUY_SOL || '0.1');
        const slippageBps = profile?.max_slippage_bps || parseInt(process.env.DEFAULT_SLIPPAGE_BPS || '100');

        // 3. Get Jupiter quote
        const solAmount = Math.min(maxSol, signal.sol_amount || maxSol);
        const lamports = solToLamports(solAmount);

        const quote = await getQuote(
            TOKENS.SOL,
            signal.token_address,
            lamports,
            slippageBps
        );

        if (!quote) {
            return NextResponse.json(
                { error: 'Failed to get swap quote from Jupiter' },
                { status: 500 }
            );
        }

        // 4. Return quote for client-side execution
        // The actual swap will be signed by the user's wallet on the frontend
        return NextResponse.json({
            success: true,
            signal: {
                id: signal.id,
                tokenAddress: signal.token_address,
                tokenSymbol: signal.token_symbol,
                whaleLabel: signal.whales?.label,
                aiScore: signal.ai_score,
            },
            trade: {
                solAmount,
                expectedTokens: quote.outAmount,
                priceImpact: quote.priceImpactPct,
                slippageBps,
            },
            quote,
            message: 'Quote ready. Complete transaction on frontend with wallet signing.',
        });
    } catch (error: any) {
        console.error('[Trading API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to prepare trade', message: error.message },
            { status: 500 }
        );
    }
}

// Record executed trade
export async function PUT(request: NextRequest) {
    const supabase = getSupabaseAdmin();

    try {
        const { signalId, userId, txHash, tokensReceived, entryPrice, status } = await request.json();

        // Update signal status
        await supabase
            .from('signals')
            .update({ status: status === 'SUCCESS' ? 'EXECUTED' : 'FAILED' })
            .eq('id', signalId);

        // Get signal info
        const { data: signal } = await supabase
            .from('signals')
            .select('*')
            .eq('id', signalId)
            .single();

        // Record the executed trade
        const { data: trade, error } = await supabase
            .from('executed_trades')
            .insert({
                user_id: userId,
                signal_id: signalId,
                whale_id: signal?.whale_id,
                token_address: signal?.token_address,
                token_symbol: signal?.token_symbol,
                type: 'BUY',
                amount_in_sol: signal?.sol_amount,
                tokens_received: tokensReceived,
                entry_price: entryPrice,
                tx_hash: txHash,
                status,
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: 'Failed to record trade' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            tradeId: trade?.id,
            txHash,
        });
    } catch (error: any) {
        console.error('[Trading API] Error recording trade:', error);
        return NextResponse.json(
            { error: 'Failed to record trade', message: error.message },
            { status: 500 }
        );
    }
}
