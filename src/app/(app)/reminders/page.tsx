'use client';

import { useMemo } from 'react';
import { Bell } from 'lucide-react';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { Subscription, formatCurrency } from '@/lib/types';
import { differenceInDays, format } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function RemindersPage() {
  const { subscriptions, loading } = useSubscriptions();

  const reminders = useMemo(() => {
    return subscriptions
      .map((sub) => ({ sub, days: differenceInDays(new Date(sub.renewalDate), new Date()) }))
      .filter(({ days }) => days >= 0 && days <= 60)
      .sort((a, b) => a.days - b.days);
  }, [subscriptions]);

  const urgent = reminders.filter((r) => r.days <= 3);
  const soon = reminders.filter((r) => r.days > 3 && r.days <= 14);
  const upcoming = reminders.filter((r) => r.days > 14);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black tracking-tight">リマインダー</h1>
        <p className="text-zinc-400 text-sm mt-1">60日以内に更新されるサブスク</p>
      </div>

      {reminders.length === 0 ? (
        <div className="border border-dashed border-zinc-200 rounded-2xl py-20 text-center">
          <Bell size={32} className="text-zinc-200 mx-auto mb-3" />
          <p className="text-zinc-300 text-sm">60日以内の更新予定はありません</p>
        </div>
      ) : (
        <div className="space-y-5">
          {urgent.length > 0 && (
            <Group title="3日以内" count={urgent.length} items={urgent} tone="urgent" />
          )}
          {soon.length > 0 && (
            <Group title="14日以内" count={soon.length} items={soon} tone="soon" />
          )}
          {upcoming.length > 0 && (
            <Group title="60日以内" count={upcoming.length} items={upcoming} tone="normal" />
          )}
        </div>
      )}
    </div>
  );
}

function Group({
  title, count, items, tone,
}: {
  title: string;
  count: number;
  items: { sub: Subscription; days: number }[];
  tone: 'urgent' | 'soon' | 'normal';
}) {
  const badgeStyle = {
    urgent: 'bg-black text-white',
    soon: 'bg-zinc-700 text-white',
    normal: 'bg-zinc-100 text-zinc-600',
  }[tone];

  const daysBadge = {
    urgent: 'bg-black text-white',
    soon: 'bg-zinc-800 text-white',
    normal: 'bg-zinc-100 text-zinc-600',
  }[tone];

  return (
    <section>
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{title}</h2>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeStyle}`}>{count}</span>
      </div>
      <ul className="space-y-2">
        {items.map(({ sub, days }) => (
          <li key={sub.id} className="bg-white border border-zinc-200 rounded-2xl px-5 py-4 flex items-center gap-4 hover:border-zinc-300 transition-colors">
            <div
              className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: sub.color }}
            >
              {sub.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-black text-sm">{sub.name}</p>
              <p className="text-xs text-zinc-400 mt-0.5">
                {format(new Date(sub.renewalDate), 'yyyy年M月d日（E）', { locale: ja })}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-semibold text-black text-sm">{formatCurrency(sub.amount, sub.currency)}</p>
              <p className="text-xs text-zinc-400">{sub.billingCycle === 'monthly' ? '月払い' : '年払い'}</p>
            </div>
            <span className={`text-sm font-bold px-3 py-1.5 rounded-xl shrink-0 min-w-[56px] text-center ${daysBadge}`}>
              {days === 0 ? '今日' : `${days}日後`}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
