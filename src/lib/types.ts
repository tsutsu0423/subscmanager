export type BillingCycle = 'monthly' | 'yearly';

export type Currency = 'JPY' | 'USD' | 'EUR' | 'GBP';

export const CURRENCIES: { code: Currency; symbol: string; label: string }[] = [
  { code: 'JPY', symbol: '¥', label: '日本円 (JPY)' },
  { code: 'USD', symbol: '$', label: 'US Dollar (USD)' },
  { code: 'EUR', symbol: '€', label: 'Euro (EUR)' },
  { code: 'GBP', symbol: '£', label: 'British Pound (GBP)' },
];

export const CATEGORIES = [
  '動画・映像',
  '音楽',
  'ゲーム',
  'クラウドストレージ',
  'ソフトウェア・ツール',
  'ニュース・情報',
  'フィットネス・健康',
  '教育・学習',
  'その他',
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Subscription {
  id: string;
  userId: string;
  name: string;
  amount: number;
  currency: Currency;
  category: Category;
  billingCycle: BillingCycle;
  billingDay: number;
  startDate: string;
  renewalDate: string;
  color: string;
  memo?: string;
  createdAt: string;
  updatedAt: string;
}

export const SUBSCRIPTION_COLORS = [
  '#6366f1',
  '#f43f5e',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#84cc16',
];

export const USD_TO_JPY = 150;
export const EUR_TO_JPY = 165;
export const GBP_TO_JPY = 190;

export function toJPY(amount: number, currency: Currency): number {
  switch (currency) {
    case 'USD': return amount * USD_TO_JPY;
    case 'EUR': return amount * EUR_TO_JPY;
    case 'GBP': return amount * GBP_TO_JPY;
    default: return amount;
  }
}

export function formatCurrency(amount: number, currency: Currency): string {
  const symbols: Record<Currency, string> = { JPY: '¥', USD: '$', EUR: '€', GBP: '£' };
  if (currency === 'JPY') return `¥${Math.round(amount).toLocaleString()}`;
  return `${symbols[currency]}${amount.toFixed(2)}`;
}

export function getMonthlyAmount(sub: Subscription): number {
  const jpy = toJPY(sub.amount, sub.currency);
  return sub.billingCycle === 'yearly' ? jpy / 12 : jpy;
}
