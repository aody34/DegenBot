'use client';

// DexScreener API for live price data and charts
const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex';

export interface DexPair {
    chainId: string;
    dexId: string;
    url: string;
    pairAddress: string;
    baseToken: {
        address: string;
        name: string;
        symbol: string;
    };
    quoteToken: {
        address: string;
        name: string;
        symbol: string;
    };
    priceNative: string;
    priceUsd: string;
    liquidity: {
        usd: number;
        base: number;
        quote: number;
    };
    fdv: number;
    marketCap: number;
    volume: {
        h24: number;
        h6: number;
        h1: number;
        m5: number;
    };
    priceChange: {
        h24: number;
        h6: number;
        h1: number;
        m5: number;
    };
    txns: {
        h24: { buys: number; sells: number };
        h6: { buys: number; sells: number };
        h1: { buys: number; sells: number };
        m5: { buys: number; sells: number };
    };
}

export interface TokenPairData {
    pairs: DexPair[];
    schemaVersion: string;
}

/**
 * Get token pairs data from DexScreener
 */
export async function getTokenPairs(tokenAddress: string): Promise<DexPair[]> {
    try {
        const response = await fetch(`${DEXSCREENER_API}/tokens/${tokenAddress}`);

        if (!response.ok) {
            console.error('DexScreener API error:', response.status);
            return [];
        }

        const data: TokenPairData = await response.json();
        return data.pairs || [];
    } catch (error) {
        console.error('Error fetching DexScreener data:', error);
        return [];
    }
}

/**
 * Get the best pair (highest liquidity) for a token
 */
export async function getBestPair(tokenAddress: string): Promise<DexPair | null> {
    const pairs = await getTokenPairs(tokenAddress);

    if (pairs.length === 0) return null;

    // Filter for Solana pairs and sort by liquidity
    const solanaPairs = pairs.filter(p => p.chainId === 'solana');

    if (solanaPairs.length === 0) return null;

    // Return the pair with highest liquidity
    return solanaPairs.reduce((best, current) =>
        (current.liquidity?.usd || 0) > (best.liquidity?.usd || 0) ? current : best
    );
}

/**
 * Get current price and 24h change for a token
 */
export async function getTokenPriceData(tokenAddress: string): Promise<{
    price: number;
    priceChange24h: number;
    volume24h: number;
    liquidity: number;
} | null> {
    const pair = await getBestPair(tokenAddress);

    if (!pair) return null;

    return {
        price: parseFloat(pair.priceUsd) || 0,
        priceChange24h: pair.priceChange?.h24 || 0,
        volume24h: pair.volume?.h24 || 0,
        liquidity: pair.liquidity?.usd || 0,
    };
}

/**
 * Check if a token might be a honeypot/rug
 * Returns warning flags
 */
export async function getTokenSafetyCheck(tokenAddress: string): Promise<{
    isLowLiquidity: boolean;
    isNewPair: boolean;
    hasLowVolume: boolean;
    sellToBuyRatio: number;
    warnings: string[];
}> {
    const pairs = await getTokenPairs(tokenAddress);
    const warnings: string[] = [];

    if (pairs.length === 0) {
        return {
            isLowLiquidity: true,
            isNewPair: true,
            hasLowVolume: true,
            sellToBuyRatio: 0,
            warnings: ['Token not found on DexScreener'],
        };
    }

    const pair = pairs.find(p => p.chainId === 'solana') || pairs[0];

    const liquidity = pair.liquidity?.usd || 0;
    const volume24h = pair.volume?.h24 || 0;
    const buyTxns = pair.txns?.h24?.buys || 0;
    const sellTxns = pair.txns?.h24?.sells || 0;

    const isLowLiquidity = liquidity < 10000; // Less than $10k liquidity
    const isNewPair = buyTxns + sellTxns < 50; // Less than 50 transactions
    const hasLowVolume = volume24h < 5000; // Less than $5k volume
    const sellToBuyRatio = buyTxns > 0 ? sellTxns / buyTxns : 0;

    if (isLowLiquidity) warnings.push('Low liquidity (< $10k)');
    if (isNewPair) warnings.push('New pair with low activity');
    if (hasLowVolume) warnings.push('Low 24h volume');
    if (sellToBuyRatio > 2) warnings.push('High sell pressure');
    if (pair.priceChange?.h24 && pair.priceChange.h24 < -50) {
        warnings.push('Price dropped >50% in 24h');
    }

    return {
        isLowLiquidity,
        isNewPair,
        hasLowVolume,
        sellToBuyRatio,
        warnings,
    };
}

/**
 * Search for tokens by name/symbol on DexScreener
 */
export async function searchTokens(query: string): Promise<DexPair[]> {
    try {
        const response = await fetch(`${DEXSCREENER_API}/search/?q=${encodeURIComponent(query)}`);

        if (!response.ok) {
            return [];
        }

        const data = await response.json();

        // Filter for Solana tokens only
        return (data.pairs || []).filter((p: DexPair) => p.chainId === 'solana');
    } catch (error) {
        console.error('Error searching tokens:', error);
        return [];
    }
}
