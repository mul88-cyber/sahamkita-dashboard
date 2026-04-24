// =============================================
// components/TopBar.tsx
// Premium Top Bar dengan Market Ticker
// =============================================
'use client';

import { useTheme } from '@/components/ThemeProvider';
import Link from 'next/link';

export default function TopBar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800/50">
      <div className="flex items-center justify-between h-11 px-4 md:pl-16">
        {/* Left: Breadcrumb */}
        <div className="flex items-center gap-3">
          <Link href="/" className="text-[11px] font-medium text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors uppercase tracking-wider">
            Dashboard
          </Link>
          <span className="text-[10px] text-gray-300 dark:text-gray-700">|</span>
          <span className="text-[10px] text-gray-500 dark:text-gray-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse-soft" />
            <span className="uppercase tracking-wider">Live Market</span>
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Dark Mode */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Quick Links */}
          <Link href="/screener" className="hidden md:flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-all">
            🔍 Screener
          </Link>
          <Link href="/quant" className="hidden md:flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-md transition-all">
            🧪 Quant
          </Link>
          <Link href="/watchlist" className="hidden md:flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-md transition-all">
            ⭐ Watchlist
          </Link>
        </div>
      </div>
    </header>
  );
}
