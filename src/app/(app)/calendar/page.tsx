'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { Subscription } from '@/lib/types';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, format, addMonths, subMonths,
} from 'date-fns';
import { ja } from 'date-fns/locale';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

export default function CalendarPage() {
  const { subscriptions, loading } = useSubscriptions();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getEventsForDay = (day: Date) => {
    const events: { sub: Subscription; type: 'renewal' | 'start' }[] = [];
    for (const sub of subscriptions) {
      const start = new Date(sub.startDate);

      // 開始日はそのままの日付のみ表示
      if (isSameDay(start, day)) {
        events.push({ sub, type: 'start' });
        continue;
      }

      // 開始日より前の日は無視
      if (day < start) continue;

      // 月払い: 毎月同じ日に更新
      if (sub.billingCycle === 'monthly') {
        if (day.getDate() === start.getDate()) {
          events.push({ sub, type: 'renewal' });
        }
      }
      // 年払い: 毎年同じ月日に更新
      if (sub.billingCycle === 'yearly') {
        if (day.getMonth() === start.getMonth() && day.getDate() === start.getDate()) {
          events.push({ sub, type: 'renewal' });
        }
      }
    }
    return events;
  };

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
          <h1 className="text-2xl font-bold text-black tracking-tight">カレンダー</h1>
          <p className="text-zinc-400 text-sm mt-1">更新日・開始日を確認</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-black inline-block" />更新日</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-zinc-400 inline-block" />開始日</span>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <button onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
            <ChevronLeft size={18} className="text-zinc-500" />
          </button>
          <h2 className="text-sm font-semibold text-black">
            {format(currentMonth, 'yyyy年 M月', { locale: ja })}
          </h2>
          <button onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
            <ChevronRight size={18} className="text-zinc-500" />
          </button>
        </div>

        <div className="grid grid-cols-7">
          {WEEKDAYS.map((d, i) => (
            <div key={d} className={`text-center text-xs font-medium py-3 ${i === 0 ? 'text-zinc-400' : i === 6 ? 'text-zinc-400' : 'text-zinc-400'}`}>
              {d}
            </div>
          ))}
          {days.map((day, idx) => {
            const events = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());
            return (
              <div key={idx} className={`min-h-[88px] p-1.5 border-t border-zinc-100 ${!isCurrentMonth ? 'bg-zinc-50/50' : ''}`}>
                <div className={`text-xs w-6 h-6 flex items-center justify-center rounded-full mx-auto mb-1 font-medium ${
                  isToday ? 'bg-black text-white' : isCurrentMonth ? 'text-zinc-700' : 'text-zinc-300'
                }`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-0.5">
                  {events.slice(0, 3).map((ev, i) => (
                    <div key={i} className={`flex items-center gap-1 px-1 py-0.5 rounded text-xs truncate ${
                      ev.type === 'renewal' ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-600'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: ev.sub.color }} />
                      <span className="truncate">{ev.sub.name}</span>
                    </div>
                  ))}
                  {events.length > 3 && <p className="text-xs text-zinc-400 px-1">+{events.length - 3}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
