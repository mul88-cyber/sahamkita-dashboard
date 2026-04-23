'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

export default function ScreenerClient({ initialStocks, sectors, lastDate }: any) {
  const [mode, setMode] = useState<'whale' | 'split'>('whale');
  const [minValue, setMinValue] = useState(1_000_000_000); // 1M
  const [filterSector, setFilterSector] = useState('all');
  const [priceContext, setPriceContext] = useState('all');

  const filteredStocks = useMemo(() => {
    return initialStocks
      .filter((s: any) => {
        if (mode === 'whale' && !s.whale_signal) return false;
        if (mode === 'split' && !s.split_signal) return false;
        if (filterSector !== 'all' && s.sector !== filterSector) return false;
        if ((s.value || 0) < minValue) return false;
        if (priceContext !== 'all' && s.price_context !== priceContext) return false; // 🆕
        return true;
      })
      .sort((a: any, b: any) => (b.conviction_score || 0) - (a.conviction_score || 0));
  }, [initialStocks, mode, minValue, filterSector, priceContext]); // 🆕 Tambah priceContext

  const formatCurrency = (v: number) => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(v);

  const formatVolume = (v: number) => {
    if (v >= 1e9) return `${(v/1e9).toFixed(2)}B`;
    if (v >= 1e6) return `${(v/1e6).toFixed(2)}M`;
    return v.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="text-sm text-gray-500 mb-2">
            <Link href="/" className="hover:text-blue-600">Dashboard</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Screener</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === 'whale' ? '🐋 Whale Screener' : '⚡ Split/Retail Screener'}
          </h1>
          <p className="text-sm text-gray-500">
            Data per: {new Date(lastDate).toLocaleDateString('id-ID')}
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-1">Mode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setMode('whale')}
                  className={`px-4 py-2 rounded-lg ${
                    mode === 'whale' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  🐋 Whale
                </button>
                <button
                  onClick={() => setMode('split')}
                  className={`px-4 py-2 rounded-lg ${
                    mode === 'split' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  ⚡ Split
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Min. Value</label>
              <select
                value={minValue}
                onChange={(e) => setMinValue(Number(e.target.value))}
                className="px-3 py-2 border rounded-lg"
              >
                <option value={500_000_000}>Rp 500M</option>
                <option value={1_000_000_000}>Rp 1M</option>
                <option value={5_000_000_000}>Rp 5M</option>
                <option value={10_000_000_000}>Rp 10M</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Sektor</label>
              <select
                value={filterSector}
                onChange={(e) => setFilterSector(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="all">Semua Sektor</option>
                {sectors.map((s: string) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            {/* 🆕 Price Context Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">📉 Price Context</label>
              <select
                value={priceContext}
                onChange={(e) => setPriceContext(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="all">Semua Fase</option>
                <option value="Hidden Gem (Sideways)">💎 Hidden Gem</option>
                <option value="Bottom Fishing (Downtrend)">⚓ Bottom Fishing</option>
                <option value="Early Move (Uptrend Awal)">🚀 Early Move</option>
                <option value="Strong Uptrend">📈 Strong Uptrend</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Ditemukan: {filteredStocks.length} saham
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">Kode</th>
                <th className="px-4 py-3 text-right">Close</th>
                <th className="px-4 py-3 text-right">Chg %</th>
                <th className="px-4 py-3 text-right">Value</th>
                <th className="px-4 py-3 text-center">AOV Ratio</th>
                <th className="px-4 py-3 text-center">Conviction</th>
                <th className="px-4 py-3 text-left">Sektor</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.map((stock: any) => (
                <tr key={stock.stock_code} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/emiten/${stock.stock_code}`} className="text-blue-600 hover:underline">
                      {stock.stock_code}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {formatCurrency(stock.close)}
                  </td>
                  <td className={`px-4 py-3 text-right ${
                    stock.change_percent > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stock.change_percent > 0 ? '+' : ''}{stock.change_percent?.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatVolume(stock.value || 0)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-medium ${
                      mode === 'whale' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {(stock.aov_ratio || 1).toFixed(2)}x
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center gap-2">
                      <span>{(stock.conviction_score || 0).toFixed(0)}%</span>
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${
                            mode === 'whale' ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(stock.conviction_score || 0, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{stock.sector || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <Link href={`/emiten/${stock.stock_code}`} className="text-blue-600">
                      Detail →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
