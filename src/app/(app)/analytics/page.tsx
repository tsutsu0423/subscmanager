'use client';

import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { getMonthlyAmount, SUBSCRIPTION_COLORS } from '@/lib/types';
import { format, subMonths, addMonths } from 'date-fns';
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
    const months = Array.from({ length: 6 }, (_, i) => subMonths(new Date(), 5 - i));
    return months.map((month) => {
      const label = format(month, 'M月', { locale: ja });
      const total = subscriptions.reduce((acc, sub) => {
        const start = new Date(sub.startDate);
        if (start <= month) return acc + getMonthlyAmount(sub);
        return acc;
      }, 0);
      return { label, total: Math.round(total) };
    });
  }, [subscriptions]);

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
        <h1 className="text-2xl font-bold text-gray-900">分析</h1>
        <p className="text-gray-500 mt-1">サブスクリプション費用の詳細分析</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">カテゴリ別月額（ドーナツグラフ）</h2>
          {categoryData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">データがありません</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={SUBSCRIPTION_COLORS[i % SUBSCRIPTION_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `¥${Number(v).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">サービス別月額ランキング</h2>
          {serviceRanking.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">データがありません</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={serviceRanking} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `¥${Number(v).toLocaleString()}`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                <Tooltip formatter={(v) => `¥${Number(v).toLocaleString()}`} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {serviceRanking.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">月別費用推移（過去6ヶ月）</h2>
        {monthlyTrend.every((d) => d.total === 0) ? (
          <p className="text-sm text-gray-400 text-center py-12">データがありません</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `¥${Number(v).toLocaleString()}`} />
              <Tooltip formatter={(v) => `¥${Number(v).toLocaleString()}`} />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ fill: '#6366f1', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
