// app/page.tsx (VERSI OPTIMASI)
import { supabase } from '@/supabase';
import DashboardClient from '@/components/DashboardClient';
import { Suspense } from 'react';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';

// Cache selama 1 jam (3600 detik)
export const revalidate = 3600;

// Type safety untuk data
type StockData = {
  stock_code: string;
  close: number;
  change_percent: number;
  volume: number;
  net_foreign_flow: number;
  big_player_anomaly: boolean;
  final_signal: string;
  sector: string;
};

export default async function Dashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  try {
    // OPTIMASI: Single query dengan CTE (Common Table Expression)
    const { data, error } = await supabase.rpc('get_dashboard_data', {
      p_limit: 500 // Batasi data yang di-fetch
    });

    if (error) throw error;

    // Data sudah di-process di database level
    const { 
      stocks, 
      stats, 
      sectors,
      latestDate 
    } = data;

    return (
      <DashboardClient 
        initialStocks={stocks} 
        initialStats={stats} 
        sectors={sectors} 
        lastDate={latestDate} 
      />
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Gagal memuat data
          </h2>
          <p className="text-gray-600 mb-4">
            Silakan refresh halaman atau coba beberapa saat lagi
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Halaman
          </button>
        </div>
      </div>
    );
  }
}
