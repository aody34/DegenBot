'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowLeft, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';

// Password validation
function validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push('At least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('One uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('One lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('One number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('One special character (!@#$%^&*)');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const plan = searchParams.get('plan') || 'free';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

    // Validate password on change
    useEffect(() => {
        if (password.length > 0) {
            const { errors } = validatePassword(password);
            setPasswordErrors(errors);
        } else {
            setPasswordErrors([]);
        }
    }, [password]);

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

        // Validate strong password
        const { valid, errors } = validatePassword(password);
        if (!valid) {
            setError('Password must include: ' + errors.join(', '));
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
                    emailRedirectTo: `${window.location.origin}/auth/callback${plan !== 'free' ? `?plan=${plan}` : ''}`,
                },
            });

            if (authError) {
                // Handle specific error messages
                if (authError.message.includes('already registered')) {
                    setError('This email is already registered. Please login instead.');
                } else {
                    setError(authError.message);
                }
                return;
            }

            if (data.user) {
                // Create subscription record (free tier initially)
                try {
                    await supabase.from('subscriptions').insert({
                        user_id: data.user.id,
                        tier: 'free',
                    } as any);
                } catch (subscriptionError) {
                    console.error('Failed to create subscription:', subscriptionError);
                }

                setSuccess(true);
            }
        } catch (err: any) {
            if (err.message?.includes('supabase') || err.message?.includes('environment')) {
                setError('Service temporarily unavailable. Please try again later.');
            } else {
                setError(err.message || 'An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    const getPlanDisplay = () => {
        switch (plan) {
            case 'pro':
                return { name: 'Pro', price: '3 SOL/month' };
            case 'whale':
                return { name: 'Whale', price: '5 SOL/month' };
            default:
                return { name: 'Free', price: '5 trades/month' };
        }
    };

    const planInfo = getPlanDisplay();

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
                        <h1 className="text-3xl font-bold mb-2">Sign Up</h1>
                        <p className="text-muted-foreground">
                            Create your DegenBot account
                        </p>
                    </div>

                    {/* Plan Badge */}
                    {plan !== 'free' && (
                        <div className="mb-6 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-violet-400">{planInfo.name} Plan</p>
                                    <p className="text-sm text-muted-foreground">{planInfo.price}</p>
                                </div>
                                <p className="text-xs text-muted-foreground">Payment after signup</p>
                            </div>
                        </div>
                    )}

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
                            {plan !== 'free' && (
                                <p className="text-sm text-violet-400 mb-4">
                                    After confirming, you'll be directed to complete your {planInfo.name} subscription payment.
                                </p>
                            )}
                            <Link
                                href="/auth/login"
                                className="btn-primary px-6 py-3 inline-block"
                            >
                                Go to Login
                            </Link>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSignup} className="space-y-5">
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
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full pl-10 pr-12 py-3 rounded-xl bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {/* Password Requirements */}
                                {password.length > 0 && passwordErrors.length > 0 && (
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        <p className="mb-1">Password needs:</p>
                                        <ul className="space-y-0.5">
                                            {passwordErrors.map((err, i) => (
                                                <li key={i} className="flex items-center gap-1 text-amber-400">
                                                    <span>•</span> {err}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {password.length > 0 && passwordErrors.length === 0 && (
                                    <div className="mt-2 flex items-center gap-1 text-xs text-emerald-400">
                                        <CheckCircle className="w-3 h-3" />
                                        Strong password
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                    />
                                </div>
                                {confirmPassword.length > 0 && password !== confirmPassword && (
                                    <p className="mt-2 text-xs text-red-400">Passwords do not match</p>
                                )}
                            </div>

                            {/* Free Plan Badge */}
                            {plan === 'free' && (
                                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-emerald-400">Free Plan</p>
                                            <p className="text-sm text-muted-foreground">5 trades included</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-start gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400"
                                >
                                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm">{error}</span>
                                </motion.div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || passwordErrors.length > 0}
                                className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    'Create Account'
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

export default function SignupPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <SignupForm />
        </Suspense>
    );
}
