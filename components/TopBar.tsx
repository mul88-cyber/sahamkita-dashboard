// =============================================
// components/TopBar.tsx
// Top bar dengan Dark Mode Toggle
// =============================================
'use client';

import { useTheme } from '@/components/ThemeProvider';
import Link from 'next/link';

export default function TopBar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between h-14 px-4 md:pl-20">
        {/* Left: Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link href="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600">
            Dashboard
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <Link
            href="/screener"
            className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg"
          >
            🔍 Screener
          </Link>
          <Link
            href="/watchlist"
            className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-yellow-50 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-lg"
          >
            ⭐ Watchlist
          </Link>
        </div>
      </div>
    </header>
  );
}
