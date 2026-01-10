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
    // Use Helius RPC - user has set up their API key in Vercel env vars
    // Fallback to a free RPC if env var not set
    const endpoint = useMemo(() => {
        const envRpc = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
        if (envRpc) {
            console.log('[WalletProvider] Using custom RPC from env');
            return envRpc;
        }
        // Fallback to Helius public free tier
        console.log('[WalletProvider] Using fallback Helius RPC');
        return 'https://mainnet.helius-rpc.com/?api-key=9b583a75-fa36-4da9-932d-db8e4e06ae35';
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
