// app/page.tsx
import { supabase } from '@/supabase'; // Sesuaikan dengan path file supabase Anda
import DashboardClient from '@/components/DashboardClient';

// Memastikan Vercel selalu mengambil data terbaru secara dinamis (tidak di-cache selamanya)
export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  // 1. Ambil tanggal terbaru
  const { data: latest } = await supabase
    .from('daily_transactions')
    .select('trading_date')
    .order('trading_date', { ascending: false })
    .limit(1);
  
  const latestDate = latest?.[0]?.trading_date || '';

  // 2. Ambil semua data saham berdasarkan tanggal terbaru
  const { data: stocksData, error } = await supabase
    .from('daily_transactions')
    .select('stock_code, close, change_percent, volume, net_foreign_flow, big_player_anomaly, final_signal, sector')
    .eq('trading_date', latestDate);

  if (error) {
    console.error('Error fetching data from Supabase:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Gagal memuat data dashboard.</div>
      </div>
    );
  }

  const stocks = stocksData || [];

  // 3. Kalkulasi statistik DILAKUKAN DI SERVER untuk menghemat resource pengguna
  const sortedByGain = [...stocks].sort((a, b) => b.change_percent - a.change_percent);
  const sortedByVolume = [...stocks].sort((a, b) => b.volume - a.volume);
  const totalNetForeign = stocks.reduce((sum, s) => sum + (s.net_foreign_flow || 0), 0);
  const anomalyCount = stocks.filter(s => s.big_player_anomaly).length;

  const stats = {
    topGainer: sortedByGain.slice(0, 5),
    topLoser: sortedByGain.slice(-5).reverse(),
    topVolume: sortedByVolume.slice(0, 5),
    totalNetForeign,
    anomalyCount
  };

  const uniqueSectors = [...new Set(stocks.map(s => s.sector).filter(Boolean))];

  // 4. Kirim data yang sudah bersih ke Client Component
  return (
    <DashboardClient 
      initialStocks={stocks} 
      initialStats={stats} 
      sectors={uniqueSectors} 
      lastDate={latestDate} 
    />
  );
}
