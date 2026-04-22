// components/DashboardClient.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

interface StockData {
  stock_code: string;
  close: number;
  change_percent: number;
  volume: number;
  net_foreign_flow: number;
  big_player_anomaly: boolean;
  final_signal: string;
  sector: string;
}

interface StatsProps {
  topGainer: StockData[];
  topLoser: StockData[];
  topVolume: StockData[];
  totalNetForeign: number;
  anomalyCount: number;
}

interface DashboardClientProps {
  initialStocks: StockData[];
  initialStats: StatsProps;
  sectors: string[];
  lastDate: string;
}

export default function DashboardClient({ 
  initialStocks, 
  initialStats, 
  sectors, 
  lastDate 
}: DashboardClientProps) {
  // Tidak ada lagi loading state atau useEffect fetching data!
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnomaly, setFilterAnomaly] = useState(false);
  const [filterSignal, setFilterSignal] = useState('all');
  const [filterSector, setFilterSector] = useState('all');

  // Filter stocks tetap berjalan di sisi client agar interaktif dan instan
  const filteredStocks = initialStocks.filter(s => {
    if (filterAnomaly && !s.big_player_anomaly) return false;
    if (filterSignal !== 'all' && s.final_signal !== filterSignal) return false;
    if (filterSector !== 'all' && s.sector !== filterSector) return false;
    if (searchTerm && !s.stock_code.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <h1 className="text-xl font-bold text-blue-600">📈 SahamKita</h1>
            <div className="text-xs text-gray-400">Update: {lastDate}</div>
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Cari kode saham..."
                className="w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-lg shadow p-3">
            <div className="text-gray-500 text-xs">Net Foreign Flow</div>
            <div className={`text-lg font-bold ${initialStats.totalNetForeign >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {initialStats.totalNetForeign >= 0 ? '+' : ''}{(initialStats.totalNetForeign / 1e9).toFixed(1)}B
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-3">
            <div className="text-gray-500 text-xs">Big Player Anomaly</div>
            <div className="text-lg font-bold text-orange-600">{initialStats.anomalyCount}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-3">
            <div className="text-gray-500 text-xs">Total Saham</div>
            <div className="text-lg font-bold text-gray-800">{initialStocks.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-3">
            <div className="text-gray-500 text-xs">Sektor</div>
            <div className="text-lg font-bold text-gray-800">{sectors.length}</div>
          </div>
        </div>

        {/* Top Gainers, Losers, Volume */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-3 py-2 border-b font-semibold text-sm">🚀 Top Gainer</div>
            {initialStats.topGainer.map((s) => (
              <Link key={s.stock_code} href={`/emiten/${s.stock_code}`}>
                <div className="px-3 py-2 border-b last:border-0 flex justify-between hover:bg-gray-50 cursor-pointer">
                  <span className="font-medium text-sm">{s.stock_code}</span>
                  <span className="text-green-600 text-sm">+{s.change_percent?.toFixed(2)}%</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="bg-white rounded-lg shadow">
            <div className="px-3 py-2 border-b font-semibold text-sm">📉 Top Loser</div>
            {initialStats.topLoser.map((s) => (
              <Link key={s.stock_code} href={`/emiten/${s.stock_code}`}>
                <div className="px-3 py-2 border-b last:border-0 flex justify-between hover:bg-gray-50 cursor-pointer">
                  <span className="font-medium text-sm">{s.stock_code}</span>
                  <span className="text-red-600 text-sm">{s.change_percent?.toFixed(2)}%</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="bg-white rounded-lg shadow">
            <div className="px-3 py-2 border-b font-semibold text-sm">📊 Top Volume</div>
            {initialStats.topVolume.map((s) => (
              <Link key={s.stock_code} href={`/emiten/${s.stock_code}`}>
                <div className="px-3 py-2 border-b last:border-0 flex justify-between hover:bg-gray-50 cursor-pointer">
                  <span className="font-medium text-sm">{s.stock_code}</span>
                  <span className="text-gray-600 text-sm">{(s.volume / 1e6).toFixed(1)}M</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Screener Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold">🔎 Stock Screener</h2>
          </div>
          <div className="p-4 flex flex-wrap gap-3">
            <button
              onClick={() => { setFilterAnomaly(false); setFilterSignal('all'); }}
              className={`px-3 py-1 rounded-full text-sm ${!filterAnomaly && filterSignal === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterAnomaly(true)}
              className={`px-3 py-1 rounded-full text-sm ${filterAnomaly ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}
            >
              🐳 Big Player Anomaly
            </button>
            <select
              value={filterSignal}
              onChange={(e) => setFilterSignal(e.target.value)}
              className="px-3 py-1 rounded-full text-sm bg-gray-200 border-none"
            >
              <option value="all">Semua Signal</option>
              <option value="Strong Akumulasi">Strong Akumulasi</option>
              <option value="Akumulasi">Akumulasi</option>
              <option value="Strong Distribusi">Strong Distribusi</option>
              <option value="Distribusi">Distribusi</option>
              <option value="Netral">Netral</option>
            </select>
            <select
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              className="px-3 py-1 rounded-full text-sm bg-gray-200 border-none"
            >
              <option value="all">Semua Sektor</option>
              {sectors.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Tabel Hasil Screener */}
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">Kode</th>
                  <th className="px-3 py-2 text-right">Harga</th>
                  <th className="px-3 py-2 text-right">Change</th>
                  <th className="px-3 py-2 text-right">Volume</th>
                  <th className="px-3 py-2 text-right">Net Foreign</th>
                  <th className="px-3 py-2 text-left">Signal</th>
                  <th className="px-3 py-2 text-left">Anomaly</th>
                </tr>
              </thead>
              <tbody>
                {filteredStocks.slice(0, 50).map((s) => (
                  <tr key={s.stock_code} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/emiten/${s.stock_code}`}>
                    <td className="px-3 py-2 font-medium text-blue-600">{s.stock_code}</td>
                    <td className="px-3 py-2 text-right">{s.close?.toLocaleString()}</td>
                    <td className={`px-3 py-2 text-right ${s.change_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {s.change_percent?.toFixed(2)}%
                    </td>
                    <td className="px-3 py-2 text-right">{(s.volume / 1e6).toFixed(1)}M</td>
                    <td className={`px-3 py-2 text-right ${s.net_foreign_flow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(s.net_foreign_flow / 1e6).toFixed(0)}M
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        s.final_signal?.includes('Strong Akum') ? 'bg-green-100 text-green-700' :
                        s.final_signal?.includes('Akum') ? 'bg-green-50 text-green-600' :
                        s.final_signal?.includes('Distribusi') ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {s.final_signal || '-'}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {s.big_player_anomaly && <span className="text-orange-600">🐳</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
