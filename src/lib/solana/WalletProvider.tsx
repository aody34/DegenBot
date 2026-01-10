'use client';

import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

// Import wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

interface Props {
    children: ReactNode;
}

export const WalletProvider: FC<Props> = ({ children }) => {
    // Use PublicNode free RPC - allows requests from Vercel without API key
    const endpoint = useMemo(() => {
        return process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://solana-rpc.publicnode.com';
    }, []);

    // Configure wallets
    const wallets = useMemo(() => [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter(),
    ], []);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <SolanaWalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </SolanaWalletProvider>
        </ConnectionProvider>
    );
};

export default WalletProvider;
