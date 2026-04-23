// =============================================
// app/page.tsx
// Halaman utama dashboard dengan Server Component
// =============================================
import { supabase } from '@/supabase';
import { Suspense } from 'react';
import DashboardClient from '@/components/DashboardClient';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';
import type { Stock, DashboardStats } from '@/types';

// Revalidate setiap 1 jam (3600 detik)
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
    // Panggil RPC function yang sudah dibuat
    const { data, error } = await supabase.rpc('get_dashboard_data', {
      p_limit: 500
    });

    if (error) {
      console.error('Supabase RPC error:', error);
      throw new Error(error.message);
    }

    // Parse response
    const response = data as {
      stocks: Stock[];
      stats: DashboardStats;
      sectors: string[];
      latestDate: string;
      totalCount: number;
      error?: boolean;
      message?: string;
    };

    // Handle jika function return error
    if (response.error) {
      throw new Error(response.message || 'Gagal mengambil data');
    }

    // Handle jika tidak ada data
    if (!response.stocks || response.stocks.length === 0) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Belum Ada Data
            </h2>
            <p className="text-gray-600 mb-6">
              Database masih kosong. Silakan lakukan import data terlebih dahulu.
            </p>
            <a
              href="https://supabase.com/dashboard/project/YOUR_PROJECT_ID"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Buka Supabase Dashboard →
            </a>
          </div>
        </div>
      );
    }

    // Render dashboard dengan data
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
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Gagal Memuat Dashboard
          </h2>
          <p className="text-gray-600 mb-6">
            {error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui'}
          </p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh Halaman
            </button>
            <a
              href="/"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Kembali ke Beranda
            </a>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            Jika masalah berlanjut, hubungi support@sahamkita.com
          </p>
        </div>
      </div>
    );
  }
}
