// =============================================
// app/emiten/[code]/page.tsx
// VERSI FINAL - Full Feature dengan Chart & Styling
// =============================================
import { supabase } from '@/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import StockChart from '@/components/StockChart';

export const revalidate = 3600;

// Dynamic Metadata untuk SEO
export async function generateMetadata(
  { params }: { params: { code: string } }
): Promise<Metadata> {
  const stockCode = params.code.toUpperCase();
  
  const { data } = await supabase
    .from('daily_transactions')
    .select('stock_code, close, change_percent, sector')
    .eq('stock_code', stockCode)
    .order('trading_date', { ascending: false })
    .limit(1)
    .single();

  if (!data) {
    return {
      title: 'Emiten Tidak Ditemukan | SahamKita',
    };
  }

  const changeEmoji = data.change_percent > 0 ? '📈' : data.change_percent < 0 ? '📉' : '➡️';
  
  return {
    title: `${data.stock_code} ${changeEmoji} ${data.change_percent > 0 ? '+' : ''}${data.change_percent}% | SahamKita`,
    description: `Analisis saham ${data.stock_code} sektor ${data.sector || 'Lainnya'}.`,
  };
}

export default async function EmitenDetail({ 
  params 
}: { 
  params: { code: string } 
}) {
  const stockCode = params.code.toUpperCase();
  
  // Fetch data historis 30 hari
  const { data: historyData, error } = await supabase
    .from('daily_transactions')
    .select('*')
    .eq('stock_code', stockCode)
    .order('trading_date', { ascending: false })
    .limit(30);

  if (error) {
    console.error('Query error:', error);
    throw error;
  }

  if (!historyData || historyData.length === 0) {
    notFound();
  }

  const latestData = historyData[0];
  
  // Data untuk chart (sudah dalam format number semua)
  const chartData = [...historyData].reverse().map(item => ({
    trading_date: item.trading_date,
    close: item.close,
    volume: item.volume,
  }));

  // Hitung statistik 30 hari
  const closes = historyData.map(d => d.close);
  const stats = {
    highest: Math.max(...closes),
    lowest: Math.min(...closes),
    avgVolume: historyData.reduce((sum, d) => sum + d.volume, 0) / historyData.length,
    totalForeignFlow: historyData.reduce((sum, d) => sum + d.net_foreign_flow, 0),
  };

  // Format helpers
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
    return volume.toLocaleString('id-ID');
  };

  const formatForeignFlow = (flow: number) => {
    const absFlow = Math.abs(flow);
    const sign = flow >= 0 ? '+' : '-';
    if (absFlow >= 1_000_000_000) return `${sign}${(absFlow / 1_000_000_000).toFixed(2)}B`;
    if (absFlow >= 1_000_000) return `${sign}${(absFlow / 1_000_000).toFixed(2)}M`;
    return `${sign}${absFlow.toLocaleString('id-ID')}`;
  };

  const getSignalColor = (signal: string) => {
    const lower = signal?.toLowerCase() || '';
    if (lower.includes('akumulasi')) return 'text-blue-600';
    if (lower.includes('distribusi')) return 'text-orange-600';
    if (lower.includes('buy')) return 'text-green-600';
    if (lower.includes('sell')) return 'text-red-600';
    return 'text-gray-600';
  };

  const getSignalBg = (signal: string) => {
    const lower = signal?.toLowerCase() || '';
    if (lower.includes('akumulasi')) return 'bg-blue-100 text-blue-800';
    if (lower.includes('distribusi')) return 'bg-orange-100 text-orange-800';
    if (lower.includes('buy')) return 'bg-green-100 text-green-800';
    if (lower.includes('sell')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="text-sm text-gray-500 mb-2">
            <Link href="/" className="hover:text-blue-600">Dashboard</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">{stockCode}</span>
          </nav>
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {stockCode}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-gray-500">
                  {latestData.sector || 'Sektor tidak tersedia'}
                </p>
                {latestData.big_player_anomaly && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">
                    ⚡ Anomali Big Player
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {formatCurrency(latestData.close)}
              </div>
              <div className={`text-lg font-medium ${
                latestData.change_percent > 0 ? 'text-green-600' : 
                latestData.change_percent < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {latestData.change_percent > 0 ? '▲' : latestData.change_percent < 0 ? '▼' : '●'} 
                {' '}{latestData.change_percent > 0 ? '+' : ''}{latestData.change_percent}%
                {' '}({latestData.change_amount > 0 ? '+' : ''}{latestData.change_amount})
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Statistik Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 mb-1">📊 Volume</p>
            <p className="text-xl font-semibold">{formatVolume(latestData.volume)}</p>
            {latestData.volume_spike > 2 && (
              <p className="text-xs text-orange-600 mt-1">
                🔥 Spike {latestData.volume_spike.toFixed(1)}x
              </p>
            )}
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 mb-1">💱 Foreign Flow</p>
            <p className={`text-xl font-semibold ${
              latestData.net_foreign_flow >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatForeignFlow(latestData.net_foreign_flow)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 mb-1">🟢 Foreign Buy</p>
            <p className="text-xl font-semibold text-green-600">
              {formatVolume(latestData.foreign_buy)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 mb-1">🔴 Foreign Sell</p>
            <p className="text-xl font-semibold text-red-600">
              {formatVolume(latestData.foreign_sell)}
            </p>
          </div>
        </div>

        {/* Range 30 Hari & Info Tambahan */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 mb-1">📈 Highest (30H)</p>
            <p className="text-xl font-semibold">{formatCurrency(stats.highest)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 mb-1">📉 Lowest (30H)</p>
            <p className="text-xl font-semibold">{formatCurrency(stats.lowest)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 mb-1">📅 Avg Volume (30H)</p>
            <p className="text-xl font-semibold">{formatVolume(stats.avgVolume)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 mb-1">🌊 Total Foreign (30H)</p>
            <p className={`text-xl font-semibold ${
              stats.totalForeignFlow >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatForeignFlow(stats.totalForeignFlow)}
            </p>
          </div>
        </div>

        {/* Sinyal Card */}
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">🎯 Sinyal Trading</p>
              <p className={`text-2xl font-bold ${getSignalColor(latestData.final_signal)}`}>
                {latestData.final_signal || 'NEUTRAL'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">📝 Detail Sinyal</p>
              <p className="text-lg text-gray-700">{latestData.signal || '-'}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Bid/Offer Imbalance</p>
              <p className="font-medium">{latestData.bid_offer_imbalance?.toFixed(4) || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">VWMA 20D</p>
              <p className="font-medium">{formatCurrency(latestData.vwma_20d || 0)}</p>
            </div>
            <div>
              <p className="text-gray-500">Avg Order Volume</p>
              <p className="font-medium">{formatVolume(latestData.avg_order_volume || 0)}</p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">
            📊 Pergerakan Harga & Volume (30 Hari Terakhir)
          </h2>
          <StockChart data={chartData} />
        </div>

        {/* Historical Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h3 className="font-semibold">📋 Data Historis</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Tanggal</th>
                  <th className="px-4 py-3 text-right">Close</th>
                  <th className="px-4 py-3 text-right">Chg %</th>
                  <th className="px-4 py-3 text-right">Volume</th>
                  <th className="px-4 py-3 text-right">F. Buy</th>
                  <th className="px-4 py-3 text-right">F. Sell</th>
                  <th className="px-4 py-3 text-right">Net F.</th>
                  <th className="px-4 py-3 text-center">Sinyal</th>
                </tr>
              </thead>
              <tbody>
                {historyData.map((row, index) => (
                  <tr key={row.trading_date || index} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {new Date(row.trading_date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {formatCurrency(row.close)}
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${
                      row.change_percent > 0 ? 'text-green-600' : 
                      row.change_percent < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {row.change_percent > 0 ? '+' : ''}{row.change_percent}%
                    </td>
                    <td className="px-4 py-3 text-right">
                      {formatVolume(row.volume)}
                    </td>
                    <td className="px-4 py-3 text-right text-green-600">
                      {formatVolume(row.foreign_buy)}
                    </td>
                    <td className="px-4 py-3 text-right text-red-600">
                      {formatVolume(row.foreign_sell)}
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${
                      row.net_foreign_flow >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatForeignFlow(row.net_foreign_flow)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSignalBg(row.final_signal)}`}>
                        {row.final_signal || '-'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            ← Kembali ke Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
