import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

// Configuration
const HELIUS_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl('mainnet-beta');
const NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'mainnet-beta';

// Create connection instance
let connection: Connection | null = null;

export function getConnection(): Connection {
    if (!connection) {
        connection = new Connection(HELIUS_RPC_URL, {
            commitment: 'confirmed',
            confirmTransactionInitialTimeout: 60000,
        });
    }
    return connection;
}

// Get SOL balance for a wallet
export async function getBalance(walletAddress: string): Promise<number> {
    const conn = getConnection();
    const publicKey = new PublicKey(walletAddress);
    const balance = await conn.getBalance(publicKey);
    return balance / 1e9; // Convert lamports to SOL
}

// Get token accounts for a wallet
export async function getTokenAccounts(walletAddress: string) {
    const conn = getConnection();
    const publicKey = new PublicKey(walletAddress);

    const tokenAccounts = await conn.getParsedTokenAccountsByOwner(publicKey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
    });

    return tokenAccounts.value.map((account) => {
        const parsedInfo = account.account.data.parsed.info;
        return {
            address: account.pubkey.toBase58(),
            mint: parsedInfo.mint,
            amount: parsedInfo.tokenAmount.uiAmount,
            decimals: parsedInfo.tokenAmount.decimals,
        };
    });
}

// Fetch token metadata (simplified - in production use Metaplex)
export async function getTokenMetadata(mintAddress: string) {
    // In production, use Metaplex SDK or Helius DAS API
    // This is a simplified placeholder
    return {
        address: mintAddress,
        name: 'Unknown Token',
        symbol: 'UNKNOWN',
        decimals: 9,
    };
}

// Get recent transactions for a wallet
export async function getRecentTransactions(walletAddress: string, limit: number = 10) {
    const conn = getConnection();
    const publicKey = new PublicKey(walletAddress);

    const signatures = await conn.getSignaturesForAddress(publicKey, { limit });

    return signatures.map((sig) => ({
        signature: sig.signature,
        slot: sig.slot,
        blockTime: sig.blockTime,
        err: sig.err,
        memo: sig.memo,
    }));
}

// Validate Solana address
export function isValidAddress(address: string): boolean {
    try {
        new PublicKey(address);
        return true;
    } catch {
        return false;
    }
}

// Format public key for display
export function formatPublicKey(publicKey: string, chars: number = 4): string {
    return `${publicKey.slice(0, chars)}...${publicKey.slice(-chars)}`;
}

// Get network name
export function getNetworkName(): string {
    switch (NETWORK) {
        case 'mainnet-beta':
            return 'Mainnet';
        case 'devnet':
            return 'Devnet';
        case 'testnet':
            return 'Testnet';
        default:
            return 'Unknown';
    }
}

// Get Solscan URL for a transaction
export function getSolscanTxUrl(signature: string): string {
    const cluster = NETWORK === 'mainnet-beta' ? '' : `?cluster=${NETWORK}`;
    return `https://solscan.io/tx/${signature}${cluster}`;
}

// Get Solscan URL for an address
export function getSolscanAddressUrl(address: string): string {
    const cluster = NETWORK === 'mainnet-beta' ? '' : `?cluster=${NETWORK}`;
    return `https://solscan.io/account/${address}${cluster}`;
}

// Fetch price from DexScreener
export async function fetchTokenPrice(tokenAddress: string): Promise<number | null> {
    try {
        const response = await fetch(
            `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`
        );
        const data = await response.json();

        if (data.pairs && data.pairs.length > 0) {
            // Get the pair with highest liquidity
            const topPair = data.pairs.reduce((prev: any, current: any) => {
                return (prev.liquidity?.usd || 0) > (current.liquidity?.usd || 0) ? prev : current;
            });
            return parseFloat(topPair.priceUsd) || null;
        }

        return null;
    } catch (error) {
        console.error('Error fetching token price:', error);
        return null;
    }
}

// Estimate transaction fee
export async function estimateTransactionFee(): Promise<number> {
    const conn = getConnection();
    const { feeCalculator } = await conn.getRecentBlockhash();
    return feeCalculator.lamportsPerSignature / 1e9; // Return in SOL
}
