// =============================================
// app/watchlist/page.tsx
// Halaman Watchlist Personal User
// =============================================
import { createClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import WatchlistClient from '@/components/WatchlistClient';

export const dynamic = 'force-dynamic';

export default async function WatchlistPage() {
  const supabase = createClient();
  
  // Cek user login
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Ambil watchlist user
  const { data: watchlistData } = await supabase
    .from('watchlist')
    .select('stock_code, added_at, notes')
    .order('added_at', { ascending: false });

  const watchlistCodes = watchlistData?.map(item => item.stock_code) || [];

  // Ambil data saham terbaru untuk kode yang ada di watchlist
  const { data: latestDateData } = await supabase
    .from('daily_transactions')
    .select('trading_date')
    .order('trading_date', { ascending: false })
    .limit(1);

  const latestDate = latestDateData?.[0]?.trading_date || '';

  let stocksData: any[] = [];
  
  if (watchlistCodes.length > 0) {
    const { data } = await supabase
      .from('daily_transactions')
      .select(`
        stock_code,
        close,
        change_percent,
        volume,
        net_foreign_flow,
        big_player_anomaly,
        final_signal,
        sector,
        aov_ratio,
        whale_signal,
        split_signal,
        conviction_score,
        non_regular_value,
        transaction_value:value,
        tradeable_pct
      `)
      .eq('trading_date', latestDate)
      .in('stock_code', watchlistCodes);
    
    stocksData = data || [];
  }

  // Gabungkan data watchlist dengan data saham
  const enrichedStocks = watchlistCodes.map(code => {
    const stockInfo = stocksData.find(s => s.stock_code === code);
    const watchlistInfo = watchlistData?.find(w => w.stock_code === code);
    
    return {
      stock_code: code,
      close: stockInfo?.close || 0,
      change_percent: stockInfo?.change_percent || 0,
      volume: stockInfo?.volume || 0,
      net_foreign_flow: stockInfo?.net_foreign_flow || 0,
      big_player_anomaly: stockInfo?.big_player_anomaly || false,
      final_signal: stockInfo?.final_signal || 'N/A',
      sector: stockInfo?.sector || '-',
      aov_ratio: stockInfo?.aov_ratio || 1.0,
      whale_signal: stockInfo?.whale_signal || false,
      split_signal: stockInfo?.split_signal || false,
      conviction_score: stockInfo?.conviction_score || 50,
      non_regular_value: stockInfo?.non_regular_value || 0,
      transaction_value: stockInfo?.transaction_value || 0,
      tradeable_pct: stockInfo?.tradeable_pct || null,
      added_at: watchlistInfo?.added_at || '',
      notes: watchlistInfo?.notes || '',
    };
  });

  return (
    <WatchlistClient 
      initialStocks={enrichedStocks} 
      userEmail={user.email || ''} 
      lastDate={latestDate}
    />
  );
}
