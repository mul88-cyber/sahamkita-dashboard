// =============================================
// app/emiten/[kode]/page.tsx
// Halaman detail per saham
// =============================================
import { supabase } from '@/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import StockChart from '@/components/StockChart';
import type { Stock } from '@/types';

export const revalidate = 3600; // Cache 1 jam

// Dynamic Metadata untuk SEO
export async function generateMetadata(
  { params }: { params: { kode: string } }
): Promise<Metadata> {
  const stockCode = params.kode.toUpperCase();
  
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
      description: 'Data emiten tidak tersedia dalam database kami.'
    };
  }

  const changeEmoji = data.change_percent > 0 ? '📈' : data.change_percent < 0 ? '📉' : '➡️';
  
  return {
    title: `${data.stock_code} ${changeEmoji} ${data.change_percent > 0 ? '+' : ''}${data.change_percent}% | SahamKita`,
    description: `Analisis saham ${data.stock_code} sektor ${data.sector || 'Lainnya'}. Harga terakhir Rp ${data.close.toLocaleString('id-ID')}. Lihat pergerakan harga, volume, dan foreign flow.`,
    openGraph: {
      title: `${data.stock_code} - ${data.change_percent > 0 ? '+' : ''}${data.change_percent}% Hari Ini`,
      description: `Sektor: ${data.sector || 'Lainnya'} | Harga: Rp ${data.close.toLocaleString('id-ID')}`,
    }
  };
}

export default async function EmitenDetail({ 
  params 
}: { 
  params: { kode: string } 
}) {
  const stockCode = params.kode.toUpperCase();
  
  // Fetch data historis 30 hari
  const { data: historyData, error } = await supabase
    .from('daily_transactions')
    .select('*')
    .eq('stock_code', stockCode)
    .order('trading_date', { ascending: false })
    .limit(30);

  if (error) {
    console.error('Error fetching stock detail:', error);
    throw new Error('Gagal mengambil data emiten');
  }

  if (!historyData || historyData.length === 0) {
    notFound();
  }

  const latestData = historyData[0] as Stock;
  const chartData = [...historyData].reverse();

  // Hitung statistik 30 hari
  const stats = {
    highest: Math.max(...historyData.map(d => d.close)),
    lowest: Math.min(...historyData.map(d => d.close)),
    avgVolume: historyData.reduce((sum, d) => sum + d.volume, 0) / historyData.length,
    totalForeignFlow: historyData.reduce((sum, d) => sum + (d.net_foreign_flow || 0), 0),
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="text-sm text-gray-500 mb-2">
            <Link href="/" className="hover:text-blue-600">Dashboard</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">{stockCode}</span>
          </nav>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {stockCode}
              </h1>
              <p className="text-gray-500 mt-1">
                {latestData.sector || 'Sektor tidak tersedia'}
                {latestData.big_player_anomaly && (
                  <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                    ⚡ Anomali Big Player
                  </span>
                )}
              </p>
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
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Statistik Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 mb-1">Volume Hari Ini</p>
            <p className="text-xl font-semibold">{formatVolume(latestData.volume)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 mb-1">Foreign Flow</p>
            <p className={`text-xl font-semibold ${
              latestData.net_foreign_flow > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {latestData.net_foreign_flow > 0 ? '+' : ''}
              {formatVolume(Math.abs(latestData.net_foreign_flow))}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 mb-1">Highest (30 Hari)</p>
            <p className="text-xl font-semibold">{formatCurrency(stats.highest)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 mb-1">Lowest (30 Hari)</p>
            <p className="text-xl font-semibold">{formatCurrency(stats.lowest)}</p>
          </div>
        </div>

        {/* Sinyal Card */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Sinyal Trading</p>
              <p className={`text-2xl font-bold ${
                latestData.final_signal === 'BUY' ? 'text-green-600' :
                latestData.final_signal === 'SELL' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {latestData.final_signal || 'NEUTRAL'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Rata-rata Volume (30 Hari)</p>
              <p className="text-xl font-semibold">{formatVolume(stats.avgVolume)}</p>
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
                  <th className="px-4 py-3 text-right">Change %</th>
                  <th className="px-4 py-3 text-right">Volume</th>
                  <th className="px-4 py-3 text-right">Foreign Flow</th>
                  <th className="px-4 py-3 text-center">Sinyal</th>
                </tr>
              </thead>
              <tbody>
                {historyData.map((row) => (
                  <tr key={row.trading_date} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {new Date(row.trading_date).toLocaleDateString('id-ID', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {row.close.toLocaleString()}
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
                    <td className={`px-4 py-3 text-right ${
                      row.net_foreign_flow > 0 ? 'text-green-600' : 
                      row.net_foreign_flow < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {row.net_foreign_flow > 0 ? '+' : ''}
                      {formatVolume(Math.abs(row.net_foreign_flow || 0))}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        row.final_signal === 'BUY' ? 'bg-green-100 text-green-800' :
                        row.final_signal === 'SELL' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {row.final_signal || 'NEUTRAL'}
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
            className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            ← Kembali ke Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
