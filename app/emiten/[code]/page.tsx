// =============================================
// app/emiten/[code]/page.tsx
// VERSI FINAL - Full Feature dengan Semua Fitur Baru
// =============================================
import { supabase } from '@/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import CandlestickChart from '@/components/CandlestickChart';
import DeepDiveChart from '@/components/DeepDiveChart';
import AddToWatchlistButton from '@/components/AddToWatchlistButton';
import ShareButton from '@/components/ShareButton';
import { detectPatterns } from '@/lib/patterns';
import AccumulationScore from '@/components/AccumulationScore';

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

  const changeEmoji = (data.change_percent || 0) > 0 ? '📈' : (data.change_percent || 0) < 0 ? '📉' : '➡️';
  
  return {
    title: `${data.stock_code} ${changeEmoji} ${(data.change_percent || 0) > 0 ? '+' : ''}${data.change_percent || 0}% | SahamKita`,
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

  // 🆕 Fetch Foreign Streak
  const { data: streakData } = await supabase.rpc('get_foreign_streak', {
    p_stock_code: stockCode,
    p_days: 90
  });
  const foreignStreak = streakData as any;

  // 🆕 Fetch Whale Win-Rate
  const { data: winrateData } = await supabase.rpc('get_whale_winrate', {
    p_stock_code: stockCode,
    p_days: 90
  });
  const winrate = winrateData as any;

  const latestData = historyData[0];
  
  // Helper function untuk konversi aman
  const toNumber = (val: any): number => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'string') return parseFloat(val) || 0;
    return Number(val) || 0;
  };
  
  // Data untuk chart
  const chartData = [...historyData].reverse().map(item => ({
    time: item.trading_date ? String(item.trading_date).split('T')[0] : '',
    open: toNumber(item.open_price) || toNumber(item.close) * 0.99,
    high: toNumber(item.high) || toNumber(item.close) * 1.01,
    low: toNumber(item.low) || toNumber(item.close) * 0.98,
    close: toNumber(item.close),
    volume: toNumber(item.volume),
    typical_price: toNumber(item.typical_price) || (toNumber(item.high) + toNumber(item.low) + toNumber(item.close)) / 3,
    vwma_20d: toNumber(item.vwma_20d),
  }));

  // 🆕 Deteksi Pola Candlestick
  const patterns = detectPatterns(
    historyData.slice(0, 5).reverse().map((item: any) => ({
      open: toNumber(item.open_price) || toNumber(item.close),
      high: toNumber(item.high) || toNumber(item.close),
      low: toNumber(item.low) || toNumber(item.close),
      close: toNumber(item.close),
    }))
  );

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
    if (lower.includes('strong akumulasi')) return 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (lower.includes('akumulasi')) return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300';
    if (lower.includes('strong distribusi')) return 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (lower.includes('distribusi')) return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
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

  // 🆕 Turnover Ratio
  const turnoverRatio = (toNumber(latestData.volume) > 0 && toNumber(latestData.tradeable_shares) > 0)
    ? (toNumber(latestData.volume) / toNumber(latestData.tradeable_shares)) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 dark:text-white font-medium">{stockCode}</span>
          </nav>
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stockCode}
                </h1>
                <AddToWatchlistButton stockCode={stockCode} />
                <ShareButton stockCode={stockCode} title={`Cek analisis saham ${stockCode} di SahamKita!`} />
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <p className="text-gray-500 dark:text-gray-400">
                  {latestData.sector || 'Sektor tidak tersedia'}
                </p>
                
                <Link 
                  href={`/emiten/${stockCode}/ownership`}
                  className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                >
                  📊 Lihat Kepemilikan →
                </Link>
                
                {latestData.big_player_anomaly && (
                  <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs rounded-full font-medium">
                    ⚡ Anomali Big Player
                  </span>
                )}
                {isWhale && (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full font-medium">
                    🐋 Whale Detected
                  </span>
                )}
                {isSplit && (
                  <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs rounded-full font-medium">
                    ⚡ Split/Retail
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold dark:text-white">
                {formatCurrency(closeValue)}
              </div>
              <div className={`text-lg font-medium ${
                changeValue > 0 ? 'text-green-600 dark:text-green-400' : 
                changeValue < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">📊 Volume</p>
            <p className="text-xl font-semibold dark:text-white">{formatVolume(volumeValue)}</p>
            {toNumber(latestData.volume_spike) > 2 && (
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                🔥 Spike {toNumber(latestData.volume_spike).toFixed(1)}x
              </p>
            )}
          </div>
          
          {/* Foreign Flow */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">💱 Foreign Flow</p>
            <p className={`text-xl font-semibold ${
              foreignFlowValue >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {formatForeignFlow(foreignFlowValue)}
            </p>
          </div>
          
          {/* Foreign Buy */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">🟢 Foreign Buy</p>
            <p className="text-xl font-semibold text-green-600 dark:text-green-400">
              {formatVolume(foreignBuyValue)}
            </p>
          </div>
          
          {/* Foreign Sell */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">🔴 Foreign Sell</p>
            <p className="text-xl font-semibold text-red-600 dark:text-red-400">
              {formatVolume(foreignSellValue)}
            </p>
          </div>

          {/* AOV RATIO */}
          <div className={`rounded-lg shadow p-4 border-l-4 ${
            isWhale ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-500' : 
            isSplit ? 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 border-red-500' : 
            'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{isWhale ? '🐋' : isSplit ? '⚡' : '📊'}</span>
              <p className="text-sm text-gray-600 dark:text-gray-400">AOV Ratio</p>
            </div>
            <p className={`text-xl font-semibold ${
              isWhale ? 'text-green-700 dark:text-green-400' : isSplit ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'
            }`}>
              {aovRatio.toFixed(2)}x
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {isWhale ? '🐋 Whale Detected' : isSplit ? '⚡ Split/Retail' : 'Normal Activity'}
            </p>
          </div>

          {/* CONVICTION SCORE */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">🎯 Conviction</p>
            <p className="text-xl font-semibold dark:text-white">
              {convictionScore.toFixed(0)}%
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full ${
                  isWhale ? 'bg-green-500' : isSplit ? 'bg-red-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(convictionScore, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* 🆕 TURNOVER RATIO */}
        <div className={`rounded-lg shadow p-4 border-l-4 ${
          turnoverRatio > 10 ? 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 border-red-500' :
          turnoverRatio > 5 ? 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 border-yellow-500' :
          'bg-white dark:bg-gray-800 border-blue-500'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">💧 Turnover Ratio</p>
              <p className={`text-2xl font-bold mt-1 ${
                turnoverRatio > 10 ? 'text-red-700 dark:text-red-400' :
                turnoverRatio > 5 ? 'text-yellow-700 dark:text-yellow-400' :
                'text-gray-700 dark:text-gray-300'
              }`}>
                {turnoverRatio.toFixed(2)}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {turnoverRatio > 10 ? '🔥 Sangat Panas' :
                 turnoverRatio > 5 ? '🟡 Aktif' :
                 turnoverRatio > 1 ? '🔵 Normal' :
                 turnoverRatio > 0.1 ? '⚪ Sepi' : '💤 Tidur'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                dari {formatVolume(toNumber(latestData.tradeable_shares))} saham beredar
              </p>
            </div>
          </div>
        </div>
        
        {/* 📊 Z-SCORE VOLUME ANOMALY */}
        {(() => {
          const volumeSpike = toNumber(latestData.volume_spike);
          const ma20Vol = toNumber(latestData.ma20_volume);
          const currentVol = toNumber(latestData.volume);
          
          const estimatedStd = ma20Vol * 0.5;
          const zScore = estimatedStd > 0 ? (currentVol - ma20Vol) / estimatedStd : 0;
          
          return (
            <div className={`rounded-lg shadow p-4 border-l-4 ${
              zScore > 3 ? 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 border-red-500' :
              zScore > 2 ? 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 border-yellow-500' :
              'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">📊 Volume Z-Score</p>
                  <p className={`text-2xl font-bold mt-1 ${
                    zScore > 3 ? 'text-red-700 dark:text-red-400' :
                    zScore > 2 ? 'text-yellow-700 dark:text-yellow-400' :
                    'text-green-700 dark:text-green-400'
                  }`}>
                    {zScore > 0 ? '+' : ''}{zScore.toFixed(1)}σ
                  </p>
                </div>
                <div className="text-right text-xs">
                  <p className="text-gray-500 dark:text-gray-400">
                    Volume: {formatVolume(currentVol)}
                  </p>
                  <p className="text-gray-400 mt-1">
                    MA20: {formatVolume(ma20Vol)}
                  </p>
                  <p className="text-gray-400">
                    Spike: {volumeSpike.toFixed(1)}x
                  </p>
                </div>
              </div>
              <div className="mt-3 text-xs">
                <span className={`px-2 py-1 rounded-full font-medium ${
                  zScore > 3 ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                  zScore > 2 ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                  'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                }`}>
                  {zScore > 3 ? '🔥 Extreme Anomaly (+3σ)' :
                   zScore > 2 ? '⚠️ Significant (+2σ)' :
                   zScore > 1 ? '📈 Above Normal (+1σ)' :
                   zScore > -1 ? '✅ Normal Range' :
                   '📉 Below Normal'}
                </span>
              </div>
            </div>
          );
        })()}

        {/* ============================================ */}
        {/* RANGE 30 HARI                                  */}
        {/* ============================================ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">📈 Highest (30H)</p>
            <p className="text-xl font-semibold dark:text-white">{formatCurrency(stats.highest)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">📉 Lowest (30H)</p>
            <p className="text-xl font-semibold dark:text-white">{formatCurrency(stats.lowest)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">📅 Avg Volume (30H)</p>
            <p className="text-xl font-semibold dark:text-white">{formatVolume(stats.avgVolume)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">🌊 Total Foreign (30H)</p>
            <p className={`text-xl font-semibold ${
              stats.totalForeignFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {formatForeignFlow(stats.totalForeignFlow)}
            </p>
          </div>
        </div>

        {/* ============================================ */}
        {/* 🌊 FOREIGN FLOW STREAK                        */}
        {/* ============================================ */}
        {foreignStreak && foreignStreak.streak_days > 0 && (
          <div className={`rounded-lg shadow p-5 border-l-4 ${
            foreignStreak.streak_type === 'buy' 
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-500' 
              : 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 border-red-500'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {foreignStreak.streak_type === 'buy' ? '🔥 Foreign Buy Streak' : '🧊 Foreign Sell Streak'}
                </p>
                <p className={`text-3xl font-bold mt-1 ${
                  foreignStreak.streak_type === 'buy' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                }`}>
                  {foreignStreak.streak_days} Hari Berturut-turut
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {foreignStreak.streak_type === 'buy' 
                    ? 'Asing terus menerus membeli tanpa henti' 
                    : 'Asing terus menerus menjual tanpa henti'}
                </p>
              </div>
              <div className="text-right text-sm">
                <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <span>🟢 Buy Days:</span>
                    <span className="font-bold">{foreignStreak.total_buy_days}</span>
                  </div>
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mt-1">
                    <span>🔴 Sell Days:</span>
                    <span className="font-bold">{foreignStreak.total_sell_days}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    dalam {foreignStreak.period_days} hari terakhir
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* 🎯 WHALE SIGNAL WIN-RATE                       */}
        {/* ============================================ */}
        {winrate && winrate.total_signals > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                🎯 Whale Signal Accuracy
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {winrate.total_signals} sinyal dalam {winrate.period_days} hari
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">T+1</p>
                <p className={`text-2xl font-bold ${winrate.winrate_t1 >= 50 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {winrate.winrate_t1}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Win Rate</p>
                <p className={`text-sm font-medium ${winrate.avg_return_t1 >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {winrate.avg_return_t1 >= 0 ? '+' : ''}{winrate.avg_return_t1}% Avg Return
                </p>
              </div>
              
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">⭐ Recommended</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">T+3</p>
                <p className={`text-2xl font-bold ${winrate.winrate_t3 >= 50 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {winrate.winrate_t3}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Win Rate</p>
                <p className={`text-sm font-medium ${winrate.avg_return_t3 >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {winrate.avg_return_t3 >= 0 ? '+' : ''}{winrate.avg_return_t3}% Avg Return
                </p>
              </div>
              
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">T+5</p>
                <p className={`text-2xl font-bold ${winrate.winrate_t5 >= 50 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {winrate.winrate_t5}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Win Rate</p>
                <p className={`text-sm font-medium ${winrate.avg_return_t5 >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {winrate.avg_return_t5 >= 0 ? '+' : ''}{winrate.avg_return_t5}% Avg Return
                </p>
              </div>
            </div>
            
            {/* Badge */}
            <div className="text-center">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                winrate.winrate_t3 >= 60 
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                  : winrate.winrate_t3 >= 40 
                  ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' 
                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              }`}>
                {winrate.winrate_t3 >= 60 ? '🟢 High Accuracy - Sinyal Dapat Diandalkan' : 
                 winrate.winrate_t3 >= 40 ? '🟡 Moderate Accuracy - Perlu Konfirmasi' : 
                 '🔴 Low Accuracy - Sinyal Kurang Akurat'}
              </span>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* SINYAL CARD + WHALE DETAILS                  */}
        {/* ============================================ */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">🎯 Sinyal Trading</p>
              <p className={`text-2xl font-bold ${getSignalColor(latestData.final_signal)}`}>
                {latestData.final_signal || 'NEUTRAL'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Detail: {latestData.signal || '-'}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Avg Order Volume</p>
                <p className="text-lg font-semibold dark:text-white">
                  {formatVolume(toNumber(latestData.avg_order_volume))}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">MA50 AOVol</p>
                <p className="text-lg font-semibold dark:text-white">
                  {formatVolume(toNumber(latestData.ma50_avg_order_volume))}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Free Float</p>
                <p className="text-lg font-semibold dark:text-white">
                  {freeFloat > 0 ? `${freeFloat.toFixed(1)}%` : '-'}
                </p>
                {freeFloat > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {freeFloat < 10 ? '⚠️ Kering' : freeFloat > 40 ? '💧 Liquid' : 'Normal'}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Bid/Offer Imbalance</p>
                <p className={`text-lg font-semibold ${
                  toNumber(latestData.bid_offer_imbalance) > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {toNumber(latestData.bid_offer_imbalance).toFixed(4)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t dark:border-gray-700 grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">VWMA 20D</p>
              <p className="font-medium dark:text-white">{formatCurrency(toNumber(latestData.vwma_20d))}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Value Transaksi</p>
              <p className="font-medium dark:text-white">{formatVolume(toNumber(latestData.value))}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Frequency</p>
              <p className="font-medium dark:text-white">{toNumber(latestData.frequency).toLocaleString('id-ID')}x</p>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* ORDERBOOK IMBALANCE CARD                     */}
        {/* ============================================ */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📊 Orderbook Analysis</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">🟢 Bid Volume</p>
              <p className="text-xl font-bold text-green-700 dark:text-green-400">
                {formatVolume(toNumber(latestData.bid_volume))}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">🔴 Offer Volume</p>
              <p className="text-xl font-bold text-red-700 dark:text-red-400">
                {formatVolume(toNumber(latestData.offer_volume))}
              </p>
            </div>
          </div>
          
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-green-600 dark:text-green-400">🟢 Bid</span>
              <span className="text-gray-500 dark:text-gray-400">⚖️</span>
              <span className="text-red-600 dark:text-red-400">🔴 Offer</span>
            </div>
            <div className="w-full bg-gradient-to-r from-green-500 via-gray-300 to-red-500 h-4 rounded-full relative">
              <div 
                className="absolute top-0 w-1 h-6 bg-black dark:bg-white rounded-full -mt-1"
                style={{ 
                  left: `${((toNumber(latestData.bid_offer_imbalance) + 1) / 2) * 100}%`,
                  transform: 'translateX(-50%)'
                }}
              />
            </div>
          </div>
          
          {(() => {
            const imbalance = toNumber(latestData.bid_offer_imbalance);
            const priceChange = toNumber(latestData.change_percent);
            
            let interpretation = { signal: '', desc: '', color: '' };
            
            if (imbalance > 0.3 && priceChange < 0) {
              interpretation = { 
                signal: '🟢 Akumulasi Tersembunyi', 
                desc: 'Harga turun tapi bid tebal → Bandar serok di bawah',
                color: 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800'
              };
            } else if (imbalance < -0.3 && priceChange > 0) {
              interpretation = { 
                signal: '🔴 Distribusi Tersembunyi', 
                desc: 'Harga naik tapi offer tebal → Bandar jualan di atas',
                color: 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800'
              };
            } else if (imbalance > 0.5) {
              interpretation = { 
                signal: '🟢 Demand Kuat', 
                desc: 'Antrean beli sangat dominan',
                color: 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800'
              };
            } else if (imbalance < -0.5) {
              interpretation = { 
                signal: '🔴 Supply Kuat', 
                desc: 'Antrean jual sangat dominan',
                color: 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800'
              };
            } else {
              interpretation = { 
                signal: '⚖️ Seimbang', 
                desc: 'Supply-Demand relatif seimbang',
                color: 'text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
              };
            }
            
            return (
              <div className={`mt-4 p-3 rounded-lg border ${interpretation.color}`}>
                <p className="font-semibold">{interpretation.signal}</p>
                <p className="text-sm mt-1">{interpretation.desc}</p>
              </div>
            );
          })()}
          
          <div className="mt-3 text-sm text-gray-500 dark:text-gray-400 text-center">
            Bid/Offer Imbalance: <span className="font-mono font-medium dark:text-white">
              {toNumber(latestData.bid_offer_imbalance).toFixed(4)}
            </span>
          </div>
        </div>

        {/* ============================================ */}
        {/* ACCUMULATION SCORE                           */}
        {/* ============================================ */}
        <AccumulationScore
          whaleSignal={isWhale}
          splitSignal={isSplit}
          netForeignFlow={foreignFlowValue}
          bidOfferImbalance={toNumber(latestData.bid_offer_imbalance)}
          changePercent={changeValue}
          volumeSpike={toNumber(latestData.volume_spike)}
        />

        {/* ============================================ */}
        {/* CANDLESTICK PATTERNS                         */}
        {/* ============================================ */}
        {patterns.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🕯️ Candlestick Pattern Detected</h2>
            <div className="space-y-3">
              {patterns.map((pattern, idx) => (
                <div key={idx} className={`p-3 rounded-lg border ${
                  pattern.type === 'bullish' ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800' :
                  pattern.type === 'bearish' ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800' :
                  'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold dark:text-white">
                        {pattern.type === 'bullish' ? '🟢' : pattern.type === 'bearish' ? '🔴' : '⚪'} {pattern.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{pattern.description}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      pattern.reliability === 'high' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                      pattern.reliability === 'medium' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                      'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200'
                    }`}>
                      {pattern.reliability.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* CROSSING NEGO CARD                           */}
        {/* ============================================ */}
        {toNumber(latestData.non_regular_value) > 0 && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg shadow p-5 border-l-4 border-purple-500">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🏦</span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Crossing Nego</h3>
              {toNumber(latestData.non_regular_value) > toNumber(latestData.value) * 0.1 && (
                <span className="ml-auto px-2 py-1 bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 text-xs rounded-full font-medium">
                  🔥 Large Crossing
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Volume Nego</p>
                <p className="text-xl font-semibold dark:text-white">{formatVolume(toNumber(latestData.non_regular_volume))}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Value Nego</p>
                <p className="text-xl font-semibold dark:text-white">{formatVolume(toNumber(latestData.non_regular_value))}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Freq Nego</p>
                <p className="text-xl font-semibold dark:text-white">{toNumber(latestData.non_regular_frequency)}x</p>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              ℹ️ Crossing nego adalah transaksi di pasar negosiasi, sering digunakan bandar untuk tukar barang tanpa ganggu harga pasar.
            </p>
          </div>
        )}

        {/* ============================================ */}
        {/* DEEP DIVE CHART (4 PANEL)                    */}
        {/* ============================================ */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🔍 Deep Dive Analysis
          </h2>
          <DeepDiveChart data={chartData.map((item: any) => ({
            ...item,
            aov_ratio: (historyData || []).find((h: any) => 
              String(h.trading_date).split('T')[0] === item.time
            )?.aov_ratio || 1,
            avg_order_volume: (historyData || []).find((h: any) => 
              String(h.trading_date).split('T')[0] === item.time
            )?.avg_order_volume || 0,
            ma50_avg_order_volume: (historyData || []).find((h: any) => 
              String(h.trading_date).split('T')[0] === item.time
            )?.ma50_avg_order_volume || 0,
            net_foreign_flow: (historyData || []).find((h: any) => 
              String(h.trading_date).split('T')[0] === item.time
            )?.net_foreign_flow || 0,
            vwma_20d: (historyData || []).find((h: any) => 
              String(h.trading_date).split('T')[0] === item.time
            )?.vwma_20d || 0,
            whale_signal: (historyData || []).find((h: any) => 
              String(h.trading_date).split('T')[0] === item.time
            )?.whale_signal || false,
            split_signal: (historyData || []).find((h: any) => 
              String(h.trading_date).split('T')[0] === item.time
            )?.split_signal || false,
            big_player_anomaly: (historyData || []).find((h: any) => 
              String(h.trading_date).split('T')[0] === item.time
            )?.big_player_anomaly || 0,
            volume_spike: (historyData || []).find((h: any) => 
              String(h.trading_date).split('T')[0] === item.time
            )?.volume_spike || 0,
          }))} height={800} />
        </div>

        {/* ============================================ */}
        {/* HISTORICAL TABLE                             */}
        {/* ============================================ */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 border-b dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">📋 Data Historis</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left dark:text-gray-200">Tanggal</th>
                  <th className="px-4 py-3 text-right dark:text-gray-200">Close</th>
                  <th className="px-4 py-3 text-right dark:text-gray-200">Chg %</th>
                  <th className="px-4 py-3 text-right dark:text-gray-200">Volume</th>
                  <th className="px-4 py-3 text-right dark:text-gray-200">F. Buy</th>
                  <th className="px-4 py-3 text-right dark:text-gray-200">F. Sell</th>
                  <th className="px-4 py-3 text-right dark:text-gray-200">Net F.</th>
                  <th className="px-4 py-3 text-center dark:text-gray-200">🐋 AOV</th>
                  <th className="px-4 py-3 text-center dark:text-gray-200">Sinyal</th>
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
                    <tr key={row.trading_date || index} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                      <td className="px-4 py-3 dark:text-gray-300">
                        {row.trading_date ? new Date(String(row.trading_date)).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                        }) : '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono dark:text-gray-300">
                        {formatCurrency(rowClose)}
                      </td>
                      <td className={`px-4 py-3 text-right font-medium ${
                        rowChange > 0 ? 'text-green-600 dark:text-green-400' : 
                        rowChange < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {rowChange > 0 ? '+' : ''}{rowChange.toFixed(2)}%
                      </td>
                      <td className="px-4 py-3 text-right dark:text-gray-300">
                        {formatVolume(toNumber(row.volume))}
                      </td>
                      <td className="px-4 py-3 text-right text-green-600 dark:text-green-400">
                        {formatVolume(rowForeignBuy)}
                      </td>
                      <td className="px-4 py-3 text-right text-red-600 dark:text-red-400">
                        {formatVolume(rowForeignSell)}
                      </td>
                      <td className={`px-4 py-3 text-right font-medium ${
                        rowNetForeign >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatForeignFlow(rowNetForeign)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {rowIsWhale && <span className="text-green-600 dark:text-green-400" title="Whale">🐋</span>}
                          {rowIsSplit && <span className="text-red-600 dark:text-red-400" title="Split">⚡</span>}
                          <span className={rowIsWhale ? 'text-green-700 dark:text-green-400 font-medium' : rowIsSplit ? 'text-red-700 dark:text-red-400 font-medium' : 'dark:text-gray-300'}>
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
            className="inline-flex items-center px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            ← Kembali ke Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
