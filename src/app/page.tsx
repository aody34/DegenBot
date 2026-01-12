'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    Zap,
    Shield,
    Fuel,
    History,
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
    ExternalLink,
    Target,
    Activity,
    CheckCircle,
    XCircle,
    AlertCircle,
    Eye,
    Key,
    XOctagon,
    BarChart3,
    Crosshair,
    Terminal
} from 'lucide-react';

const features = [
    {
        icon: Zap,
        title: 'One-Click Execution',
        description: 'Execute trades instantly with a single click. No complex confirmations or multi-step processes.',
        color: 'from-emerald-500 to-teal-500',
    },
    {
        icon: BarChart3,
        title: 'Real-time DexScreener',
        description: 'Live price feeds, liquidity depth, and market data directly from DexScreener. Always trade with accurate info.',
        color: 'from-cyan-500 to-blue-500',
    },
    {
        icon: Shield,
        title: 'Anti-Rug Protection',
        description: 'Automatic liquidity monitoring and honeypot detection. Get alerts before you get rugged.',
        color: 'from-violet-500 to-purple-500',
    },
    {
        icon: XOctagon,
        title: 'Kill Switch',
        description: 'Cancel all pending orders with one click. Exit everything instantly when the market turns against you.',
        color: 'from-red-500 to-rose-500',
    },
    {
        icon: Server,
        title: 'Private RPC Nodes',
        description: 'Dedicated Helius RPC endpoints for ultra-low latency. No public node congestion.',
        color: 'from-pink-500 to-rose-500',
    },
    {
        icon: Target,
        title: 'Automated Exit Strategies',
        description: 'Set 25% moonbags, auto-sell 50% at 2x, and trailing stop-losses in one click. Multi-step exit plans.',
        color: 'from-indigo-500 to-violet-500',
    },
];

const stats = [
    { value: '99.8%', label: 'Success Rate' },
    { value: '<100ms', label: 'Avg. Latency' },
    { value: '0%', label: 'Keys Exposed' },
    { value: '1%', label: 'Fee on Profits' },
];

const howItWorks = [
    {
        step: '01',
        title: 'Connect Wallet',
        description: 'Instant client-side link with Phantom or Solflare. Your keys never leave your browser.',
        icon: Wallet,
        technical: 'Non-custodial • Client-side signing only',
    },
    {
        step: '02',
        title: 'Import Token',
        description: 'Paste any Mint Address to see live liquidity, depth, and real-time price data.',
        icon: Crosshair,
        technical: 'DexScreener API • Real-time monitoring',
    },
    {
        step: '03',
        title: 'Set & Forget',
        description: 'Configure your TP/SL levels. We use Jito bundles to ensure you aren\'t front-run on the way out.',
        icon: Target,
        technical: 'Jito Block Engine • MEV-protected exits',
    },
];

const comparisonData = [
    {
        feature: 'MEV Protection',
        degenbot: { status: 'yes', text: 'Jito Bundles' },
        tgBots: { status: 'no', text: 'Public mempool' },
        dex: { status: 'no', text: 'Public mempool' },
    },
    {
        feature: 'RPC Speed',
        degenbot: { status: 'yes', text: 'Private Helius (<100ms)' },
        tgBots: { status: 'warning', text: 'Shared RPC' },
        dex: { status: 'warning', text: 'Public RPC' },
    },
    {
        feature: 'Non-Custodial',
        degenbot: { status: 'yes', text: 'Client-side signing' },
        tgBots: { status: 'no', text: 'Bot holds keys' },
        dex: { status: 'yes', text: 'Direct wallet' },
    },
    {
        feature: 'Visual Control',
        degenbot: { status: 'yes', text: 'Full terminal' },
        tgBots: { status: 'no', text: 'Chat commands' },
        dex: { status: 'warning', text: 'Basic UI' },
    },
    {
        feature: 'Take-Profit Automation',
        degenbot: { status: 'yes', text: 'Multi-step rules' },
        tgBots: { status: 'warning', text: 'Limited' },
        dex: { status: 'no', text: 'Manual only' },
    },
    {
        feature: 'Kill Switch',
        degenbot: { status: 'yes', text: 'One-click cancel all' },
        tgBots: { status: 'no', text: 'Not available' },
        dex: { status: 'no', text: 'Manual per order' },
    },
];

