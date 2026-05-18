'use client';

import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { SubscriptionCard } from '@/components/subscriptions/SubscriptionCard';
import { SubscriptionForm } from '@/components/subscriptions/SubscriptionForm';
import { Subscription, CATEGORIES } from '@/lib/types';

export default function SubscriptionsPage() {
  const { subscriptions, loading, addSubscription, updateSubscription, deleteSubscription } = useSubscriptions();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Subscription | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const filtered = subscriptions.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !filterCategory || s.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const handleEdit = (sub: Subscription) => { setEditTarget(sub); setShowForm(true); };
  const handleClose = () => { setShowForm(false); setEditTarget(null); };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-black tracking-tight">サブスク一覧</h1>
          <p className="text-zinc-400 text-sm mt-1">{subscriptions.length} 件のサービス</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors"
        >
          <Plus size={16} />
          追加
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-black transition-colors bg-white w-52"
            placeholder="サービス名で検索"
          />
        </div>
        <select
          value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
          className="border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors bg-white text-zinc-600"
        >
          <option value="">すべて</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-zinc-200 rounded-2xl">
          <p className="text-zinc-300 text-sm mb-3">サブスクが見つかりません</p>
          <button onClick={() => setShowForm(true)} className="text-sm text-black hover:underline font-medium">
            最初のサブスクを追加する
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((sub) => (
            <SubscriptionCard key={sub.id} sub={sub} onEdit={handleEdit} onDelete={deleteSubscription} />
          ))}
        </div>
      )}

      {showForm && (
        <SubscriptionForm
          initial={editTarget ?? undefined}
          onSubmit={editTarget ? (data) => updateSubscription(editTarget.id, data) : addSubscription}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
