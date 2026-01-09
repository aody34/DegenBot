'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import {
    Search,
    Filter,
    TrendingUp,
    TrendingDown,
    Target,
    ExternalLink,
    MoreVertical,
    Plus,
    ChevronDown,
    X,
    Wallet,
    RefreshCw,
    Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { getTokenAccounts, fetchTokenPrice } from '@/lib/solana/connection';

// Demo positions (used when not connected)
const demoPositions = [
    {
        token: 'BONK',
        symbol: 'BONK/SOL',
        amount: '10,000,000',
        value: 1800,
        entryPrice: 0.0000012,
        currentPrice: 0.0000018,
        pnl: 50.0,
        pnlValue: 600,
        takeProfitSet: true,
        targetPrice: 0.0000024,
        targetPnl: 100,
        status: 'profitable',
    },
    {
        token: 'WIF',
        symbol: 'WIF/SOL',
        amount: '1,500',
        value: 3180,
        entryPrice: 1.85,
        currentPrice: 2.12,
        pnl: 14.6,
        pnlValue: 405,
        takeProfitSet: true,
        targetPrice: 2.50,
        targetPnl: 35,
        status: 'profitable',
    },
    {
        token: 'POPCAT',
        symbol: 'POPCAT/SOL',
        amount: '5,000',
        value: 1900,
        entryPrice: 0.42,
        currentPrice: 0.38,
        pnl: -9.5,
        pnlValue: -200,
        takeProfitSet: false,
        targetPrice: null,
        targetPnl: null,
        status: 'loss',
    },
    {
        token: 'MYRO',
        symbol: 'MYRO/SOL',
        amount: '25,000',
        value: 2750,
        entryPrice: 0.08,
        currentPrice: 0.11,
        pnl: 37.5,
        pnlValue: 750,
        takeProfitSet: true,
        targetPrice: 0.16,
        targetPnl: 100,
        status: 'profitable',
    },
    {
        token: 'SLERF',
        symbol: 'SLERF/SOL',
        amount: '8,000',
        value: 720,
        entryPrice: 0.12,
        currentPrice: 0.09,
        pnl: -25.0,
        pnlValue: -240,
        takeProfitSet: false,
        targetPrice: null,
        targetPnl: null,
        status: 'loss',
    },
];

