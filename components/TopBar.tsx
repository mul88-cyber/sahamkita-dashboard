// =============================================
// components/TopBar.tsx
// Top bar dengan info pasar
// =============================================
import Link from 'next/link';

export default async function TopBar() {
  // Bisa tambah data real-time nanti
  return (
    <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
      <div className="flex items-center justify-between h-14 px-4 md:pl-20">
        {/* Left: Breadcrumb / Page Title */}
        <div className="flex items-center gap-2">
          <Link href="/" className="text-sm text-gray-500 hover:text-blue-600">
            Dashboard
          </Link>
        </div>

        {/* Center: Market Status */}
        <div className="hidden md:flex items-center gap-4">
          <span className="flex items-center gap-1 text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-gray-600">Market Open</span>
          </span>
          <span className="text-xs text-gray-400">|</span>
          <span className="text-sm text-gray-600">
            📊 <span className="font-medium">IHSG</span> 
            <span className="text-green-600 ml-1">+0.45%</span>
          </span>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/screener"
            className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
          >
            🔍 Screener
          </Link>
          <Link
            href="/watchlist"
            className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100"
          >
            ⭐ Watchlist
          </Link>
        </div>
      </div>
    </header>
  );
}
