'use client';

import { motion } from 'framer-motion';
import {
    History,
    Search,
    Filter,
    TrendingUp,
    TrendingDown,
    ExternalLink,
    Calendar,
    ChevronDown,
    Download,
    Clock,
    CheckCircle,
    XCircle,
    Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

const transactions = [
    {
        id: 1,
        type: 'SELL',
        action: 'Take-Profit',
        token: 'SAMO',
        symbol: 'SAMO/SOL',
        amount: '50,000',
        entryPrice: 0.0156,
        exitPrice: 0.0234,
        pnl: 50.0,
        pnlValue: 390,
        fee: 0.12,
        timestamp: '2024-01-15 14:32:00',
        hash: '5xH7kL9mN2oP4qR6sT8uV0wX3yZ1aB2cD4eF6gH8jK0',
        status: 'completed',
    },
    {
        id: 2,
        type: 'BUY',
        action: 'Market Buy',
        token: 'BONK',
        symbol: 'BONK/SOL',
        amount: '10,000,000',
        entryPrice: null,
        exitPrice: 0.0000012,
        pnl: null,
        pnlValue: null,
        fee: 0.08,
        timestamp: '2024-01-15 12:15:00',
        hash: '3kL2mN4oP6qR8sT0uV2wX4yZ6aB8cD0eF2gH4jK6mN8',
        status: 'completed',
    },
    {
        id: 3,
        type: 'SELL',
        action: 'Manual Sell',
        token: 'PONKE',
        symbol: 'PONKE/SOL',
        amount: '2,500',
        entryPrice: 0.45,
        exitPrice: 0.38,
        pnl: -15.5,
        pnlValue: -175,
        fee: 0.15,
        timestamp: '2024-01-14 22:45:00',
        hash: '9mN4oP6qR8sT0uV2wX4yZ6aB8cD0eF2gH4jK6mN8oP0',
        status: 'completed',
    },
    {
        id: 4,
        type: 'SELL',
        action: 'Take-Profit',
        token: 'WIF',
        symbol: 'WIF/SOL',
        amount: '500',
        entryPrice: 1.20,
        exitPrice: 1.80,
        pnl: 50.0,
        pnlValue: 300,
        fee: 0.22,
        timestamp: '2024-01-14 16:20:00',
        hash: '7kL9mN2oP4qR6sT8uV0wX3yZ1aB2cD4eF6gH8jK0mN2',
        status: 'completed',
    },
    {
        id: 5,
        type: 'BUY',
        action: 'Market Buy',
        token: 'WIF',
        symbol: 'WIF/SOL',
        amount: '1,500',
        entryPrice: null,
        exitPrice: 1.85,
        pnl: null,
        pnlValue: null,
        fee: 0.35,
        timestamp: '2024-01-13 09:30:00',
        hash: '1aB2cD4eF6gH8jK0mN2oP4qR6sT8uV0wX3yZ5aB7cD9',
        status: 'completed',
    },
    {
        id: 6,
        type: 'SELL',
        action: 'Take-Profit',
        token: 'MYRO',
        symbol: 'MYRO/SOL',
        amount: '10,000',
        entryPrice: 0.055,
        exitPrice: 0.11,
        pnl: 100.0,
        pnlValue: 550,
        fee: 0.18,
        timestamp: '2024-01-12 18:00:00',
        hash: '4eF6gH8jK0mN2oP4qR6sT8uV0wX3yZ1aB2cD5eF7gH9',
        status: 'completed',
    },
];

const stats = [
    { label: 'Total Trades', value: '156', change: '+12 this week' },
    { label: 'Win Rate', value: '68%', change: '+5% vs last month' },
    { label: 'Total Profit', value: '+$4,280', change: 'All time' },
    { label: 'Avg. Return', value: '+23.5%', change: 'Per trade' },
];

export default function HistoryPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Transaction History</h1>
                    <p className="text-muted-foreground">View all your past trades and take-profits</p>
                </div>
                <button className="btn-outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass rounded-xl p-4"
                    >
                        <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <div className="text-xs text-muted-foreground mt-1">{stat.change}</div>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-2xl p-4"
            >
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by token or hash..."
                            className="input-field pl-10"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button className="btn-outline flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Date Range
                            <ChevronDown className="w-4 h-4" />
                        </button>
                        <select className="input-field w-auto">
                            <option>All Types</option>
                            <option>Buys Only</option>
                            <option>Sells Only</option>
                            <option>Take-Profits</option>
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* Transactions List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass rounded-2xl overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/30">
                            <tr>
                                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Token</th>
                                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Type</th>
                                <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Amount</th>
                                <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Price</th>
                                <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">P&L</th>
                                <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Time</th>
                                <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Tx</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx, index) => (
                                <tr
                                    key={tx.id}
                                    className="border-t border-border/50 hover:bg-muted/20 transition-colors"
                                >
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold">
                                                {tx.token[0]}
                                            </div>
                                            <div>
                                                <div className="font-medium">{tx.token}</div>
                                                <div className="text-sm text-muted-foreground">{tx.symbol}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                'w-8 h-8 rounded-lg flex items-center justify-center',
                                                tx.type === 'BUY' ? 'bg-emerald-500/10' : 'bg-red-500/10'
                                            )}>
                                                {tx.type === 'BUY' ? (
                                                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                                                ) : (
                                                    <TrendingDown className="w-4 h-4 text-red-400" />
                                                )}
                                            </div>
                                            <div>
                                                <div className={cn(
                                                    'font-medium',
                                                    tx.type === 'BUY' ? 'text-emerald-400' : 'text-red-400'
                                                )}>
                                                    {tx.type}
                                                </div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                    {tx.action === 'Take-Profit' && <Target className="w-3 h-3 text-primary" />}
                                                    {tx.action}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right font-mono">{tx.amount}</td>
                                    <td className="py-4 px-6 text-right font-mono">
                                        ${tx.exitPrice < 0.01 ? tx.exitPrice.toFixed(7) : tx.exitPrice.toFixed(2)}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        {tx.pnl !== null ? (
                                            <div className={cn(
                                                'font-medium',
                                                tx.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                                            )}>
                                                {tx.pnl >= 0 ? '+' : ''}{tx.pnl}%
                                                <div className="text-sm opacity-70">
                                                    {tx.pnlValue! >= 0 ? '+' : ''}${Math.abs(tx.pnlValue!)}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="text-sm">{tx.timestamp.split(' ')[1]}</div>
                                        <div className="text-xs text-muted-foreground">{tx.timestamp.split(' ')[0]}</div>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <a
                                            href={`https://solscan.io/tx/${tx.hash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                                        >
                                            {tx.hash.slice(0, 6)}...
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between p-4 border-t border-border/50">
                    <div className="text-sm text-muted-foreground">
                        Showing 1-6 of 156 transactions
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm">
                            Previous
                        </button>
                        <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm">
                            1
                        </button>
                        <button className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm">
                            2
                        </button>
                        <button className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm">
                            3
                        </button>
                        <button className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm">
                            Next
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
