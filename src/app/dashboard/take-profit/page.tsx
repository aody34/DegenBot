'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Target,
    Plus,
    Zap,
    AlertCircle,
    Trash2,
    Settings,
    ToggleLeft,
    ToggleRight,
    Percent,
    DollarSign,
    TrendingUp,
    Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

const activeRules = [
    {
        id: 1,
        token: 'BONK',
        symbol: 'BONK/SOL',
        targetPercentage: 100,
        currentPnl: 50,
        slippage: 1.0,
        autoExecute: true,
        createdAt: '2024-01-15',
        status: 'active',
    },
    {
        id: 2,
        token: 'WIF',
        symbol: 'WIF/SOL',
        targetPercentage: 50,
        currentPnl: 14.6,
        slippage: 0.5,
        autoExecute: true,
        createdAt: '2024-01-14',
        status: 'active',
    },
    {
        id: 3,
        token: 'MYRO',
        symbol: 'MYRO/SOL',
        targetPercentage: 100,
        currentPnl: 37.5,
        slippage: 1.0,
        autoExecute: false,
        createdAt: '2024-01-12',
        status: 'active',
    },
];

const presets = [
    { name: 'Conservative', percentage: 25, slippage: 0.5, description: 'Low risk, quick profits' },
    { name: 'Balanced', percentage: 50, slippage: 1.0, description: 'Moderate risk and reward' },
    { name: 'Aggressive', percentage: 100, slippage: 1.5, description: 'Max gains, higher slippage' },
    { name: 'YOLO', percentage: 200, slippage: 2.0, description: 'Moon or nothing' },
];

export default function TakeProfitPage() {
    const [selectedPreset, setSelectedPreset] = useState(1);
    const [customPercentage, setCustomPercentage] = useState(50);
    const [slippage, setSlippage] = useState(1.0);
    const [autoExecute, setAutoExecute] = useState(true);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Take-Profit Rules</h1>
                    <p className="text-muted-foreground">Configure automatic take-profit execution</p>
                </div>
                <button className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    New Rule
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Configuration Panel */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 glass rounded-2xl p-6"
                >
                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-primary" />
                        Quick Configuration
                    </h2>

                    {/* Presets */}
                    <div className="mb-6">
                        <label className="text-sm text-muted-foreground mb-3 block">Select Preset</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {presets.map((preset, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setSelectedPreset(index);
                                        setCustomPercentage(preset.percentage);
                                        setSlippage(preset.slippage);
                                    }}
                                    className={cn(
                                        'p-4 rounded-xl border transition-all text-left',
                                        selectedPreset === index
                                            ? 'bg-primary/10 border-primary'
                                            : 'border-border hover:border-primary/50'
                                    )}
                                >
                                    <div className="font-semibold mb-1">{preset.name}</div>
                                    <div className="text-2xl font-bold text-primary">{preset.percentage}%</div>
                                    <div className="text-xs text-muted-foreground mt-1">{preset.description}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Settings */}
                    <div className="grid sm:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="text-sm text-muted-foreground mb-2 block">
                                Target Profit (%)
                            </label>
                            <div className="relative">
                                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="number"
                                    value={customPercentage}
                                    onChange={(e) => setCustomPercentage(Number(e.target.value))}
                                    className="input-field pl-10"
                                    placeholder="50"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground mb-2 block">
                                Slippage Tolerance (%)
                            </label>
                            <div className="relative">
                                <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="number"
                                    value={slippage}
                                    onChange={(e) => setSlippage(Number(e.target.value))}
                                    step="0.1"
                                    className="input-field pl-10"
                                    placeholder="1.0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Auto Execute Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 mb-6">
                        <div>
                            <div className="font-medium">Auto-Execute</div>
                            <div className="text-sm text-muted-foreground">
                                Automatically execute when target is reached
                            </div>
                        </div>
                        <button
                            onClick={() => setAutoExecute(!autoExecute)}
                            className="text-primary"
                        >
                            {autoExecute ? (
                                <ToggleRight className="w-10 h-10" />
                            ) : (
                                <ToggleLeft className="w-10 h-10 text-muted-foreground" />
                            )}
                        </button>
                    </div>

                    {/* Warning */}
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6">
                        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <div className="font-medium text-amber-500">Connect Wallet Required</div>
                            <div className="text-sm text-amber-500/80">
                                You need to connect your wallet to enable auto-execution feature.
                            </div>
                        </div>
                    </div>

                    <button className="btn-primary w-full">
                        <Zap className="w-4 h-4 mr-2" />
                        Apply to All Positions
                    </button>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4"
                >
                    <div className="glass rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Target className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold">Active Rules</h3>
                        </div>
                        <div className="text-4xl font-bold mb-2">3</div>
                        <div className="text-sm text-muted-foreground">2 with auto-execute</div>
                    </div>

                    <div className="glass rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <DollarSign className="w-5 h-5 text-emerald-400" />
                            <h3 className="font-semibold">Protected Value</h3>
                        </div>
                        <div className="text-4xl font-bold text-emerald-400 mb-2">$7,730</div>
                        <div className="text-sm text-muted-foreground">If all targets hit</div>
                    </div>

                    <div className="glass rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock className="w-5 h-5 text-violet-400" />
                            <h3 className="font-semibold">Avg. Time to Target</h3>
                        </div>
                        <div className="text-4xl font-bold text-violet-400 mb-2">~2.5h</div>
                        <div className="text-sm text-muted-foreground">Based on volatility</div>
                    </div>
                </motion.div>
            </div>

            {/* Active Rules */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-2xl p-6"
            >
                <h2 className="text-lg font-semibold mb-6">Active Take-Profit Rules</h2>

                <div className="space-y-4">
                    {activeRules.map((rule, index) => (
                        <div
                            key={rule.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-lg font-bold">
                                    {rule.token[0]}
                                </div>
                                <div>
                                    <div className="font-semibold">{rule.token}</div>
                                    <div className="text-sm text-muted-foreground">{rule.symbol}</div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-6">
                                <div>
                                    <div className="text-sm text-muted-foreground">Target</div>
                                    <div className="font-semibold text-primary">+{rule.targetPercentage}%</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Current</div>
                                    <div className="font-semibold text-emerald-400">+{rule.currentPnl}%</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Slippage</div>
                                    <div className="font-semibold">{rule.slippage}%</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Auto</div>
                                    <div className={cn(
                                        'font-semibold',
                                        rule.autoExecute ? 'text-emerald-400' : 'text-muted-foreground'
                                    )}>
                                        {rule.autoExecute ? 'On' : 'Off'}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 ml-auto">
                                    <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                                        <Settings className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
