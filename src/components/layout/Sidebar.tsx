'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CreditCard, Calendar, BarChart3, Bell, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { href: '/', label: 'ダッシュボード', icon: LayoutDashboard },
  { href: '/subscriptions', label: 'サブスク一覧', icon: CreditCard },
  { href: '/calendar', label: 'カレンダー', icon: Calendar },
  { href: '/analytics', label: '分析', icon: BarChart3 },
  { href: '/reminders', label: 'リマインダー', icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-56 bg-black text-white flex flex-col h-screen sticky top-0 shrink-0">
      <div className="px-6 py-7 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-white rounded-md" />
          <span className="text-sm font-semibold tracking-wide">SubscManager</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-white text-black font-medium'
                  : 'text-zinc-400 hover:bg-white/8 hover:text-white'
              }`}
            >
              <Icon size={16} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-2.5 px-3 mb-2">
            {user.photoURL ? (
              <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs">
                {user.displayName?.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate text-white">{user.displayName}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-zinc-400 hover:bg-white/8 hover:text-white rounded-lg transition-colors"
          >
            <LogOut size={16} />
            ログアウト
          </button>
        </div>
      )}
    </aside>
  );
}
