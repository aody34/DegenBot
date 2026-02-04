'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';

interface Whale {
    id: string;
    address: string;
    label: string;
    total_trades: number;
    win_rate: number;
    avg_profit_pct: number;
    is_active: boolean;
    last_active_at: string | null;
}

export default function WhalesPage() {
    const [whales, setWhales] = useState<Whale[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newWhale, setNewWhale] = useState({ address: '', label: '' });
    const [saving, setSaving] = useState(false);

    const supabase = createBrowserClient();

    useEffect(() => {
        fetchWhales();
    }, []);

    async function fetchWhales() {
        const { data, error } = await supabase
            .from('whales')
            .select('*')
            .order('win_rate', { ascending: false });

        if (data) setWhales(data);
        setLoading(false);
    }

    async function toggleWhale(id: string, isActive: boolean) {
        await supabase
            .from('whales')
            .update({ is_active: !isActive })
            .eq('id', id);

        setWhales(whales.map(w =>
            w.id === id ? { ...w, is_active: !isActive } : w
        ));
    }

    async function addWhale() {
        if (!newWhale.address || !newWhale.label) return;
        setSaving(true);

        const { data, error } = await supabase
            .from('whales')
            .insert({
                address: newWhale.address,
                label: newWhale.label,
            })
            .select()
            .single();

        if (data) {
            setWhales([...whales, data]);
            setNewWhale({ address: '', label: '' });
            setShowAddModal(false);
        }
        setSaving(false);
    }

    async function deleteWhale(id: string) {
        if (!confirm('Are you sure you want to delete this whale?')) return;

        await supabase.from('whales').delete().eq('id', id);
        setWhales(whales.filter(w => w.id !== id));
    }

    function formatTimeAgo(dateStr: string | null) {
        if (!dateStr) return 'Never';
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        🐋 Whale Tracking
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Manage the wallets you're copy trading
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center gap-2"
                >
                    <span>+</span> Add Whale
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4">
                    <p className="text-gray-400 text-sm">Total Whales</p>
                    <p className="text-2xl font-bold">{whales.length}</p>
                </div>
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4">
                    <p className="text-gray-400 text-sm">Active</p>
                    <p className="text-2xl font-bold text-green-400">
                        {whales.filter(w => w.is_active).length}
                    </p>
                </div>
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4">
                    <p className="text-gray-400 text-sm">Avg Win Rate</p>
                    <p className="text-2xl font-bold text-cyan-400">
                        {whales.length > 0
                            ? (whales.reduce((acc, w) => acc + w.win_rate, 0) / whales.length).toFixed(1)
                            : 0}%
                    </p>
                </div>
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4">
                    <p className="text-gray-400 text-sm">Total Trades Tracked</p>
                    <p className="text-2xl font-bold">
                        {whales.reduce((acc, w) => acc + w.total_trades, 0)}
                    </p>
                </div>
            </div>

            {/* Whale List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
                </div>
            ) : whales.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-6xl mb-4">🐋</p>
                    <p className="text-xl text-gray-400">No whales tracked yet</p>
                    <p className="text-gray-500 mt-2">Add a whale wallet to start copy trading</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {whales.map((whale) => (
                        <div
                            key={whale.id}
                            className={`bg-gray-800/50 backdrop-blur border rounded-xl p-5 transition-all hover:border-cyan-500/50 ${whale.is_active ? 'border-gray-700' : 'border-gray-700/50 opacity-60'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {/* Status indicator */}
                                    <div className={`w-3 h-3 rounded-full ${whale.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                                        }`} />

                                    <div>
                                        <h3 className="font-semibold text-lg">{whale.label}</h3>
                                        <p className="text-gray-400 text-sm font-mono">
                                            {whale.address.slice(0, 6)}...{whale.address.slice(-4)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    {/* Stats */}
                                    <div className="text-center">
                                        <p className="text-xs text-gray-400">Win Rate</p>
                                        <p className={`font-bold ${whale.win_rate >= 60 ? 'text-green-400' :
                                                whale.win_rate >= 40 ? 'text-yellow-400' : 'text-red-400'
                                            }`}>
                                            {whale.win_rate.toFixed(1)}%
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-400">Trades</p>
                                        <p className="font-bold">{whale.total_trades}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-400">Last Active</p>
                                        <p className="text-sm">{formatTimeAgo(whale.last_active_at)}</p>
                                    </div>

                                    {/* Toggle */}
                                    <button
                                        onClick={() => toggleWhale(whale.id, whale.is_active)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all ${whale.is_active
                                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                            }`}
                                    >
                                        {whale.is_active ? 'Tracking' : 'Paused'}
                                    </button>

                                    {/* Delete */}
                                    <button
                                        onClick={() => deleteWhale(whale.id)}
                                        className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Whale Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Add New Whale</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Wallet Address</label>
                                <input
                                    type="text"
                                    value={newWhale.address}
                                    onChange={(e) => setNewWhale({ ...newWhale, address: e.target.value })}
                                    placeholder="Solana wallet address..."
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:border-cyan-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Label</label>
                                <input
                                    type="text"
                                    value={newWhale.label}
                                    onChange={(e) => setNewWhale({ ...newWhale, label: e.target.value })}
                                    placeholder="e.g., Smart Money Alpha"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:border-cyan-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 px-4 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={addWhale}
                                disabled={saving || !newWhale.address || !newWhale.label}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50"
                            >
                                {saving ? 'Adding...' : 'Add Whale'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
