import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatNumber(num: number, decimals: number = 2): string {
    if (num >= 1e9) {
        return (num / 1e9).toFixed(decimals) + 'B';
    }
    if (num >= 1e6) {
        return (num / 1e6).toFixed(decimals) + 'M';
    }
    if (num >= 1e3) {
        return (num / 1e3).toFixed(decimals) + 'K';
    }
    return num.toFixed(decimals);
}

export function formatCurrency(num: number, decimals: number = 2): string {
    return '$' + formatNumber(num, decimals);
}

export function formatPercentage(num: number, decimals: number = 2): string {
    const sign = num >= 0 ? '+' : '';
    return sign + num.toFixed(decimals) + '%';
}

export function shortenAddress(address: string, chars: number = 4): string {
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatTimestamp(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function generateId(): string {
    return Math.random().toString(36).substring(2, 15);
}
