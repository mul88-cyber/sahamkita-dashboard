'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
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

export default function Dashboard() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnomaly, setFilterAnomaly] = useState(false);
  const [filterSignal, setFilterSignal] = useState('all');
  const [filterSector, setFilterSector] = useState('all');
  const [sectors, setSectors] = useState<string[]>([]);
  const [lastDate, setLastDate] = useState('');
  const [stats, setStats] = useState({
    topGainer: [] as StockData[],
    topLoser: [] as StockData[],
    topVolume: [] as StockData[],
    totalNetForeign: 0,
    anomalyCount: 0
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      // Ambil tanggal terbaru
      const { data: latest } = await supabase
        .from('daily_transactions')
        .select('trading_date')
        .order('trading_date', { ascending: false })
        .limit(1);
      
      const latestDate = latest?.[0]?.trading_date || '';
      setLastDate(latestDate);

      // Ambil semua data saham
      let query = supabase
        .from('daily_transactions')
        .select('stock_code, close, change_percent, volume, net_foreign_flow, big_player_anomaly, final_signal, sector')
        .eq('trading_date', latestDate);

      const { data, error } = await query;

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      const stocksData = data as StockData[];
      setStocks(stocksData);

      // Hitung statistik
      const sortedByGain = [...stocksData].sort((a, b) => b.change_percent - a.change_percent);
      const sortedByVolume = [...stocksData].sort((a, b) => b.volume - a.volume);
      const totalNetForeign = stocksData.reduce((sum, s) => sum + (s.net_foreign_flow || 0), 0);
      const anomalyCount = stocksData.filter(s => s.big_player_anomaly).length;

      setStats({
        topGainer: sortedByGain.slice(0, 5),
        topLoser: sortedByGain.slice(-5).reverse(),
        topVolume: sortedByVolume.slice(0, 5),
        totalNetForeign,
        anomalyCount
      });

      // Ambil daftar sektor unik
      const uniqueSectors = [...new Set(stocksData.map(s => s.sector).filter(Boolean))];
      setSectors(uniqueSectors);

      setLoading(false);
    }

    fetchData();
  }, []);

  // Filter stocks
  const filteredStocks = stocks.filter(s => {
    if (filterAnomaly && !s.big_player_anomaly) return false;
    if (filterSignal !== 'all' && s.final_signal !== filterSignal) return false;
    if (filterSector !== 'all' && s.sector !== filterSector) return false;
    if (searchTerm && !s.stock_code.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <h1 className="text-xl font-bold text-blue-600">📊 SahamKita</h1>
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
            <div className={`text-lg font-bold ${stats.totalNetForeign >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.totalNetForeign >= 0 ? '+' : ''}{(stats.totalNetForeign / 1e9).toFixed(1)}B
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-3">
            <div className="text-gray-500 text-xs">Big Player Anomaly</div>
            <div className="text-lg font-bold text-orange-600">{stats.anomalyCount}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-3">
            <div className="text-gray-500 text-xs">Total Saham</div>
            <div className="text-lg font-bold text-gray-800">{stocks.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-3">
            <div className="text-gray-500 text-xs">Sektor</div>
            <div className="text-lg font-bold text-gray-800">{sectors.length}</div>
          </div>
        </div>

        {/* Top Gainers & Losers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-3 py-2 border-b font-semibold text-sm">🚀 Top Gainer</div>
            {stats.topGainer.map((s, i) => (
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
            {stats.topLoser.map((s, i) => (
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
            {stats.topVolume.map((s, i) => (
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
            <h2 className="font-semibold">🔍 Stock Screener</h2>
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
              🔥 Big Player Anomaly
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
                      {s.big_player_anomaly && <span className="text-orange-600">🔥</span>}
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
