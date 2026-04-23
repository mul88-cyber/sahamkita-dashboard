// =============================================
// app/emiten/[kode]/page.tsx
// VERSI FIX - Sesuai struktur database Bapak
// =============================================
import { supabase } from '@/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import StockChart from '@/components/StockChart';

export const revalidate = 3600;

// Helper function untuk konversi string ke number
function toNumber(value: any): number {
  if (typeof value === 'string') {
    return parseFloat(value) || 0;
  }
  return Number(value) || 0;
}

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
    };
  }

  const changeValue = parseFloat(data.change_percent) || 0;
  const changeEmoji = changeValue > 0 ? '📈' : changeValue < 0 ? '📉' : '➡️';
  
  return {
    title: `${data.stock_code} ${changeEmoji} ${changeValue > 0 ? '+' : ''}${changeValue}% | SahamKita`,
    description: `Analisis saham ${data.stock_code} sektor ${data.sector || 'Lainnya'}.`,
  };
}

export default async function EmitenDetail({ 
  params 
}: { 
  params: { kode: string } 
}) {
  const stockCode = params.kode.toUpperCase();
  
  try {
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
    
    // Konversi data untuk chart (pastikan number)
    const chartData = historyData.map(item => ({
      trading_date: item.trading_date,
      close: toNumber(item.close),
      volume: toNumber(item.volume),
      change_percent: parseFloat(item.change_percent) || 0,
      net_foreign_flow: toNumber(item.net_foreign_flow),
    })).reverse();

    // Hitung statistik 30 hari
    const numericCloses = historyData.map(d => toNumber(d.close));
    const stats = {
      highest: Math.max(...numericCloses),
      lowest: Math.min(...numericCloses),
      avgVolume: historyData.reduce((sum, d) => sum + toNumber(d.volume), 0) / historyData.length,
      totalForeignFlow: historyData.reduce((sum, d) => sum + toNumber(d.net_foreign_flow), 0),
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

    const closeValue = toNumber(latestData.close);
    const changeValue = parseFloat(latestData.change_percent) || 0;
    const volumeValue = toNumber(latestData.volume);
    const foreignFlowValue = toNumber(latestData.net_foreign_flow);

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
            
            <div className="flex flex-wrap items-center justify-between gap-4">
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
                  {formatCurrency(closeValue)}
                </div>
                <div className={`text-lg font-medium ${
                  changeValue > 0 ? 'text-green-600' : 
                  changeValue < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {changeValue > 0 ? '▲' : changeValue < 0 ? '▼' : '●'} 
                  {' '}{changeValue > 0 ? '+' : ''}{changeValue}%
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
              <p className="text-xl font-semibold">{formatVolume(volumeValue)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500 mb-1">Foreign Flow</p>
              <p className={`text-xl font-semibold ${
                foreignFlowValue >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatForeignFlow(foreignFlowValue)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500 mb-1">Foreign Buy</p>
              <p className="text-xl font-semibold text-green-600">
                {formatVolume(toNumber(latestData.foreign_buy))}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500 mb-1">Foreign Sell</p>
              <p className="text-xl font-semibold text-red-600">
                {formatVolume(toNumber(latestData.foreign_sell))}
              </p>
            </div>
          </div>

          {/* Range 30 Hari */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500 mb-1">Highest (30 Hari)</p>
              <p className="text-xl font-semibold">{formatCurrency(stats.highest)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500 mb-1">Lowest (30 Hari)</p>
              <p className="text-xl font-semibold">{formatCurrency(stats.lowest)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500 mb-1">Avg Volume (30 Hari)</p>
              <p className="text-xl font-semibold">{formatVolume(stats.avgVolume)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500 mb-1">Total Foreign (30 Hari)</p>
              <p className={`text-xl font-semibold ${
                stats.totalForeignFlow >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatForeignFlow(stats.totalForeignFlow)}
              </p>
            </div>
          </div>

          {/* Sinyal Card */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Sinyal Trading</p>
                <p className={`text-2xl font-bold ${
                  latestData.final_signal?.toLowerCase().includes('buy') ? 'text-green-600' :
                  latestData.final_signal?.toLowerCase().includes('sell') ? 'text-red-600' :
                  latestData.final_signal?.toLowerCase().includes('distribusi') ? 'text-orange-600' :
                  'text-gray-600'
                }`}>
                  {latestData.final_signal || 'NEUTRAL'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Signal Detail</p>
                <p className="text-lg text-gray-700">{latestData.signal || '-'}</p>
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
                    <th className="px-4 py-3 text-right">Foreign Buy</th>
                    <th className="px-4 py-3 text-right">Foreign Sell</th>
                    <th className="px-4 py-3 text-right">Net Foreign</th>
                    <th className="px-4 py-3 text-center">Sinyal</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.map((row, index) => {
                    const rowClose = toNumber(row.close);
                    const rowChange = parseFloat(row.change_percent) || 0;
                    const rowForeignBuy = toNumber(row.foreign_buy);
                    const rowForeignSell = toNumber(row.foreign_sell);
                    const rowNetForeign = toNumber(row.net_foreign_flow);
                    
                    return (
                      <tr key={row.trading_date || index} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {row.trading_date ? new Date(row.trading_date).toLocaleDateString('id-ID', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          }) : '-'}
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          {formatCurrency(rowClose)}
                        </td>
                        <td className={`px-4 py-3 text-right font-medium ${
                          rowChange > 0 ? 'text-green-600' : 
                          rowChange < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {rowChange > 0 ? '+' : ''}{rowChange}%
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatVolume(toNumber(row.volume))}
                        </td>
                        <td className="px-4 py-3 text-right text-green-600">
                          {formatVolume(rowForeignBuy)}
                        </td>
                        <td className="px-4 py-3 text-right text-red-600">
                          {formatVolume(rowForeignSell)}
                        </td>
                        <td className={`px-4 py-3 text-right font-medium ${
                          rowNetForeign >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatForeignFlow(rowNetForeign)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            row.final_signal?.toLowerCase().includes('buy') ? 'bg-green-100 text-green-800' :
                            row.final_signal?.toLowerCase().includes('sell') ? 'bg-red-100 text-red-800' :
                            row.final_signal?.toLowerCase().includes('distribusi') ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {row.final_signal || 'NEUTRAL'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
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
    
  } catch (error) {
    console.error('Error di halaman detail:', error);
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Gagal Memuat Data
          </h2>
          <p className="text-gray-600 mb-6">
            Saham "{stockCode}" tidak dapat dimuat. Silakan coba lagi.
          </p>
          <div className="space-x-4">
            <Link
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
