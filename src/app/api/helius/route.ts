/**
 * Helius Webhook Handler for DegenBot Copy Trading
 * Receives whale swap events and processes them for copy trading
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parseSwapEvent, HeliusTransactionEvent, getTokenMetadata } from '@/lib/api/helius';
import { getTokenDataFromDexScreener, analyzeToken } from '@/lib/api/openai';

// Create Supabase client with service role for server-side operations
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createClient(url, key);
}

interface HeliusWebhookPayload {
    webhookId: string;
    type: string;
    timestamp: number;
    // Enhanced transaction format
    signature?: string;
    feePayer?: string;
    slot?: number;
    nativeTransfers?: Array<{
        fromUserAccount: string;
        toUserAccount: string;
        amount: number;
    }>;
    tokenTransfers?: Array<{
        fromUserAccount: string;
        toUserAccount: string;
        mint: string;
        tokenAmount: number;
    }>;
    // Or array format
    events?: HeliusTransactionEvent[];
}

export async function POST(request: NextRequest) {
    const supabase = getSupabaseAdmin();

    try {
        const payload: HeliusWebhookPayload[] | HeliusWebhookPayload = await request.json();
        const events = Array.isArray(payload) ? payload : [payload];

        console.log(`[Helius Webhook] Received ${events.length} event(s)`);

        // Get all active whale addresses
        const { data: whales } = await supabase
            .from('whales')
            .select('id, address, label')
            .eq('is_active', true);

        if (!whales || whales.length === 0) {
            return NextResponse.json({ message: 'No active whales to track' });
        }

        const whaleAddresses = whales.map(w => w.address);
        const whaleMap = new Map(whales.map(w => [w.address, w]));
        const processedSignals: string[] = [];

        for (const event of events) {
            // Handle enhanced transaction format
            if (event.type === 'SWAP' || event.tokenTransfers?.length) {
                const txEvent = event as HeliusTransactionEvent;
                const parsedSwap = parseSwapEvent(txEvent, whaleAddresses);

                if (parsedSwap) {
                    const whale = whaleMap.get(parsedSwap.walletAddress);
                    if (!whale) continue;

                    // Check if we already processed this tx
                    const { data: existing } = await supabase
                        .from('signals')
                        .select('id')
                        .eq('tx_hash', parsedSwap.txHash)
                        .single();

                    if (existing) {
                        console.log(`[Helius] Skipping duplicate tx: ${parsedSwap.txHash}`);
                        continue;
                    }

                    // Get token metadata
                    const heliusApiKey = process.env.HELIUS_API_KEY;
                    let tokenName = parsedSwap.tokenSymbol;
                    let tokenSymbol = parsedSwap.tokenSymbol;

                    if (heliusApiKey) {
                        const metadata = await getTokenMetadata(heliusApiKey, parsedSwap.tokenMint);
                        if (metadata) {
                            tokenName = metadata.name;
                            tokenSymbol = metadata.symbol;
                        }
                    }

                    // Get token data for AI analysis
                    const tokenData = await getTokenDataFromDexScreener(parsedSwap.tokenMint);

                    // Run AI analysis
                    const analysis = await analyzeToken(
                        { mintAddress: parsedSwap.tokenMint, ...tokenData },
                        whale.label
                    );

                    // Insert signal into database
                    const { data: signal, error } = await supabase
                        .from('signals')
                        .insert({
                            whale_id: whale.id,
                            token_address: parsedSwap.tokenMint,
                            token_name: tokenName || tokenData.name,
                            token_symbol: tokenSymbol || tokenData.symbol,
                            type: parsedSwap.type,
                            sol_amount: parsedSwap.solAmount,
                            token_amount: parsedSwap.tokenAmount,
                            price_usd: tokenData.priceUsd,
                            ai_score: analysis.score,
                            ai_reasoning: analysis.reasoning,
                            tx_hash: parsedSwap.txHash,
                            status: analysis.score >= 80 ? 'PENDING' : 'SKIPPED',
                        })
                        .select()
                        .single();

                    if (error) {
                        console.error('[Helius] Error inserting signal:', error);
                    } else if (signal) {
                        processedSignals.push(signal.id);
                        console.log(`[Helius] New signal: ${whale.label} ${parsedSwap.type} ${tokenSymbol || parsedSwap.tokenMint.slice(0, 8)} | AI Score: ${analysis.score}`);
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            processed: processedSignals.length,
            signalIds: processedSignals,
        });
    } catch (error: any) {
        console.error('[Helius Webhook] Error:', error);
        return NextResponse.json(
            { error: 'Failed to process webhook', message: error.message },
            { status: 500 }
        );
    }
}

// Health check endpoint
export async function GET() {
    return NextResponse.json({
        status: 'healthy',
        service: 'Helius Webhook Handler',
        timestamp: new Date().toISOString(),
    });
}
