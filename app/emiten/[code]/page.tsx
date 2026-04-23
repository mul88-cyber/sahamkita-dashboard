// =============================================
// app/emiten/[code]/page.tsx
// VERSI FINAL - Full Feature dengan Whale Detection
// =============================================
import { supabase } from '@/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import CandlestickChart from '@/components/CandlestickChart';

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
  
  // Helper function untuk konversi aman
  const toNumber = (val: any): number => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'string') return parseFloat(val) || 0;
    return Number(val) || 0;
  };
  
  // Data untuk chart
  const chartData = [...historyData].reverse().map(item => ({
    time: item.trading_date,  // Format: YYYY-MM-DD
    open: toNumber(item.open_price) || toNumber(item.close) * 0.99, // Fallback
    high: toNumber(item.high) || toNumber(item.close) * 1.01,
    low: toNumber(item.low) || toNumber(item.close) * 0.98,
    close: toNumber(item.close),
    volume: toNumber(item.volume),
  }));

  // Hitung statistik 30 hari
  const closes = historyData.map(d => toNumber(d.close));
  const stats = {
    highest: Math.max(...closes),
    lowest: Math.min(...closes),
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

  const getSignalColor = (signal: string) => {
    const lower = signal?.toLowerCase() || '';
    if (lower.includes('akumulasi')) return 'text-green-600';
    if (lower.includes('distribusi')) return 'text-red-600';
    return 'text-gray-600';
  };

  const getSignalBg = (signal: string) => {
    const lower = signal?.toLowerCase() || '';
    if (lower.includes('strong akumulasi')) return 'bg-green-200 text-green-800';
    if (lower.includes('akumulasi')) return 'bg-green-100 text-green-700';
    if (lower.includes('strong distribusi')) return 'bg-red-200 text-red-800';
    if (lower.includes('distribusi')) return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-800';
  };

  // Whale Detection Metrics
  const closeValue = toNumber(latestData.close);
  const changeValue = toNumber(latestData.change_percent);
  const volumeValue = toNumber(latestData.volume);
  const foreignFlowValue = toNumber(latestData.net_foreign_flow);
  const foreignBuyValue = toNumber(latestData.foreign_buy);
  const foreignSellValue = toNumber(latestData.foreign_sell);
  const aovRatio = toNumber(latestData.aov_ratio) || 
    (toNumber(latestData.ma50_avg_order_volume) > 0 
      ? toNumber(latestData.avg_order_volume) / toNumber(latestData.ma50_avg_order_volume) 
      : 1.0);
  const isWhale = latestData.whale_signal || aovRatio >= 1.5;
  const isSplit = latestData.split_signal || (aovRatio <= 0.6 && aovRatio > 0);
  const convictionScore = toNumber(latestData.conviction_score) || 
    (isWhale ? Math.min(99, ((aovRatio - 1.5) / 3.5) * 80 + 20) :
     isSplit ? Math.min(99, ((0.6 - aovRatio) / 0.6) * 80 + 20) : 50);
  const freeFloat = toNumber(latestData.free_float);

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
                {isWhale && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                    🐋 Whale Detected
                  </span>
                )}
                {isSplit && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                    ⚡ Split/Retail
                  </span>
                )}
              </div>
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
                {' '}({toNumber(latestData.change_amount) > 0 ? '+' : ''}{toNumber(latestData.change_amount)})
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* ============================================ */}
        {/* STATISTIK CARDS - 6 KOLOM                     */}
        {/* ============================================ */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Volume */}
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 mb-1">📊 Volume</p>
            <p className="text-xl font-semibold">{formatVolume(volumeValue)}</p>
            {toNumber(latestData.volume_spike) > 2 && (
              <p className="text-xs text-orange-600 mt-1">
                🔥 Spike {toNumber(latestData.volume_spike).toFixed(1)}x
              </p>
            )}
          </div>
          
          {/* Foreign Flow */}
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 mb-1">💱 Foreign Flow</p>
            <p className={`text-xl font-semibold ${
              foreignFlowValue >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatForeignFlow(foreignFlowValue)}
            </p>
          </div>
          
          {/* Foreign Buy */}
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 mb-1">🟢 Foreign Buy</p>
            <p className="text-xl font-semibold text-green-600">
              {formatVolume(foreignBuyValue)}
            </p>
          </div>
          
          {/* Foreign Sell */}
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 mb-1">🔴 Foreign Sell</p>
            <p className="text-xl font-semibold text-red-600">
              {formatVolume(foreignSellValue)}
            </p>
          </div>

          {/* 🆕 AOV RATIO & WHALE DETECTION CARD */}
          <div className={`rounded-lg shadow p-4 border-l-4 ${
            isWhale ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-500' : 
            isSplit ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-500' : 
            'bg-white border-gray-300'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{isWhale ? '🐋' : isSplit ? '⚡' : '📊'}</span>
              <p className="text-sm text-gray-600">AOV Ratio</p>
            </div>
            <p className={`text-xl font-semibold ${
              isWhale ? 'text-green-700' : isSplit ? 'text-red-700' : 'text-gray-700'
            }`}>
              {aovRatio.toFixed(2)}x
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {isWhale ? '🐋 Whale Detected' : isSplit ? '⚡ Split/Retail' : 'Normal Activity'}
            </p>
          </div>

          {/* 🆕 CONVICTION SCORE CARD */}
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 mb-1">🎯 Conviction</p>
            <p className="text-xl font-semibold">
              {convictionScore.toFixed(0)}%
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full ${
                  isWhale ? 'bg-green-500' : isSplit ? 'bg-red-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(convictionScore, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* RANGE 30 HARI & INFO TAMBAHAN                */}
        {/* ============================================ */}
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

        {/* ============================================ */}
        {/* SINYAL CARD + WHALE DETAILS                  */}
        {/* ============================================ */}
        <div className="bg-white rounded-lg shadow p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kiri: Sinyal Trading */}
            <div>
              <p className="text-sm text-gray-500 mb-1">🎯 Sinyal Trading</p>
              <p className={`text-2xl font-bold ${getSignalColor(latestData.final_signal)}`}>
                {latestData.final_signal || 'NEUTRAL'}
              </p>
              <p className="text-sm text-gray-500 mt-2">Detail: {latestData.signal || '-'}</p>
            </div>
            
            {/* Kanan: Whale Metrics Detail */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Avg Order Volume</p>
                <p className="text-lg font-semibold">
                  {formatVolume(toNumber(latestData.avg_order_volume))}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">MA50 AOVol</p>
                <p className="text-lg font-semibold">
                  {formatVolume(toNumber(latestData.ma50_avg_order_volume))}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Free Float</p>
                <p className="text-lg font-semibold">
                  {freeFloat > 0 ? `${freeFloat.toFixed(1)}%` : '-'}
                </p>
                {freeFloat > 0 && (
                  <p className="text-xs text-gray-500">
                    {freeFloat < 10 ? '⚠️ Kering' : freeFloat > 40 ? '💧 Liquid' : 'Normal'}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Bid/Offer Imbalance</p>
                <p className={`text-lg font-semibold ${
                  toNumber(latestData.bid_offer_imbalance) > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {toNumber(latestData.bid_offer_imbalance).toFixed(4)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Technical Indicators */}
          <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">VWMA 20D</p>
              <p className="font-medium">{formatCurrency(toNumber(latestData.vwma_20d))}</p>
            </div>
            <div>
              <p className="text-gray-500">Value Transaksi</p>
              <p className="font-medium">{formatVolume(toNumber(latestData.value))}</p>
            </div>
            <div>
              <p className="text-gray-500">Frequency</p>
              <p className="font-medium">{toNumber(latestData.frequency).toLocaleString('id-ID')}x</p>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* CHART                                         */}
        {/* ============================================ */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">
            📊 Pergerakan Harga & Volume (30 Hari Terakhir)
          </h2>
          <CandlestickChart data={chartData} height={500} showVolume={true} />
        </div>

        {/* ============================================ */}
        {/* HISTORICAL TABLE                             */}
        {/* ============================================ */}
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
                  <th className="px-4 py-3 text-center">🐋 AOV</th>
                  <th className="px-4 py-3 text-center">Sinyal</th>
                </tr>
              </thead>
              <tbody>
                {historyData.map((row, index) => {
                  const rowClose = toNumber(row.close);
                  const rowChange = toNumber(row.change_percent);
                  const rowForeignBuy = toNumber(row.foreign_buy);
                  const rowForeignSell = toNumber(row.foreign_sell);
                  const rowNetForeign = toNumber(row.net_foreign_flow);
                  const rowAovRatio = toNumber(row.aov_ratio) || 
                    (toNumber(row.ma50_avg_order_volume) > 0 
                      ? toNumber(row.avg_order_volume) / toNumber(row.ma50_avg_order_volume) 
                      : 1.0);
                  const rowIsWhale = row.whale_signal || rowAovRatio >= 1.5;
                  const rowIsSplit = row.split_signal || (rowAovRatio <= 0.6 && rowAovRatio > 0);
                  
                  return (
                    <tr key={row.trading_date || index} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {row.trading_date ? new Date(row.trading_date).toLocaleDateString('id-ID', {
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
                        {rowChange > 0 ? '+' : ''}{rowChange.toFixed(2)}%
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
                        <div className="flex items-center justify-center gap-1">
                          {rowIsWhale && <span className="text-green-600" title="Whale">🐋</span>}
                          {rowIsSplit && <span className="text-red-600" title="Split">⚡</span>}
                          <span className={rowIsWhale ? 'text-green-700 font-medium' : rowIsSplit ? 'text-red-700 font-medium' : ''}>
                            {rowAovRatio.toFixed(2)}x
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSignalBg(row.final_signal)}`}>
                          {row.final_signal || '-'}
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
            className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            ← Kembali ke Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
