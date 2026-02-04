import { createClient } from '@supabase/supabase-js';

// Types for database
export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    wallet_address: string;
                    created_at: string;
                    settings: Record<string, unknown>;
                };
                Insert: {
                    wallet_address: string;
                    settings?: Record<string, unknown>;
                };
                Update: {
                    settings?: Record<string, unknown>;
                };
            };
            positions: {
                Row: {
                    id: string;
                    user_id: string;
                    token_address: string;
                    token_symbol: string;
                    amount: number;
                    entry_price: number;
                    created_at: string;
                };
                Insert: {
                    user_id: string;
                    token_address: string;
                    token_symbol: string;
                    amount: number;
                    entry_price: number;
                };
                Update: {
                    amount?: number;
                };
            };
            take_profit_orders: {
                Row: {
                    id: string;
                    user_id: string;
                    position_id: string;
                    target_percentage: number;
                    slippage: number;
                    auto_execute: boolean;
                    status: 'active' | 'triggered' | 'cancelled';
                    created_at: string;
                    triggered_at: string | null;
                };
                Insert: {
                    user_id: string;
                    position_id: string;
                    target_percentage: number;
                    slippage?: number;
                    auto_execute?: boolean;
                };
                Update: {
                    status?: 'active' | 'triggered' | 'cancelled';
                    triggered_at?: string;
                };
            };
            transactions: {
                Row: {
                    id: string;
                    user_id: string;
                    type: 'buy' | 'sell';
                    token_address: string;
                    token_symbol: string;
                    amount: number;
                    price: number;
                    tx_hash: string | null;
                    status: 'pending' | 'completed' | 'failed';
                    created_at: string;
                };
                Insert: {
                    user_id: string;
                    type: 'buy' | 'sell';
                    token_address: string;
                    token_symbol: string;
                    amount: number;
                    price: number;
                    tx_hash?: string;
                    status?: 'pending' | 'completed' | 'failed';
                };
                Update: {
                    tx_hash?: string;
                    status?: 'pending' | 'completed' | 'failed';
                };
            };
            subscriptions: {
                Row: {
                    id: string;
                    user_id: string;
                    tier: 'free' | 'pro' | 'whale';
                    payment_tx: string | null;
                    started_at: string;
                    expires_at: string | null;
                    is_active: boolean;
                    trades_used: number;
                };
                Insert: {
                    user_id: string;
                    tier?: 'free' | 'pro' | 'whale';
                    payment_tx?: string;
                    expires_at?: string;
                };
                Update: {
                    tier?: 'free' | 'pro' | 'whale';
                    payment_tx?: string;
                    expires_at?: string;
                    is_active?: boolean;
                    trades_used?: number;
                };
            };
            // ============ COPY TRADING TABLES ============
            profiles: {
                Row: {
                    id: string;
                    wallet_address: string | null;
                    sol_balance_limit: number;
                    is_active: boolean;
                    telegram_id: string | null;
                    ai_score_threshold: number;
                    max_slippage_bps: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    wallet_address?: string;
                    sol_balance_limit?: number;
                    is_active?: boolean;
                    telegram_id?: string;
                    ai_score_threshold?: number;
                    max_slippage_bps?: number;
                };
                Update: {
                    wallet_address?: string;
                    sol_balance_limit?: number;
                    is_active?: boolean;
                    telegram_id?: string;
                    ai_score_threshold?: number;
                    max_slippage_bps?: number;
                };
            };
            whales: {
                Row: {
                    id: string;
                    address: string;
                    label: string;
                    total_trades: number;
                    win_rate: number;
                    avg_profit_pct: number;
                    is_active: boolean;
                    last_active_at: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    address: string;
                    label: string;
                    total_trades?: number;
                    win_rate?: number;
                    avg_profit_pct?: number;
                    is_active?: boolean;
                };
                Update: {
                    label?: string;
                    total_trades?: number;
                    win_rate?: number;
                    avg_profit_pct?: number;
                    is_active?: boolean;
                };
            };
            signals: {
                Row: {
                    id: string;
                    whale_id: string;
                    token_address: string;
                    token_name: string | null;
                    token_symbol: string | null;
                    type: 'BUY' | 'SELL';
                    sol_amount: number | null;
                    token_amount: number | null;
                    price_usd: number | null;
                    ai_score: number;
                    ai_reasoning: string | null;
                    tx_hash: string;
                    status: 'PENDING' | 'EXECUTED' | 'SKIPPED' | 'FAILED';
                    created_at: string;
                };
                Insert: {
                    whale_id: string;
                    token_address: string;
                    token_name?: string;
                    token_symbol?: string;
                    type: 'BUY' | 'SELL';
                    sol_amount?: number;
                    token_amount?: number;
                    price_usd?: number;
                    ai_score?: number;
                    ai_reasoning?: string;
                    tx_hash: string;
                    status?: 'PENDING' | 'EXECUTED' | 'SKIPPED' | 'FAILED';
                };
                Update: {
                    ai_score?: number;
                    ai_reasoning?: string;
                    status?: 'PENDING' | 'EXECUTED' | 'SKIPPED' | 'FAILED';
                };
            };
            executed_trades: {
                Row: {
                    id: string;
                    user_id: string;
                    signal_id: string | null;
                    whale_id: string | null;
                    token_address: string;
                    token_symbol: string | null;
                    type: 'BUY' | 'SELL';
                    amount_in_sol: number | null;
                    tokens_received: number | null;
                    entry_price: number | null;
                    exit_price: number | null;
                    profit_loss: number | null;
                    profit_pct: number | null;
                    tx_hash: string | null;
                    jito_bundle_id: string | null;
                    status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
                    error_message: string | null;
                    executed_at: string;
                    created_at: string;
                };
                Insert: {
                    user_id: string;
                    signal_id?: string;
                    whale_id?: string;
                    token_address: string;
                    token_symbol?: string;
                    type: 'BUY' | 'SELL';
                    amount_in_sol?: number;
                    tokens_received?: number;
                    entry_price?: number;
                    status?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
                };
                Update: {
                    tokens_received?: number;
                    exit_price?: number;
                    profit_loss?: number;
                    profit_pct?: number;
                    tx_hash?: string;
                    jito_bundle_id?: string;
                    status?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
                    error_message?: string;
                };
            };
        };
    };
}

// Create Supabase client for client-side usage
export function createBrowserClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase environment variables');
    }

    return createClient<Database>(supabaseUrl, supabaseAnonKey);
}

// Create Supabase client for server-side usage
export function createServerClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Supabase environment variables');
    }

    return createClient<Database>(supabaseUrl, supabaseServiceKey, {
        auth: {
            persistSession: false,
        },
    });
}

// Helper functions for common database operations
export async function getUserByWallet(walletAddress: string) {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

    if (error) throw error;
    return data;
}

export async function getPositionsByUser(userId: string) {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from('positions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function getActiveTakeProfitOrders(userId: string) {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from('take_profit_orders')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active');

    if (error) throw error;
    return data;
}

export async function getTransactionHistory(userId: string, limit: number = 50) {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data;
}
