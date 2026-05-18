'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Subscription, CATEGORIES, CURRENCIES, SUBSCRIPTION_COLORS, Currency, Category } from '@/lib/types';
import { format } from 'date-fns';

interface Props {
  initial?: Partial<Subscription>;
  onSubmit: (data: Omit<Subscription, 'id' | 'userId' | 'renewalDate' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onClose: () => void;
}

export function SubscriptionForm({ initial, onSubmit, onClose }: Props) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    amount: initial?.amount?.toString() ?? '',
    currency: (initial?.currency ?? 'JPY') as Currency,
    category: (initial?.category ?? 'その他') as Category,
    billingCycle: initial?.billingCycle ?? 'monthly',
    billingDay: initial?.billingDay?.toString() ?? '1',
    startDate: initial?.startDate ?? format(new Date(), 'yyyy-MM-dd'),
    color: initial?.color ?? SUBSCRIPTION_COLORS[0],
    memo: initial?.memo ?? '',
  });
  const [loading, setLoading] = useState(false);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit({
      name: form.name,
      amount: parseFloat(form.amount),
      currency: form.currency,
      category: form.category,
      billingCycle: form.billingCycle as 'monthly' | 'yearly',
      billingDay: parseInt(form.billingDay),
      startDate: form.startDate,
      color: form.color,
      memo: form.memo || undefined,
    });
    setLoading(false);
    onClose();
  };

  const inputClass = "w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm text-black focus:outline-none focus:border-black transition-colors bg-white";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100">
          <h2 className="text-base font-semibold text-black">{initial?.name ? 'サブスク編集' : 'サブスク追加'}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors">
            <X size={18} className="text-zinc-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">サービス名</label>
            <input required value={form.name} onChange={(e) => set('name', e.target.value)}
              className={inputClass} placeholder="Netflix" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5">金額</label>
              <input required type="number" min="0" step="0.01" value={form.amount}
                onChange={(e) => set('amount', e.target.value)} className={inputClass} placeholder="1490" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5">通貨</label>
              <select value={form.currency} onChange={(e) => set('currency', e.target.value)} className={inputClass}>
                {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">カテゴリ</label>
            <select value={form.category} onChange={(e) => set('category', e.target.value)} className={inputClass}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5">請求サイクル</label>
              <select value={form.billingCycle} onChange={(e) => set('billingCycle', e.target.value)} className={inputClass}>
                <option value="monthly">月払い</option>
                <option value="yearly">年払い</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5">請求日</label>
              <select value={form.billingDay} onChange={(e) => set('billingDay', e.target.value)} className={inputClass}>
                {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>{d}日</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">開始日</label>
            <input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-2">カラー</label>
            <div className="flex gap-2 flex-wrap">
              {SUBSCRIPTION_COLORS.map((c) => (
                <button
                  key={c} type="button" onClick={() => set('color', c)}
                  className={`w-7 h-7 rounded-full transition-all ${form.color === c ? 'scale-125 ring-2 ring-offset-2 ring-zinc-400' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">メモ</label>
            <textarea value={form.memo} onChange={(e) => set('memo', e.target.value)}
              rows={2} className={`${inputClass} resize-none`} placeholder="任意のメモ" />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-black text-white py-3 rounded-xl text-sm font-medium hover:bg-zinc-800 disabled:opacity-40 transition-colors mt-2"
          >
            {loading ? '保存中...' : '保存する'}
          </button>
        </form>
      </div>
    </div>
  );
}
