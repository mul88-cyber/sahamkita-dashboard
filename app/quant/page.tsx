// =============================================
// app/quant/page.tsx
// Quant Dashboard - Pusat Analisis Statistik
// =============================================
import { supabase } from '@/supabase';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function QuantDashboardPage() {
  // Fetch Market Breadth Latest
  const { data: breadthResult } = await supabase.rpc('get_market_breadth', { p_days: 1 });
  const latestBreadth = (breadthResult as any)?.breadth?.[0] || null;

  // Fetch Whale Stats
  const { data: latestDate } = await supabase
    .from('daily_transactions')
    .select('trading_date')
    .order('trading_date', { ascending: false })
    .limit(1);
  
  const date = latestDate?.[0]?.trading_date || '';

  // Count Whale & Split
  const { count: whaleCount } = await supabase
    .from('daily_transactions')
    .select('*', { count: 'exact', head: true })
    .eq('trading_date', date)
    .eq('whale_signal', true);

  const { count: splitCount } = await supabase
    .from('daily_transactions')
    .select('*', { count: 'exact', head: true })
    .eq('trading_date', date)
    .eq('split_signal', true);

  // Avg metrics
  const { data: avgMetrics } = await supabase
    .from('daily_transactions')
    .select('close, change_percent, volume, aov_ratio')
    .eq('trading_date', date);

  const avgChange = avgMetrics?.length 
    ? (avgMetrics.reduce((sum: number, s: any) => sum + (s.change_percent || 0), 0) / avgMetrics.length).toFixed(2)
    : '0';

  const totalVolume = avgMetrics?.length
    ? avgMetrics.reduce((sum: number, s: any) => sum + (s.volume || 0), 0)
    : 0;

  const avgAOV = avgMetrics?.length
    ? (avgMetrics.reduce((sum: number, s: any) => sum + (s.aov_ratio || 1), 0) / avgMetrics.length).toFixed(2)
    : '1.00';

  // Top Z-Score stocks
  const { data: topVolumeStocks } = await supabase
    .from('daily_transactions')
    .select('stock_code, close, change_percent, volume, ma20_volume, volume_spike, whale_signal, sector')
    .eq('trading_date', date)
    .order('volume_spike', { ascending: false })
    .limit(10);

  const formatVolume = (v: number) => {
    if (v >= 1e12) return `${(v/1e12).toFixed(2)}T`;
    if (v >= 1e9) return `${(v/1e9).toFixed(2)}B`;
    if (v >= 1e6) return `${(v/1e6).toFixed(2)}M`;
    return v?.toLocaleString('id-ID') || '0';
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🧪 Quant Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Pusat Analisis Statistik & Anomali Pasar
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Data: {new Date(date).toLocaleDateString('id-ID')}
          </p>
        </div>

        {/* Market Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">📊 Total Saham</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgMetrics?.length || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">📈 Avg Change</p>
            <p className={`text-2xl font-bold ${Number(avgChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Number(avgChange) >= 0 ? '+' : ''}{avgChange}%
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">🐋 Whale Today</p>
            <p className="text-2xl font-bold text-green-600">{whaleCount || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">⚡ Split Today</p>
            <p className="text-2xl font-bold text-red-600">{splitCount || 0}</p>
          </div>
        </div>

        {/* Market Breadth Quick View */}
        {latestBreadth && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">📈 Market Breadth</h3>
              <Link href="/market-breadth" className="text-sm text-blue-600 hover:underline">Detail →</Link>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">📈 Advancers</p>
                <p className="text-2xl font-bold text-green-600">{latestBreadth.advancers}</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">📉 Decliners</p>
                <p className="text-2xl font-bold text-red-600">{latestBreadth.decliners}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">➖ Unchanged</p>
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{latestBreadth.unchanged}</p>
              </div>
            </div>
            <div className="mt-3 text-center text-sm">
              <span className={latestBreadth.advancers - latestBreadth.decliners >= 0 ? 'text-green-600' : 'text-red-600'}>
                A/D Ratio: {latestBreadth.advancers - latestBreadth.decliners >= 0 ? '+' : ''}{latestBreadth.advancers - latestBreadth.decliners}
              </span>
            </div>
          </div>
        )}

        {/* Top Volume Z-Score Stocks */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 border-b dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">🔥 Top Volume Z-Score (Anomali Volume)</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Saham dengan volume spike tertinggi hari ini</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left dark:text-gray-200">Kode</th>
                  <th className="px-4 py-3 text-right dark:text-gray-200">Close</th>
                  <th className="px-4 py-3 text-right dark:text-gray-200">Chg %</th>
                  <th className="px-4 py-3 text-right dark:text-gray-200">Volume</th>
                  <th className="px-4 py-3 text-right dark:text-gray-200">MA20 Vol</th>
                  <th className="px-4 py-3 text-center dark:text-gray-200">Spike</th>
                  <th className="px-4 py-3 text-center dark:text-gray-200">🐋</th>
                  <th className="px-4 py-3 text-left dark:text-gray-200">Sektor</th>
                </tr>
              </thead>
              <tbody>
                {(topVolumeStocks || []).map((stock: any, idx: number) => (
                  <tr key={idx} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-4 py-3">
                      <Link href={`/emiten/${stock.stock_code}`} className="text-blue-600 hover:underline font-medium">
                        {stock.stock_code}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right font-mono dark:text-gray-300">
                      {stock.close?.toLocaleString('id-ID')}
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${stock.change_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stock.change_percent >= 0 ? '+' : ''}{stock.change_percent?.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                      {formatVolume(stock.volume)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400">
                      {formatVolume(stock.ma20_volume)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        (stock.volume_spike || 0) > 5 ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                        (stock.volume_spike || 0) > 2 ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                        'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      }`}>
                        {(stock.volume_spike || 1).toFixed(1)}x
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {stock.whale_signal ? '🐋' : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                      {stock.sector || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/market-breadth" className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
            <p className="text-2xl mb-2">📈</p>
            <p className="font-semibold text-gray-900 dark:text-white">Market Breadth</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Advance/Decline Line</p>
          </Link>
          <Link href="/top-whale" className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
            <p className="text-2xl mb-2">🐋</p>
            <p className="font-semibold text-gray-900 dark:text-white">Top Whale</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Whale Signals Hari Ini</p>
          </Link>
          <Link href="/whale-tracker" className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
            <p className="text-2xl mb-2">🔭</p>
            <p className="font-semibold text-gray-900 dark:text-white">Whale Tracker</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Multi-day Accumulation</p>
          </Link>
          <Link href="/heatmap" className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
            <p className="text-2xl mb-2">🗺️</p>
            <p className="font-semibold text-gray-900 dark:text-white">Sector Heatmap</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Performa per Sektor</p>
          </Link>
        </div>

        <div className="text-center">
          <Link href="/" className="inline-flex items-center px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg">
            ← Kembali ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
