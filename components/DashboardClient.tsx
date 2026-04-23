// =============================================
// components/DashboardClient.tsx
// Client component untuk interaktivitas dashboard
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
    const formatted = absValue >= 1_000_000_000_000
      ? `${(absValue / 1_000_000_000_000).toFixed(2)}T`
      : absValue >= 1_000_000_000
      ? `${(absValue / 1_000_000_000).toFixed(2)}M`
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 mb-1">Total Net Foreign Flow</p>
            <p className={`text-2xl font-bold ${
              initialStats.total_net_foreign >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatForeignFlow(initialStats.total_net_foreign)}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 mb-1">Anomali Big Player</p>
            <p className="text-2xl font-bold text-orange-600">
              {initialStats.anomaly_count} Saham
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 mb-1">Top Gainer</p>
            {initialStats.top_gainer?.[0] && (
              <>
                <p className="text-lg font-semibold">
                  {initialStats.top_gainer[0].stock_code}
                </p>
                <p className="text-green-600">
                  +{initialStats.top_gainer[0].change_percent}%
                </p>
              </>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 mb-1">Top Volume</p>
            {initialStats.top_volume?.[0] && (
              <>
                <p className="text-lg font-semibold">
                  {initialStats.top_volume[0].stock_code}
                </p>
                <p className="text-blue-600">
                  {formatVolume(initialStats.top_volume[0].volume)}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Filters */}
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
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
                <option value="NEUTRAL">NEUTRAL</option>
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

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">Kode</th>
                  <th className="px-4 py-3 text-right">Close</th>
                  <th className="px-4 py-3 text-right">Change %</th>
                  <th className="px-4 py-3 text-right">Volume</th>
                  <th className="px-4 py-3 text-right">Foreign Flow</th>
                  <th className="px-4 py-3 text-center">Sinyal</th>
                  <th className="px-4 py-3 text-left">Sektor</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredStocks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      Tidak ada saham yang sesuai dengan filter
                    </td>
                  </tr>
                ) : (
                  filteredStocks.map((stock) => (
                    <tr key={stock.stock_code} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium">
                        <Link 
                          href={`/emiten/${stock.stock_code}`}
                          className="text-blue-600 hover:underline"
                        >
                          {stock.stock_code}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {stock.close.toLocaleString()}
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
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          stock.final_signal === 'BUY' ? 'bg-green-100 text-green-800' :
                          stock.final_signal === 'SELL' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {stock.final_signal || 'NEUTRAL'}
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