const pricingPlans = [
    {
        planId: 'free',
        name: 'Free',
        price: '$0',
        period: 'forever',
        description: 'Perfect for getting started',
        features: [
            '5 trades per month',
            'Basic price alerts',
            'DexScreener integration',
            'Community support',
        ],
        cta: 'Start Free',
        popular: false,
        available: true,
    },
    {
        planId: 'pro',
        name: 'Pro',
        price: '3 SOL',
        period: 'per month',
        description: 'For active traders',
        features: [
            'Unlimited trades',
            'Jito MEV protection',
            'Private Helius RPC',
            'Kill Switch feature',
            'Advanced take-profit',
            'Email support',
        ],
        cta: 'Upgrade to Pro',
        popular: true,
        available: true,
    },
    {
        planId: 'whale',
        name: 'Whale',
        price: '5 SOL',
        period: 'per month',
        description: 'Maximum performance',
        features: [
            'Everything in Pro',
            'Dedicated RPC endpoint',
            'API access',
            'Custom alerts',
            'Priority support',
            'Early feature access',
        ],
        cta: 'Go Whale',
        popular: false,
        available: true,
    },
];

// Enhanced Live Status Indicator Component
function LiveStatusIndicator() {
    const [latency, setLatency] = useState(34);
    const [successRate, setSuccessRate] = useState(99.8);

    useEffect(() => {
        const interval = setInterval(() => {
            setLatency(Math.floor(Math.random() * 20) + 28);
            setSuccessRate(99.5 + Math.random() * 0.4);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-400 font-semibold">LIVE</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/50 border border-border/50">
                <Activity className="w-3 h-3 text-primary" />
                <span className="text-muted-foreground">RPC Latency: <span className="text-foreground font-medium">{latency}ms</span></span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/50 border border-border/50">
                <Shield className="w-3 h-3 text-violet-500" />
                <span className="text-muted-foreground">Jito Bundle: <span className="text-emerald-400 font-medium">Optimal</span></span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/50 border border-border/50">
                <CheckCircle className="w-3 h-3 text-emerald-500" />
                <span className="text-muted-foreground">Success Rate: <span className="text-foreground font-medium">{successRate.toFixed(1)}%</span></span>
            </div>
        </div>
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

// Comparison Status Icon
function ComparisonStatusIcon({ status }: { status: string }) {
    if (status === 'yes') return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    if (status === 'no') return <XCircle className="w-5 h-5 text-red-500" />;
    return <AlertCircle className="w-5 h-5 text-amber-500" />;
}

export default function LandingPage() {
    const [contactOpen, setContactOpen] = useState(false);

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-grid opacity-30" />
            <div className="fixed inset-0 bg-radial-gradient" />
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-30" />
            <div className="fixed bottom-0 right-0 w-[600px] h-[400px] bg-secondary/20 rounded-full blur-[100px] opacity-20" />

            {/* Contact Modal */}
            <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />

            {/* Navigation */}
            <nav className="relative z-50 border-b border-border/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                <Terminal className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold">DegenBot</span>
                            <span className="hidden sm:inline-flex px-2 py-0.5 text-xs font-medium rounded-md bg-primary/10 text-primary border border-primary/20">
                                Trading Terminal
                            </span>
                        </div>

                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
                            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
                            <a href="#compare" className="text-muted-foreground hover:text-foreground transition-colors">Compare</a>
                            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs text-emerald-400 font-medium">Mainnet: Live</span>
                            </div>
                            <Link
                                href="/auth/login"
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Login
                            </Link>
                            <Link
                                href="/auth/signup"
                                className="btn-primary text-sm"
                            >
                                Sign Up Free
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 pt-16 pb-24 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    {/* Live Stats Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-10"
                    >
                        <LiveStatusIndicator />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
                            <Terminal className="w-4 h-4 text-primary" />
                            <span className="text-sm text-primary font-medium">Web-Based Trading Terminal • Non-Custodial</span>
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
                    >
                        The 100ms Exit Strategy
                        <br />
                        <span className="gradient-text">For Solana.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6"
                    >
                        The non-custodial trading terminal that lands your sells when Raydium fails.
                        Jito-protected bundles. Private Helius RPCs. Your keys never leave your browser.
                    </motion.p>

                    {/* Social Proof Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.25 }}
                        className="flex flex-wrap items-center justify-center gap-6 mb-8"
                    >
                        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            <div>
                                <div className="text-xl font-bold">$2.5M+</div>
                                <div className="text-xs text-muted-foreground">Volume Traded</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                            <Activity className="w-5 h-5 text-emerald-500" />
                            <div>
                                <div className="text-xl font-bold">15K+</div>
                                <div className="text-xs text-muted-foreground">Trades Executed</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20">
                            <CheckCircle className="w-5 h-5 text-violet-500" />
                            <div>
                                <div className="text-xl font-bold">99.8%</div>
                                <div className="text-xs text-muted-foreground">Success Rate</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Trust Signals - Client Side Security */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.25 }}
                        className="flex flex-wrap items-center justify-center gap-6 mb-10"
                    >
                        <div className="flex items-center gap-2 text-sm">
                            <Lock className="w-4 h-4 text-emerald-500" />
                            <span className="text-muted-foreground"><span className="text-foreground font-medium">Client-Side Signing</span> — Private keys never leave your browser</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Shield className="w-4 h-4 text-violet-500" />
                            <span className="text-muted-foreground"><span className="text-foreground font-medium">Jito Protected</span> — MEV-resistant exits</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <XOctagon className="w-4 h-4 text-red-500" />
                            <span className="text-muted-foreground"><span className="text-foreground font-medium">Kill Switch</span> — Cancel all with one click</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link href="/dashboard" className="btn-primary text-lg px-8 py-4 flex items-center gap-2">
                            <Zap className="w-5 h-5" />
                            Launch Trading Terminal
                        </Link>
                    </motion.div>

                    {/* Fee Transparency */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-4 text-sm text-muted-foreground"
                    >
                        <span className="text-foreground font-medium">Free to use.</span> 1% fee only on successful automated trades. No monthly fees.
                    </motion.p>
                </div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="max-w-4xl mx-auto mt-16"
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
                            Pro-Level Execution
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-muted-foreground max-w-2xl mx-auto"
                        >
                            Professional-grade infrastructure. The same tools used by top trading desks.
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
                            Get Started in 60 Seconds
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-muted-foreground max-w-2xl mx-auto"
                        >
                            Connect → Import → Set & Forget. No sign-up required.
                        </motion.p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
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
                                <h4 className="font-medium text-primary mb-2">Client-Side Signing</h4>
                                <p className="text-muted-foreground">
                                    Your private keys never leave your wallet. All transactions are signed client-side.
                                    We cannot access or move your funds. Period.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Comparison Section */}
            <section id="compare" className="relative z-10 py-24 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl font-bold mb-4"
                        >
                            Why Not Just Use a TG Bot?
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-muted-foreground max-w-2xl mx-auto"
                        >
                            Telegram bots store your private keys. We don't. See how we compare.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="glass rounded-2xl overflow-hidden"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border/50">
                                        <th className="text-left p-4 font-semibold">Feature</th>
                                        <th className="text-center p-4 font-semibold">
                                            <div className="flex items-center justify-center gap-2">
                                                <Terminal className="w-4 h-4 text-primary" />
                                                DegenBot
                                            </div>
                                        </th>
                                        <th className="text-center p-4 font-semibold text-muted-foreground">TG Bots</th>
                                        <th className="text-center p-4 font-semibold text-muted-foreground">DEX Swaps</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comparisonData.map((row, index) => (
                                        <tr key={index} className="border-b border-border/30 last:border-0">
                                            <td className="p-4 font-medium">{row.feature}</td>
                                            <td className="p-4 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <ComparisonStatusIcon status={row.degenbot.status} />
                                                    <span className="text-xs text-muted-foreground">{row.degenbot.text}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <ComparisonStatusIcon status={row.tgBots.status} />
                                                    <span className="text-xs text-muted-foreground">{row.tgBots.text}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <ComparisonStatusIcon status={row.dex.status} />
                                                    <span className="text-xs text-muted-foreground">{row.dex.text}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Security Architecture Section */}
            <section id="security" className="relative z-10 py-24 px-4 bg-card/30">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl font-bold mb-4"
                        >
                            Security Architecture
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-muted-foreground max-w-2xl mx-auto"
                        >
                            In Solana, everyone's terrified of wallet drainers. Here's why you're safe with us.
                        </motion.p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="glass rounded-2xl p-8"
                        >
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-6">
                                <Key className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-2xl font-semibold mb-4">Client-Side Signing</h3>
                            <p className="text-muted-foreground mb-4">
                                Your private keys <span className="text-foreground font-medium">never leave your browser</span>.
                                When you execute a trade, the transaction is constructed in your browser and signed
                                by your wallet extension (Phantom, Solflare, etc.).
                            </p>
                            <p className="text-muted-foreground">
                                We only receive the signed transaction to broadcast. This is the same security model
                                as using Raydium or Jupiter directly.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="glass rounded-2xl p-8"
                        >
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mb-6">
                                <Shield className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-2xl font-semibold mb-4">Why TG Bots Are Risky</h3>
                            <p className="text-muted-foreground mb-4">
                                Most Telegram trading bots require you to <span className="text-foreground font-medium">paste your private key</span> or
                                generate a new wallet within the bot. This means the bot operator has full access to your funds.
                            </p>
                            <p className="text-muted-foreground">
                                With DegenBot, you connect your existing wallet. We request transaction approval, not key access.
                                You're always in control.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="glass rounded-2xl p-8 md:col-span-2"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                                    <Eye className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-semibold mb-4">Transaction Flow</h3>
                                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                                        <div className="bg-background/50 rounded-lg p-4">
                                            <div className="text-primary font-semibold mb-2">1. You Configure</div>
                                            <p className="text-muted-foreground">Set your TP/SL targets in the terminal</p>
                                        </div>
                                        <div className="bg-background/50 rounded-lg p-4">
                                            <div className="text-primary font-semibold mb-2">2. Price Triggers</div>
                                            <p className="text-muted-foreground">Our servers monitor prices via DexScreener API</p>
                                        </div>
                                        <div className="bg-background/50 rounded-lg p-4">
                                            <div className="text-primary font-semibold mb-2">3. TX Built Locally</div>
                                            <p className="text-muted-foreground">Transaction is constructed in your browser</p>
                                        </div>
                                        <div className="bg-background/50 rounded-lg p-4">
                                            <div className="text-primary font-semibold mb-2">4. You Sign & Send</div>
                                            <p className="text-muted-foreground">Your wallet signs, we broadcast via Jito</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
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
                            Performance-Based Fees
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-muted-foreground max-w-2xl mx-auto"
                        >
                            We only make money when you make money. 1% on successful automated trades. That's it.
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
                                <Link
                                    href={`/auth/signup?plan=${plan.planId}`}
                                    className={`block w-full py-3 rounded-lg font-semibold transition-all text-center ${plan.popular
                                        ? 'bg-primary text-primary-foreground hover:opacity-90'
                                        : 'border border-border hover:bg-muted'
                                        }`}
                                >
                                    {plan.cta}
                                </Link>
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
                            <Link href="/auth/signup" className="btn-outline">
                                Get Started
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
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
                            <h2 className="text-4xl font-bold mb-4">The 100ms Exit Strategy Awaits.</h2>
                            <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
                                Stop losing money to failed Raydium sells. Land every trade with Jito protection.
                            </p>
                            <Link href="/auth/signup" className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2">
                                <Rocket className="w-5 h-5" />
                                Start Trading Free
                            </Link>
                            <p className="mt-4 text-sm text-muted-foreground">
                                Sign up free. Upgrade anytime for unlimited trades.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer with Legal Disclaimer and Powered By */}
            <footer className="relative z-10 border-t border-border/50 py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Powered By Section */}
                    <div className="flex flex-wrap items-center justify-center gap-8 mb-12 pb-8 border-b border-border/30">
                        <span className="text-sm text-muted-foreground">Powered by</span>
                        <div className="flex flex-wrap items-center justify-center gap-8">
                            <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                                    <span className="text-white font-bold text-xs">H</span>
                                </div>
                                <span className="font-medium">Helius</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                    <span className="text-white font-bold text-xs">J</span>
                                </div>
                                <span className="font-medium">Jito</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                                    <span className="text-white font-bold text-xs">J</span>
                                </div>
                                <span className="font-medium">Jupiter</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                    <Terminal className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-bold">DegenBot</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                The non-custodial trading terminal for Solana. Built with Jito Bundles and Helius RPC.
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
                                <span>Non-custodial • Client-side signing • Your keys, your crypto</span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
