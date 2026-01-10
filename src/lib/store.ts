import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
interface Position {
    id: string;
    token: string;
    symbol: string;
    amount: string;
    entryPrice: number;
    currentPrice: number;
    pnl: number;
    pnlValue: number;
    takeProfitSet: boolean;
    targetPrice: number | null;
}

interface TakeProfitOrder {
    id: string;
    positionId: string;
    targetPercentage: number;
    slippage: number;
    autoExecute: boolean;
    status: 'active' | 'triggered' | 'cancelled';
}

interface Transaction {
    id: string;
    type: 'buy' | 'sell';
    action: string;
    token: string;
    amount: string;
    price: number;
    pnl: number | null;
    timestamp: string;
    txHash: string;
}

interface Settings {
    darkMode: boolean;
    defaultSlippage: number;
    autoTakeProfit: boolean;
    emailNotifications: boolean;
    telegramNotifications: boolean;
    pushNotifications: boolean;
}

interface AppState {
    // Wallet
    connected: boolean;
    walletAddress: string | null;
    balance: number;

    // Positions
    positions: Position[];

    // Take-Profit Orders
    takeProfitOrders: TakeProfitOrder[];

    // Transactions
    transactions: Transaction[];

    // Entry Prices (tokenMint -> price)
    entryPrices: Record<string, number>;

    // TP Monitoring
    tpMonitoringActive: boolean;

    // Settings
    settings: Settings;

    // Actions
    setConnected: (connected: boolean, address?: string) => void;
    setBalance: (balance: number) => void;
    setPositions: (positions: Position[]) => void;
    addPosition: (position: Position) => void;
    updatePosition: (id: string, updates: Partial<Position>) => void;
    removePosition: (id: string) => void;
    setTakeProfitOrders: (orders: TakeProfitOrder[]) => void;
    addTakeProfitOrder: (order: TakeProfitOrder) => void;
    updateTakeProfitOrder: (id: string, updates: Partial<TakeProfitOrder>) => void;
    removeTakeProfitOrder: (id: string) => void;
    addTransaction: (transaction: Transaction) => void;
    setEntryPrice: (tokenMint: string, price: number) => void;
    setTpMonitoringActive: (active: boolean) => void;
    updateSettings: (settings: Partial<Settings>) => void;
    reset: () => void;
}

const defaultSettings: Settings = {
    darkMode: true,
    defaultSlippage: 1.0,
    autoTakeProfit: true,
    emailNotifications: true,
    telegramNotifications: false,
    pushNotifications: true,
};

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            // Initial state
            connected: false,
            walletAddress: null,
            balance: 0,
            positions: [],
            takeProfitOrders: [],
            transactions: [],
            entryPrices: {},
            tpMonitoringActive: false,
            settings: defaultSettings,

            // Actions
            setConnected: (connected, address) =>
                set({ connected, walletAddress: address || null }),

            setBalance: (balance) => set({ balance }),

            setPositions: (positions) => set({ positions }),

            addPosition: (position) =>
                set((state) => ({ positions: [...state.positions, position] })),

            updatePosition: (id, updates) =>
                set((state) => ({
                    positions: state.positions.map((p) =>
                        p.id === id ? { ...p, ...updates } : p
                    ),
                })),

            removePosition: (id) =>
                set((state) => ({
                    positions: state.positions.filter((p) => p.id !== id),
                })),

            setTakeProfitOrders: (orders) => set({ takeProfitOrders: orders }),

            addTakeProfitOrder: (order) =>
                set((state) => ({
                    takeProfitOrders: [...state.takeProfitOrders, order],
                })),

            updateTakeProfitOrder: (id, updates) =>
                set((state) => ({
                    takeProfitOrders: state.takeProfitOrders.map((o) =>
                        o.id === id ? { ...o, ...updates } : o
                    ),
                })),

            removeTakeProfitOrder: (id) =>
                set((state) => ({
                    takeProfitOrders: state.takeProfitOrders.filter((o) => o.id !== id),
                })),

            addTransaction: (transaction) =>
                set((state) => ({
                    transactions: [transaction, ...state.transactions],
                })),

            setEntryPrice: (tokenMint, price) =>
                set((state) => ({
                    entryPrices: { ...state.entryPrices, [tokenMint]: price },
                })),

            setTpMonitoringActive: (active) =>
                set({ tpMonitoringActive: active }),

            updateSettings: (newSettings) =>
                set((state) => ({
                    settings: { ...state.settings, ...newSettings },
                })),

            reset: () =>
                set({
                    connected: false,
                    walletAddress: null,
                    balance: 0,
                    positions: [],
                    takeProfitOrders: [],
                    transactions: [],
                    entryPrices: {},
                    tpMonitoringActive: false,
                    settings: defaultSettings,
                }),
        }),
        {
            name: 'degenbot-storage',
            partialize: (state) => ({
                settings: state.settings,
            }),
        }
    )
);

// Selector hooks for better performance
export const useWallet = () =>
    useAppStore((state) => ({
        connected: state.connected,
        walletAddress: state.walletAddress,
        balance: state.balance,
        setConnected: state.setConnected,
        setBalance: state.setBalance,
    }));

export const usePositions = () =>
    useAppStore((state) => ({
        positions: state.positions,
        setPositions: state.setPositions,
        addPosition: state.addPosition,
        updatePosition: state.updatePosition,
        removePosition: state.removePosition,
    }));

export const useTakeProfitOrders = () =>
    useAppStore((state) => ({
        takeProfitOrders: state.takeProfitOrders,
        setTakeProfitOrders: state.setTakeProfitOrders,
        addTakeProfitOrder: state.addTakeProfitOrder,
        updateTakeProfitOrder: state.updateTakeProfitOrder,
        removeTakeProfitOrder: state.removeTakeProfitOrder,
    }));

export const useSettings = () =>
    useAppStore((state) => ({
        settings: state.settings,
        updateSettings: state.updateSettings,
    }));
