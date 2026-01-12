'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

function AuthCallbackHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const plan = searchParams.get('plan');

    useEffect(() => {
        const handleCallback = async () => {
            const supabase = createBrowserClient();

            // Get session from URL hash
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error('Auth callback error:', error);
                router.push('/auth/login?error=callback_failed');
                return;
            }

            if (session) {
                // Check if user signed up for Pro or Whale plan
                if (plan === 'pro' || plan === 'whale') {
                    // Redirect to subscribe page to complete payment
                    router.push('/auth/subscribe');
                } else {
                    // Free plan - redirect to dashboard
                    router.push('/dashboard');
                }
            } else {
                // No session, redirect to login
                router.push('/auth/login');
            }
        };

        handleCallback();
    }, [router, plan]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Confirming your email...</p>
                {(plan === 'pro' || plan === 'whale') && (
                    <p className="text-sm text-violet-400 mt-2">
                        You'll be redirected to complete your {plan === 'whale' ? 'Whale' : 'Pro'} subscription
                    </p>
                )}
            </div>
        </div>
    );
}

// This route handles the callback from Supabase email confirmation
export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        }>
            <AuthCallbackHandler />
        </Suspense>
    );
}
