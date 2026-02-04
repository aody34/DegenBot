# 🚀 DegenBot - Whale Copy Trading Bot for Solana

<p align="center">
  <img src="assets/x_profile_pic.png" alt="DegenBot Logo" width="120" />
</p>

<p align="center">
  <strong>AI-Powered Whale Copy Trading for Solana</strong><br/>
  Track whale wallets • AI risk analysis • One-click copy trades • Jito MEV protection
</p>

<p align="center">
  <a href="https://degenbot.dev">🌐 Website</a> •
  <a href="https://x.com/BotDegen62550">𝕏 Twitter</a> •
  <a href="#features">✨ Features</a> •
  <a href="#how-it-works">⚙️ How It Works</a>
</p>

---

## 🎯 What is DegenBot?

DegenBot is a professional-grade **Whale Copy Trading Bot** for Solana. Track successful wallets, analyze trades with AI, and execute copy trades with MEV protection via Jito Bundles.

**🔥 NEW: Copy Trading v2.0** - AI-powered risk analysis + real-time signal feed!

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🐋 **Whale Tracking** | Monitor successful wallets with win rates & performance metrics |
| 📡 **Live Signals** | Real-time notifications when tracked whales make swaps |
| 🧠 **AI Analysis** | Gemini/GPT-4o scores every trade 0-100 with risk assessment |
| ⚡ **One-Click Copy** | Execute trades instantly with your connected wallet |
| 🛡️ **MEV Protection** | Jito Bundles prevent sandwich attacks |
| 🔒 **Non-Custodial** | Your keys never leave your wallet |

---

## ⚙️ How It Works

```
1. Whale Swaps    → Helius webhook fires instantly
2. AI Analyzes    → Token risk scored 0-100
3. Signal Shows   → High-quality trades appear in your feed
4. User Clicks    → One-click "Copy Trade" button
5. Jito Protects  → Transaction wrapped in MEV-protected bundle
6. Trade Logged   → Full history in Supabase
```

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** TailwindCSS
- **Blockchain:** @solana/web3.js, Jupiter Aggregator, Jito Bundles
- **Database:** Supabase (PostgreSQL + RLS)
- **AI:** Google Gemini / OpenAI GPT-4o
- **Webhooks:** Helius Enhanced Transactions
- **Deployment:** Netlify / Vercel

---

## 📦 Quick Start

```bash
# Clone
git clone https://github.com/aody34/DegenBot.git
cd DegenBot

# Install
npm install

# Configure
cp .env.example .env.local
# Edit .env.local with your API keys

# Run Supabase schema
# Copy supabase/schema.sql to Supabase SQL Editor and run

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔒 Security

- ✅ **Non-custodial** - Private keys never stored
- ✅ **Client-side signing** - All transactions signed in your browser
- ✅ **Open source** - Audit the code yourself
- ✅ **RLS policies** - Users only see their own data
- ✅ **AI safety layer** - Filters scams and rugs

---

## 📫 Support

- **Twitter:** [@BotDegen62550](https://x.com/BotDegen62550)
- **Website:** [degenbot.dev](https://degenbot.dev)
- **Issues:** [GitHub Issues](https://github.com/aody34/DegenBot/issues)

---

## 📄 License

MIT License — feel free to use this code for your own projects.

---

<p align="center">
  <sub>Built with ❤️ for degen traders</sub>
</p>
