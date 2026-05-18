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
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: sub.color }}
        >
          {sub.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{sub.name}</h3>
          <p className="text-xs text-gray-500">{sub.category}</p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(sub)}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Pencil size={15} />
          </button>
          {confirmDelete ? (
            <div className="flex gap-1">
              <button
                onClick={() => onDelete(sub.id)}
                className="px-2 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600"
              >
                削除
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-300"
              >
                キャンセル
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <div>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(sub.amount, sub.currency)}</p>
          <p className="text-xs text-gray-500">{sub.billingCycle === 'monthly' ? '月払い' : '年払い'} / {sub.billingDay}日</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">月換算</p>
          <p className="text-sm font-medium text-indigo-600">¥{Math.round(monthly).toLocaleString()}</p>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          次回更新: {format(new Date(sub.renewalDate), 'yyyy年M月d日', { locale: ja })}
        </p>
      </div>
    </div>
  );
}
