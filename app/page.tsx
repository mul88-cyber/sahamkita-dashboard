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
      <>
        {/* 🆕 MARKET SUMMARY BAR - TAMBAHKAN INI */}
        <div className="max-w-7xl mx-auto px-4 pt-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-4 border border-blue-100">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
              <div>
                <p className="text-xs text-gray-500">Total Saham</p>
                <p className="text-lg font-bold text-gray-900">{response.totalCount}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">🐋 Whale</p>
                <p className="text-lg font-bold text-green-600">{response.stats.whale_count || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">⚡ Split</p>
                <p className="text-lg font-bold text-red-600">{response.stats.split_count || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">🏦 Crossing</p>
                <p className="text-lg font-bold text-purple-600">{response.stats.nego_crossing_count || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">⚡ Anomali</p>
                <p className="text-lg font-bold text-orange-600">{response.stats.anomaly_count}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">📈 Gainers</p>
                <p className="text-lg font-bold text-green-600">
                  {response.stocks.filter((s: any) => s.change_percent > 0).length}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">📉 Losers</p>
                <p className="text-lg font-bold text-red-600">
                  {response.stocks.filter((s: any) => s.change_percent < 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      
        <DashboardClient
          initialStocks={response.stocks}
          initialStats={response.stats}
          sectors={response.sectors.filter(Boolean)}
          lastDate={response.latestDate}
          totalCount={response.totalCount}
        />
      </>
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
