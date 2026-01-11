'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

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
                setSuccess(true);
                // Redirect to dashboard after successful login
                setTimeout(() => {
                    router.push('/dashboard');
                }, 1000);
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

                {/* Login Card */}
                <div className="glass rounded-2xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                        <p className="text-muted-foreground">
                            Sign in to access your DegenBot dashboard
                        </p>
                    </div>

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
                            disabled={loading || success}
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
                                href="/auth/signup"
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
