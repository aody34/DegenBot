import { NextRequest, NextResponse } from 'next/server';

// Proxy Jupiter Token API through Vercel edge servers

export const runtime = 'edge';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');
    const strict = searchParams.get('strict');

    try {
        // If address provided, fetch specific token
        if (address) {
            const response = await fetch(`https://tokens.jup.ag/token/${address}`, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'DegenBot/1.0',
                },
            });

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

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'DegenBot/1.0',
            },
        });

        if (!response.ok) {
            // Return empty array if token list fails
            return NextResponse.json([]);
        }

        const data = await response.json();
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
