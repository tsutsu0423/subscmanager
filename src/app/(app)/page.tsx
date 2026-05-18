'use client';

import { useMemo } from 'react';
import { TrendingUp, CreditCard, Bell, BarChart2 } from 'lucide-react';
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
    .filter((s) => {
      const days = differenceInDays(new Date(s.renewalDate), new Date());
      return days >= 0 && days <= 30;
    })
    .sort((a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-gray-500 mt-1">サブスクリプションの概要</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<TrendingUp className="text-indigo-600" size={22} />}
          label="月額合計"
          value={`¥${Math.round(stats.monthlyTotal).toLocaleString()}`}
          bg="bg-indigo-50"
        />
        <StatCard
          icon={<TrendingUp className="text-emerald-600" size={22} />}
          label="年額合計"
          value={`¥${Math.round(stats.yearlyTotal).toLocaleString()}`}
          bg="bg-emerald-50"
        />
        <StatCard
          icon={<CreditCard className="text-blue-600" size={22} />}
          label="登録サービス数"
          value={`${stats.count} 件`}
          bg="bg-blue-50"
        />
        <StatCard
          icon={<Bell className="text-amber-600" size={22} />}
          label="7日以内の更新"
          value={`${stats.upcoming} 件`}
          bg="bg-amber-50"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">最近追加したサービス</h2>
            <Link href="/subscriptions" className="text-sm text-indigo-600 hover:underline">すべて見る</Link>
          </div>
          {recentSubs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">サブスクがまだ登録されていません</p>
          ) : (
            <ul className="space-y-3">
              {recentSubs.map((sub) => (
                <li key={sub.id} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-xs"
                    style={{ backgroundColor: sub.color }}
                  >
                    {sub.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{sub.name}</p>
                    <p className="text-xs text-gray-400">{sub.category}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(sub.amount, sub.currency)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">近日中の更新</h2>
            <Link href="/reminders" className="text-sm text-indigo-600 hover:underline">詳細を見る</Link>
          </div>
          {upcomingSubs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">30日以内の更新はありません</p>
          ) : (
            <ul className="space-y-3">
              {upcomingSubs.map((sub) => {
                const days = differenceInDays(new Date(sub.renewalDate), new Date());
                const urgency = days <= 3 ? 'bg-red-100 text-red-700' : days <= 14 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600';
                return (
                  <li key={sub.id} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-xs"
                      style={{ backgroundColor: sub.color }}
                    >
                      {sub.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{sub.name}</p>
                      <p className="text-xs text-gray-400">{sub.renewalDate}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${urgency}`}>
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

function StatCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: string; bg: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>{icon}</div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}