// Import Token Modal
function ImportTokenModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [tokenAddress, setTokenAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleImport = async () => {
        if (!tokenAddress) {
            setError('Please enter a token address');
            return;
        }
        setLoading(true);
        setError('');

        // Simulate import
        setTimeout(() => {
            setLoading(false);
            onClose();
            setTokenAddress('');
        }, 1500);
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
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            >
                <div className="glass rounded-2xl p-6 border border-primary/20">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                <Plus className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-xl font-bold">Import Token</h3>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-muted-foreground mb-2 block">Token Mint Address</label>
                            <input
                                type="text"
                                value={tokenAddress}
                                onChange={(e) => setTokenAddress(e.target.value)}
                                placeholder="Paste token mint address..."
                                className="input-field w-full"
                            />
                            {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
                        </div>

                        <p className="text-sm text-muted-foreground">
                            We'll fetch real-time price, liquidity, and market data from DexScreener.
                        </p>

                        <button
                            onClick={handleImport}
                            disabled={loading}
                            className="btn-primary w-full"
                        >
                            {loading ? (
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Plus className="w-4 h-4 mr-2" />
                            )}
                            {loading ? 'Importing...' : 'Import Token'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

// Set TP Modal for positions
function SetTPModal({
    isOpen,
    onClose,
    position
}: {
    isOpen: boolean;
    onClose: () => void;
    position: any;
}) {
    const [targetPercentage, setTargetPercentage] = useState(50);
    const { addTakeProfitOrder } = useAppStore();

    if (!isOpen || !position) return null;

    const handleSave = () => {
        addTakeProfitOrder({
            id: Date.now().toString(),
            positionId: position.token,
            targetPercentage,
            slippage: 1,
            autoExecute: true,
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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm"
            >
                <div className="glass rounded-2xl p-6 border border-primary/20">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold">Set Take-Profit for {position.token}</h3>
                        <button onClick={onClose} className="p-1 hover:bg-muted rounded">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-4 gap-2">
                            {[25, 50, 100, 200].map((val) => (
                                <button
                                    key={val}
                                    onClick={() => setTargetPercentage(val)}
                                    className={cn(
                                        'py-2 rounded-lg text-sm font-medium border',
                                        targetPercentage === val
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'border-border hover:border-primary/50'
                                    )}
                                >
                                    {val}%
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

                        <button onClick={handleSave} className="btn-primary w-full">
                            <Target className="w-4 h-4 mr-2" />
                            Save Take-Profit
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

export default function PositionsPage() {
    const { connected, publicKey } = useWallet();
    const { setVisible } = useWalletModal();
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [tpModalOpen, setTPModalOpen] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');

    const positions = demoPositions;

    const filteredPositions = positions.filter(p => {
        const matchesSearch = p.token.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' ||
            (filter === 'profitable' && p.pnl >= 0) ||
            (filter === 'loss' && p.pnl < 0) ||
            (filter === 'tp-set' && p.takeProfitSet);
        return matchesSearch && matchesFilter;
    });

    const totalValue = positions.reduce((sum, p) => sum + p.value, 0);
    const totalPnl = positions.reduce((sum, p) => sum + p.pnlValue, 0);
    const positionsWithTP = positions.filter(p => p.takeProfitSet).length;

    const handleSetTP = (position: any) => {
        setSelectedPosition(position);
        setTPModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <ImportTokenModal isOpen={importModalOpen} onClose={() => setImportModalOpen(false)} />
            <SetTPModal
                isOpen={tpModalOpen}
                onClose={() => setTPModalOpen(false)}
                position={selectedPosition}
            />

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Positions</h1>
                    <p className="text-muted-foreground">Manage all your active trading positions</p>
                </div>
                <button
                    onClick={() => connected ? setImportModalOpen(true) : setVisible(true)}
                    className="btn-primary"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    {connected ? 'Add Position' : 'Connect Wallet'}
                </button>
            </div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-4"
            >
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search tokens..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-field pl-10 w-full"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="input-field w-auto"
                        >
                            <option value="all">All Positions</option>
                            <option value="profitable">Profitable</option>
                            <option value="loss">At Loss</option>
                            <option value="tp-set">With TP Set</option>
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass rounded-xl p-4"
                >
                    <div className="text-sm text-muted-foreground mb-1">Total Value</div>
                    <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass rounded-xl p-4"
                >
                    <div className="text-sm text-muted-foreground mb-1">Unrealized P&L</div>
                    <div className={cn(
                        'text-2xl font-bold',
                        totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                    )}>
                        {totalPnl >= 0 ? '+' : ''}${totalPnl.toLocaleString()}
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass rounded-xl p-4"
                >
                    <div className="text-sm text-muted-foreground mb-1">Positions with TP</div>
                    <div className="text-2xl font-bold">{positionsWithTP} / {positions.length}</div>
                </motion.div>
            </div>

            {/* Positions Grid */}
            <div className="grid gap-4">
                {filteredPositions.map((position, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="glass rounded-2xl p-6 hover:border-primary/30 transition-all"
                    >
                        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                            {/* Token Info */}
                            <div className="flex items-center gap-4 lg:w-48">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-lg font-bold">
                                    {position.token[0]}
                                </div>
                                <div>
                                    <div className="font-semibold text-lg">{position.token}</div>
                                    <div className="text-sm text-muted-foreground">{position.symbol}</div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div>
                                    <div className="text-sm text-muted-foreground mb-1">Amount</div>
                                    <div className="font-mono font-medium">{position.amount}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground mb-1">Value</div>
                                    <div className="font-mono font-medium">${position.value.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground mb-1">Entry</div>
                                    <div className="font-mono text-muted-foreground">
                                        ${position.entryPrice < 0.01 ? position.entryPrice.toFixed(7) : position.entryPrice.toFixed(2)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground mb-1">Current</div>
                                    <div className="font-mono font-medium">
                                        ${position.currentPrice < 0.01 ? position.currentPrice.toFixed(7) : position.currentPrice.toFixed(2)}
                                    </div>
                                </div>
                            </div>

                            {/* P&L */}
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="text-sm text-muted-foreground mb-1">P&L</div>
                                    <div className={cn(
                                        'font-semibold',
                                        position.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                                    )}>
                                        {position.pnl >= 0 ? '+' : ''}{position.pnl.toFixed(1)}%
                                    </div>
                                    <div className={cn(
                                        'text-sm',
                                        position.pnlValue >= 0 ? 'text-emerald-400/70' : 'text-red-400/70'
                                    )}>
                                        {position.pnlValue >= 0 ? '+' : ''}${Math.abs(position.pnlValue)}
                                    </div>
                                </div>

                                {/* Target */}
                                <div className="text-right">
                                    <div className="text-sm text-muted-foreground mb-1">Target</div>
                                    {position.takeProfitSet ? (
                                        <>
                                            <div className="text-primary font-mono">
                                                ${position.targetPrice! < 0.01 ? position.targetPrice!.toFixed(7) : position.targetPrice!.toFixed(2)}
                                            </div>
                                            <div className="text-sm text-primary/70">+{position.targetPnl}%</div>
                                        </>
                                    ) : (
                                        <div className="text-muted-foreground">Not set</div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    {position.takeProfitSet ? (
                                        <button
                                            onClick={() => handleSetTP(position)}
                                            className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors flex items-center gap-2"
                                        >
                                            <Target className="w-4 h-4" />
                                            Edit TP
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleSetTP(position)}
                                            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-colors flex items-center gap-2"
                                        >
                                            <Target className="w-4 h-4" />
                                            Set TP
                                        </button>
                                    )}
                                    <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredPositions.length === 0 && (
                <div className="glass rounded-2xl p-12 text-center">
                    <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No positions found</h3>
                    <p className="text-muted-foreground mb-6">
                        {searchQuery ? 'Try a different search term' : 'Import a token to get started'}
                    </p>
                    <button
                        onClick={() => connected ? setImportModalOpen(true) : setVisible(true)}
                        className="btn-primary"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        {connected ? 'Import Token' : 'Connect Wallet'}
                    </button>
                </div>
            )}
        </div>
    );
}
