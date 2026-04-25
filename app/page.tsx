// =============================================
// app/page.tsx - REDESIGNED
// =============================================
import { supabase } from '@/supabase';
import { Suspense } from 'react';
import DashboardClient from '@/components/DashboardClient';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';

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
    const { data, error } = await supabase.rpc('get_dashboard_data', { p_limit: 500 });

    if (error) throw new Error(error.message);
    const response = data as any;

    if (response.error) throw new Error(response.message || 'Gagal mengambil data');
    if (!response.stocks || response.stocks.length === 0) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold mb-2">Belum Ada Data</h2>
            <a href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Refresh</a>
          </div>
        </div>
      );
    }

    const { stocks, stats, sectors, latestDate, totalCount } = response;

    // Quick stats
    const gainers = stocks.filter((s: any) => s.change_percent > 0).length;
    const losers = stocks.filter((s: any) => s.change_percent < 0).length;
    const topGainers = [...stocks].sort((a: any, b: any) => b.change_percent - a.change_percent).slice(0, 5);
    const topLosers = [...stocks].sort((a: any, b: any) => a.change_percent - b.change_percent).slice(0, 5);
    const topWhales = (stats.top_whale || []).slice(0, 5);

    return (
      <DashboardClient 
        stocks={stocks}
        stats={stats}
        sectors={sectors}
        latestDate={latestDate}
        totalCount={totalCount}
        gainers={gainers}
        losers={losers}
        topGainers={topGainers}
        topLosers={topLosers}
        topWhales={topWhales}
      />
    );
  } catch (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Gagal Memuat Dashboard</h2>
          <a href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Refresh</a>
        </div>
      </div>
    );
  }
}
