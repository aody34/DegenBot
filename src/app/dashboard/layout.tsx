'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useConnection } from '@solana/wallet-adapter-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import {
    LayoutDashboard,
    Briefcase,
    Target,
    History,
    Settings,
    Terminal,
    Menu,
    X,
    ChevronLeft,
    LogOut,
    Bell,
    Wallet,
    Copy,
    Check,
    ExternalLink,
} from 'lucide-react';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Briefcase, label: 'Positions', href: '/dashboard/positions' },
    { icon: Target, label: 'Take-Profit', href: '/dashboard/take-profit' },
    { icon: History, label: 'History', href: '/dashboard/history' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

function WalletButton() {
    const { publicKey, connected, disconnect } = useWallet();
    const { connection } = useConnection();
    const { setVisible } = useWalletModal();
    const { setConnected, setBalance, balance } = useAppStore();
    const [copied, setCopied] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    // Sync wallet state with store and fetch balance
    useEffect(() => {
        if (connected && publicKey) {
            console.log('[DegenBot] Wallet connected:', publicKey.toBase58());
            setConnected(true, publicKey.toBase58());
            // Fetch balance using the connection from wallet adapter
            console.log('[DegenBot] Fetching balance...');
            connection.getBalance(publicKey)
                .then((bal) => {
                    const solBalance = bal / 1e9;
                    console.log('[DegenBot] Balance fetched:', solBalance, 'SOL');
                    setBalance(solBalance);
                })
                .catch((error) => {
                    console.error('[DegenBot] Balance fetch error:', error);
                    // Try again with a slight delay
                    setTimeout(() => {
                        connection.getBalance(publicKey)
                            .then((bal) => setBalance(bal / 1e9))
                            .catch(console.error);
                    }, 2000);
                });
        } else {
            setConnected(false);
            setBalance(0);
        }
    }, [connected, publicKey, connection, setConnected, setBalance]);

    // Refresh balance periodically
    useEffect(() => {
        if (!connected || !publicKey) return;

        const interval = setInterval(() => {
            connection.getBalance(publicKey).then((bal) => {
                setBalance(bal / 1e9);
            }).catch(console.error);
        }, 30000); // Every 30 seconds

        return () => clearInterval(interval);
    }, [connected, publicKey, connection, setBalance]);

    const handleCopy = async () => {
        if (publicKey) {
            await navigator.clipboard.writeText(publicKey.toBase58());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDisconnect = () => {
        disconnect();
        setShowDropdown(false);
    };

    const shortenAddress = (address: string) => {
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    };

    if (!connected || !publicKey) {
        return (
            <button
                onClick={() => setVisible(true)}
                className="btn-primary py-2 px-4 text-sm"
            >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
            </button>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
            >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-sm">{shortenAddress(publicKey.toBase58())}</span>
                <span className="text-sm text-muted-foreground">{balance.toFixed(2)} SOL</span>
            </button>

            <AnimatePresence>
                {showDropdown && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40"
                            onClick={() => setShowDropdown(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute right-0 top-full mt-2 w-64 z-50 glass rounded-xl border border-border p-2"
                        >
                            <div className="p-3 border-b border-border mb-2">
                                <div className="text-sm text-muted-foreground mb-1">Connected Wallet</div>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm">{shortenAddress(publicKey.toBase58())}</span>
                                    <button
                                        onClick={handleCopy}
                                        className="p-1 hover:bg-muted rounded transition-colors"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                    <a
                                        href={`https://solscan.io/account/${publicKey.toBase58()}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1 hover:bg-muted rounded transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                            <div className="p-3 border-b border-border mb-2">
                                <div className="text-sm text-muted-foreground mb-1">Balance</div>
                                <div className="text-2xl font-bold">{balance.toFixed(4)} SOL</div>
                            </div>
                            <button
                                onClick={handleDisconnect}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Disconnect
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    'fixed left-0 top-0 z-40 h-screen border-r border-border bg-card/50 backdrop-blur-xl transition-all duration-300 hidden lg:block',
                    sidebarOpen ? 'w-64' : 'w-20'
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between h-16 px-4 border-b border-border">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                                <Terminal className="w-5 h-5 text-white" />
                            </div>
                            {sidebarOpen && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-xl font-bold"
                                >
                                    DegenBot
                                </motion.span>
                            )}
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                            <ChevronLeft
                                className={cn(
                                    'w-5 h-5 transition-transform',
                                    !sidebarOpen && 'rotate-180'
                                )}
                            />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                                        isActive
                                            ? 'bg-primary/10 text-primary border border-primary/20'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    )}
                                >
                                    <item.icon className="w-5 h-5 flex-shrink-0" />
                                    {sidebarOpen && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="font-medium"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom */}
                    <div className="p-4 border-t border-border">
                        <Link
                            href="/"
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all w-full'
                            )}
                        >
                            <LogOut className="w-5 h-5 flex-shrink-0" />
                            {sidebarOpen && <span className="font-medium">Back to Home</span>}
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-card/50 backdrop-blur-xl">
                <div className="flex items-center justify-between h-full px-4">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <Terminal className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold">DegenBot</span>
                    </Link>
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 20 }}
                            className="lg:hidden fixed right-0 top-0 z-50 h-screen w-72 bg-card border-l border-border"
                        >
                            <div className="flex items-center justify-between h-16 px-4 border-b border-border">
                                <span className="font-bold">Menu</span>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-4">
                                <WalletButton />
                            </div>
                            <nav className="p-4 space-y-2">
                                {navItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={cn(
                                                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                                                isActive
                                                    ? 'bg-primary/10 text-primary border border-primary/20'
                                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                            )}
                                        >
                                            <item.icon className="w-5 h-5" />
                                            <span className="font-medium">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main
                className={cn(
                    'min-h-screen pt-16 lg:pt-0 transition-all duration-300',
                    sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
                )}
            >
                {/* Top Bar */}
                <header className="hidden lg:flex items-center justify-between h-16 px-6 border-b border-border bg-card/30 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg font-semibold">
                            {navItems.find((item) => item.href === pathname)?.label || 'Dashboard'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard/settings"
                            className="p-2 rounded-lg hover:bg-muted transition-colors relative group"
                            title="Notifications"
                        >
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
                            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-card text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border">
                                Notifications
                            </span>
                        </Link>
                        <WalletButton />
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-6">{children}</div>
            </main>
        </div>
    );
}
