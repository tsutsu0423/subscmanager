'use client';

import { useMemo } from 'react';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { getMonthlyAmount, formatCurrency } from '@/lib/types';
import { differenceInDays } from 'date-fns';
import Link from 'next/link';

export default function DashboardPage() {
  const { subscriptions, loading } = useSubscriptions();

  const stats = useMemo(() => {
    const monthlyTotal = subscriptions.reduce((acc, s) => acc + getMonthlyAmount(s), 0);
    const yearlyTotal = monthlyTotal * 12;
    const count = subscriptions.length;
    const upcoming = subscriptions.filter((s) => {
      const days = differenceInDays(new Date(s.renewalDate), new Date());
      return days >= 0 && days <= 7;
    }).length;
    return { monthlyTotal, yearlyTotal, count, upcoming };
  }, [subscriptions]);

  const recentSubs = subscriptions
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const upcomingSubs = subscriptions
    .filter((s) => differenceInDays(new Date(s.renewalDate), new Date()) >= 0 && differenceInDays(new Date(s.renewalDate), new Date()) <= 30)
    .sort((a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-black tracking-tight">ダッシュボード</h1>
        <p className="text-zinc-400 text-sm mt-1">サブスクリプションの概要</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { label: '月額合計', value: `¥${Math.round(stats.monthlyTotal).toLocaleString()}` },
          { label: '年額合計', value: `¥${Math.round(stats.yearlyTotal).toLocaleString()}` },
          { label: '登録サービス', value: `${stats.count} 件` },
          { label: '7日以内の更新', value: `${stats.upcoming} 件` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-zinc-200 rounded-2xl p-5">
            <p className="text-xs text-zinc-400 mb-2">{label}</p>
            <p className="text-xl font-bold text-black tracking-tight">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <section className="bg-white border border-zinc-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-black">最近追加</h2>
            <Link href="/subscriptions" className="text-xs text-zinc-400 hover:text-black transition-colors">すべて見る →</Link>
          </div>
          {recentSubs.length === 0 ? (
            <p className="text-sm text-zinc-300 text-center py-8">まだ登録がありません</p>
          ) : (
            <ul className="space-y-3">
              {recentSubs.map((sub) => (
                <li key={sub.id} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: sub.color }}
                  >
                    {sub.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-black truncate">{sub.name}</p>
                    <p className="text-xs text-zinc-400">{sub.category}</p>
                  </div>
                  <p className="text-sm font-semibold text-black">{formatCurrency(sub.amount, sub.currency)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white border border-zinc-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-black">近日中の更新</h2>
            <Link href="/reminders" className="text-xs text-zinc-400 hover:text-black transition-colors">詳細 →</Link>
          </div>
          {upcomingSubs.length === 0 ? (
            <p className="text-sm text-zinc-300 text-center py-8">30日以内の更新はありません</p>
          ) : (
            <ul className="space-y-3">
              {upcomingSubs.map((sub) => {
                const days = differenceInDays(new Date(sub.renewalDate), new Date());
                return (
                  <li key={sub.id} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: sub.color }}
                    >
                      {sub.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black truncate">{sub.name}</p>
                      <p className="text-xs text-zinc-400">{sub.renewalDate}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-lg ${days <= 3 ? 'bg-black text-white' : days <= 14 ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-600'}`}>
                      {days === 0 ? '今日' : `${days}日後`}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
