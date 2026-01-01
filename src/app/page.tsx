'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    X,
    Check,
    Server,
    Lock,
    Cpu,
    Timer,
    ShieldCheck,
    AlertTriangle,
    FileText,
    ExternalLink
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
        title: 'MEV Protection',
        description: 'Jito Bundles integration prevents sandwich attacks. Your trades are protected from front-runners.',
        color: 'from-violet-500 to-purple-500',
    },
    {
        icon: Fuel,
        title: 'Gas Optimization',
        description: 'Dynamic priority fee calculation ensures your transactions land in the next block, every time.',
        color: 'from-amber-500 to-orange-500',
    },
    {
        icon: History,
        title: 'Transaction History',
        description: 'Complete history of all your trades with detailed analytics and performance tracking.',
        color: 'from-blue-500 to-cyan-500',
    },
    {
        icon: Server,
        title: 'Private RPC Nodes',
        description: 'Dedicated Helius RPC endpoints for ultra-low latency. No public node congestion.',
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
        description: 'Securely connect your Phantom, Solflare, or any Solana wallet. We never store your private keys.',
        icon: Wallet,
        technical: 'Non-custodial • Client-side signing only',
    },
    {
        step: '02',
        title: 'Set Take-Profit Rules',
        description: 'Configure target percentages (25%, 50%, 100%+), slippage tolerance, and auto-execute preferences.',
        icon: TrendingUp,
        technical: 'Real-time price monitoring via DexScreener API',
    },
    {
        step: '03',
        title: 'Jito Bundle Protection',
        description: 'Your sell orders are wrapped in Jito bundles, protecting you from MEV bots and sandwich attacks.',
        icon: ShieldCheck,
        technical: 'Jito Block Engine • Private mempool',
    },
    {
        step: '04',
        title: 'Instant Execution',
        description: 'When your target hits, we execute via dedicated Helius RPC nodes for guaranteed speed.',
        icon: Timer,
        technical: 'Helius RPC • <100ms latency • Priority fees',
    },
];

const pricingPlans = [
    {
        name: 'Free',
        price: '$0',
        period: 'forever',
        description: 'Perfect for getting started',
        features: [
            '3 active take-profit rules',
            'Basic price alerts',
            'Public RPC nodes',
            'Community support',
        ],
        cta: 'Get Started Free',
        popular: true,
        comingSoon: false,
    },
    {
        name: 'Pro',
        price: '0.5%',
        period: 'per successful trade',
        description: 'For serious traders',
        features: [
            'Unlimited take-profit rules',
            'Jito Bundle protection',
            'Private Helius RPC',
            'Telegram alerts',
            'Priority support',
            'No monthly fees',
        ],
        cta: 'Coming Soon',
        popular: false,
        comingSoon: true,
    },
    {
        name: 'Whale',
        price: '$99',
        period: 'per month',
        description: 'Maximum performance',
        features: [
            'Everything in Pro',
            'Dedicated RPC endpoint',
            '0.25% trade fee',
            'Custom slippage profiles',
            'API access',
            '24/7 priority support',
        ],
        cta: 'Coming Soon',
        popular: false,
        comingSoon: true,
    },
];

