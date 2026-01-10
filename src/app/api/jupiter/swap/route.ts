import { NextRequest, NextResponse } from 'next/server';

// Proxy Jupiter Swap API through Vercel edge servers

export const runtime = 'edge';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const response = await fetch('https://quote-api.jup.ag/v6/swap', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'DegenBot/1.0',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.text();
            return NextResponse.json(
                { error: `Jupiter Swap API error: ${error}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('[Swap Proxy] Error:', error.message);
        return NextResponse.json(
            { error: error.message || 'Failed to create swap transaction' },
            { status: 500 }
        );
    }
}
