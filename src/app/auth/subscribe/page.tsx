'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Check,
    Crown,
    Rocket,
    Zap,
    ArrowLeft,
    Loader2,
    Wallet,
    AlertCircle,
    CheckCircle,
    Shield
} from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useConnection } from '@solana/wallet-adapter-react';
import {
    PublicKey,
    Transaction,
    SystemProgram,
    LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { createBrowserClient } from '@/lib/supabase/client';

// Pricing tiers
const PAYMENT_WALLET = '7VWUqa2MWXpBiTzrpkZH3E3ipt4VfH78sZ2T6n6N2oDi';

const pricingTiers = [
    {
        id: 'free',
        name: 'Free',
        price: 0,
        priceLabel: 'Free',
        description: 'Get started with basic features',
        features: [
            '5 trades per month',
            'Basic price alerts',
            'DexScreener integration',
            'Community support',
        ],
        icon: Zap,
        color: 'from-slate-500 to-gray-500',
        buttonText: 'Current Plan',
        popular: false,
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 3,
        priceLabel: '3 SOL',
        description: 'Perfect for active traders',
        features: [
            'Unlimited trades',
            'Priority RPC access',
            'Advanced take-profit settings',
            'Kill switch enabled',
            'Jito MEV protection',
            'Email support',
        ],
        icon: Rocket,
        color: 'from-violet-500 to-purple-500',
        buttonText: 'Upgrade to Pro',
        popular: true,
    },
    {
        id: 'whale',
        name: 'Whale',
        price: 5,
        priceLabel: '5 SOL',
        description: 'For serious traders',
        features: [
            'Everything in Pro',
            'Dedicated RPC nodes',
            'API access',
            'Custom alerts',
            'Priority support',
            'Early feature access',
        ],
        icon: Crown,
        color: 'from-amber-500 to-orange-500',
        buttonText: 'Upgrade to Whale',
        popular: false,
    },
];

export default function SubscribePage() {
    const router = useRouter();
    const wallet = useWallet();
    const { setVisible } = useWalletModal();
    const { connection } = useConnection();

    const [user, setUser] = useState<any>(null);
    const [currentTier, setCurrentTier] = useState<string>('free');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Check user session and subscription
    useEffect(() => {
        const checkUser = async () => {
            const supabase = createBrowserClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push('/auth/login?redirect=/auth/subscribe');
                return;
            }

            setUser(session.user);

            // Get current subscription
            const { data: subscription } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('user_id', session.user.id)
                .single();

            if (subscription) {
                setCurrentTier((subscription as any).tier);
            }

            setLoading(false);
        };

        checkUser();
    }, [router]);

    const handleUpgrade = async (tier: typeof pricingTiers[0]) => {
        if (tier.id === 'free' || tier.id === currentTier) return;

        if (!wallet.connected) {
            setVisible(true);
            return;
        }

        setProcessing(tier.id);
        setError(null);
        setSuccess(null);

        try {
            // Create SOL transfer transaction
            const paymentWallet = new PublicKey(PAYMENT_WALLET);
            const lamports = tier.price * LAMPORTS_PER_SOL;

            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: wallet.publicKey!,
                    toPubkey: paymentWallet,
                    lamports,
                })
            );

            // Get recent blockhash
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = wallet.publicKey!;

            // Sign and send transaction
            const signature = await wallet.sendTransaction(transaction, connection);

            // Confirm transaction
            await connection.confirmTransaction({
                signature,
                blockhash,
                lastValidBlockHeight,
            }, 'confirmed');

            // Update subscription in database
            const supabase = createBrowserClient();
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month subscription

            const { error: dbError } = await supabase
                .from('subscriptions')
                .upsert({
                    user_id: user.id,
                    tier: tier.id,
                    payment_tx: signature,
                    expires_at: expiresAt.toISOString(),
                    is_active: true,
                    trades_used: 0,
                } as any);

            if (dbError) throw dbError;

            setCurrentTier(tier.id);
            setSuccess(`Successfully upgraded to ${tier.name}! Transaction: ${signature.slice(0, 8)}...`);

            // Redirect to dashboard after 3 seconds
            setTimeout(() => {
                router.push('/dashboard');
            }, 3000);

        } catch (err: any) {
            console.error('Payment error:', err);
            setError(err.message || 'Payment failed. Please try again.');
        } finally {
            setProcessing(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-12 px-4">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto">
                {/* Back link */}
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                {/* Header */}
                <div className="text-center mb-12">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold mb-4"
                    >
                        Upgrade Your Trading
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-muted-foreground max-w-2xl mx-auto"
                    >
                        Choose the plan that fits your trading style. Pay with SOL directly from your Phantom wallet.
                    </motion.p>
                </div>

                {/* Current tier badge */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
                        <Shield className="w-4 h-4 text-primary" />
                        <span className="text-sm">Current Plan: <span className="font-semibold capitalize text-primary">{currentTier}</span></span>
                    </div>
                </div>

                {/* Error/Success Messages */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-md mx-auto mb-8 flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400"
                    >
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm">{error}</span>
                    </motion.div>
                )}

                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-md mx-auto mb-8 flex items-center gap-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                    >
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm">{success}</span>
                    </motion.div>
                )}

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                    {pricingTiers.map((tier, index) => {
                        const Icon = tier.icon;
                        const isCurrentTier = tier.id === currentTier;
                        const isUpgrade = tier.price > pricingTiers.find(t => t.id === currentTier)!.price;

                        return (
                            <motion.div
                                key={tier.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`relative glass rounded-2xl p-6 ${tier.popular ? 'border-2 border-primary' : 'border border-border'
                                    } ${isCurrentTier ? 'ring-2 ring-emerald-500' : ''}`}
                            >
                                {/* Popular badge */}
                                {tier.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                                        Most Popular
                                    </div>
                                )}

                                {/* Current tier badge */}
                                {isCurrentTier && (
                                    <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-semibold">
                                        Current
                                    </div>
                                )}

                                {/* Icon */}
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4`}>
                                    <Icon className="w-7 h-7 text-white" />
                                </div>

                                {/* Name & Price */}
                                <h3 className="text-2xl font-bold mb-1">{tier.name}</h3>
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-3xl font-bold">{tier.priceLabel}</span>
                                    {tier.price > 0 && <span className="text-muted-foreground">/month</span>}
                                </div>
                                <p className="text-muted-foreground text-sm mb-6">{tier.description}</p>

                                {/* Features */}
                                <ul className="space-y-3 mb-8">
                                    {tier.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm">
                                            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                {/* Button */}
                                <button
                                    onClick={() => handleUpgrade(tier)}
                                    disabled={isCurrentTier || processing !== null || !isUpgrade}
                                    className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${isCurrentTier
                                        ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
                                        : isUpgrade
                                            ? 'btn-primary'
                                            : 'bg-muted text-muted-foreground cursor-not-allowed'
                                        }`}
                                >
                                    {processing === tier.id ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : isCurrentTier ? (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            Current Plan
                                        </>
                                    ) : !isUpgrade ? (
                                        'Included'
                                    ) : !wallet.connected ? (
                                        <>
                                            <Wallet className="w-4 h-4" />
                                            Connect Wallet to Pay
                                        </>
                                    ) : (
                                        tier.buttonText
                                    )}
                                </button>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Payment info */}
                <div className="mt-12 text-center">
                    <p className="text-sm text-muted-foreground">
                        Payments are processed securely via Solana blockchain.
                        Your subscription will be active immediately after confirmation.
                    </p>
                </div>
            </div>
        </div>
    );
}
