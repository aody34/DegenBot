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
