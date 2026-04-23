// =============================================
// app/screener/page.tsx
// Whale & Split Screener - Basic Version
// =============================================
import { supabase } from '@/supabase';
import ScreenerClient from '@/components/ScreenerClient';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function ScreenerPage() {
  // Ambil data terbaru
  const { data: latestDateData } = await supabase
    .from('daily_transactions')
    .select('trading_date')
    .order('trading_date', { ascending: false })
    .limit(1);
  
  const latestDate = latestDateData?.[0]?.trading_date || '';

  // Ambil semua saham di tanggal terbaru dengan metrik whale
  const { data: stocks, error } = await supabase
    .from('daily_transactions')
    .select(`
      stock_code,
      close,
      change_percent,
      volume,
      value,
      net_foreign_flow,
      avg_order_volume,
      ma50_avg_order_volume,
      aov_ratio,
      whale_signal,
      split_signal,
      conviction_score,
      sector,
      final_signal,
      vwma_20d,
      free_float
    `)
    .eq('trading_date', latestDate)
    .order('volume', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return <div>Error loading data</div>;
  }

  // Hitung AOV Ratio untuk yang belum ada
  const enrichedStocks = (stocks || []).map(stock => {
    const avgOrderVol = stock.avg_order_volume || 0;
    const ma50 = stock.ma50_avg_order_volume || 1;
    const aovRatio = stock.aov_ratio || (ma50 > 0 ? avgOrderVol / ma50 : 1.0);
    const isWhale = stock.whale_signal || aovRatio >= 1.5;
    const isSplit = stock.split_signal || (aovRatio <= 0.6 && aovRatio > 0);
    const conviction = stock.conviction_score || 
      (isWhale ? Math.min(99, ((aovRatio - 1.5) / 3.5) * 80 + 20) :
       isSplit ? Math.min(99, ((0.6 - aovRatio) / 0.6) * 80 + 20) : 50);

    return {
      ...stock,
      aov_ratio: aovRatio,
      whale_signal: isWhale,
      split_signal: isSplit,
      conviction_score: conviction,
    };
  });

  const sectors = [...new Set(enrichedStocks.map(s => s.sector).filter(Boolean))];

  return (
    <ScreenerClient 
      initialStocks={enrichedStocks}
      sectors={sectors}
      lastDate={latestDate}
    />
  );
}
