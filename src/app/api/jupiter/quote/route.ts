import { NextRequest, NextResponse } from 'next/server';

// Proxy Jupiter Quote API through Vercel edge servers
// This bypasses network restrictions on client side

export const runtime = 'edge';

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'DegenBot/1.0',
                },
            });
            return response;
        } catch (error) {
            console.log(`[Quote Proxy] Attempt ${i + 1} failed:`, error);
            if (i === retries - 1) throw error;
            await new Promise(r => setTimeout(r, Math.pow(2, i) * 500));
        }
    }
    throw new Error('All retries failed');
}

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

        const response = await fetchWithRetry(`https://quote-api.jup.ag/v6/quote?${params}`);

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
        console.error('[Quote Proxy] Error:', error.message);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch quote' },
            { status: 500 }
        );
    }
}
