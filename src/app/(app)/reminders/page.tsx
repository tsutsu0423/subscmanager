'use client';

import { useMemo } from 'react';
import { Bell, AlertCircle, Clock } from 'lucide-react';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { formatCurrency, getMonthlyAmount } from '@/lib/types';
import { differenceInDays, format } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function RemindersPage() {
  const { subscriptions, loading } = useSubscriptions();

  const reminders = useMemo(() => {
    return subscriptions
      .map((sub) => ({
        sub,
        days: differenceInDays(new Date(sub.renewalDate), new Date()),
      }))
      .filter(({ days }) => days >= 0 && days <= 60)
      .sort((a, b) => a.days - b.days);
  }, [subscriptions]);

  const urgent = reminders.filter((r) => r.days <= 3);
  const soon = reminders.filter((r) => r.days > 3 && r.days <= 14);
  const upcoming = reminders.filter((r) => r.days > 14);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">リマインダー</h1>
        <p className="text-gray-500 mt-1">60日以内に更新されるサブスク</p>
      </div>

      {reminders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
          <Bell size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">60日以内の更新予定はありません</p>
        </div>
      ) : (
        <div className="space-y-6">
          {urgent.length > 0 && (
            <Section
              title="3日以内に更新"
              icon={<AlertCircle size={18} className="text-red-500" />}
              color="border-red-200 bg-red-50"
              items={urgent}
              badge="text-red-700 bg-red-100"
            />
          )}
          {soon.length > 0 && (
            <Section
              title="14日以内に更新"
              icon={<Clock size={18} className="text-yellow-500" />}
              color="border-yellow-200 bg-yellow-50"
              items={soon}
              badge="text-yellow-700 bg-yellow-100"
            />
          )}
          {upcoming.length > 0 && (
            <Section
              title="60日以内に更新"
              icon={<Bell size={18} className="text-gray-400" />}
              color="border-gray-200 bg-gray-50"
              items={upcoming}
              badge="text-gray-600 bg-gray-100"
            />
          )}
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  icon,
  color,
  items,
  badge,
}: {
  title: string;
  icon: React.ReactNode;
  color: string;
  items: { sub: ReturnType<typeof Object.assign> & { renewalDate: string; name: string; color: string; category: string; amount: number; currency: string; billingCycle: string; id: string }; days: number }[];
  badge: string;
}) {
  return (
    <div className={`rounded-2xl border p-6 ${color}`}>
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="font-semibold text-gray-900">{title}</h2>
        <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${badge}`}>
          {items.length} 件
        </span>
      </div>
      <ul className="space-y-3">
        {items.map(({ sub, days }) => (
          <li key={sub.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: sub.color }}
            >
              {sub.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900">{sub.name}</p>
              <p className="text-xs text-gray-500">
                {format(new Date(sub.renewalDate), 'yyyy年M月d日（E）', { locale: ja })}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-semibold text-gray-900">{formatCurrency(sub.amount, sub.currency)}</p>
              <p className="text-xs text-gray-400">{sub.billingCycle === 'monthly' ? '月払い' : '年払い'}</p>
            </div>
            <span className={`text-sm font-bold px-3 py-1.5 rounded-lg flex-shrink-0 ${badge}`}>
              {days === 0 ? '今日' : `${days}日後`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
