'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Loader2, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            const supabase = createBrowserClient();

            // Sign up user
            const { data, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (authError) {
                setError(authError.message);
                return;
            }

            if (data.user) {
                // Create subscription record (free tier)
                await supabase.from('subscriptions').insert({
                    user_id: data.user.id,
                    tier: 'free',
                });

                setSuccess(true);
            }
        } catch (err: any) {
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

                {/* Signup Card */}
                <div className="glass rounded-2xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">Create Account</h1>
                        <p className="text-muted-foreground">
                            Start trading with DegenBot for free
                        </p>
                    </div>

                    {success ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-8"
                        >
                            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h2 className="text-xl font-semibold mb-2">Check Your Email</h2>
                            <p className="text-muted-foreground mb-6">
                                We've sent a confirmation link to <span className="text-foreground">{email}</span>
                            </p>
                            <Link
                                href="/auth/login"
                                className="btn-primary px-6 py-3 inline-block"
                            >
                                Go to Login
                            </Link>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSignup} className="space-y-6">
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

                            {/* Confirm Password Field */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Free Plan Badge */}
                            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-emerald-400">Free Plan</p>
                                        <p className="text-sm text-muted-foreground">5 free trades included</p>
                                    </div>
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

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    'Create Free Account'
                                )}
                            </button>
                        </form>
                    )}

                    {/* Login Link */}
                    {!success && (
                        <div className="mt-6 text-center">
                            <p className="text-muted-foreground">
                                Already have an account?{' '}
                                <Link
                                    href="/auth/login"
                                    className="text-primary hover:underline font-medium"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <p className="mt-8 text-center text-sm text-muted-foreground">
                    By signing up, you agree to our Terms of Service and Privacy Policy.
                </p>
            </motion.div>
        </div>
    );
}
