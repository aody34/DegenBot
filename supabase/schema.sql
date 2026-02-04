-- ============================================================================
-- DEGENBOT COPY TRADING SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE 1: PROFILES
-- Links to auth.users, stores user trading preferences
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    wallet_address TEXT UNIQUE,
    sol_balance_limit DECIMAL(18, 9) DEFAULT 1.0,  -- Max SOL per trade
    is_active BOOLEAN DEFAULT true,                 -- Master switch for copy trading
    telegram_id TEXT,                               -- For notifications
    ai_score_threshold INTEGER DEFAULT 80,          -- Min AI score to show signal
    max_slippage_bps INTEGER DEFAULT 100,          -- 1% default slippage
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE 2: WHALES
-- Tracked whale wallets with performance metrics
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.whales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    address TEXT UNIQUE NOT NULL,                   -- Solana wallet address
    label TEXT NOT NULL,                            -- Display name (e.g., "Smart Money #1")
    total_trades INTEGER DEFAULT 0,                 -- Total swaps tracked
    win_rate DECIMAL(5, 2) DEFAULT 0,              -- Win percentage (0-100)
    avg_profit_pct DECIMAL(10, 2) DEFAULT 0,       -- Average profit percentage
    is_active BOOLEAN DEFAULT true,                 -- Toggle tracking on/off
    last_active_at TIMESTAMPTZ,                     -- Last trade timestamp
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE 3: SIGNALS
-- Captured whale trades from Helius webhooks
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    whale_id UUID REFERENCES public.whales(id) ON DELETE CASCADE,
    token_address TEXT NOT NULL,                    -- Token mint address
    token_name TEXT,                                -- Token name/symbol
    token_symbol TEXT,                              -- Token symbol
    type TEXT NOT NULL CHECK (type IN ('BUY', 'SELL')),
    sol_amount DECIMAL(18, 9),                      -- Amount in SOL
    token_amount DECIMAL(28, 9),                    -- Token amount
    price_usd DECIMAL(20, 10),                      -- Price at signal time
    ai_score INTEGER DEFAULT 0,                     -- AI confidence (0-100)
    ai_reasoning TEXT,                              -- AI explanation
    tx_hash TEXT UNIQUE,                            -- Transaction signature
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'EXECUTED', 'SKIPPED', 'FAILED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE 4: EXECUTED_TRADES
-- Trades actually made by the bot/user
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.executed_trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    signal_id UUID REFERENCES public.signals(id) ON DELETE SET NULL,
    whale_id UUID REFERENCES public.whales(id) ON DELETE SET NULL,
    token_address TEXT NOT NULL,
    token_symbol TEXT,
    type TEXT NOT NULL CHECK (type IN ('BUY', 'SELL')),
    amount_in_sol DECIMAL(18, 9),                   -- SOL spent/received
    tokens_received DECIMAL(28, 9),                 -- Tokens bought/sold
    entry_price DECIMAL(20, 10),                    -- Entry price USD
    exit_price DECIMAL(20, 10),                     -- Exit price (for sells)
    profit_loss DECIMAL(20, 10),                    -- P&L in USD
    profit_pct DECIMAL(10, 4),                      -- P&L percentage
    tx_hash TEXT,                                   -- Transaction signature
    jito_bundle_id TEXT,                            -- Jito bundle ID if used
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED')),
    error_message TEXT,                             -- Error if failed
    executed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES for high-speed lookups
-- ============================================================================

-- Signals indexes
CREATE INDEX IF NOT EXISTS idx_signals_token_address ON public.signals(token_address);
CREATE INDEX IF NOT EXISTS idx_signals_whale_id ON public.signals(whale_id);
CREATE INDEX IF NOT EXISTS idx_signals_created_at ON public.signals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_status ON public.signals(status);

-- Whales indexes
CREATE INDEX IF NOT EXISTS idx_whales_address ON public.whales(address);
CREATE INDEX IF NOT EXISTS idx_whales_is_active ON public.whales(is_active);

-- Executed trades indexes
CREATE INDEX IF NOT EXISTS idx_executed_trades_user_id ON public.executed_trades(user_id);
CREATE INDEX IF NOT EXISTS idx_executed_trades_token_address ON public.executed_trades(token_address);
CREATE INDEX IF NOT EXISTS idx_executed_trades_status ON public.executed_trades(status);
CREATE INDEX IF NOT EXISTS idx_executed_trades_created_at ON public.executed_trades(created_at DESC);

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_address ON public.profiles(wallet_address);

-- ============================================================================
-- TRIGGER: Update whale's last_active_at when new signal arrives
-- ============================================================================
CREATE OR REPLACE FUNCTION update_whale_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.whales
    SET 
        last_active_at = NEW.created_at,
        total_trades = total_trades + 1,
        updated_at = NOW()
    WHERE id = NEW.whale_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_whale_activity ON public.signals;
CREATE TRIGGER trigger_update_whale_activity
    AFTER INSERT ON public.signals
    FOR EACH ROW
    EXECUTE FUNCTION update_whale_last_active();

-- ============================================================================
-- TRIGGER: Update timestamps on profile changes
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_whales_updated_at ON public.whales;
CREATE TRIGGER trigger_whales_updated_at
    BEFORE UPDATE ON public.whales
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executed_trades ENABLE ROW LEVEL SECURITY;

-- PROFILES: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- WHALES: Everyone can view whales (public list), only admins can modify
CREATE POLICY "Anyone can view active whales"
    ON public.whales FOR SELECT
    USING (true);

-- For admin operations, use service_role key (bypasses RLS)

-- SIGNALS: Everyone can view signals (public feed)
CREATE POLICY "Anyone can view signals"
    ON public.signals FOR SELECT
    USING (true);

-- EXECUTED_TRADES: Users can only see their own trades
CREATE POLICY "Users can view own trades"
    ON public.executed_trades FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades"
    ON public.executed_trades FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades"
    ON public.executed_trades FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================================================
-- HELPER FUNCTION: Create profile on user signup
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id)
    VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- SAMPLE DATA: Add some whale wallets to track
-- ============================================================================
INSERT INTO public.whales (address, label, win_rate) VALUES
    ('5kMHAXK7L1gFLpkCCqL6KRmGvRdKRh7KKaVYr8YVJqPq', 'Smart Money Alpha', 72.5),
    ('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', 'DeFi Whale', 68.3),
    ('HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH', 'Meme Lord', 55.0)
ON CONFLICT (address) DO NOTHING;

-- ============================================================================
-- DONE! Your copy trading schema is ready.
-- ============================================================================

-- Quick verification queries (run to test):
-- SELECT * FROM public.whales;
-- SELECT * FROM public.profiles;
