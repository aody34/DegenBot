import { NextRequest, NextResponse } from 'next/server';

// Proxy Jupiter Token API through Vercel servers

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');
    const strict = searchParams.get('strict');

    try {
        // If address provided, fetch specific token
        if (address) {
            const response = await fetch(`https://tokens.jup.ag/token/${address}`, {
                headers: { 'Accept': 'application/json' },
            });

            if (!response.ok) {
                return NextResponse.json(
                    { error: 'Token not found' },
                    { status: 404 }
                );
            }

            const data = await response.json();
            return NextResponse.json(data);
        }

        // Otherwise fetch token list
        const url = strict === 'true'
            ? 'https://token.jup.ag/strict'
            : 'https://token.jup.ag/all';

        const response = await fetch(url, {
            headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch token list' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Token proxy error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch token data' },
            { status: 500 }
        );
    }
}
