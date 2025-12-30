'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Zap,
    Shield,
    Fuel,
    History,
    Globe,
    Moon,
    ArrowRight,
    Rocket,
    TrendingUp,
    Bell,
    Wallet,
    BarChart3
} from 'lucide-react';

const features = [
    {
        icon: Zap,
        title: 'One-Click Execution',
        description: 'Execute trades instantly with a single click. No complex confirmations or multi-step processes.',
        color: 'from-emerald-500 to-teal-500',
    },
    {
        icon: Shield,
        title: 'Slippage Protection',
        description: 'Built-in slippage protection ensures you never lose more than expected on volatile trades.',
        color: 'from-violet-500 to-purple-500',
    },
    {
        icon: Fuel,
        title: 'Gas Optimization',
        description: 'Smart gas estimation and priority fee optimization for faster, cheaper transactions.',
        color: 'from-amber-500 to-orange-500',
    },
    {
        icon: History,
        title: 'Transaction History',
        description: 'Complete history of all your trades with detailed analytics and performance tracking.',
        color: 'from-blue-500 to-cyan-500',
    },
    {
        icon: Globe,
        title: 'Real-Time Integration',
        description: 'Live connection to Solana blockchain with instant price updates and order execution.',
        color: 'from-pink-500 to-rose-500',
    },
    {
        icon: Moon,
        title: 'Beautiful Dark Mode',
        description: 'Premium dark theme designed for extended trading sessions. Easy on the eyes, heavy on style.',
        color: 'from-indigo-500 to-violet-500',
    },
];

const stats = [
    { value: '$2.5M+', label: 'Volume Traded' },
    { value: '15K+', label: 'Trades Executed' },
    { value: '99.9%', label: 'Uptime' },
    { value: '<100ms', label: 'Avg. Execution' },
];

const howItWorks = [
    {
        step: '01',
        title: 'Connect Wallet',
        description: 'Connect your Phantom, Solflare, or any Solana wallet securely.',
        icon: Wallet,
    },
    {
        step: '02',
        title: 'Set Take-Profit',
        description: 'Configure your take-profit percentages and slippage tolerance.',
        icon: TrendingUp,
    },
    {
        step: '03',
        title: 'Get Alerts',
        description: 'Receive instant notifications when your targets are hit.',
        icon: Bell,
    },
    {
        step: '04',
        title: 'Auto Execute',
        description: 'Trades execute automatically or with one click confirmation.',
        icon: Rocket,
    },
];

export default function LandingPage() {
    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-grid opacity-30" />
            <div className="fixed inset-0 bg-radial-gradient" />
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-30" />
            <div className="fixed bottom-0 right-0 w-[600px] h-[400px] bg-secondary/20 rounded-full blur-[100px] opacity-20" />

            {/* Navigation */}
            <nav className="relative z-50 border-b border-border/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                <Rocket className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold">DegenBot</span>
                        </div>

                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
                            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
                            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
                        </div>

                        <Link
                            href="/dashboard"
                            className="btn-primary text-sm"
                        >
                            Launch App
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 pt-20 pb-32 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-sm text-primary font-medium">Powered by Solana</span>
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
                    >
                        Auto Take-Profit
                        <br />
                        <span className="gradient-text">For Degen Traders</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
                    >
                        Never miss a pump again. Automate your Solana trades with lightning-fast execution,
                        built-in safety checks, and instant alerts.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link href="/dashboard" className="btn-primary text-lg px-8 py-4">
                            Start Trading
                            <Rocket className="w-5 h-5 ml-2" />
                        </Link>
                        <a href="#features" className="btn-outline text-lg px-8 py-4">
                            Learn More
                        </a>
                    </motion.div>
                </div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="max-w-4xl mx-auto mt-20"
                >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.map((stat, index) => (
                            <div key={index} className="glass rounded-xl p-6 text-center">
                                <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                                <div className="text-sm text-muted-foreground">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section id="features" className="relative z-10 py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl font-bold mb-4"
                        >
                            Built for Speed & Safety
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-muted-foreground max-w-2xl mx-auto"
                        >
                            Everything you need to trade memecoins like a pro
                        </motion.p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="glass rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 group"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="relative z-10 py-24 px-4 bg-card/30">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl font-bold mb-4"
                        >
                            How It Works
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-muted-foreground max-w-2xl mx-auto"
                        >
                            Get started in minutes, not hours
                        </motion.p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {howItWorks.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="relative"
                            >
                                <div className="text-6xl font-bold text-primary/10 absolute -top-4 -left-2">
                                    {item.step}
                                </div>
                                <div className="relative pt-8">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
                                        <item.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                                    <p className="text-muted-foreground">{item.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 py-24 px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="glass rounded-3xl p-12 text-center relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10" />
                        <div className="relative z-10">
                            <h2 className="text-4xl font-bold mb-4">Ready to Automate Your Trades?</h2>
                            <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
                                Join thousands of traders who never miss a pump with DegenBot
                            </p>
                            <Link href="/dashboard" className="btn-primary text-lg px-10 py-4">
                                Launch App Now
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-border/50 py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                <Rocket className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold">DegenBot</span>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
                            <a href="#" className="hover:text-foreground transition-colors">Discord</a>
                            <a href="#" className="hover:text-foreground transition-colors">Telegram</a>
                            <a href="#" className="hover:text-foreground transition-colors">Docs</a>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            © 2024 DegenBot. All rights reserved.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