// Waitlist Modal Component
function WaitlistModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [email, setEmail] = useState('');
    const [alreadySignedUp, setAlreadySignedUp] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Check if user already signed up on mount
    useEffect(() => {
        if (isOpen) {
            const hasSignedUp = localStorage.getItem('degenbot_waitlist_signed_up');
            if (hasSignedUp) {
                setAlreadySignedUp(true);
            }
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In production, send to your backend/Supabase
        console.log('Waitlist signup:', email);

        // Save to localStorage to remember signup
        localStorage.setItem('degenbot_waitlist_signed_up', 'true');
        localStorage.setItem('degenbot_waitlist_email', email);

        setSubmitted(true);
        setTimeout(() => {
            onClose();
            setSubmitted(false);
            setAlreadySignedUp(true);
            setEmail('');
        }, 2000);
    };

    const showSuccessMessage = submitted || alreadySignedUp;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
                    >
                        <div className="glass rounded-2xl p-8 border border-primary/20">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                        <Rocket className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold">Join the Waitlist</h3>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {showSuccessMessage ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                        <Check className="w-8 h-8 text-primary" />
                                    </div>
                                    <h4 className="text-lg font-semibold mb-2">You're on the list!</h4>
                                    <p className="text-muted-foreground">We'll notify you when DegenBot launches.</p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-muted-foreground mb-6">
                                        DegenBot is currently in private beta. Join the waitlist to get early access and exclusive perks.
                                    </p>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email"
                                            required
                                            className="input-field w-full"
                                        />
                                        <button type="submit" className="btn-primary w-full">
                                            Join Waitlist
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </button>
                                    </form>
                                    <p className="text-xs text-muted-foreground mt-4 text-center">
                                        No spam. We'll only email you about launch updates.
                                    </p>
                                </>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// Contact Modal Component
function ContactModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [email, setEmail] = useState('');
    const [inquiryType, setInquiryType] = useState('');
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In production, send to your backend/Supabase
        console.log('Contact form:', { email, inquiryType, message });
        setSubmitted(true);
        setTimeout(() => {
            onClose();
            setSubmitted(false);
            setEmail('');
            setInquiryType('');
            setMessage('');
        }, 3000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md max-h-[90vh] overflow-y-auto"
                    >
                        <div className="glass rounded-2xl p-8 border border-primary/20">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                        <Bell className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold">Contact Us</h3>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {submitted ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                        <Check className="w-8 h-8 text-primary" />
                                    </div>
                                    <h4 className="text-lg font-semibold mb-2">Message Sent!</h4>
                                    <p className="text-muted-foreground">We'll get back to you within 24-48 hours.</p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-muted-foreground mb-6">
                                        Have a question, bug report, or partnership inquiry? We'd love to hear from you.
                                    </p>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Email Address *</label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="your@email.com"
                                                required
                                                className="input-field w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Inquiry Type *</label>
                                            <select
                                                value={inquiryType}
                                                onChange={(e) => setInquiryType(e.target.value)}
                                                required
                                                className="input-field w-full"
                                            >
                                                <option value="">Select an option...</option>
                                                <option value="bug">Bug Report</option>
                                                <option value="feature">Feature Request</option>
                                                <option value="partnership">Partnership Inquiry</option>
                                                <option value="support">General Support</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Message *</label>
                                            <textarea
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                placeholder="Tell us more about your inquiry..."
                                                required
                                                rows={4}
                                                className="input-field w-full resize-none"
                                            />
                                        </div>
                                        <button type="submit" className="btn-primary w-full">
                                            Send Message
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default function LandingPage() {
    const [waitlistOpen, setWaitlistOpen] = useState(false);
    const [contactOpen, setContactOpen] = useState(false);

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-grid opacity-30" />
            <div className="fixed inset-0 bg-radial-gradient" />
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-30" />
            <div className="fixed bottom-0 right-0 w-[600px] h-[400px] bg-secondary/20 rounded-full blur-[100px] opacity-20" />

            {/* Waitlist Modal */}
            <WaitlistModal isOpen={waitlistOpen} onClose={() => setWaitlistOpen(false)} />

            {/* Contact Modal */}
            <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />

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
                            <a href="#docs" className="text-muted-foreground hover:text-foreground transition-colors">Docs</a>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                href="/dashboard"
                                className="btn-outline text-sm"
                            >
                                Try Demo
                            </Link>
                            <button
                                onClick={() => setWaitlistOpen(true)}
                                className="btn-primary text-sm"
                            >
                                Join Waitlist
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </button>
                        </div>
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
                            <span className="text-sm text-primary font-medium">Powered by Solana • Jito Bundles • Helius RPC</span>
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
                        Never miss a pump again. Automate your Solana trades with Jito-protected execution,
                        private RPC nodes, and instant alerts.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <button onClick={() => setWaitlistOpen(true)} className="btn-primary text-lg px-8 py-4">
                            Join Waitlist
                            <Rocket className="w-5 h-5 ml-2" />
                        </button>
                        <Link href="/dashboard" className="btn-outline text-lg px-8 py-4">
                            Try Demo
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                    </motion.div>

                    {/* Beta Notice */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-6 inline-flex items-center gap-2 text-sm text-amber-400"
                    >
                        <AlertTriangle className="w-4 h-4" />
                        <span>Currently in private beta • Limited spots available</span>
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
                            Professional-grade infrastructure used by the top trading bots
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

            {/* How It Works Section - Technical Depth */}
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
                            Professional infrastructure. Zero compromises.
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
                                    <p className="text-muted-foreground mb-3">{item.description}</p>
                                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 border border-primary/20">
                                        <Cpu className="w-3 h-3 text-primary" />
                                        <span className="text-xs text-primary font-medium">{item.technical}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Technical Architecture Callout */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-16 glass rounded-2xl p-8"
                    >
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Server className="w-5 h-5 text-primary" />
                            Technical Architecture
                        </h3>
                        <div className="grid md:grid-cols-3 gap-6 text-sm">
                            <div>
                                <h4 className="font-medium text-primary mb-2">Jito Bundles</h4>
                                <p className="text-muted-foreground">
                                    All sell orders are submitted through Jito's Block Engine, ensuring your transactions
                                    are protected from MEV bots and sandwich attacks in the private mempool.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-medium text-primary mb-2">Private RPC</h4>
                                <p className="text-muted-foreground">
                                    We use dedicated Helius RPC endpoints with geographically distributed nodes
                                    for sub-100ms latency. No public RPC congestion.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-medium text-primary mb-2">Non-Custodial</h4>
                                <p className="text-muted-foreground">
                                    Your private keys never leave your wallet. All transactions are signed client-side.
                                    We cannot access or move your funds.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="relative z-10 py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl font-bold mb-4"
                        >
                            Simple, Transparent Pricing
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-muted-foreground max-w-2xl mx-auto"
                        >
                            No hidden fees. Pay only when you profit.
                        </motion.p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {pricingPlans.map((plan, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={`glass rounded-2xl p-8 relative ${plan.popular ? 'border-primary ring-1 ring-primary' : ''}`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary rounded-full text-xs font-semibold text-primary-foreground">
                                        Most Popular
                                    </div>
                                )}
                                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                <div className="mb-4">
                                    <span className="text-4xl font-bold">{plan.price}</span>
                                    <span className="text-muted-foreground ml-2">{plan.period}</span>
                                </div>
                                <p className="text-muted-foreground mb-6">{plan.description}</p>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm">
                                            <Check className="w-4 h-4 text-primary flex-shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={() => !plan.comingSoon && setWaitlistOpen(true)}
                                    disabled={plan.comingSoon}
                                    className={`w-full py-3 rounded-lg font-semibold transition-all ${plan.comingSoon
                                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                        : plan.popular
                                            ? 'bg-primary text-primary-foreground hover:opacity-90'
                                            : 'border border-border hover:bg-muted'
                                        }`}
                                >
                                    {plan.cta}
                                </button>
                            </motion.div>
                        ))}
                    </div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center text-sm text-muted-foreground mt-8"
                    >
                        * Trade fees are only charged on successful take-profit executions. Failed or cancelled orders incur no fees.
                    </motion.p>
                </div>
            </section>

            {/* Documentation Section */}
            <section id="docs" className="relative z-10 py-24 px-4 bg-card/30">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="glass rounded-2xl p-8 text-center"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-6">
                            <FileText className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Documentation</h2>
                        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                            Learn how to set up take-profit rules, configure slippage settings, and maximize your trading efficiency.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a
                                href="https://github.com/aody34/DegenBot"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary"
                            >
                                View on GitHub
                                <ExternalLink className="w-4 h-4 ml-2" />
                            </a>
                            <button
                                onClick={() => setWaitlistOpen(true)}
                                className="btn-outline"
                            >
                                Join Waitlist for Docs Access
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </button>
                        </div>
                    </motion.div>
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
                                Join the waitlist for early access and exclusive launch pricing
                            </p>
                            <button onClick={() => setWaitlistOpen(true)} className="btn-primary text-lg px-10 py-4">
                                Join Waitlist
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer with Legal Disclaimer */}
            <footer className="relative z-10 border-t border-border/50 py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                    <Rocket className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-bold">DegenBot</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Auto take-profit bot for Solana traders. Built with Jito Bundles and Helius RPC.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                                <li><a href="#docs" className="hover:text-foreground transition-colors">Documentation</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Community</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="https://x.com/BotDegen62550" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Follow us on X</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Support</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="https://github.com/aody34/DegenBot" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a></li>
                                <li><button onClick={() => setContactOpen(true)} className="hover:text-foreground transition-colors text-left">Contact Us</button></li>
                            </ul>
                        </div>
                    </div>

                    {/* Legal Disclaimer */}
                    <div className="border-t border-border/50 pt-8">
                        <div className="glass rounded-xl p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                <div className="text-xs text-muted-foreground">
                                    <p className="font-semibold text-foreground mb-1">Risk Disclaimer</p>
                                    <p>
                                        Trading cryptocurrencies involves significant risk and can result in the loss of your invested capital.
                                        You should not invest more than you can afford to lose and should ensure that you fully understand the risks involved.
                                        Past performance is not indicative of future results. DegenBot is a tool to assist with trading automation;
                                        we do not provide financial advice.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="glass rounded-xl p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                <div className="text-xs text-muted-foreground">
                                    <p className="font-semibold text-foreground mb-1">Security Notice</p>
                                    <p>
                                        DegenBot is non-custodial. We never store, access, or have the ability to move your private keys or funds.
                                        All transactions are signed locally in your browser using your connected wallet.
                                        Always verify transaction details in your wallet before signing.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                            <div>© 2026 DegenBot. All rights reserved.</div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-primary" />
                                <span>Non-custodial • Your keys, your crypto</span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
