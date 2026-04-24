// =============================================
// components/ScreenerClientV3.tsx
// Screener Advanced V3 - Bandarmology Edition
// =============================================
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ScreenerStock {
  stock_code: string;
  last_close: number;
  last_change: number;
  avg_daily_value: number;
  turnover_float_pct: number;
  whale_spikes: number;
  retail_drops: number;
  max_aov_ratio: number;
  total_foreign: number;
  max_anomaly: number;
  conviction_score: number;
  sector: string;
  trading_days: number;
}

interface ScreenerClientV3Props {
  initialStocks: ScreenerStock[];
  totalCount: number;
  defaultMode: string;
  defaultContext: string;
  startDate: string;
  endDate: string;
}

export default function ScreenerClientV3({ 
  initialStocks, 
  totalCount,
  defaultMode,
  defaultContext,
  startDate: defaultStart,
  endDate: defaultEnd
}: ScreenerClientV3Props) {
  const router = useRouter();
  const [mode, setMode] = useState(defaultMode);
  const [priceContext, setPriceContext] = useState(defaultContext);
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [minTurnover, setMinTurnover] = useState(0.5);
  const [minValue, setMinValue] = useState(1); // Miliar
  const [minSignals, setMinSignals] = useState(1);

  const formatCurrency = (v: number) => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(v || 0);

  const formatVolume = (v: number) => {
    if (v >= 1e12) return `${(v/1e12).toFixed(1)}T`;
    if (v >= 1e9) return `${(v/1e9).toFixed(1)}B`;
    if (v >= 1e6) return `${(v/1e6).toFixed(1)}M`;
    return v?.toLocaleString('id-ID') || '0';
  };

  const handleApply = () => {
    const params = new URLSearchParams();
    params.set('mode', mode);
    params.set('context', priceContext);
    params.set('start', startDate);
    params.set('end', endDate);
    router.push(`/screener?${params.toString()}`);
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🎯 Screener Pro V3
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Whale & Float Absorption Radar • {totalCount} saham ditemukan
          </p>
        </div>

        {/* Filter Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4">
          {/* Row 1: Mode & Price Context */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                🎯 Target Deteksi
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setMode('whale')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    mode === 'whale' 
                      ? 'bg-green-600 text-white shadow-lg shadow-green-200' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  🐋 Whale Accumulation
                </button>
                <button
                  onClick={() => setMode('retail')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    mode === 'retail' 
                      ? 'bg-red-600 text-white shadow-lg shadow-red-200' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  🩸 Retail Panic
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                📉 Fase Harga (Price Context)
              </label>
              <select
                value={priceContext}
                onChange={(e) => setPriceContext(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="all">🔍 Semua Fase</option>
                <option value="hidden_gem">💎 Hidden Gem (Sideways -2% s/d +2%)</option>
                <option value="bottom_fishing">⚓ Bottom Fishing (Turun / Below VWMA)</option>
                <option value="early_move">🚀 Early Move (Naik 0% s/d +4%)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">📅 Dari Tanggal</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">📅 Sampai Tanggal</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {/* Row 3: Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Min Avg Value/Hari
              </label>
              <select
                value={minValue}
                onChange={(e) => setMinValue(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value={0.5}>Rp 500M</option>
                <option value={1}>Rp 1M</option>
                <option value={5}>Rp 5M</option>
                <option value={10}>Rp 10M</option>
                <option value={50}>Rp 50M</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Min Serapan Float (%)
              </label>
              <select
                value={minTurnover}
                onChange={(e) => setMinTurnover(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value={0.1}>0.1%</option>
                <option value={0.5}>0.5%</option>
                <option value={1}>1%</option>
                <option value={2}>2%</option>
                <option value={5}>5%</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                Min Sinyal
              </label>
              <select
                value={minSignals}
                onChange={(e) => setMinSignals(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value={1}>1 Kali</option>
                <option value={2}>2 Kali</option>
                <option value={3}>3 Kali</option>
                <option value={5}>5 Kali</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleApply}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔍 Terapkan Filter
              </button>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left dark:text-gray-200">Kode</th>
                  <th className="px-3 py-2 text-right dark:text-gray-200">Harga</th>
                  <th className="px-3 py-2 text-right dark:text-gray-200">Chg %</th>
                  <th className="px-3 py-2 text-right dark:text-gray-200">Avg Value</th>
                  <th className="px-3 py-2 text-right dark:text-gray-200">% Serap Float</th>
                  <th className="px-3 py-2 text-center dark:text-gray-200">
                    {mode === 'whale' ? '🐋 Spikes' : '🩸 Drops'}
                  </th>
                  <th className="px-3 py-2 text-center dark:text-gray-200">AOV</th>
                  <th className="px-3 py-2 text-right dark:text-gray-200">Foreign</th>
                  <th className="px-3 py-2 text-center dark:text-gray-200">Score</th>
                </tr>
              </thead>
              <tbody>
                {initialStocks.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-3 py-8 text-center text-gray-500">
                      Tidak ada saham yang sesuai filter
                    </td>
                  </tr>
                ) : (
                  initialStocks.map((stock, idx) => (
                    <tr key={stock.stock_code} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                      <td className="px-3 py-2">
                        <Link href={`/emiten/${stock.stock_code}`} className="text-blue-600 hover:underline font-medium">
                          {stock.stock_code}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-right font-mono dark:text-gray-300">
                        {formatCurrency(stock.last_close)}
                      </td>
                      <td className={`px-3 py-2 text-right font-medium ${
                        stock.last_change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stock.last_change >= 0 ? '+' : ''}{stock.last_change?.toFixed(2)}%
                      </td>
                      <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-400">
                        {formatVolume(stock.avg_daily_value)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <div className="w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${Math.min(stock.turnover_float_pct * 10, 100)}%` }}
                            />
                          </div>
                          <span className="text-blue-600 font-medium">{stock.turnover_float_pct?.toFixed(2)}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          mode === 'whale' 
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        }`}>
                          {mode === 'whale' ? stock.whale_spikes : stock.retail_drops}×
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center font-mono dark:text-gray-300">
                        {stock.max_aov_ratio?.toFixed(1)}x
                      </td>
                      <td className={`px-3 py-2 text-right font-medium ${
                        stock.total_foreign >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatVolume(stock.total_foreign)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          stock.conviction_score >= 20 
                            ? mode === 'whale' 
                              ? 'bg-green-500 text-white' 
                              : 'bg-red-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600'
                        }`}>
                          {stock.conviction_score?.toFixed(0)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
