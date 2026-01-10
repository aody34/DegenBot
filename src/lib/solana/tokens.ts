'use client';

import { Connection, PublicKey } from '@solana/web3.js';
import { getTokenPrices, TOKENS } from './jupiter';

// Use proxy API route for token list
const JUPITER_TOKEN_PROXY = '/api/jupiter/tokens';

export interface TokenInfo {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    logoURI?: string;
}

export interface TokenHolding {
    mint: string;
    symbol: string;
    name: string;
    logoURI?: string;
    balance: number;
    decimals: number;
    usdValue: number;
    price: number;
}

// Cache for token metadata
let tokenMetadataCache: Map<string, TokenInfo> = new Map();
let tokenListLoaded = false;

/**
 * Load the Jupiter token list for metadata (via proxy)
 */
export async function loadTokenList(): Promise<void> {
    if (tokenListLoaded) return;

    try {
        console.log('[Tokens] Loading token list via proxy...');
        const response = await fetch(`${JUPITER_TOKEN_PROXY}?strict=true`);

        if (!response.ok) {
            console.error('[Tokens] Failed to load token list:', response.status);
            return;
        }

        const tokens: TokenInfo[] = await response.json();

        for (const token of tokens) {
            tokenMetadataCache.set(token.address, token);
        }

        console.log('[Tokens] Token list loaded:', tokens.length, 'tokens');
        tokenListLoaded = true;
    } catch (error) {
        console.error('[Tokens] Error loading token list:', error);
    }
}

/**
 * Get token metadata by mint address
 */
export function getTokenMetadata(mint: string): TokenInfo | undefined {
    return tokenMetadataCache.get(mint);
}

/**
 * Fetch all SPL token accounts for a wallet
 */
export async function getTokenHoldings(
    connection: Connection,
    walletAddress: string
): Promise<TokenHolding[]> {
    try {
        // Ensure token list is loaded
        await loadTokenList();

        const publicKey = new PublicKey(walletAddress);

        // Get all token accounts
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
            publicKey,
            { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
        );

        const holdings: TokenHolding[] = [];
        const mintAddresses: string[] = [];

        // Parse token accounts
        for (const account of tokenAccounts.value) {
            const parsed = account.account.data.parsed;
            const info = parsed.info;
            const mint = info.mint;
            const balance = info.tokenAmount.uiAmount;
            const decimals = info.tokenAmount.decimals;

            // Skip zero balances
            if (balance === 0) continue;

            // Get token metadata
            const metadata = getTokenMetadata(mint);

            holdings.push({
                mint,
                symbol: metadata?.symbol || 'Unknown',
                name: metadata?.name || 'Unknown Token',
                logoURI: metadata?.logoURI,
                balance,
                decimals,
                usdValue: 0, // Will be updated
                price: 0, // Will be updated
            });

            mintAddresses.push(mint);
        }

        // Fetch prices for all tokens
        if (mintAddresses.length > 0) {
            const prices = await getTokenPrices(mintAddresses);

            for (const holding of holdings) {
                const price = prices[holding.mint] || 0;
                holding.price = price;
                holding.usdValue = holding.balance * price;
            }
        }

        // Sort by USD value descending
        holdings.sort((a, b) => b.usdValue - a.usdValue);

        return holdings;
    } catch (error) {
        console.error('[Tokens] Error fetching token holdings:', error);
        return [];
    }
}

/**
 * Get SOL balance for a wallet
 */
export async function getSolBalance(
    connection: Connection,
    walletAddress: string
): Promise<{ balance: number; usdValue: number }> {
    try {
        const publicKey = new PublicKey(walletAddress);
        const lamports = await connection.getBalance(publicKey);
        const balance = lamports / 1_000_000_000;

        // Get SOL price
        const prices = await getTokenPrices([TOKENS.SOL]);
        const solPrice = prices[TOKENS.SOL] || 0;

        return {
            balance,
            usdValue: balance * solPrice,
        };
    } catch (error) {
        console.error('[Tokens] Error fetching SOL balance:', error);
        return { balance: 0, usdValue: 0 };
    }
}

/**
 * Get total portfolio value
 */
export async function getPortfolioValue(
    connection: Connection,
    walletAddress: string
): Promise<{ total: number; sol: number; tokens: number }> {
    try {
        const [solData, tokenHoldings] = await Promise.all([
            getSolBalance(connection, walletAddress),
            getTokenHoldings(connection, walletAddress),
        ]);

        const tokenTotal = tokenHoldings.reduce((sum, h) => sum + h.usdValue, 0);

        return {
            total: solData.usdValue + tokenTotal,
            sol: solData.usdValue,
            tokens: tokenTotal,
        };
    } catch (error) {
        console.error('[Tokens] Error calculating portfolio value:', error);
        return { total: 0, sol: 0, tokens: 0 };
    }
}

/**
 * Search for a token by address and get its info (via proxy)
 */
export async function searchToken(mintAddress: string): Promise<TokenInfo | null> {
    try {
        await loadTokenList();

        // Check cache first
        const cached = tokenMetadataCache.get(mintAddress);
        if (cached) return cached;

        console.log('[Tokens] Searching for token via proxy:', mintAddress);

        // Try to fetch from Jupiter API via proxy
        const response = await fetch(`${JUPITER_TOKEN_PROXY}?address=${mintAddress}`);
        if (response.ok) {
            const token = await response.json();
            if (token && !token.error) {
                tokenMetadataCache.set(mintAddress, token);
                return token;
            }
        }

        return null;
    } catch (error) {
        console.error('[Tokens] Error searching token:', error);
        return null;
    }
}
