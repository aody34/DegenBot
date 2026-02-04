/**
 * Helius API Client for DegenBot Copy Trading
 * Handles webhook subscriptions and transaction parsing
 */

const HELIUS_API_URL = 'https://api.helius.xyz/v0';

export interface HeliusWebhookPayload {
    webhookId: string;
    txnSignature: string;
    timestamp: number;
    type: string;
    events: HeliusTransactionEvent[];
}

export interface HeliusTransactionEvent {
    type: 'SWAP' | 'TRANSFER' | 'NFT_SALE' | 'COMPRESSED_NFT_MINT' | string;
    source: string;
    fee: number;
    feePayer: string;
    signature: string;
    slot: number;
    timestamp: number;
    tokenTransfers: TokenTransfer[];
    nativeTransfers: NativeTransfer[];
    accountData: AccountData[];
    description: string;
}

export interface TokenTransfer {
    fromTokenAccount: string;
    toTokenAccount: string;
    fromUserAccount: string;
    toUserAccount: string;
    tokenAmount: number;
    mint: string;
    tokenStandard: string;
}

export interface NativeTransfer {
    fromUserAccount: string;
    toUserAccount: string;
    amount: number;
}

export interface AccountData {
    account: string;
    nativeBalanceChange: number;
    tokenBalanceChanges: TokenBalanceChange[];
}

export interface TokenBalanceChange {
    userAccount: string;
    tokenAccount: string;
    mint: string;
    rawTokenAmount: {
        tokenAmount: string;
        decimals: number;
    };
}

export interface ParsedSwap {
    type: 'BUY' | 'SELL';
    walletAddress: string;
    tokenMint: string;
    tokenSymbol?: string;
    solAmount: number;
    tokenAmount: number;
    txHash: string;
    timestamp: number;
}

/**
 * Parse a Helius webhook event to extract swap details
 */
export function parseSwapEvent(event: HeliusTransactionEvent, trackedWallets: string[]): ParsedSwap | null {
    // Check if this is a swap event
    if (event.type !== 'SWAP') {
        return null;
    }

    // Find if any tracked wallet is involved
    const walletAddress = trackedWallets.find(wallet =>
        event.feePayer === wallet ||
        event.nativeTransfers.some(t => t.fromUserAccount === wallet || t.toUserAccount === wallet) ||
        event.tokenTransfers.some(t => t.fromUserAccount === wallet || t.toUserAccount === wallet)
    );

    if (!walletAddress) {
        return null;
    }

    // Determine if it's a BUY or SELL based on SOL flow
    const solTransfer = event.nativeTransfers.find(t =>
        t.fromUserAccount === walletAddress || t.toUserAccount === walletAddress
    );

    // Find token transfer
    const tokenTransfer = event.tokenTransfers.find(t =>
        t.fromUserAccount === walletAddress || t.toUserAccount === walletAddress
    );

    if (!tokenTransfer) {
        return null;
    }

    const isBuy = tokenTransfer.toUserAccount === walletAddress;
    const solAmount = solTransfer ? solTransfer.amount / 1e9 : 0;

    return {
        type: isBuy ? 'BUY' : 'SELL',
        walletAddress,
        tokenMint: tokenTransfer.mint,
        solAmount: Math.abs(solAmount),
        tokenAmount: tokenTransfer.tokenAmount,
        txHash: event.signature,
        timestamp: event.timestamp,
    };
}

/**
 * Create a webhook subscription for tracking whale wallets
 */
export async function createWebhookSubscription(
    apiKey: string,
    walletAddresses: string[],
    webhookUrl: string
): Promise<{ webhookId: string } | null> {
    try {
        const response = await fetch(`${HELIUS_API_URL}/webhooks?api-key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                webhookURL: webhookUrl,
                transactionTypes: ['SWAP'],
                accountAddresses: walletAddresses,
                webhookType: 'enhanced',
                txnStatus: 'success',
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('[Helius] Failed to create webhook:', error);
            return null;
        }

        const data = await response.json();
        return { webhookId: data.webhookID };
    } catch (error) {
        console.error('[Helius] Error creating webhook:', error);
        return null;
    }
}

/**
 * Update an existing webhook subscription
 */
export async function updateWebhookSubscription(
    apiKey: string,
    webhookId: string,
    walletAddresses: string[]
): Promise<boolean> {
    try {
        const response = await fetch(`${HELIUS_API_URL}/webhooks/${webhookId}?api-key=${apiKey}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                accountAddresses: walletAddresses,
            }),
        });

        return response.ok;
    } catch (error) {
        console.error('[Helius] Error updating webhook:', error);
        return false;
    }
}

/**
 * Delete a webhook subscription
 */
export async function deleteWebhookSubscription(
    apiKey: string,
    webhookId: string
): Promise<boolean> {
    try {
        const response = await fetch(`${HELIUS_API_URL}/webhooks/${webhookId}?api-key=${apiKey}`, {
            method: 'DELETE',
        });

        return response.ok;
    } catch (error) {
        console.error('[Helius] Error deleting webhook:', error);
        return false;
    }
}

/**
 * Get token metadata from Helius
 */
export async function getTokenMetadata(
    apiKey: string,
    mintAddress: string
): Promise<{ name: string; symbol: string; image?: string } | null> {
    try {
        const response = await fetch(`${HELIUS_API_URL}/token-metadata?api-key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mintAccounts: [mintAddress],
                includeOffChain: true,
            }),
        });

        if (!response.ok) return null;

        const data = await response.json();
        const metadata = data[0];

        return {
            name: metadata?.onChainMetadata?.metadata?.name || metadata?.offChainMetadata?.metadata?.name || 'Unknown',
            symbol: metadata?.onChainMetadata?.metadata?.symbol || metadata?.offChainMetadata?.metadata?.symbol || '???',
            image: metadata?.offChainMetadata?.metadata?.image,
        };
    } catch (error) {
        console.error('[Helius] Error fetching token metadata:', error);
        return null;
    }
}

/**
 * Verify Helius webhook signature
 */
export function verifyHeliusSignature(
    payload: string,
    signature: string | null,
    webhookId: string
): boolean {
    // Helius uses the webhook ID as part of verification
    // In production, implement HMAC verification if Helius provides a secret
    if (!signature) return false;

    // For now, basic check - enhance based on Helius docs
    return true;
}
