import { NextRequest, NextResponse } from 'next/server';

// Proxy Jupiter Token API through Vercel servers

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');
    const strict = searchParams.get('strict');

    try {
        // If address provided, fetch specific token
        if (address) {
            console.log('[Token Proxy] Fetching token:', address);

            const response = await fetch(`https://tokens.jup.ag/token/${address}`, {
                headers: { 'Accept': 'application/json' },
                cache: 'no-store',
            });

            console.log('[Token Proxy] Token response:', response.status);

            if (!response.ok) {
                // Return a basic token object for unknown tokens
                return NextResponse.json({
                    address,
                    symbol: 'Unknown',
                    name: 'Unknown Token',
                    decimals: 9,
                });
            }

            const data = await response.json();
            return NextResponse.json(data);
        }

        // Otherwise fetch token list
        const url = strict === 'true'
            ? 'https://token.jup.ag/strict'
            : 'https://token.jup.ag/all';

        console.log('[Token Proxy] Fetching token list:', url);

        const response = await fetch(url, {
            headers: { 'Accept': 'application/json' },
            cache: 'no-store',
        });

        console.log('[Token Proxy] Token list response:', response.status);

        if (!response.ok) {
            // Return empty array if token list fails
            console.log('[Token Proxy] Token list failed, returning empty');
            return NextResponse.json([]);
        }

        const data = await response.json();
        console.log('[Token Proxy] Token list loaded:', data.length, 'tokens');
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('[Token Proxy] Error:', error.message);
        // Return graceful fallback instead of error
        if (address) {
            return NextResponse.json({
                address,
                symbol: 'Unknown',
                name: 'Unknown Token',
                decimals: 9,
            });
        }
        return NextResponse.json([]);
    }
}

export const dynamic = 'force-dynamic';
