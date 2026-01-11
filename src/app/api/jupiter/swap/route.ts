import { NextRequest, NextResponse } from 'next/server';

// Proxy Jupiter Swap API through Vercel servers

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        console.log('[Swap Proxy] Creating swap transaction...');

        const response = await fetch('https://quote-api.jup.ag/v6/swap', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            cache: 'no-store',
        });

        console.log('[Swap Proxy] Response status:', response.status);

        if (!response.ok) {
            const error = await response.text();
            console.error('[Swap Proxy] Jupiter error:', error);
            return NextResponse.json(
                { error: `Jupiter Swap API error: ${error}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log('[Swap Proxy] Swap transaction created');

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('[Swap Proxy] Error:', error.message);
        return NextResponse.json(
            { error: error.message || 'Failed to create swap transaction' },
            { status: 500 }
        );
    }
}

export const dynamic = 'force-dynamic';
