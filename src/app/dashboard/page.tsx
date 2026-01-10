'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useConnection } from '@solana/wallet-adapter-react';
import Link from 'next/link';
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    Activity,
    Target,
    Zap,
    ChevronRight,
    ExternalLink,
    Clock,
    DollarSign,
    Percent,
    AlertCircle,
    X,
    Search,
    ArrowUpDown,
    XOctagon,
    Loader2,
    CheckCircle,
    AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { getQuote, executeSwap, TOKENS, solToLamports, formatTokenAmount } from '@/lib/solana/jupiter';
import { getTokenPriceData, getTokenSafetyCheck } from '@/lib/api/dexscreener';
import { searchToken } from '@/lib/solana/tokens';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

// Mock chart data
const chartData = [
    { time: '00:00', value: 11200 },
    { time: '04:00', value: 11800 },
    { time: '08:00', value: 11500 },
    { time: '12:00', value: 12100 },
    { time: '16:00', value: 11900 },
    { time: '20:00', value: 12450 },
    { time: '24:00', value: 12450 },
];

const takeProfitPresets = [
    { label: '25%', value: 25 },
    { label: '50%', value: 50 },
    { label: '100%', value: 100 },
    { label: '200%', value: 200 },
];

// Quick Trade Modal with Real Jupiter Integration
function QuickTradeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const wallet = useWallet();
    const { connection } = useConnection();
    const { setVisible } = useWalletModal();
    const { balance } = useAppStore();

    const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
    const [tokenAddress, setTokenAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [slippage, setSlippage] = useState(1);

    // Trading states
    const [loading, setLoading] = useState(false);
    const [fetchingQuote, setFetchingQuote] = useState(false);
    const [quote, setQuote] = useState<any>(null);
    const [tokenInfo, setTokenInfo] = useState<any>(null);
    const [safetyWarnings, setSafetyWarnings] = useState<string[]>([]);
    const [txStatus, setTxStatus] = useState<'idle' | 'signing' | 'confirming' | 'success' | 'error'>('idle');
    const [txSignature, setTxSignature] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch token info when address changes
    useEffect(() => {
        const fetchTokenInfo = async () => {
            if (tokenAddress.length !== 44) {
                setTokenInfo(null);
                setSafetyWarnings([]);
                return;
            }

            try {
                const [token, priceData, safety] = await Promise.all([
                    searchToken(tokenAddress),
                    getTokenPriceData(tokenAddress),
                    getTokenSafetyCheck(tokenAddress),
                ]);

                setTokenInfo({ ...token, ...priceData });
                setSafetyWarnings(safety.warnings);
            } catch (err) {
                console.error('Error fetching token:', err);
            }
        };

        fetchTokenInfo();
    }, [tokenAddress]);

    // Fetch quote when amount or token changes
    useEffect(() => {
        const fetchQuoteData = async () => {
            if (!tokenAddress || !amount || parseFloat(amount) <= 0) {
                setQuote(null);
                return;
            }

            setFetchingQuote(true);
            try {
                const amountInLamports = solToLamports(parseFloat(amount));
                const inputMint = tradeType === 'buy' ? TOKENS.SOL : tokenAddress;
                const outputMint = tradeType === 'buy' ? tokenAddress : TOKENS.SOL;

                const quoteData = await getQuote(
                    inputMint,
                    outputMint,
                    amountInLamports,
                    slippage * 100 // Convert to basis points
                );

                setQuote(quoteData);
            } catch (err) {
                console.error('Error fetching quote:', err);
            } finally {
                setFetchingQuote(false);
            }
        };

        const debounce = setTimeout(fetchQuoteData, 500);
        return () => clearTimeout(debounce);
    }, [tokenAddress, amount, tradeType, slippage]);

    // Execute trade
    const handleTrade = async () => {
        if (!wallet.connected || !quote) return;

        setLoading(true);
        setError(null);
        setTxStatus('signing');

        try {
            setTxStatus('confirming');
            const result = await executeSwap(connection, wallet, quote);

            if (result.success) {
                setTxStatus('success');
                setTxSignature(result.signature || null);

                // Clear form after success
                setTimeout(() => {
                    setAmount('');
                    setQuote(null);
                    setTxStatus('idle');
                }, 3000);
            } else {
                setTxStatus('error');
                setError(result.error || 'Transaction failed');
            }
        } catch (err: any) {
            setTxStatus('error');
            setError(err.message || 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed left-1/2 top-4 -translate-x-1/2 z-50 w-full max-w-sm px-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="glass rounded-xl p-4 border border-primary/20 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                <Zap className="w-4 h-4 text-white" />
                            </div>
                            <h3 className="text-lg font-bold">Quick Trade</h3>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {!wallet.connected ? (
                        <div className="text-center py-4">
                            <Wallet className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                            <h4 className="font-semibold mb-1">Connect Your Wallet</h4>
                            <p className="text-muted-foreground text-sm mb-4">Connect to start trading</p>
                            <button
                                onClick={() => { onClose(); setVisible(true); }}
                                className="btn-primary"
                            >
                                <Wallet className="w-4 h-4 mr-2" />
                                Connect Wallet
                            </button>
                        </div>
                    ) : txStatus === 'success' ? (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h4 className="text-lg font-semibold mb-2">Trade Successful!</h4>
                            {txSignature && (
                                <a
                                    href={`https://solscan.io/tx/${txSignature}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline flex items-center justify-center gap-1"
                                >
                                    View on Solscan
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {/* Balance Display */}
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                <span>Available: {balance.toFixed(4)} SOL</span>
                                {tokenInfo?.price && (
                                    <span>{tokenInfo.symbol}: ${tokenInfo.price.toFixed(6)}</span>
                                )}
                            </div>

                            {/* Trade Type Toggle */}
                            <div className="flex gap-2 p-1 bg-muted rounded-lg">
                                <button
                                    onClick={() => setTradeType('buy')}
                                    className={cn(
                                        'flex-1 py-2 rounded-md font-medium transition-all',
                                        tradeType === 'buy'
                                            ? 'bg-emerald-500 text-white'
                                            : 'text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    Buy
                                </button>
                                <button
                                    onClick={() => setTradeType('sell')}
                                    className={cn(
                                        'flex-1 py-2 rounded-md font-medium transition-all',
                                        tradeType === 'sell'
                                            ? 'bg-red-500 text-white'
                                            : 'text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    Sell
                                </button>
                            </div>

                            {/* Token Address */}
                            <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Token Address</label>
                                <div className="relative">
                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={tokenAddress}
                                        onChange={(e) => setTokenAddress(e.target.value)}
                                        placeholder="Paste token mint address..."
                                        className="input-field pl-8 w-full text-sm py-2"
                                    />
                                </div>
                                {tokenInfo && (
                                    <div className="flex items-center gap-2 mt-1 text-xs">
                                        <span className="text-foreground font-medium">{tokenInfo.symbol}</span>
                                        <span className="text-muted-foreground">{tokenInfo.name}</span>
                                    </div>
                                )}
                            </div>

                            {/* Safety Warnings */}
                            {safetyWarnings.length > 0 && (
                                <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20">
                                    <div className="flex items-center gap-2 text-amber-500 text-xs font-medium mb-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        Safety Warnings
                                    </div>
                                    {safetyWarnings.map((warning, i) => (
                                        <div key={i} className="text-xs text-amber-400">{warning}</div>
                                    ))}
                                </div>
                            )}

                            {/* Amount */}
                            <div>
                                <label className="text-xs text-muted-foreground mb-1 block">
                                    Amount ({tradeType === 'buy' ? 'SOL' : 'Tokens'})
                                </label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="input-field w-full text-sm py-2"
                                />
                            </div>

                            {/* Quote Display */}
                            {fetchingQuote && (
                                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-2">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Fetching quote...
                                </div>
                            )}
                            {quote && !fetchingQuote && (
                                <div className="p-2 rounded bg-muted/50 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">You'll receive:</span>
                                        <span className="font-medium">
                                            ~{formatTokenAmount(quote.outAmount, tradeType === 'buy' ? (tokenInfo?.decimals || 9) : 9).toFixed(6)}
                                            {tradeType === 'buy' ? ` ${tokenInfo?.symbol || 'tokens'}` : ' SOL'}
                                        </span>
                                    </div>
                                    {quote.priceImpactPct && parseFloat(quote.priceImpactPct) > 1 && (
                                        <div className="text-amber-400 mt-1">
                                            ⚠️ Price impact: {parseFloat(quote.priceImpactPct).toFixed(2)}%
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Slippage */}
                            <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Slippage</label>
                                <div className="flex gap-1">
                                    {[0.5, 1, 2, 5].map((val) => (
                                        <button
                                            key={val}
                                            onClick={() => setSlippage(val)}
                                            className={cn(
                                                'flex-1 py-1.5 rounded text-xs font-medium border transition-all',
                                                slippage === val
                                                    ? 'bg-primary text-primary-foreground border-primary'
                                                    : 'border-border hover:border-primary/50'
                                            )}
                                        >
                                            {val}%
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Jito Bundle Info */}
                            <div className="flex items-center gap-2 p-2 rounded bg-violet-500/10 border border-violet-500/20">
                                <Zap className="w-3 h-3 text-violet-500" />
                                <span className="text-xs text-violet-400">Jito Bundle protection</span>
                            </div>

                            {/* Error Display */}
                            {error && (
                                <div className="p-2 rounded bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                                    {error}
                                </div>
                            )}

                            {/* Execute Button */}
                            <button
                                onClick={handleTrade}
                                disabled={loading || !quote || !tokenAddress}
                                className={cn(
                                    'w-full py-2.5 rounded-lg font-semibold transition-all text-sm flex items-center justify-center gap-2',
                                    tradeType === 'buy'
                                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white disabled:bg-emerald-500/50'
                                        : 'bg-red-500 hover:bg-red-600 text-white disabled:bg-red-500/50'
                                )}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {txStatus === 'signing' ? 'Sign in wallet...' : 'Confirming...'}
                                    </>
                                ) : (
                                    <>
                                        <ArrowUpDown className="w-4 h-4" />
                                        {tradeType === 'buy' ? 'Buy Token' : 'Sell Token'}
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-center text-muted-foreground">
                                1% fee on successful trades • MEV protected
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

// Set Take-Profit Modal
function SetTakeProfitModal({
    isOpen,
    onClose,
    position
}: {
    isOpen: boolean;
    onClose: () => void;
    position?: { token: string; symbol: string; pnl: number } | null;
}) {
    const [targetPercentage, setTargetPercentage] = useState(50);
    const [slippage, setSlippage] = useState(1);
    const [autoExecute, setAutoExecute] = useState(true);
    const { addTakeProfitOrder } = useAppStore();

    if (!isOpen || !position) return null;

    const handleSave = () => {
        addTakeProfitOrder({
            id: Date.now().toString(),
            positionId: position.token,
            targetPercentage,
            slippage,
            autoExecute,
            status: 'active',
        });
        onClose();
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            >
                <div className="glass rounded-2xl p-6 border border-primary/20">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                <Target className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Set Take-Profit</h3>
                                <p className="text-sm text-muted-foreground">{position.token} • {position.symbol}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Target Percentage */}
                        <div>
                            <label className="text-sm text-muted-foreground mb-2 block">Target Profit</label>
                            <div className="grid grid-cols-4 gap-2 mb-2">
                                {takeProfitPresets.map((preset) => (
                                    <button
                                        key={preset.value}
                                        onClick={() => setTargetPercentage(preset.value)}
                                        className={cn(
                                            'py-2 rounded-lg text-sm font-medium border transition-all',
                                            targetPercentage === preset.value
                                                ? 'bg-primary text-primary-foreground border-primary'
                                                : 'border-border hover:border-primary/50'
                                        )}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                            <input
                                type="number"
                                value={targetPercentage}
                                onChange={(e) => setTargetPercentage(Number(e.target.value))}
                                className="input-field w-full"
                                placeholder="Custom %"
                            />
                        </div>

                        {/* Slippage */}
                        <div>
                            <label className="text-sm text-muted-foreground mb-2 block">Slippage Tolerance</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="range"
                                    min="0.1"
                                    max="5"
                                    step="0.1"
                                    value={slippage}
                                    onChange={(e) => setSlippage(Number(e.target.value))}
                                    className="flex-1"
                                />
                                <span className="text-sm font-medium w-12 text-right">{slippage}%</span>
                            </div>
                        </div>

                        {/* Auto Execute */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                            <div>
                                <div className="font-medium">Auto-Execute</div>
                                <div className="text-sm text-muted-foreground">Sell when target reached</div>
                            </div>
                            <button
                                onClick={() => setAutoExecute(!autoExecute)}
                                className={cn(
                                    'w-12 h-6 rounded-full transition-colors',
                                    autoExecute ? 'bg-primary' : 'bg-muted'
                                )}
                            >
                                <div className={cn(
                                    'w-5 h-5 rounded-full bg-white transition-transform',
                                    autoExecute ? 'translate-x-6' : 'translate-x-0.5'
                                )} />
                            </button>
                        </div>

                        {/* Summary */}
                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <div className="text-sm text-emerald-400 mb-1">When {position.token} reaches</div>
                            <div className="text-2xl font-bold text-emerald-400">+{targetPercentage}%</div>
                            <div className="text-sm text-emerald-400/70">Auto-sell will execute via Jito bundle</div>
                        </div>

                        <button onClick={handleSave} className="btn-primary w-full">
                            <Target className="w-4 h-4 mr-2" />
                            Save Take-Profit Rule
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

export default function DashboardPage() {
    const { connected, publicKey } = useWallet();
    const { setVisible } = useWalletModal();
    const { balance, positions, setPositions } = useAppStore();
    const [quickTradeOpen, setQuickTradeOpen] = useState(false);
    const [takeProfitModalOpen, setTakeProfitModalOpen] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState<any>(null);
    const [selectedPreset, setSelectedPreset] = useState(50);
    const [slippage, setSlippage] = useState(1);

    // Mock positions for demo (will be replaced with real data when connected)
    const demoPositions = [
        {
            token: 'BONK',
            symbol: 'BONK/SOL',
            amount: '10,000,000',
            entryPrice: 0.0000012,
            currentPrice: 0.0000018,
            pnl: 50.0,
            pnlValue: 600,
            takeProfitSet: true,
            targetPrice: 0.0000024,
        },
        {
            token: 'WIF',
            symbol: 'WIF/SOL',
            amount: '1,500',
            entryPrice: 1.85,
            currentPrice: 2.12,
            pnl: 14.6,
            pnlValue: 405,
            takeProfitSet: true,
            targetPrice: 2.50,
        },
        {
            token: 'POPCAT',
            symbol: 'POPCAT/SOL',
            amount: '5,000',
            entryPrice: 0.42,
            currentPrice: 0.38,
            pnl: -9.5,
            pnlValue: -200,
            takeProfitSet: false,
            targetPrice: null,
        },
    ];

    const displayPositions = positions.length > 0 ? positions : demoPositions;

    const portfolioStats = [
        {
            label: 'Total Balance',
            value: connected ? `${balance.toFixed(2)} SOL` : '$12,450.00',
            change: '+12.5%',
            isPositive: true,
            icon: Wallet,
            color: 'from-emerald-500 to-teal-500',
        },
        {
            label: '24h P&L',
            value: '+$1,245.00',
            change: '+8.2%',
            isPositive: true,
            icon: TrendingUp,
            color: 'from-violet-500 to-purple-500',
        },
        {
            label: 'Active Positions',
            value: displayPositions.length.toString(),
            change: '+2 today',
            isPositive: true,
            icon: Activity,
            color: 'from-blue-500 to-cyan-500',
        },
        {
            label: 'Pending Take-Profits',
            value: displayPositions.filter(p => p.takeProfitSet).length.toString(),
            change: '2 near target',
            isPositive: true,
            icon: Target,
            color: 'from-amber-500 to-orange-500',
        },
    ];

    const recentTransactions = [
        { type: 'BUY', token: 'BONK', amount: '10M', price: '$120', time: '2h ago', hash: '5xH7...' },
        { type: 'SELL', token: 'SAMO', amount: '50K', price: '$89', time: '5h ago', hash: '3kL2...' },
        { type: 'BUY', token: 'WIF', amount: '1.5K', price: '$2,775', time: '1d ago', hash: '9mN4...' },
    ];

    const handleSetTP = (position: any) => {
        setSelectedPosition(position);
        setTakeProfitModalOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Quick Trade Modal */}
            <QuickTradeModal isOpen={quickTradeOpen} onClose={() => setQuickTradeOpen(false)} />

            {/* Set Take-Profit Modal */}
            <SetTakeProfitModal
                isOpen={takeProfitModalOpen}
                onClose={() => setTakeProfitModalOpen(false)}
                position={selectedPosition}
            />

            {/* Welcome Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10"
            >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold mb-1">
                            {connected ? `Welcome back!` : 'Welcome to DegenBot!'}
                        </h1>
                        <p className="text-muted-foreground">
                            {connected
                                ? 'Your portfolio is up 12.5% this week. Keep it going! 🚀'
                                : 'Connect your wallet to start trading with Jito protection.'
                            }
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {connected ? (
                            <>
                                <button
                                    onClick={() => setQuickTradeOpen(true)}
                                    className="btn-primary"
                                >
                                    <Zap className="w-4 h-4 mr-2" />
                                    Quick Trade
                                </button>
                                <button className="btn-outline text-red-400 border-red-400/20 hover:bg-red-500/10">
                                    <XOctagon className="w-4 h-4 mr-2" />
                                    Kill Switch
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setVisible(true)}
                                className="btn-primary"
                            >
                                <Wallet className="w-4 h-4 mr-2" />
                                Connect Wallet
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {portfolioStats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="stat-card"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                            <span className={cn(
                                'text-sm font-medium px-2 py-1 rounded-full',
                                stat.isPositive ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'
                            )}>
                                {stat.change}
                            </span>
                        </div>
                        <div className="text-2xl font-bold mb-1">{stat.value}</div>
                        <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 glass rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold">Portfolio Value</h2>
                            <p className="text-sm text-muted-foreground">Last 24 hours</p>
                        </div>
                        <div className="flex gap-2">
                            {['1H', '24H', '7D', '30D'].map((period) => (
                                <button
                                    key={period}
                                    className={cn(
                                        'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
                                        period === '24H' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                                    )}
                                >
                                    {period}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="time"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                    tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px',
                                    }}
                                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="hsl(160, 84%, 39%)"
                                    strokeWidth={2}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Take-Profit Configuration */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass rounded-2xl p-6"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Target className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-semibold">Quick Take-Profit</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-muted-foreground mb-2 block">Target Percentage</label>
                            <div className="grid grid-cols-4 gap-2">
                                {takeProfitPresets.map((preset) => (
                                    <button
                                        key={preset.value}
                                        onClick={() => setSelectedPreset(preset.value)}
                                        className={cn(
                                            'py-2 rounded-lg text-sm font-medium transition-all border',
                                            selectedPreset === preset.value
                                                ? 'bg-primary text-primary-foreground border-primary'
                                                : 'border-border hover:border-primary/50 hover:bg-muted'
                                        )}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm text-muted-foreground mb-2 block">Slippage Tolerance</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="range"
                                    min="0.1"
                                    max="5"
                                    step="0.1"
                                    value={slippage}
                                    onChange={(e) => setSlippage(Number(e.target.value))}
                                    className="flex-1"
                                />
                                <span className="text-sm font-medium w-12 text-right">{slippage.toFixed(1)}%</span>
                            </div>
                        </div>

                        {!connected && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                <span className="text-sm text-amber-500">Connect wallet to enable auto-execution</span>
                            </div>
                        )}

                        <button
                            onClick={() => connected ? null : setVisible(true)}
                            className="btn-primary w-full"
                        >
                            <Zap className="w-4 h-4 mr-2" />
                            {connected ? 'Set Take-Profit' : 'Connect Wallet'}
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Positions Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass rounded-2xl p-6"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">Active Positions</h2>
                    <Link href="/dashboard/positions" className="text-sm text-primary hover:underline flex items-center gap-1">
                        View All <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Token</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Entry</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Current</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">P&L</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Target</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayPositions.map((position, index) => (
                                <tr key={index} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold">
                                                {position.token[0]}
                                            </div>
                                            <div>
                                                <div className="font-medium">{position.token}</div>
                                                <div className="text-sm text-muted-foreground">{position.symbol}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-right font-mono">{position.amount}</td>
                                    <td className="py-4 px-4 text-right font-mono text-muted-foreground">
                                        ${position.entryPrice < 0.01 ? position.entryPrice.toFixed(7) : position.entryPrice.toFixed(2)}
                                    </td>
                                    <td className="py-4 px-4 text-right font-mono">
                                        ${position.currentPrice < 0.01 ? position.currentPrice.toFixed(7) : position.currentPrice.toFixed(2)}
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <div className={cn(
                                            'font-medium',
                                            position.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                                        )}>
                                            {position.pnl >= 0 ? '+' : ''}{position.pnl.toFixed(1)}%
                                        </div>
                                        <div className={cn(
                                            'text-sm',
                                            position.pnlValue >= 0 ? 'text-emerald-400/70' : 'text-red-400/70'
                                        )}>
                                            {position.pnlValue >= 0 ? '+' : ''}${position.pnlValue}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        {position.takeProfitSet ? (
                                            <span className="text-primary font-mono">
                                                ${position.targetPrice! < 0.01 ? position.targetPrice!.toFixed(7) : position.targetPrice!.toFixed(2)}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">Not set</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <button
                                            onClick={() => handleSetTP(position)}
                                            className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                                        >
                                            {position.takeProfitSet ? 'Edit' : 'Set TP'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Recent Transactions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass rounded-2xl p-6"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">Recent Transactions</h2>
                    <Link href="/dashboard/history" className="text-sm text-primary hover:underline flex items-center gap-1">
                        View All <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="space-y-3">
                    {recentTransactions.map((tx, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    'w-10 h-10 rounded-xl flex items-center justify-center',
                                    tx.type === 'BUY' ? 'bg-emerald-500/10' : 'bg-red-500/10'
                                )}>
                                    {tx.type === 'BUY' ? (
                                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                                    ) : (
                                        <TrendingDown className="w-5 h-5 text-red-400" />
                                    )}
                                </div>
                                <div>
                                    <div className="font-medium flex items-center gap-2">
                                        <span className={tx.type === 'BUY' ? 'text-emerald-400' : 'text-red-400'}>
                                            {tx.type}
                                        </span>
                                        {tx.amount} {tx.token}
                                    </div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Clock className="w-3 h-3" />
                                        {tx.time}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-medium">{tx.price}</div>
                                <a
                                    href={`https://solscan.io/tx/${tx.hash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline flex items-center gap-1 justify-end"
                                >
                                    {tx.hash}
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
