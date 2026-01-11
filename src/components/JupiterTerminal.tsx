'use client';

import { useEffect, useRef, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

// Jupiter Terminal is their official swap widget
// It handles all API calls internally and may bypass network restrictions

declare global {
    interface Window {
        Jupiter: any;
    }
}

interface JupiterTerminalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function JupiterTerminal({ isOpen, onClose }: JupiterTerminalProps) {
    const wallet = useWallet();
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Load Jupiter Terminal script
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Check if already loaded
        if (window.Jupiter) {
            setLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://terminal.jup.ag/main-v2.js';
        script.async = true;

        script.onload = () => {
            console.log('[JupiterTerminal] Script loaded');
            setLoaded(true);
        };

        script.onerror = () => {
            console.error('[JupiterTerminal] Failed to load script');
            setError('Failed to load Jupiter Terminal. Network may be blocking access.');
        };

        document.head.appendChild(script);

        return () => {
            // Cleanup
            if (window.Jupiter) {
                try {
                    window.Jupiter.close();
                } catch (e) {
                    // Ignore cleanup errors
                }
            }
        };
    }, []);

    // Initialize Jupiter Terminal when opened
    useEffect(() => {
        if (!isOpen || !loaded || !window.Jupiter) return;

        console.log('[JupiterTerminal] Initializing...');

        try {
            window.Jupiter.init({
                displayMode: 'integrated',
                integratedTargetId: 'jupiter-terminal-container',
                endpoint: 'https://mainnet.helius-rpc.com/?api-key=9b583a75-fa36-4da9-932d-db8e4e06ae35',
                strictTokenList: false,
                defaultExplorer: 'Solscan',
                formProps: {
                    initialInputMint: 'So11111111111111111111111111111111111111112', // SOL
                    initialAmount: '10000000', // 0.01 SOL in lamports
                },
                // Pass wallet if connected
                ...(wallet.connected && wallet.publicKey ? {
                    enableWalletPassthrough: true,
                    passthroughWalletContextState: wallet,
                } : {}),
            });

            console.log('[JupiterTerminal] Initialized successfully');
        } catch (err: any) {
            console.error('[JupiterTerminal] Init error:', err);
            setError(err.message || 'Failed to initialize Jupiter Terminal');
        }
    }, [isOpen, loaded, wallet]);

    // Close Jupiter Terminal when modal closes
    useEffect(() => {
        if (!isOpen && window.Jupiter) {
            try {
                window.Jupiter.close();
            } catch (e) {
                // Ignore
            }
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Terminal Container */}
            <div className="relative z-10 w-full max-w-md mx-4">
                <div className="bg-[#1B1B1E] rounded-xl overflow-hidden shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                        <div className="flex items-center gap-2">
                            <img
                                src="https://jup.ag/svg/jupiter-logo.svg"
                                alt="Jupiter"
                                className="w-6 h-6"
                            />
                            <span className="font-semibold text-white">Jupiter Swap</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                        >
                            <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="min-h-[400px]">
                        {error ? (
                            <div className="flex flex-col items-center justify-center h-[400px] p-6 text-center">
                                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">Connection Error</h3>
                                <p className="text-white/60 text-sm mb-4">{error}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg font-medium transition-colors"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : !loaded ? (
                            <div className="flex flex-col items-center justify-center h-[400px]">
                                <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
                                <p className="text-white/60">Loading Jupiter Terminal...</p>
                            </div>
                        ) : (
                            <div
                                id="jupiter-terminal-container"
                                ref={containerRef}
                                className="min-h-[400px]"
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default JupiterTerminal;
