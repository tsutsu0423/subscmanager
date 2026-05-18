'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { Subscription } from '@/lib/types';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
  addMonths,
  subMonths,
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
      if (isSameDay(new Date(sub.renewalDate), day)) {
        events.push({ sub, type: 'renewal' });
      }
      if (isSameDay(new Date(sub.startDate), day)) {
        events.push({ sub, type: 'start' });
      }
    }
    return events;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">カレンダー</h1>
          <p className="text-gray-500 mt-1">更新日・開始日を確認</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="inline-block w-3 h-3 rounded-full bg-blue-500" />更新日
            <span className="inline-block w-3 h-3 rounded-full bg-emerald-500 ml-2" />開始日
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <button
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            {format(currentMonth, 'yyyy年M月', { locale: ja })}
          </h2>
          <button
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7">
          {WEEKDAYS.map((d, i) => (
            <div
              key={d}
              className={`text-center text-xs font-medium py-3 ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'}`}
            >
              {d}
            </div>
          ))}
          {days.map((day, idx) => {
            const events = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());
            return (
              <div
                key={idx}
                className={`min-h-[90px] p-1.5 border-t border-gray-100 ${!isCurrentMonth ? 'bg-gray-50' : ''}`}
              >
                <div className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mx-auto mb-1 ${isToday ? 'bg-indigo-600 text-white' : isCurrentMonth ? 'text-gray-700' : 'text-gray-300'}`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-0.5">
                  {events.slice(0, 3).map((ev, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-1 px-1 py-0.5 rounded text-xs truncate ${ev.type === 'renewal' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: ev.sub.color }}
                      />
                      <span className="truncate">{ev.sub.name}</span>
                    </div>
                  ))}
                  {events.length > 3 && (
                    <p className="text-xs text-gray-400 px-1">+{events.length - 3}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
