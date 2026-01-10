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

    try {
        const params = new URLSearchParams({
            inputMint,
            outputMint,
            amount,
            slippageBps,
            onlyDirectRoutes: 'false',
            asLegacyTransaction: 'false',
        });

        const response = await fetch(`https://quote-api.jup.ag/v6/quote?${params}`, {
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.text();
            return NextResponse.json(
                { error: `Jupiter API error: ${error}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Quote proxy error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch quote' },
            { status: 500 }
        );
    }
}
