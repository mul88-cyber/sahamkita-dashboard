// =============================================
// app/page.tsx - FIXED
// =============================================
import { supabase } from '@/supabase';
import { Suspense } from 'react';
import DashboardClient from '@/components/DashboardClient';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';
import type { Stock, DashboardStats } from '@/types';

export const revalidate = 3600;

export default async function Dashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  try {
    const { data, error } = await supabase.rpc('get_dashboard_data', {
      p_limit: 500
    });

    if (error) throw new Error(error.message);

    const response = data as {
      stocks: Stock[];
      stats: DashboardStats;
      sectors: string[];
      latestDate: string;
      totalCount: number;
      error?: boolean;
      message?: string;
    };

    if (response.error) {
      throw new Error(response.message || 'Gagal mengambil data');
    }

    if (!response.stocks || response.stocks.length === 0) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Belum Ada Data</h2>
            <p className="text-gray-600 mb-6">Database masih kosong.</p>
            <a href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Refresh
            </a>
          </div>
        </div>
      );
    }

    return (
      <DashboardClient
        initialStocks={response.stocks}
        initialStats={response.stats}
        sectors={response.sectors.filter(Boolean)}
        lastDate={response.latestDate}
        totalCount={response.totalCount}
      />
    );
    
  } catch (error) {
    console.error('Dashboard error:', error);
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Gagal Memuat Dashboard</h2>
          <p className="text-gray-600 mb-6">
            {error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui'}
          </p>
          <div className="space-x-4">
            <a href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Refresh Halaman
            </a>
            <a href="/" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
              Kembali ke Beranda
            </a>
          </div>
        </div>
      </div>
    );
  }
}
