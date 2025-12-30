'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Briefcase,
    Target,
    History,
    Settings,
    Rocket,
    Menu,
    X,
    ChevronLeft,
    LogOut,
    Bell,
    Wallet,
} from 'lucide-react';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Briefcase, label: 'Positions', href: '/dashboard/positions' },
    { icon: Target, label: 'Take-Profit', href: '/dashboard/take-profit' },
    { icon: History, label: 'History', href: '/dashboard/history' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

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
                                <Rocket className="w-5 h-5 text-white" />
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
                        <button
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all w-full'
                            )}
                        >
                            <LogOut className="w-5 h-5 flex-shrink-0" />
                            {sidebarOpen && <span className="font-medium">Disconnect</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-card/50 backdrop-blur-xl">
                <div className="flex items-center justify-between h-full px-4">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <Rocket className="w-4 h-4 text-white" />
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
                        <button className="p-2 rounded-lg hover:bg-muted transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
                        </button>
                        <button className="btn-primary py-2 px-4 text-sm">
                            <Wallet className="w-4 h-4 mr-2" />
                            Connect Wallet
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-6">{children}</div>
            </main>
        </div>
    );
}
