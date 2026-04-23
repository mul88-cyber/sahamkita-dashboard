// =============================================
// components/WatchlistClient.tsx
// Client component untuk Watchlist
// =============================================
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/supabase';
import { useRouter } from 'next/navigation';

interface WatchlistStock {
  stock_code: string;
  close: number;
  change_percent: number;
  volume: number;
  net_foreign_flow: number;
  big_player_anomaly: boolean;
  final_signal: string;
  sector: string;
  aov_ratio: number;
  whale_signal: boolean;
  split_signal: boolean;
  conviction_score: number;
  non_regular_value: number;
  transaction_value: number;
  tradeable_pct: number | null;
  added_at: string;
  notes: string;
}

interface WatchlistClientProps {
  initialStocks: WatchlistStock[];
  userEmail: string;
  lastDate: string;
}

export default function WatchlistClient({ initialStocks, userEmail, lastDate }: WatchlistClientProps) {
  const router = useRouter();
  const [stocks, setStocks] = useState<WatchlistStock[]>(initialStocks);
  const [searchCode, setSearchCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1_000_000_000) return `${(volume / 1_000_000_000).toFixed(2)}B`;
    if (volume >= 1_000_000) return `${(volume / 1_000_000).toFixed(2)}M`;
    if (volume >= 1_000) return `${(volume / 1_000).toFixed(2)}K`;
    return volume.toString();
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchCode.trim()) {
      setError('Masukkan kode saham');
      return;
    }

    const code = searchCode.toUpperCase().trim();
    
    // Cek apakah sudah ada di watchlist
    if (stocks.some(s => s.stock_code === code)) {
      setError(`${code} sudah ada di watchlist`);
      return;
    }

    setLoading(true);
    setError('');

    // Cek apakah saham ada di database
    const { data: stockExists } = await supabase
      .from('daily_transactions')
      .select('stock_code')
      .eq('stock_code', code)
      .limit(1);

    if (!stockExists || stockExists.length === 0) {
      setError(`Kode saham ${code} tidak ditemukan`);
      setLoading(false);
      return;
    }

    // Tambah ke watchlist
    const { error: insertError } = await supabase
      .from('watchlist')
      .insert({ stock_code: code });

    if (insertError) {
      setError(insertError.message);
    } else {
      setSearchCode('');
      router.refresh(); // Refresh halaman untuk update data
    }

    setLoading(false);
  };

  const handleRemoveStock = async (stockCode: string) => {
    if (!confirm(`Hapus ${stockCode} dari watchlist?`)) return;

    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('stock_code', stockCode);

    if (!error) {
      setStocks(stocks.filter(s => s.stock_code !== stockCode));
      router.refresh();
    }
  };

  const getSignalColor = (signal: string) => {
    const lower = signal?.toLowerCase() || '';
    if (lower.includes('akumulasi')) return 'bg-green-100 text-green-800';
    if (lower.includes('distribusi')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            ⭐ Watchlist Saya
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {userEmail} • Data per: {new Date(lastDate).toLocaleDateString('id-ID')}
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Add Stock Form */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-3">➕ Tambah Saham ke Watchlist</h2>
          <form onSubmit={handleAddStock} className="flex gap-2">
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Contoh: BBCA, TLKM, ASII"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Adding...' : 'Tambah'}
            </button>
          </form>
          {error && (
            <p className="text-red-600 text-sm mt-2">{error}</p>
          )}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Total Watchlist</p>
            <p className="text-2xl font-bold">{stocks.length} Saham</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Whale Signal</p>
            <p className="text-2xl font-bold text-green-600">
              {stocks.filter(s => s.whale_signal).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Avg Gain/Loss</p>
            <p className={`text-2xl font-bold ${
              stocks.reduce((sum, s) => sum + s.change_percent, 0) >= 0 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {(stocks.reduce((sum, s) => sum + (s.change_percent || 0), 0) / (stocks.length || 1)).toFixed(2)}%
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Crossing Nego</p>
            <p className="text-2xl font-bold text-purple-600">
              {stocks.filter(s => s.non_regular_value > s.transaction_value * 0.1).length}
            </p>
          </div>
        </div>

        {/* Watchlist Table */}
        {stocks.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">⭐</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Watchlist Kosong
            </h3>
            <p className="text-gray-600">
              Tambahkan saham favorit Anda menggunakan form di atas.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left">Kode</th>
                    <th className="px-4 py-3 text-right">Close</th>
                    <th className="px-4 py-3 text-right">Chg %</th>
                    <th className="px-4 py-3 text-right">Volume</th>
                    <th className="px-4 py-3 text-center">🐋 AOV</th>
                    <th className="px-4 py-3 text-center">Sinyal</th>
                    <th className="px-4 py-3 text-left">Sektor</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((stock) => (
                    <tr key={stock.stock_code} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link 
                            href={`/emiten/${stock.stock_code}`}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {stock.stock_code}
                          </Link>
                          {stock.whale_signal && (
                            <span className="text-green-600" title="Whale Signal">🐋</span>
                          )}
                          {stock.split_signal && (
                            <span className="text-red-600" title="Split Signal">⚡</span>
                          )}
                          {stock.non_regular_value > stock.transaction_value * 0.1 && (
                            <span className="text-purple-600" title="Crossing Nego">🏦</span>
                          )}
                          {stock.tradeable_pct && stock.tradeable_pct < 20 && (
                            <span className="text-yellow-600" title="Saham Ringan">💨</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {formatCurrency(stock.close)}
                      </td>
                      <td className={`px-4 py-3 text-right font-medium ${
                        stock.change_percent > 0 ? 'text-green-600' : 
                        stock.change_percent < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {stock.change_percent > 0 ? '+' : ''}{stock.change_percent.toFixed(2)}%
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatVolume(stock.volume)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-medium ${
                          stock.whale_signal ? 'text-green-700' : 
                          stock.split_signal ? 'text-red-700' : 'text-gray-600'
                        }`}>
                          {stock.aov_ratio?.toFixed(2)}x
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSignalColor(stock.final_signal)}`}>
                          {stock.final_signal || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {stock.sector || '-'}
                      </td>
                      <td className="px-4 py-3 text-center space-x-2">
                        <Link
                          href={`/emiten/${stock.stock_code}`}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Detail
                        </Link>
                        <button
                          onClick={() => handleRemoveStock(stock.stock_code)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
