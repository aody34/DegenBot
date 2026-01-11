import { NextRequest, NextResponse } from 'next/server';

// Proxy Jupiter Quote API through Vercel servers
// This bypasses network restrictions on client side

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const inputMint = searchParams.get('inputMint');
    const outputMint = searchParams.get('outputMint');
    const amount = searchParams.get('amount');
    const slippageBps = searchParams.get('slippageBps') || '100';

    if (!inputMint || !outputMint || !amount) {
        return NextResponse.json(
            { error: 'Missing required parameters: inputMint, outputMint, amount' },
            { status: 400 }
        );
    }

    const jupiterUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}&onlyDirectRoutes=false&asLegacyTransaction=false`;

    console.log('[Quote Proxy] Fetching:', jupiterUrl);

    try {
        const response = await fetch(jupiterUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            cache: 'no-store',
        });

        console.log('[Quote Proxy] Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Quote Proxy] Jupiter error:', errorText);
            return NextResponse.json(
                { error: `Jupiter API returned ${response.status}: ${errorText}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log('[Quote Proxy] Success, outAmount:', data.outAmount);

        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'no-store, max-age=0',
            },
        });
    } catch (error: any) {
        console.error('[Quote Proxy] Catch error:', error.name, error.message);
        return NextResponse.json(
            {
                error: 'Failed to fetch quote from Jupiter',
                details: error.message,
            },
            { status: 500 }
        );
    }
}

// Disable caching for this route
export const dynamic = 'force-dynamic';
