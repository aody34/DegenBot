'use client';

import { Connection, PublicKey } from '@solana/web3.js';
import { getQuote, executeSwap, getTokenPrice, TOKENS, solToLamports } from './jupiter';
import { getTokenPriceData } from '../api/dexscreener';

export interface TakeProfitOrder {
    id: string;
    tokenMint: string;
    tokenSymbol: string;
    entryPrice: number;
    targetPrice: number;
    targetPercentage: number;
    sellPercentage: number; // What % of holdings to sell
    amount: number; // Token amount to sell
    status: 'pending' | 'triggered' | 'executed' | 'failed' | 'cancelled';
    createdAt: number;
    triggeredAt?: number;
    executedAt?: number;
    txSignature?: string;
    error?: string;
}

export interface TradeHistory {
    id: string;
    type: 'buy' | 'sell';
    tokenMint: string;
    tokenSymbol: string;
    amount: number;
    price: number;
    totalValue: number;
    txSignature: string;
    timestamp: number;
    isTakeProfitOrder: boolean;
}

// LocalStorage keys
const TP_ORDERS_KEY = 'degenbot_tp_orders';
const TRADE_HISTORY_KEY = 'degenbot_trade_history';
const ENTRY_PRICES_KEY = 'degenbot_entry_prices';

/**
 * Save take-profit orders to localStorage
 */
export function saveTakeProfitOrders(orders: TakeProfitOrder[]): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem(TP_ORDERS_KEY, JSON.stringify(orders));
    }
}

/**
 * Load take-profit orders from localStorage
 */
export function loadTakeProfitOrders(): TakeProfitOrder[] {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(TP_ORDERS_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    }
    return [];
}

/**
 * Save trade history
 */
export function saveTradeHistory(trades: TradeHistory[]): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem(TRADE_HISTORY_KEY, JSON.stringify(trades));
    }
}

/**
 * Load trade history
 */
export function loadTradeHistory(): TradeHistory[] {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(TRADE_HISTORY_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    }
    return [];
}

/**
 * Save entry prices for tokens
 */
export function saveEntryPrices(prices: Record<string, number>): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem(ENTRY_PRICES_KEY, JSON.stringify(prices));
    }
}

/**
 * Load entry prices
 */
export function loadEntryPrices(): Record<string, number> {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(ENTRY_PRICES_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    }
    return {};
}

/**
 * Generate unique ID
 */
