'use client';

import { useMemo } from 'react';
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, ResponsiveContainer,
} from 'recharts';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { getMonthlyAmount, SUBSCRIPTION_COLORS } from '@/lib/types';
import { format, subMonths } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function AnalyticsPage() {
  const { subscriptions, loading } = useSubscriptions();

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const sub of subscriptions) {
      const m = getMonthlyAmount(sub);
      map[sub.category] = (map[sub.category] ?? 0) + m;
    }
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
  }, [subscriptions]);

  const serviceRanking = useMemo(() => {
    return subscriptions
      .map((s) => ({ name: s.name, value: Math.round(getMonthlyAmount(s)), color: s.color }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [subscriptions]);

  const monthlyTrend = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => subMonths(new Date(), 5 - i)).map((month) => ({
      label: format(month, 'M月', { locale: ja }),
      total: Math.round(subscriptions.reduce((acc, sub) => {
        return new Date(sub.startDate) <= month ? acc + getMonthlyAmount(sub) : acc;
      }, 0)),
    }));
  }, [subscriptions]);

  const empty = <p className="text-sm text-zinc-300 text-center py-12">データがありません</p>;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black tracking-tight">分析</h1>
        <p className="text-zinc-400 text-sm mt-1">サブスクリプション費用の詳細分析</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-white border border-zinc-200 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-black mb-5">カテゴリ別月額</h2>
          {categoryData.length === 0 ? empty : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={100}
                  dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false} fontSize={11}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={SUBSCRIPTION_COLORS[i % SUBSCRIPTION_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `¥${Number(v).toLocaleString()}`}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e5e5e5', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-black mb-5">サービス別ランキング</h2>
          {serviceRanking.length === 0 ? empty : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={serviceRanking} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#a1a1aa' }}
                  tickFormatter={(v) => `¥${Number(v).toLocaleString()}`} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#3f3f46' }} width={75} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => `¥${Number(v).toLocaleString()}`}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e5e5e5', fontSize: 12 }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {serviceRanking.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-black mb-5">月別費用推移（過去6ヶ月）</h2>
        {monthlyTrend.every((d) => d.total === 0) ? empty : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} tickFormatter={(v) => `¥${Number(v).toLocaleString()}`} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => `¥${Number(v).toLocaleString()}`}
                contentStyle={{ borderRadius: 12, border: '1px solid #e5e5e5', fontSize: 12 }} />
              <Line type="monotone" dataKey="total" stroke="#0a0a0a" strokeWidth={2}
                dot={{ fill: '#0a0a0a', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
