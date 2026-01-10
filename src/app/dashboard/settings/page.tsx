'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import {
    Settings,
    User,
    Bell,
    Shield,
    Wallet,
    Link2,
    Moon,
    Sun,
    Globe,
    Save,
    ToggleLeft,
    ToggleRight,
    Key,
    Smartphone,
    MessageSquare,
    Mail,
    LogOut,
    Copy,
    Check,
    ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';

const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Link2 },
];

export default function SettingsPage() {
    const { connected, publicKey, disconnect } = useWallet();
    const { setVisible } = useWalletModal();
    const { balance, setConnected } = useAppStore();
    const [activeTab, setActiveTab] = useState('general');
    const [copied, setCopied] = useState(false);
    const [settings, setSettings] = useState({
        darkMode: true,
        defaultSlippage: 1.0,
        autoTakeProfit: true,
        emailNotifications: true,
        telegramNotifications: false,
        pushNotifications: true,
        twoFactorAuth: false,
        whitelistOnly: false,
    });

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleCopy = async () => {
        if (publicKey) {
            await navigator.clipboard.writeText(publicKey.toBase58());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDisconnect = () => {
        disconnect();
        setConnected(false);
    };

    const shortenAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your account and preferences</p>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
                {/* Sidebar Tabs */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-1"
                >
                    <div className="glass rounded-2xl p-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left',
                                    activeTab === tab.id
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                )}
                            >
                                <tab.icon className="w-5 h-5" />
                                <span className="font-medium">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-3 glass rounded-2xl p-6"
                >
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold">General Settings</h2>

                            {/* Wallet Connection Status */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-muted-foreground">Wallet</h3>
                                {connected && publicKey ? (
                                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                                    <Wallet className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                        <span className="text-emerald-400 font-medium">Connected</span>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground font-mono flex items-center gap-2">
                                                        {shortenAddress(publicKey.toBase58())}
                                                        <button onClick={handleCopy} className="hover:text-foreground transition-colors">
                                                            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                                        </button>
                                                        <a
                                                            href={`https://solscan.io/account/${publicKey.toBase58()}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="hover:text-foreground transition-colors"
                                                        >
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold">{balance.toFixed(4)} SOL</div>
                                                <div className="text-sm text-muted-foreground">Balance</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleDisconnect}
                                            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors font-medium"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Disconnect Wallet
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                            <User className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold">Wallet Not Connected</div>
                                            <div className="text-sm text-muted-foreground">
                                                Connect your wallet to access all features
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setVisible(true)}
                                            className="btn-primary py-2 px-4 text-sm"
                                        >
                                            <Wallet className="w-4 h-4 mr-2" />
                                            Connect
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Appearance */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-muted-foreground">Appearance</h3>
                                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                                    <div className="flex items-center gap-3">
                                        {settings.darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                                        <div>
                                            <div className="font-medium">Dark Mode</div>
                                            <div className="text-sm text-muted-foreground">Use dark color scheme</div>
                                        </div>
                                    </div>
                                    <button onClick={() => toggleSetting('darkMode')}>
                                        {settings.darkMode ? (
                                            <ToggleRight className="w-10 h-10 text-primary" />
                                        ) : (
                                            <ToggleLeft className="w-10 h-10 text-muted-foreground" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Trading Defaults */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-muted-foreground">Trading Defaults</h3>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-muted-foreground mb-2 block">
                                            Default Slippage (%)
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.defaultSlippage}
                                            onChange={(e) => setSettings({ ...settings, defaultSlippage: Number(e.target.value) })}
                                            step="0.1"
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-muted-foreground mb-2 block">
                                            Default RPC
                                        </label>
                                        <select className="input-field">
                                            <option>Helius (Recommended)</option>
                                            <option>QuickNode</option>
                                            <option>Custom</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                                    <div>
                                        <div className="font-medium">Auto Take-Profit</div>
                                        <div className="text-sm text-muted-foreground">Enable by default for new positions</div>
                                    </div>
                                    <button onClick={() => toggleSetting('autoTakeProfit')}>
                                        {settings.autoTakeProfit ? (
                                            <ToggleRight className="w-10 h-10 text-primary" />
                                        ) : (
                                            <ToggleLeft className="w-10 h-10 text-muted-foreground" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button className="btn-primary">
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </button>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold">Notification Settings</h2>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-5 h-5 text-blue-400" />
                                        <div>
                                            <div className="font-medium">Email Notifications</div>
                                            <div className="text-sm text-muted-foreground">Receive alerts via email</div>
                                        </div>
                                    </div>
                                    <button onClick={() => toggleSetting('emailNotifications')}>
                                        {settings.emailNotifications ? (
                                            <ToggleRight className="w-10 h-10 text-primary" />
                                        ) : (
                                            <ToggleLeft className="w-10 h-10 text-muted-foreground" />
                                        )}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                                    <div className="flex items-center gap-3">
                                        <MessageSquare className="w-5 h-5 text-blue-400" />
                                        <div>
                                            <div className="font-medium">Telegram Notifications</div>
                                            <div className="text-sm text-muted-foreground">Receive alerts on Telegram</div>
                                        </div>
                                    </div>
                                    <button onClick={() => toggleSetting('telegramNotifications')}>
                                        {settings.telegramNotifications ? (
                                            <ToggleRight className="w-10 h-10 text-primary" />
                                        ) : (
                                            <ToggleLeft className="w-10 h-10 text-muted-foreground" />
                                        )}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                                    <div className="flex items-center gap-3">
                                        <Smartphone className="w-5 h-5 text-emerald-400" />
                                        <div>
                                            <div className="font-medium">Push Notifications</div>
                                            <div className="text-sm text-muted-foreground">Browser push notifications</div>
                                        </div>
                                    </div>
                                    <button onClick={() => toggleSetting('pushNotifications')}>
                                        {settings.pushNotifications ? (
                                            <ToggleRight className="w-10 h-10 text-primary" />
                                        ) : (
                                            <ToggleLeft className="w-10 h-10 text-muted-foreground" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button className="btn-primary">
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </button>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold">Security Settings</h2>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                                    <div className="flex items-center gap-3">
                                        <Key className="w-5 h-5 text-amber-400" />
                                        <div>
                                            <div className="font-medium">Two-Factor Authentication</div>
                                            <div className="text-sm text-muted-foreground">Add an extra layer of security</div>
                                        </div>
                                    </div>
                                    <button onClick={() => toggleSetting('twoFactorAuth')}>
                                        {settings.twoFactorAuth ? (
                                            <ToggleRight className="w-10 h-10 text-primary" />
                                        ) : (
                                            <ToggleLeft className="w-10 h-10 text-muted-foreground" />
                                        )}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                                    <div className="flex items-center gap-3">
                                        <Shield className="w-5 h-5 text-emerald-400" />
                                        <div>
                                            <div className="font-medium">Whitelist Only</div>
                                            <div className="text-sm text-muted-foreground">Only trade whitelisted tokens</div>
                                        </div>
                                    </div>
                                    <button onClick={() => toggleSetting('whitelistOnly')}>
                                        {settings.whitelistOnly ? (
                                            <ToggleRight className="w-10 h-10 text-primary" />
                                        ) : (
                                            <ToggleLeft className="w-10 h-10 text-muted-foreground" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                <h3 className="font-medium text-red-400 mb-2">Danger Zone</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Disconnect your wallet and clear all local data.
                                </p>
                                <button
                                    onClick={handleDisconnect}
                                    disabled={!connected}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                        connected
                                            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                            : "bg-muted text-muted-foreground cursor-not-allowed"
                                    )}
                                >
                                    <LogOut className="w-4 h-4 inline mr-2" />
                                    {connected ? 'Disconnect Wallet' : 'No Wallet Connected'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'integrations' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold">Integrations</h2>

                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-muted/30">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                <MessageSquare className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div>
                                                <div className="font-medium">Telegram Bot</div>
                                                <div className="text-sm text-muted-foreground">Connect for instant alerts</div>
                                            </div>
                                        </div>
                                        <span className="text-sm text-muted-foreground">Not connected</span>
                                    </div>
                                    <button className="btn-outline w-full text-sm">
                                        Connect Telegram
                                    </button>
                                </div>

                                <div className="p-4 rounded-xl bg-muted/30">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                                                <Globe className="w-5 h-5 text-violet-400" />
                                            </div>
                                            <div>
                                                <div className="font-medium">Discord Webhook</div>
                                                <div className="text-sm text-muted-foreground">Send alerts to your server</div>
                                            </div>
                                        </div>
                                        <span className="text-sm text-muted-foreground">Not connected</span>
                                    </div>
                                    <button className="btn-outline w-full text-sm">
                                        Add Webhook
                                    </button>
                                </div>

                                <div className="p-4 rounded-xl bg-muted/30">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                                <Key className="w-5 h-5 text-emerald-400" />
                                            </div>
                                            <div>
                                                <div className="font-medium">Helius API Key</div>
                                                <div className="text-sm text-muted-foreground">Your RPC connection</div>
                                            </div>
                                        </div>
                                        <span className="text-sm text-emerald-400">Connected</span>
                                    </div>
                                    <input
                                        type="password"
                                        placeholder="••••••••••••••••"
                                        className="input-field text-sm"
                                        defaultValue="sk-xxxxxxxxxxxx"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