export function generateOrderId(): string {
    return `tp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new take-profit order
 */
export function createTakeProfitOrder(
    tokenMint: string,
    tokenSymbol: string,
    entryPrice: number,
    targetPercentage: number,
    sellPercentage: number,
    amount: number
): TakeProfitOrder {
    const targetPrice = entryPrice * (1 + targetPercentage / 100);

    return {
        id: generateOrderId(),
        tokenMint,
        tokenSymbol,
        entryPrice,
        targetPrice,
        targetPercentage,
        sellPercentage,
        amount,
        status: 'pending',
        createdAt: Date.now(),
    };
}

/**
 * Check if a take-profit order should be triggered
 */
export async function checkTakeProfitTrigger(
    order: TakeProfitOrder
): Promise<{ shouldTrigger: boolean; currentPrice: number }> {
    if (order.status !== 'pending') {
        return { shouldTrigger: false, currentPrice: 0 };
    }

    try {
        const priceData = await getTokenPriceData(order.tokenMint);
        const currentPrice = priceData?.price || 0;

        const shouldTrigger = currentPrice >= order.targetPrice;

        return { shouldTrigger, currentPrice };
    } catch (error) {
        console.error('Error checking TP trigger:', error);
        return { shouldTrigger: false, currentPrice: 0 };
    }
}

/**
 * Execute a take-profit order
 */
export async function executeTakeProfitOrder(
    connection: Connection,
    wallet: any,
    order: TakeProfitOrder
): Promise<{ success: boolean; signature?: string; error?: string }> {
    try {
        // Calculate amount to sell in smallest unit
        const amountToSell = Math.floor(order.amount * (order.sellPercentage / 100));

        // Get quote for selling tokens for SOL
        const quote = await getQuote(
            order.tokenMint,
            TOKENS.SOL,
            amountToSell,
            100 // 1% slippage for TP orders
        );

        if (!quote) {
            return { success: false, error: 'Failed to get quote' };
        }

        // Execute the swap
        const result = await executeSwap(connection, wallet, quote);

        return {
            success: result.success,
            signature: result.signature,
            error: result.error,
        };
    } catch (error: any) {
        console.error('Error executing TP order:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Take-profit monitoring class
 */
export class TakeProfitMonitor {
    private connection: Connection;
    private wallet: any;
    private isRunning: boolean = false;
    private intervalId: NodeJS.Timeout | null = null;
    private onOrderTriggered?: (order: TakeProfitOrder) => void;
    private onOrderExecuted?: (order: TakeProfitOrder, signature: string) => void;
    private onOrderFailed?: (order: TakeProfitOrder, error: string) => void;

    constructor(
        connection: Connection,
        wallet: any,
        callbacks?: {
            onOrderTriggered?: (order: TakeProfitOrder) => void;
            onOrderExecuted?: (order: TakeProfitOrder, signature: string) => void;
            onOrderFailed?: (order: TakeProfitOrder, error: string) => void;
        }
    ) {
        this.connection = connection;
        this.wallet = wallet;
        this.onOrderTriggered = callbacks?.onOrderTriggered;
        this.onOrderExecuted = callbacks?.onOrderExecuted;
        this.onOrderFailed = callbacks?.onOrderFailed;
    }

    /**
     * Start monitoring prices for take-profit triggers
     */
    start(checkIntervalMs: number = 30000): void {
        if (this.isRunning) return;

        this.isRunning = true;
        console.log('Take-profit monitor started');

        // Run immediately
        this.checkAllOrders();

        // Then run on interval
        this.intervalId = setInterval(() => {
            this.checkAllOrders();
        }, checkIntervalMs);
    }

    /**
     * Stop monitoring
     */
    stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        console.log('Take-profit monitor stopped');
    }

    /**
     * Check all pending orders
     */
    private async checkAllOrders(): Promise<void> {
        const orders = loadTakeProfitOrders();
        const pendingOrders = orders.filter(o => o.status === 'pending');

        if (pendingOrders.length === 0) return;

        console.log(`Checking ${pendingOrders.length} pending TP orders...`);

        for (const order of pendingOrders) {
            const { shouldTrigger, currentPrice } = await checkTakeProfitTrigger(order);

            if (shouldTrigger) {
                console.log(`TP triggered for ${order.tokenSymbol} at $${currentPrice}`);

                // Update order status
                order.status = 'triggered';
                order.triggeredAt = Date.now();
                this.onOrderTriggered?.(order);

                // Execute the order
                if (this.wallet.connected && this.wallet.signTransaction) {
                    const result = await executeTakeProfitOrder(
                        this.connection,
                        this.wallet,
                        order
                    );

                    if (result.success) {
                        order.status = 'executed';
                        order.executedAt = Date.now();
                        order.txSignature = result.signature;
                        this.onOrderExecuted?.(order, result.signature || '');
                    } else {
                        order.status = 'failed';
                        order.error = result.error;
                        this.onOrderFailed?.(order, result.error || 'Unknown error');
                    }
                } else {
                    order.status = 'failed';
                    order.error = 'Wallet not connected';
                    this.onOrderFailed?.(order, 'Wallet not connected');
                }

                // Save updated orders
                const allOrders = loadTakeProfitOrders();
                const updatedOrders = allOrders.map(o =>
                    o.id === order.id ? order : o
                );
                saveTakeProfitOrders(updatedOrders);
            }
        }
    }

    /**
     * Get monitoring status
     */
    isMonitoring(): boolean {
        return this.isRunning;
    }
}

/**
 * Calculate P&L for a position
 */
export function calculatePnL(
    currentValue: number,
    entryPrice: number,
    amount: number
): { pnl: number; pnlPercentage: number; pnlValue: number } {
    const entryValue = entryPrice * amount;
    const pnlValue = currentValue - entryValue;
    const pnlPercentage = entryValue > 0 ? ((currentValue - entryValue) / entryValue) * 100 : 0;

    return {
        pnl: pnlPercentage,
        pnlPercentage,
        pnlValue,
    };
}

/**
 * Record a trade and update entry prices
 */
export function recordTrade(
    trade: Omit<TradeHistory, 'id' | 'timestamp'>
): void {
    const history = loadTradeHistory();
    const newTrade: TradeHistory = {
        ...trade,
        id: `trade_${Date.now()}`,
        timestamp: Date.now(),
    };

    history.unshift(newTrade); // Add to beginning

    // Keep only last 100 trades
    if (history.length > 100) {
        history.pop();
    }

    saveTradeHistory(history);

    // Update entry prices for buys
    if (trade.type === 'buy') {
        const entryPrices = loadEntryPrices();
        entryPrices[trade.tokenMint] = trade.price;
        saveEntryPrices(entryPrices);
    }
}
