'use client';

import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { cn, formatCurrency, formatPercentage, shortenAddress } from '@/lib/utils';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

// Mock data for demonstration
const portfolioStats = [
    {
        label: 'Total Balance',
        value: '$12,450.00',
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
        value: '5',
        change: '+2 today',
        isPositive: true,
        icon: Activity,
        color: 'from-blue-500 to-cyan-500',
    },
    {
        label: 'Pending Take-Profits',
        value: '3',
        change: '2 near target',
        isPositive: true,
        icon: Target,
        color: 'from-amber-500 to-orange-500',
    },
];

const positions = [
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

const recentTransactions = [
    { type: 'BUY', token: 'BONK', amount: '10M', price: '$120', time: '2h ago', hash: '5xH7...' },
    { type: 'SELL', token: 'SAMO', amount: '50K', price: '$89', time: '5h ago', hash: '3kL2...' },
    { type: 'BUY', token: 'WIF', amount: '1.5K', price: '$2,775', time: '1d ago', hash: '9mN4...' },
];

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

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10"
            >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold mb-1">Welcome back, Trader!</h1>
                        <p className="text-muted-foreground">Your portfolio is up 12.5% this week. Keep it going! 🚀</p>
                    </div>
                    <button className="btn-primary">
                        <Zap className="w-4 h-4 mr-2" />
                        Quick Trade
                    </button>
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
                                        className={cn(
                                            'py-2 rounded-lg text-sm font-medium transition-all border',
                                            preset.value === 50
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
                                    defaultValue="1"
                                    className="flex-1"
                                />
                                <span className="text-sm font-medium w-12 text-right">1.0%</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            <span className="text-sm text-amber-500">Connect wallet to enable auto-execution</span>
                        </div>

                        <button className="btn-primary w-full">
                            <Zap className="w-4 h-4 mr-2" />
                            Set Take-Profit
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
                    <button className="text-sm text-primary hover:underline flex items-center gap-1">
                        View All <ChevronRight className="w-4 h-4" />
                    </button>
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
                            {positions.map((position, index) => (
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
                                        <button className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
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
                    <button className="text-sm text-primary hover:underline flex items-center gap-1">
                        View All <ChevronRight className="w-4 h-4" />
                    </button>
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
