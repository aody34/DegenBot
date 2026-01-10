import { NextRequest, NextResponse } from 'next/server';

// Proxy Jupiter Swap API through Vercel servers

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const response = await fetch('https://quote-api.jup.ag/v6/swap', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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
        console.error('Swap proxy error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create swap transaction' },
            { status: 500 }
        );
    }
}
