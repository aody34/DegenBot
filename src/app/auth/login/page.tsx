'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowLeft, AlertCircle, CheckCircle, Crown, Rocket } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const plan = searchParams.get('plan');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [upgradeRequired, setUpgradeRequired] = useState(false);

    const getPlanDisplay = () => {
        switch (plan) {
            case 'pro':
                return { name: 'Pro', price: '3 SOL/month', icon: Rocket, color: 'violet' };
            case 'whale':
                return { name: 'Whale', price: '5 SOL/month', icon: Crown, color: 'amber' };
            default:
                return null;
        }
    };

    const planInfo = getPlanDisplay();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setUpgradeRequired(false);

        try {
            const supabase = createBrowserClient();
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                setError(authError.message);
                return;
            }

            if (data.user) {
                // Get user's subscription
                let { data: subscription, error: subError } = await supabase
                    .from('subscriptions')
                    .select('tier, is_active')
                    .eq('user_id', data.user.id)
                    .single();

                console.log('[DegenBot] Login - User:', data.user.email);
                console.log('[DegenBot] Login - Subscription:', subscription);
                console.log('[DegenBot] Login - Plan requested:', plan);

                // If no subscription exists, create one as FREE tier (legacy user)
                if (!subscription) {
                    console.log('[DegenBot] No subscription found - creating Free tier record');
                    const { error: insertError } = await (supabase
                        .from('subscriptions') as any)
                        .insert({
                            user_id: data.user.id,
                            tier: 'free',
                            is_active: true,
                            trades_used: 0,
                        });

                    if (insertError) {
                        console.error('[DegenBot] Failed to create subscription:', insertError);
                    } else {
                        // Refetch the subscription
                        const { data: newSub } = await supabase
                            .from('subscriptions')
                            .select('tier, is_active')
                            .eq('user_id', data.user.id)
                            .single();
                        subscription = newSub;
                        console.log('[DegenBot] Created subscription:', subscription);
                    }
                }

                // Determine tier and active status
                const userTier = (subscription as any)?.tier || 'free';
                const isActive = (subscription as any)?.is_active ?? true;

                console.log('[DegenBot] Login - User tier:', userTier, 'isActive:', isActive);

                // CASE 1: User came from Pro/Whale button but registered as Free
                if ((plan === 'pro' || plan === 'whale') && userTier === 'free') {
                    const planName = plan === 'whale' ? 'Whale' : 'Pro';
                    setError(`This account is registered as FREE. You cannot access ${planName} features with a Free account. Please sign up with a new email for ${planName}.`);
                    // Sign out the user
                    await supabase.auth.signOut();
                    setLoading(false);
                    return;
                }

                // CASE 2: User is Pro/Whale but hasn't paid yet (is_active = false)
                if ((userTier === 'pro' || userTier === 'whale') && !isActive) {
                    setUpgradeRequired(true);
                    setTimeout(() => {
                        router.push('/auth/subscribe');
                    }, 2000);
                    return;
                }

                // CASE 3: User is Free and subscription is active - go to dashboard
                // CASE 4: User is Pro/Whale and has paid (is_active = true) - go to dashboard
                setSuccess(true);
                setTimeout(() => {
                    router.push('/dashboard');
                }, 1000);
            }
        } catch (err: any) {
            console.error('[DegenBot] Login error:', err);
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Back to home */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to home
                </Link>

                {/* Login Card */}
                <div className="glass rounded-2xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                        <p className="text-muted-foreground">
                            Sign in to access your DegenBot dashboard
                        </p>
                    </div>

                    {/* Plan Badge (if coming from Pro/Whale) */}
                    {planInfo && (
                        <div className={`mb-6 p-4 rounded-xl bg-${planInfo.color}-500/10 border border-${planInfo.color}-500/20`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg bg-${planInfo.color}-500/20 flex items-center justify-center`}>
                                    <planInfo.icon className={`w-5 h-5 text-${planInfo.color}-500`} />
                                </div>
                                <div>
                                    <p className={`font-medium text-${planInfo.color}-400`}>Upgrade to {planInfo.name}</p>
                                    <p className="text-sm text-muted-foreground">{planInfo.price}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400"
                            >
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm">{error}</span>
                            </motion.div>
                        )}

                        {/* Upgrade Required Message */}
                        {upgradeRequired && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col gap-2 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400"
                            >
                                <div className="flex items-center gap-2">
                                    <Rocket className="w-5 h-5 flex-shrink-0" />
                                    <span className="font-semibold">Upgrade Required</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Your current plan doesn't include {plan === 'whale' ? 'Whale' : 'Pro'} features. Redirecting to upgrade...
                                </p>
                            </motion.div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                            >
                                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm">Login successful! Redirecting...</span>
                            </motion.div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || success || upgradeRequired}
                            className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Signing in...
                                </>
                            ) : success ? (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    Success!
                                </>
                            ) : upgradeRequired ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Redirecting to upgrade...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Signup Link */}
                    <div className="mt-6 text-center">
                        <p className="text-muted-foreground">
                            Don't have an account?{' '}
                            <Link
                                href={plan ? `/auth/signup?plan=${plan}` : '/auth/signup'}
                                className="text-primary hover:underline font-medium"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="mt-8 text-center text-sm text-muted-foreground">
                    By signing in, you agree to our Terms of Service and Privacy Policy.
                </p>
            </motion.div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
