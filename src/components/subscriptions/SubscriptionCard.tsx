'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Subscription, formatCurrency, getMonthlyAmount } from '@/lib/types';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface Props {
  sub: Subscription;
  onEdit: (sub: Subscription) => void;
  onDelete: (id: string) => void;
}

export function SubscriptionCard({ sub, onEdit, onDelete }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const monthly = getMonthlyAmount(sub);

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5 hover:border-zinc-300 hover:shadow-sm transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: sub.color }}
          >
            {sub.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-black text-sm">{sub.name}</h3>
            <p className="text-xs text-zinc-400">{sub.category}</p>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(sub)}
            className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-black transition-colors"
          >
            <Pencil size={14} />
          </button>
          {confirmDelete ? (
            <div className="flex gap-1">
              <button
                onClick={() => onDelete(sub.id)}
                className="px-2 py-1 bg-black text-white text-xs rounded-lg"
              >
                削除
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-1 bg-zinc-100 text-zinc-600 text-xs rounded-lg"
              >
                取消
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-black transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-xl font-bold text-black tracking-tight">{formatCurrency(sub.amount, sub.currency)}</p>
          <p className="text-xs text-zinc-400 mt-0.5">{sub.billingCycle === 'monthly' ? '月払い' : '年払い'}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-400">月換算</p>
          <p className="text-sm font-semibold text-zinc-600">¥{Math.round(monthly).toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-100">
        <p className="text-xs text-zinc-400">
          次回 {format(new Date(sub.renewalDate), 'M月d日', { locale: ja })}
        </p>
      </div>
    </div>
  );
}
