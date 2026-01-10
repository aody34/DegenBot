'use client';

import { Connection, PublicKey, VersionedTransaction, TransactionMessage } from '@solana/web3.js';

// Jito endpoints
const JITO_BLOCK_ENGINE = 'https://mainnet.block-engine.jito.wtf/api/v1/bundles';
const JITO_TIP_ACCOUNTS = [
    '96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5',
    'HFqU5x63VTqvQss8hp11i4bVmkdzGkT7dTFkbpPfjMgf',
    'Cw8CFyM9FkoMi7K7Crf6HNQq4btSkzkXdVVcntPdoS4',
    'ADaUMid9yfUytqMBgopwjb2DTLSLdwLymSpfJbWD33',
    'DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL',
    '3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT',
];

export interface JitoBundleResult {
    success: boolean;
    bundleId?: string;
    error?: string;
}

/**
 * Get a random Jito tip account
 */
export function getRandomTipAccount(): PublicKey {
    const randomIndex = Math.floor(Math.random() * JITO_TIP_ACCOUNTS.length);
    return new PublicKey(JITO_TIP_ACCOUNTS[randomIndex]);
}

/**
 * Add a tip instruction to a transaction for Jito
 */
export function createTipInstruction(
    fromPubkey: PublicKey,
    tipLamports: number = 10000 // 0.00001 SOL default tip
): any {
    const tipAccount = getRandomTipAccount();

    // Create a simple transfer instruction for the tip
    return {
        programId: new PublicKey('11111111111111111111111111111111'),
        keys: [
            { pubkey: fromPubkey, isSigner: true, isWritable: true },
            { pubkey: tipAccount, isSigner: false, isWritable: true },
        ],
        data: Buffer.from([
            2, 0, 0, 0, // Transfer instruction
            ...Array.from(new Uint8Array(new BigUint64Array([BigInt(tipLamports)]).buffer)),
        ]),
    };
}

/**
 * Send a bundle to Jito Block Engine
 */
export async function sendJitoBundle(
    transactions: VersionedTransaction[]
): Promise<JitoBundleResult> {
    try {
        // Serialize transactions to base64
        const serializedTxs = transactions.map(tx =>
            Buffer.from(tx.serialize()).toString('base64')
        );

        const response = await fetch(JITO_BLOCK_ENGINE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'sendBundle',
                params: [serializedTxs],
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            return { success: false, error: `Jito API error: ${error}` };
        }

        const result = await response.json();

        if (result.error) {
            return { success: false, error: result.error.message };
        }

        return {
            success: true,
            bundleId: result.result,
        };
    } catch (error: any) {
        console.error('Jito bundle error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get bundle status from Jito
 */
export async function getJitoBundleStatus(bundleId: string): Promise<{
    status: 'pending' | 'landed' | 'failed';
    slot?: number;
}> {
    try {
        const response = await fetch(JITO_BLOCK_ENGINE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getBundleStatuses',
                params: [[bundleId]],
            }),
        });

        const result = await response.json();

        if (result.error || !result.result?.value?.[0]) {
            return { status: 'pending' };
        }

        const bundleStatus = result.result.value[0];

        if (bundleStatus.confirmation_status === 'confirmed' ||
            bundleStatus.confirmation_status === 'finalized') {
            return { status: 'landed', slot: bundleStatus.slot };
        }

        if (bundleStatus.err) {
            return { status: 'failed' };
        }

        return { status: 'pending' };
    } catch (error) {
        console.error('Error getting bundle status:', error);
        return { status: 'pending' };
    }
}

/**
 * Wait for bundle to land with timeout
 */
export async function waitForBundleLanding(
    bundleId: string,
    timeoutMs: number = 60000
): Promise<{ landed: boolean; slot?: number }> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
        const status = await getJitoBundleStatus(bundleId);

        if (status.status === 'landed') {
            return { landed: true, slot: status.slot };
        }

        if (status.status === 'failed') {
            return { landed: false };
        }

        // Wait 2 seconds before checking again
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return { landed: false };
}

/**
 * Calculate optimal tip based on network conditions
 */
export async function calculateOptimalTip(
    connection: Connection,
    priorityLevel: 'low' | 'medium' | 'high' = 'medium'
): Promise<number> {
    try {
        // Get recent prioritization fees
        const recentFees = await connection.getRecentPrioritizationFees();

        if (recentFees.length === 0) {
            // Default tips if no data
            const defaults = { low: 5000, medium: 10000, high: 50000 };
            return defaults[priorityLevel];
        }

        // Calculate percentiles
        const fees = recentFees.map(f => f.prioritizationFee).sort((a, b) => a - b);

        const percentileIndex = {
            low: Math.floor(fees.length * 0.25),
            medium: Math.floor(fees.length * 0.5),
            high: Math.floor(fees.length * 0.75),
        };

        // Use at least 5000 lamports (0.000005 SOL)
        return Math.max(fees[percentileIndex[priorityLevel]] || 10000, 5000);
    } catch (error) {
        console.error('Error calculating optimal tip:', error);
        return 10000; // Default 0.00001 SOL
    }
}

/**
 * Configuration for MEV protection
 */
export const MEV_PROTECTION_CONFIG = {
    enabled: true,
    defaultTipLamports: 10000, // 0.00001 SOL
    maxTipLamports: 100000, // 0.0001 SOL
    bundleTimeout: 60000, // 60 seconds
};
