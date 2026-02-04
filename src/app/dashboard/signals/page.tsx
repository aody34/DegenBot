'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';

interface Signal {
    id: string;
    whale_id: string;
    token_address: string;
    token_name: string | null;
    token_symbol: string | null;
    type: 'BUY' | 'SELL';
    sol_amount: number | null;
    token_amount: number | null;
    price_usd: number | null;
    ai_score: number;
    ai_reasoning: string | null;
    tx_hash: string;
    status: 'PENDING' | 'EXECUTED' | 'SKIPPED' | 'FAILED';
    created_at: string;
    whales: {
        label: string;
        win_rate: number;
    } | null;
}

export default function SignalsPage() {
    const [signals, setSignals] = useState<Signal[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'EXECUTED' | 'SKIPPED'>('ALL');
    const [executing, setExecuting] = useState<string | null>(null);

    const { publicKey, signTransaction, connected } = useWallet();
    const supabase = createBrowserClient();

    useEffect(() => {
        fetchSignals();

        // Real-time subscription
        const channel = supabase
            .channel('signals')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'signals' },
                (payload) => {
                    fetchSignals(); // Refresh on new signal
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    async function fetchSignals() {
        const { data, error } = await supabase
            .from('signals')
            .select('*, whales(label, win_rate)')
            .order('created_at', { ascending: false })
            .limit(100);

        if (data) setSignals(data);
        setLoading(false);
    }

    async function executeTrade(signal: Signal) {
        if (!connected || !publicKey || !signTransaction) {
            alert('Please connect your wallet first');
            return;
        }

        setExecuting(signal.id);

        try {
            // Call the API to prepare and execute the trade
            const response = await fetch('/api/trading/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    signalId: signal.id,
                    walletAddress: publicKey.toBase58(),
                }),
            });

            const result = await response.json();

            if (result.success) {
                // Update local state
                setSignals(signals.map(s =>
                    s.id === signal.id ? { ...s, status: 'EXECUTED' } : s
                ));
                alert(`✅ Trade executed! TX: ${result.txHash?.slice(0, 8)}...`);
            } else {
                alert(`❌ Trade failed: ${result.error}`);
            }
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        }

        setExecuting(null);
    }

    function getScoreColor(score: number) {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        if (score >= 40) return 'text-orange-400';
        return 'text-red-400';
    }

    function getStatusBadge(status: string) {
        const styles: Record<string, string> = {
            PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            EXECUTED: 'bg-green-500/20 text-green-400 border-green-500/30',
            SKIPPED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
            FAILED: 'bg-red-500/20 text-red-400 border-red-500/30',
        };
        return styles[status] || styles.SKIPPED;
    }

    function formatTime(dateStr: string) {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    const filteredSignals = filter === 'ALL'
        ? signals
        : signals.filter(s => s.status === filter);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                        📡 Live Signals
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Real-time whale trades with AI analysis
                    </p>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 bg-gray-800 p-1 rounded-lg">
                    {(['ALL', 'PENDING', 'EXECUTED', 'SKIPPED'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4">
                    <p className="text-gray-400 text-sm">Total Signals</p>
                    <p className="text-2xl font-bold">{signals.length}</p>
                </div>
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4">
                    <p className="text-gray-400 text-sm">Pending</p>
                    <p className="text-2xl font-bold text-yellow-400">
                        {signals.filter(s => s.status === 'PENDING').length}
                    </p>
                </div>
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4">
                    <p className="text-gray-400 text-sm">Executed</p>
                    <p className="text-2xl font-bold text-green-400">
                        {signals.filter(s => s.status === 'EXECUTED').length}
                    </p>
                </div>
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4">
                    <p className="text-gray-400 text-sm">Avg AI Score</p>
                    <p className="text-2xl font-bold text-purple-400">
                        {signals.length > 0
                            ? Math.round(signals.reduce((acc, s) => acc + s.ai_score, 0) / signals.length)
                            : 0}
                    </p>
                </div>
            </div>

            {/* Signals List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            ) : filteredSignals.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-6xl mb-4">📡</p>
                    <p className="text-xl text-gray-400">No signals yet</p>
                    <p className="text-gray-500 mt-2">Signals will appear when tracked whales make trades</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredSignals.map((signal) => (
                        <div
                            key={signal.id}
                            className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-5 hover:border-purple-500/50 transition-all"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    {/* Type badge */}
                                    <div className={`px-3 py-1 rounded-lg font-bold text-sm ${signal.type === 'BUY'
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-red-500/20 text-red-400'
                                        }`}>
                                        {signal.type}
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-lg">
                                                {signal.token_symbol || signal.token_address.slice(0, 8)}
                                            </h3>
                                            <span className={`px-2 py-0.5 text-xs rounded border ${getStatusBadge(signal.status)}`}>
                                                {signal.status}
                                            </span>
                                        </div>
                                        <p className="text-gray-400 text-sm mt-1">
                                            🐋 {signal.whales?.label || 'Unknown'}
                                            <span className="text-gray-500 mx-2">•</span>
                                            {formatTime(signal.created_at)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    {/* AI Score */}
                                    <div className="text-center">
                                        <p className="text-xs text-gray-400">AI Score</p>
                                        <p className={`text-2xl font-bold ${getScoreColor(signal.ai_score)}`}>
                                            {signal.ai_score}
                                        </p>
                                    </div>

                                    {/* SOL Amount */}
                                    {signal.sol_amount && (
                                        <div className="text-center">
                                            <p className="text-xs text-gray-400">Amount</p>
                                            <p className="font-bold">{signal.sol_amount.toFixed(2)} SOL</p>
                                        </div>
                                    )}

                                    {/* Execute button */}
                                    {signal.status === 'PENDING' && signal.type === 'BUY' && (
                                        <button
                                            onClick={() => executeTrade(signal)}
                                            disabled={executing === signal.id || !connected}
                                            className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {executing === signal.id ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                                                    Executing...
                                                </>
                                            ) : (
                                                <>⚡ Copy Trade</>
                                            )}
                                        </button>
                                    )}

                                    {/* View TX */}
                                    <a
                                        href={`https://solscan.io/tx/${signal.tx_hash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        🔗
                                    </a>
                                </div>
                            </div>

                            {/* AI Reasoning */}
                            {signal.ai_reasoning && (
                                <div className="mt-4 p-3 bg-gray-700/30 rounded-lg">
                                    <p className="text-xs text-gray-400 mb-1">🧠 AI Analysis</p>
                                    <p className="text-sm text-gray-300">{signal.ai_reasoning}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
