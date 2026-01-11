'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';

// This route handles the callback from Supabase email confirmation
export default function AuthCallbackPage() {
    const router = useRouter();

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
                // User is authenticated, redirect to dashboard
                router.push('/dashboard');
            } else {
                // No session, redirect to login
                router.push('/auth/login');
            }
        };

        handleCallback();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Confirming your email...</p>
            </div>
        </div>
    );
}
