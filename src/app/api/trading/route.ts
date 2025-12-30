import { NextRequest, NextResponse } from 'next/server';

// Types
interface TokenData {
    address: string;
    symbol: string;
    name: string;
    price: number;
    priceChange24h: number;
    volume24h: number;
    marketCap: number;
    liquidity: number;
}

interface Position {
    id: string;
    tokenAddress: string;
    amount: number;
    entryPrice: number;
    currentPrice: number;
    pnl: number;
    pnlPercentage: number;
    takeProfitTarget: number | null;
    createdAt: string;
}

// Mock data for demonstration
const mockTokenData: Record<string, TokenData> = {
    'bonk': {
        address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        symbol: 'BONK',
        name: 'Bonk',
        price: 0.0000018,
        priceChange24h: 12.5,
        volume24h: 45000000,
        marketCap: 120000000,
        liquidity: 8500000,
    },
    'wif': {
        address: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
        symbol: 'WIF',
        name: 'dogwifhat',
        price: 2.12,
        priceChange24h: 8.3,
        volume24h: 125000000,
        marketCap: 2100000000,
        liquidity: 45000000,
    },
};

// GET - Fetch token data
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const address = searchParams.get('address');
        const symbol = searchParams.get('symbol');

        if (!address && !symbol) {
            return NextResponse.json(
                { error: 'Either address or symbol is required' },
                { status: 400 }
            );
        }

        // In production, fetch from DexScreener or Birdeye API
        // const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
        // const data = await response.json();

        // Mock response
        const tokenKey = symbol?.toLowerCase() || 'bonk';
        const tokenData = mockTokenData[tokenKey] || mockTokenData['bonk'];

        return NextResponse.json({
            success: true,
            data: tokenData,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Trading API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch token data' },
            { status: 500 }
        );
    }
}

// POST - Execute trade or set take-profit
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, tokenAddress, amount, targetPercentage, slippage } = body;

        if (!action) {
            return NextResponse.json(
                { error: 'Action is required' },
                { status: 400 }
            );
        }

        switch (action) {
            case 'setTakeProfit':
                if (!tokenAddress || !targetPercentage) {
                    return NextResponse.json(
                        { error: 'tokenAddress and targetPercentage are required' },
                        { status: 400 }
                    );
                }

                // In production: Save to database and set up monitoring
                return NextResponse.json({
                    success: true,
                    message: 'Take-profit order created',
                    data: {
                        id: `tp-${Date.now()}`,
                        tokenAddress,
                        targetPercentage,
                        slippage: slippage || 1.0,
                        status: 'active',
                        createdAt: new Date().toISOString(),
                    },
                });

            case 'executeSell':
                if (!tokenAddress || !amount) {
                    return NextResponse.json(
                        { error: 'tokenAddress and amount are required' },
                        { status: 400 }
                    );
                }

                // In production: Build and send Solana transaction
                return NextResponse.json({
                    success: true,
                    message: 'Sell order executed',
                    data: {
                        id: `tx-${Date.now()}`,
                        tokenAddress,
                        amount,
                        slippage: slippage || 1.0,
                        status: 'pending',
                        txHash: null, // Would contain actual tx hash
                        createdAt: new Date().toISOString(),
                    },
                });

            case 'cancelTakeProfit':
                if (!body.orderId) {
                    return NextResponse.json(
                        { error: 'orderId is required' },
                        { status: 400 }
                    );
                }

                // In production: Remove from database
                return NextResponse.json({
                    success: true,
                    message: 'Take-profit order cancelled',
                });

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Trading API Error:', error);
        return NextResponse.json(
            { error: 'Failed to execute action' },
            { status: 500 }
        );
    }
}
