'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';

interface Subscription {
    tier: 'free' | 'pro' | 'whale';
    isActive: boolean;
    tradesUsed: number;
    tradesRemaining: number;
    canTrade: boolean;
}

interface SubscriptionContextType {
    subscription: Subscription | null;
    loading: boolean;
    error: string | null;
    incrementTradeCount: () => Promise<void>;
    refresh: () => Promise<void>;
}

const DEFAULT_FREE_TRADES = 5;

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export function useSubscription() {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSubscription = async () => {
        try {
            const supabase = createBrowserClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setSubscription(null);
                setLoading(false);
                return;
            }

            const { data, error: subError } = await supabase
                .from('subscriptions')
                .select('tier, is_active, trades_used')
                .eq('user_id', user.id)
                .single();

            if (subError) {
                console.error('Failed to fetch subscription:', subError);
                setError('Failed to load subscription');
                setLoading(false);
                return;
            }

            const tier = (data as any)?.tier || 'free';
            const isActive = (data as any)?.is_active ?? true;
            const tradesUsed = (data as any)?.trades_used || 0;

            // Calculate trades remaining (only for free tier)
            const tradesRemaining = tier === 'free'
                ? Math.max(0, DEFAULT_FREE_TRADES - tradesUsed)
                : Infinity;

            // Can trade if: (Pro/Whale and active) OR (Free and has trades remaining)
            const canTrade = (tier !== 'free' && isActive) || (tier === 'free' && tradesRemaining > 0);

            setSubscription({
                tier,
                isActive,
                tradesUsed,
                tradesRemaining,
                canTrade,
            });
        } catch (err) {
            console.error('Error fetching subscription:', err);
            setError('Failed to load subscription');
        } finally {
            setLoading(false);
        }
    };

    const incrementTradeCount = async () => {
        if (!subscription) return;

        try {
            const supabase = createBrowserClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            const newTradesUsed = subscription.tradesUsed + 1;

            await (supabase
                .from('subscriptions') as any)
                .update({ trades_used: newTradesUsed })
                .eq('user_id', user.id);

            // Refresh subscription data
            await fetchSubscription();
        } catch (err) {
            console.error('Failed to increment trade count:', err);
        }
    };

    useEffect(() => {
        fetchSubscription();
    }, []);

    return (
        <SubscriptionContext.Provider value={{
            subscription,
            loading,
            error,
            incrementTradeCount,
            refresh: fetchSubscription,
        }}>
            {children}
        </SubscriptionContext.Provider>
    );
}
