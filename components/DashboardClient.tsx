// =============================================
// components/DashboardClient.tsx
// Client component untuk interaktivitas dashboard
// DENGAN WHALE DETECTION UI
// =============================================
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Stock, DashboardStats, DashboardClientProps } from '@/types';

export default function DashboardClient({ 
  initialStocks, 
  initialStats, 
  sectors, 
  lastDate,
  totalCount 
}: DashboardClientProps) {
  // State untuk filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnomaly, setFilterAnomaly] = useState(false);
  const [filterSignal, setFilterSignal] = useState('all');
  const [filterSector, setFilterSector] = useState('all');

  // Memoized filter untuk performance
  const filteredStocks = useMemo(() => {
    return initialStocks.filter((stock: Stock) => {
      if (filterAnomaly && !stock.big_player_anomaly) return false;
      if (filterSignal !== 'all' && stock.final_signal !== filterSignal) return false;
      if (filterSector !== 'all' && stock.sector !== filterSector) return false;
      if (searchTerm && !stock.stock_code.toLowerCase().includes(searchTerm.toLowerCase())) 
        return false;
      return true;
    });
  }, [initialStocks, filterAnomaly, filterSignal, filterSector, searchTerm]);

  // Format date untuk display
  const formattedDate = lastDate 
    ? new Date(lastDate).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '';

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1_000_000_000) {
      return `${(volume / 1_000_000_000).toFixed(2)}B`;
    } else if (volume >= 1_000_000) {
      return `${(volume / 1_000_000).toFixed(2)}M`;
    } else if (volume >= 1_000) {
      return `${(volume / 1_000).toFixed(2)}K`;
    }
    return volume.toString();
  };

  const formatForeignFlow = (flow: number) => {
    const absValue = Math.abs(flow);
    const formatted = absValue >= 1_000_000_000
      ? `${(absValue / 1_000_000_000).toFixed(2)}B`
      : absValue >= 1_000_000
      ? `${(absValue / 1_000_000).toFixed(2)}M`
      : `${(absValue / 1_000_000).toFixed(2)}K`;
    return flow >= 0 ? `+${formatted}` : `-${formatted}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                📈 SahamKita Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Data Perdagangan: {formattedDate}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Saham</div>
              <div className="text-xl font-semibold">{totalCount}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* ============================================ */}
        {/* STATS CARDS - 5 KOLOM (TERMASUK WHALE)       */}
        {/* ============================================ */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Total Net Foreign */}
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 mb-1">🌊 Total Net Foreign</p>
            <p className={`text-2xl font-bold ${
              initialStats.total_net_foreign >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatForeignFlow(initialStats.total_net_foreign)}
            </p>
          </div>
          
          {/* Anomali Big Player */}
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 mb-1">⚡ Anomali Big Player</p>
            <p className="text-2xl font-bold text-orange-600">
              {initialStats.anomaly_count} Saham
            </p>
          </div>

          {/* 🆕 WHALE DETECTION CARD */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🐋</span>
              <p className="text-sm text-gray-600">Whale Detected</p>
            </div>
            <p className="text-2xl font-bold text-green-700">
              {initialStats.whale_count || 0} Saham
            </p>
            <p className="text-xs text-gray-500 mt-1">
              AOV Ratio ≥ 1.5x
            </p>
          </div>

          {/* 🆕 SPLIT/RETAIL CARD */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg shadow p-4 border-l-4 border-red-500">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">⚡</span>
              <p className="text-sm text-gray-600">Split/Retail</p>
            </div>
            <p className="text-2xl font-bold text-red-700">
              {initialStats.split_count || 0} Saham
            </p>
            <p className="text-xs text-gray-500 mt-1">
              AOV Ratio ≤ 0.6x
            </p>
          </div>

          {/* Total Saham */}
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 mb-1">📊 Total Saham</p>
            <p className="text-2xl font-bold text-gray-700">
              {totalCount}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Hari Ini
            </p>
          </div>
        </div>

        {/* ============================================ */}
        {/* TOP WHALE SIGNALS SECTION                     */}
        {/* ============================================ */}
        {initialStats.top_whale && initialStats.top_whale.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🐋</span>
              <h2 className="text-lg font-semibold text-gray-900">
                Top Whale Signals (Akumulasi Big Player)
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {initialStats.top_whale.map((stock, idx) => (
                <Link 
                  key={stock.stock_code}
                  href={`/emiten/${stock.stock_code}`}
                  className="block p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-gray-900">{stock.stock_code}</span>
                    <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">
                      #{idx + 1}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-green-700 mb-1">
                    {stock.aov_ratio?.toFixed(2)}x
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Score: {stock.conviction_score?.toFixed(0)}%
                    </span>
                    <span className={`font-medium ${
                      (stock.change_percent ?? 0) > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {(stock.change_percent ?? 0) > 0 ? '+' : ''}{stock.change_percent?.toFixed(2)}%
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-green-500 h-1.5 rounded-full" 
                      style={{ width: `${Math.min(stock.conviction_score || 0, 100)}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* FILTERS                                      */}
        {/* ============================================ */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap gap-4 items-end">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🔍 Cari Kode Saham
              </label>
              <input
                type="text"
                placeholder="Contoh: BBCA, TLKM, ASII"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Sector Filter */}
            <div className="min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🏢 Sektor
              </label>
              <select
                value={filterSector}
                onChange={(e) => setFilterSector(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Sektor</option>
                {sectors.map((sector) => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>

            {/* Signal Filter */}
            <div className="min-w-[120px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📊 Sinyal
              </label>
              <select
                value={filterSignal}
                onChange={(e) => setFilterSignal(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua</option>
                <option value="Strong Akumulasi">Strong Akumulasi</option>
                <option value="Akumulasi">Akumulasi</option>
                <option value="Netral">Netral</option>
                <option value="Distribusi">Distribusi</option>
                <option value="Strong Distribusi">Strong Distribusi</option>
              </select>
            </div>

            {/* Anomaly Toggle */}
            <div className="min-w-[150px]">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterAnomaly}
                  onChange={(e) => setFilterAnomaly(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  ⚡ Anomali Big Player
                </span>
              </label>
            </div>
          </div>

          {/* Result Count */}
          <div className="mt-4 text-sm text-gray-500">
            Menampilkan {filteredStocks.length} dari {initialStocks.length} saham
          </div>
        </div>

        {/* ============================================ */}
        {/* TABLE - DENGAN KOLOM AOV RATIO               */}
        {/* ============================================ */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">Kode</th>
                  <th className="px-4 py-3 text-right">Close</th>
                  <th className="px-4 py-3 text-right">Change %</th>
                  <th className="px-4 py-3 text-right">Volume</th>
                  <th className="px-4 py-3 text-right">Foreign</th>
                  <th className="px-4 py-3 text-center">🐋 AOV</th>
                  <th className="px-4 py-3 text-center">Sinyal</th>
                  <th className="px-4 py-3 text-left">Sektor</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredStocks.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      Tidak ada saham yang sesuai dengan filter
                    </td>
                  </tr>
                ) : (
                  filteredStocks.map((stock) => {
                    const aovRatio = stock.aov_ratio || 1.0;
                    const isWhale = stock.whale_signal || aovRatio >= 1.5;
                    const isSplit = stock.split_signal || (aovRatio <= 0.6 && aovRatio > 0);
                    const convictionScore = stock.conviction_score || 50;
                    
                    return (
                      <tr key={stock.stock_code} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium">
                          <div className="flex items-center gap-1">
                            <Link 
                              href={`/emiten/${stock.stock_code}`}
                              className="text-blue-600 hover:underline"
                            >
                              {stock.stock_code}
                            </Link>
                            
                            {/* 🆕 Crossing Nego Badge */}
                            {(() => {
                              const negoValue = stock.non_regular_value || 0;
                              const totalValue = stock.transaction_value || 0;  // ✅ PERBAIKAN: hapus stock.value
                              if (negoValue > totalValue * 0.1) {
                                return (
                                  <span 
                                    className="text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded" 
                                    title="Ada crossing nego besar (>10% total value)"
                                  >
                                    🏦
                                  </span>
                                );
                              }
                              return null;
                            })()}
                            
                            {/* 🆕 Saham Ringan Badge */}
                            {(() => {
                              const tradeablePct = stock.tradeable_pct;
                              if (tradeablePct && tradeablePct < 20) {
                                return (
                                  <span 
                                    className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded" 
                                    title="Saham ringan - mudah digerakkan (tradeable < 20%)"
                                  >
                                    💨
                                  </span>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          {formatCurrency(stock.close)}
                        </td>
                        <td className={`px-4 py-3 text-right font-medium ${
                          stock.change_percent > 0 ? 'text-green-600' : 
                          stock.change_percent < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {stock.change_percent > 0 ? '+' : ''}{stock.change_percent}%
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatVolume(stock.volume)}
                        </td>
                        <td className={`px-4 py-3 text-right ${
                          stock.net_foreign_flow > 0 ? 'text-green-600' : 
                          stock.net_foreign_flow < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {formatForeignFlow(stock.net_foreign_flow)}
                        </td>
                        
                        {/* 🆕 KOLOM AOV RATIO */}
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {isWhale && <span className="text-green-600" title="Whale Signal">🐋</span>}
                            {isSplit && <span className="text-red-600" title="Split Signal">⚡</span>}
                            <span className={`font-medium ${
                              isWhale ? 'text-green-700' : 
                              isSplit ? 'text-red-700' : 
                              'text-gray-600'
                            }`}>
                              {aovRatio.toFixed(2)}x
                            </span>
                          </div>
                          {/* Conviction bar kecil */}
                          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                            <div 
                              className={`h-1 rounded-full ${
                                isWhale ? 'bg-green-500' : 
                                isSplit ? 'bg-red-500' : 
                                'bg-gray-400'
                              }`}
                              style={{ width: `${Math.min(convictionScore, 100)}%` }}
                            />
                          </div>
                        </td>
                        
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            stock.final_signal?.includes('Strong Akumulasi') ? 'bg-green-200 text-green-800' :
                            stock.final_signal?.includes('Akumulasi') ? 'bg-green-100 text-green-700' :
                            stock.final_signal?.includes('Strong Distribusi') ? 'bg-red-200 text-red-800' :
                            stock.final_signal?.includes('Distribusi') ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {stock.final_signal || 'Netral'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {stock.sector || '-'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Link
                            href={`/emiten/${stock.stock_code}`}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Detail →
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
              {/* 🆕 DISCLAIMER - TAMBAHKAN INI */}
              <div className="text-center text-xs text-gray-400 py-4 mt-6">
                <p>
                  ⚠️ Data disajikan untuk tujuan informatif dan bukan merupakan rekomendasi investasi.
                </p>
                <p className="mt-1">
                  Data transaksi diupdate setiap hari. Data kepemilikan diupdate setiap bulan dari KSEI.
                </p>
              </div>
      
            </main>
          </div>
        );
      }
