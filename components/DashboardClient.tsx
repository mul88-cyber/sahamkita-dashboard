// =============================================
// components/DashboardClient.tsx - REDESIGNED
// =============================================
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardClient({ stocks, stats, sectors, latestDate, totalCount, gainers, losers, topGainers, topLosers, topWhales }: any) {
  const router = useRouter();
  const [quickSearch, setQuickSearch] = useState('');

  const formattedDate = latestDate ? new Date(latestDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '';

  const formatCurrency = (v: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v || 0);

  const formatVolume = (v: number) => {
    if (v >= 1e12) return `${(v/1e12).toFixed(1)}T`;
    if (v >= 1e9) return `${(v/1e9).toFixed(1)}B`;
    if (v >= 1e6) return `${(v/1e6).toFixed(1)}M`;
    return v?.toLocaleString('id-ID') || '0';
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ============================================ */}
        {/* QUICK SEARCH - TOP CENTER */}
        {/* ============================================ */}
        <form onSubmit={(e) => { e.preventDefault(); if (quickSearch.trim()) router.push(`/emiten/${quickSearch.toUpperCase().trim()}`); }} className="max-w-xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari kode saham lalu Enter... (BBCA, TLKM, ASII)"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value.toUpperCase())}
              className="w-full px-5 py-3 text-lg border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-center font-medium"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">↵</span>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">{formattedDate} • {totalCount} saham</p>
        </form>

        {/* ============================================ */}
        {/* MARKET SUMMARY BAR */}
        {/* ============================================ */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
            <p className="text-xs text-gray-500">📊 Total</p>
            <p className="text-xl font-bold">{totalCount}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
            <p className="text-xs text-gray-500">🐋 Whale</p>
            <p className="text-xl font-bold text-green-600">{stats.whale_count || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
            <p className="text-xs text-gray-500">📈 Gainers</p>
            <p className="text-xl font-bold text-green-600">{gainers}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
            <p className="text-xs text-gray-500">📉 Losers</p>
            <p className="text-xl font-bold text-red-600">{losers}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
            <p className="text-xs text-gray-500">🌊 Foreign</p>
            <p className={`text-xl font-bold ${(stats.total_net_foreign || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatVolume(stats.total_net_foreign || 0)}
            </p>
          </div>
        </div>

        {/* ============================================ */}
        {/* TOP GAINERS & LOSERS */}
        {/* ============================================ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Gainers */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-green-50 dark:bg-green-900/30 border-b dark:border-gray-700">
              <h3 className="font-semibold text-green-700">📈 Top Gainers</h3>
            </div>
            <div className="divide-y dark:divide-gray-700">
              {topGainers.map((s: any, idx: number) => (
                <Link key={idx} href={`/emiten/${s.stock_code}`} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <div>
                    <span className="font-medium text-blue-600">{s.stock_code}</span>
                    <span className="text-xs text-gray-400 ml-2">{s.sector}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(s.close)}</p>
                    <p className="text-sm text-green-600 font-medium">+{s.change_percent?.toFixed(2)}%</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Top Losers */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-red-50 dark:bg-red-900/30 border-b dark:border-gray-700">
              <h3 className="font-semibold text-red-700">📉 Top Losers</h3>
            </div>
            <div className="divide-y dark:divide-gray-700">
              {topLosers.map((s: any, idx: number) => (
                <Link key={idx} href={`/emiten/${s.stock_code}`} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <div>
                    <span className="font-medium text-blue-600">{s.stock_code}</span>
                    <span className="text-xs text-gray-400 ml-2">{s.sector}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(s.close)}</p>
                    <p className="text-sm text-red-600 font-medium">{s.change_percent?.toFixed(2)}%</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* TOP WHALE SIGNALS */}
        {/* ============================================ */}
        {topWhales.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <h3 className="font-semibold mb-3">🐋 Top Whale Signals</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {topWhales.map((s: any, idx: number) => (
                <Link key={idx} href={`/emiten/${s.stock_code}`} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold">{s.stock_code}</span>
                    <span className="text-xs text-green-700">#{idx + 1}</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">{s.aov_ratio?.toFixed(2)}x</p>
                  <p className="text-xs text-gray-500">Score: {s.conviction_score?.toFixed(0)}%</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="text-center text-xs text-gray-400 py-4">
          <p>⚠️ Data disajikan untuk tujuan informatif dan bukan merupakan rekomendasi investasi.</p>
        </div>
      </div>
    </div>
  );
}
