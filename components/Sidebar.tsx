// =============================================
// components/Sidebar.tsx
// Sidebar Navigasi ala TradingView
// =============================================
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/supabase';

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const menuGroups = [
    {
      title: 'Market',
      items: [
        { href: '/', label: '📊 Dashboard', icon: '📊' },
        { href: '/screener', label: '🎯 Screener Pro', icon: '🎯' },
        { href: '/market-map', label: '🗺️ Market Map', icon: '🗺️' },
        { href: '/market-breadth', label: '📈 Market Breadth', icon: '📈' },
      ],
    },
    {
      title: 'Analysis',
      items: [
        { href: '/heatmap', label: '🔥 Sector Heatmap', icon: '🔥' },
        { href: '/compare', label: '⚖️ Compare', icon: '⚖️' },
        { href: '/top-whale', label: '🏆 Top Whale', icon: '🏆' },
        { href: '/whale-tracker', label: '🐋 Whale Tracker', icon: '🐋' },
      ],
    },
    {
      title: 'Quant',
      items: [
        { href: '/quant', label: '🧪 Quant Lab', icon: '🧪' },
      ],
    },
    {
      title: 'User',
      items: [
        { href: '/watchlist', label: '⭐ Watchlist', icon: '⭐', requiresAuth: true },
        { href: '/profile', label: '👤 Profile', icon: '👤', requiresAuth: true },
        { href: '/pricing', label: '💎 Pricing', icon: '💎' },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-30 h-full bg-premium-gradient text-gray-100 transition-all duration-300
        border-r border-gray-700/50
        ${collapsed ? '-translate-x-full md:translate-x-0 md:w-[56px]' : 'translate-x-0 w-60'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-gray-700 dark:border-gray-800">
          {!collapsed && (
            <Link href="/" className="font-bold text-base tracking-tight flex items-center gap-2">
              <span className="text-xl">🐋</span>
              <span className="text-gradient-premium font-extrabold">SahamKita</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400"
          >
            {collapsed ? '☰' : '✕'}
          </button>
        </div>

        {/* Menu */}
        <nav className="overflow-y-auto h-[calc(100%-3.5rem)] py-2">
          {menuGroups.map((group) => (
            <div key={group.title} className="mb-1">
              {!collapsed && (
                <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">
                  {group.title}
                </p>
              )}
              {group.items.map((item) => {
                if (item.requiresAuth && !user) return null;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2 my-0.5 text-[13px] rounded-md transition-all duration-200
                      ${isActive(item.href) 
                        ? 'bg-blue-600/30 text-white border-l-2 border-blue-400 font-medium' 
                        : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 border-l-2 border-transparent'
                      }
                    `}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="text-base">{item.icon}</span>
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}

          {/* User Section */}
          <div className="border-t border-gray-700 mt-2 pt-2">
            {user ? (
              <div className="px-4 py-3">
                {!collapsed && (
                  <>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    <button
                      onClick={async () => {
                        await supabase.auth.signOut();
                        window.location.href = '/';
                      }}
                      className="mt-2 text-xs text-red-400 hover:text-red-300"
                    >
                      Logout
                    </button>
                  </>
                )}
                {collapsed && (
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm mx-auto">
                    {user.email?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
            ) : (
              <div className="px-4 py-3">
                {!collapsed ? (
                  <div className="space-y-2">
                    <Link
                      href="/login"
                      className="block w-full text-center py-1.5 text-sm bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="block w-full text-center py-1.5 text-sm bg-gray-700 rounded-lg hover:bg-gray-600"
                    >
                      Daftar
                    </Link>
                  </div>
                ) : (
                  <Link href="/login" className="flex justify-center text-lg" title="Login">
                    🔑
                  </Link>
                )}
              </div>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
}
