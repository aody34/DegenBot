'use client';

import { motion } from 'framer-motion';
import {
    Search,
    Filter,
    TrendingUp,
    TrendingDown,
    Target,
    ExternalLink,
    MoreVertical,
    Plus,
    ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

const positions = [
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

export default function PositionsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Positions</h1>
                    <p className="text-muted-foreground">Manage all your active trading positions</p>
                </div>
                <button className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Position
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
                            className="input-field pl-10"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="btn-outline flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            Filter
                            <ChevronDown className="w-4 h-4" />
                        </button>
                        <select className="input-field w-auto">
                            <option>All Positions</option>
                            <option>Profitable</option>
                            <option>At Loss</option>
                            <option>With TP Set</option>
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
                    <div className="text-2xl font-bold">$10,350.00</div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass rounded-xl p-4"
                >
                    <div className="text-sm text-muted-foreground mb-1">Unrealized P&L</div>
                    <div className="text-2xl font-bold text-emerald-400">+$1,315.00</div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass rounded-xl p-4"
                >
                    <div className="text-sm text-muted-foreground mb-1">Positions with TP</div>
                    <div className="text-2xl font-bold">3 / 5</div>
                </motion.div>
            </div>

            {/* Positions Grid */}
            <div className="grid gap-4">
                {positions.map((position, index) => (
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
                                        <button className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors flex items-center gap-2">
                                            <Target className="w-4 h-4" />
                                            Edit TP
                                        </button>
                                    ) : (
                                        <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-colors flex items-center gap-2">
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
        </div>
    );
}
