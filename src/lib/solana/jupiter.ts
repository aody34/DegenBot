'use client';

import { Connection, PublicKey, VersionedTransaction } from '@solana/web3.js';

// Jupiter API endpoints
const JUPITER_QUOTE_API = 'https://quote-api.jup.ag/v6/quote';
const JUPITER_SWAP_API = 'https://quote-api.jup.ag/v6/swap';
const JUPITER_PRICE_API = 'https://price.jup.ag/v6/price';

// Common token addresses
export const TOKENS = {
    SOL: 'So11111111111111111111111111111111111111112',
    USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
};

export interface QuoteResponse {
    inputMint: string;
    inAmount: string;
    outputMint: string;
    outAmount: string;
    otherAmountThreshold: string;
    swapMode: string;
    slippageBps: number;
    priceImpactPct: string;
    routePlan: any[];
}

export interface SwapResult {
    success: boolean;
    signature?: string;
    error?: string;
    inputAmount?: string;
    outputAmount?: string;
}

/**
 * Get a swap quote from Jupiter
 */
export async function getQuote(
    inputMint: string,
    outputMint: string,
    amount: number, // in lamports or smallest unit
    slippageBps: number = 100 // 1% default
): Promise<QuoteResponse | null> {
    try {
        const params = new URLSearchParams({
            inputMint,
            outputMint,
            amount: amount.toString(),
            slippageBps: slippageBps.toString(),
            onlyDirectRoutes: 'false',
            asLegacyTransaction: 'false',
        });

        const response = await fetch(`${JUPITER_QUOTE_API}?${params}`);

        if (!response.ok) {
            console.error('Quote API error:', response.status);
            return null;
        }

        const quote = await response.json();
        return quote;
    } catch (error) {
        console.error('Error fetching quote:', error);
        return null;
    }
}

/**
 * Execute a swap using Jupiter
 */
export async function executeSwap(
    connection: Connection,
    wallet: any, // WalletContextState from @solana/wallet-adapter-react
    quote: QuoteResponse,
    priorityFeeLamports: number = 100000 // 0.0001 SOL default priority fee
): Promise<SwapResult> {
    try {
        if (!wallet.publicKey || !wallet.signTransaction) {
            return { success: false, error: 'Wallet not connected' };
        }

        // Get swap transaction from Jupiter
        const swapResponse = await fetch(JUPITER_SWAP_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                quoteResponse: quote,
                userPublicKey: wallet.publicKey.toBase58(),
                wrapAndUnwrapSol: true,
                dynamicComputeUnitLimit: true,
                prioritizationFeeLamports: priorityFeeLamports,
            }),
        });

        if (!swapResponse.ok) {
            const error = await swapResponse.text();
            return { success: false, error: `Swap API error: ${error}` };
        }

        const { swapTransaction } = await swapResponse.json();

        // Deserialize the transaction
        const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
        const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

        // Get latest blockhash
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');

        // Sign the transaction
        const signedTransaction = await wallet.signTransaction(transaction);

        // Send the transaction
        const rawTransaction = signedTransaction.serialize();
        const signature = await connection.sendRawTransaction(rawTransaction, {
            skipPreflight: true,
            maxRetries: 3,
        });

        // Confirm the transaction
        const confirmation = await connection.confirmTransaction({
            signature,
            blockhash,
            lastValidBlockHeight,
        }, 'confirmed');

        if (confirmation.value.err) {
            return { success: false, error: 'Transaction failed', signature };
        }

        return {
            success: true,
            signature,
            inputAmount: quote.inAmount,
            outputAmount: quote.outAmount,
        };
    } catch (error: any) {
        console.error('Swap execution error:', error);
        return { success: false, error: error.message || 'Unknown error' };
    }
}

/**
 * Get token price in USD from Jupiter
 */
export async function getTokenPrice(tokenMint: string): Promise<number | null> {
    try {
        const response = await fetch(`${JUPITER_PRICE_API}?ids=${tokenMint}`);

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data.data?.[tokenMint]?.price || null;
    } catch (error) {
        console.error('Error fetching price:', error);
        return null;
    }
}

/**
 * Get multiple token prices at once
 */
export async function getTokenPrices(tokenMints: string[]): Promise<Record<string, number>> {
    try {
        const ids = tokenMints.join(',');
        const response = await fetch(`${JUPITER_PRICE_API}?ids=${ids}`);

        if (!response.ok) {
            return {};
        }

        const data = await response.json();
        const prices: Record<string, number> = {};

        for (const mint of tokenMints) {
            if (data.data?.[mint]?.price) {
                prices[mint] = data.data[mint].price;
            }
        }

        return prices;
    } catch (error) {
        console.error('Error fetching prices:', error);
        return {};
    }
}

/**
 * Convert SOL to lamports
 */
export function solToLamports(sol: number): number {
    return Math.floor(sol * 1_000_000_000);
}

/**
 * Convert lamports to SOL
 */
export function lamportsToSol(lamports: number): number {
    return lamports / 1_000_000_000;
}

/**
 * Format token amount based on decimals
 */
export function formatTokenAmount(amount: string | number, decimals: number): number {
    const amountNum = typeof amount === 'string' ? parseInt(amount) : amount;
    return amountNum / Math.pow(10, decimals);
}
