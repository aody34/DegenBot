import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'DegenBot - Auto Take-Profit Bot for Solana',
    description: 'Automate your Solana trading with speed, safety checks, and instant alerts. One-click execution, slippage protection, and gas optimization.',
    keywords: ['solana', 'trading', 'crypto', 'take-profit', 'automation', 'memecoin', 'defi'],
    authors: [{ name: 'DegenBot' }],
    openGraph: {
        title: 'DegenBot - Auto Take-Profit Bot for Solana',
        description: 'Automate your Solana trading with speed, safety checks, and instant alerts.',
        type: 'website',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className="min-h-screen bg-background antialiased">
                {children}
            </body>
        </html>
    );
}
