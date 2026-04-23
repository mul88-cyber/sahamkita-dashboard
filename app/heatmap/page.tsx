// =============================================
// app/heatmap/page.tsx
// Sector Heatmap
// =============================================
import { supabase } from '@/supabase';
import Link from 'next/link';

export const revalidate = 3600;

export default async function HeatmapPage() {
  const { data: latestDate } = await supabase
    .from('daily_transactions')
    .select('trading_date')
    .order('trading_date', { ascending: false })
    .limit(1);

  const date = latestDate?.[0]?.trading_date || '';

  const { data: sectors } = await supabase
    .from('daily_transactions')
    .select('sector, close, change_percent, volume, whale_signal, net_foreign_flow')
    .eq('trading_date', date);

  // Group by sector
  const sectorMap = new Map<string, any[]>();
  sectors?.forEach(s => {
    if (!s.sector) return;
    const existing = sectorMap.get(s.sector) || [];
    existing.push(s);
    sectorMap.set(s.sector, existing);
  });

  const sectorStats = Array.from(sectorMap.entries()).map(([sector, stocks]) => ({
    sector,
    count: stocks.length,
    avgChange: stocks.reduce((sum, s) => sum + (s.change_percent || 0), 0) / stocks.length,
    whaleCount: stocks.filter(s => s.whale_signal).length,
    totalForeign: stocks.reduce((sum, s) => sum + (s.net_foreign_flow || 0), 0),
  })).sort((a, b) => b.avgChange - a.avgChange);

  const formatForeign = (val: number) => {
    const abs = Math.abs(val);
    const sign = val >= 0 ? '+' : '-';
    if (abs >= 1e9) return `${sign}${(abs/1e9).toFixed(1)}B`;
    if (abs >= 1e6) return `${sign}${(abs/1e6).toFixed(0)}M`;
    return `${sign}${abs}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">🗺️ Sector Heatmap</h1>
          <p className="text-sm text-gray-500">Data: {new Date(date).toLocaleDateString('id-ID')}</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sectorStats.map(s => (
            <div key={s.sector} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-lg mb-3">{s.sector}</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Saham</p>
                  <p className="font-semibold">{s.count}</p>
                </div>
                <div>
                  <p className="text-gray-500">Avg Change</p>
                  <p className={`font-semibold ${s.avgChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {s.avgChange >= 0 ? '+' : ''}{s.avgChange.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">🐋 Whale</p>
                  <p className="font-semibold text-green-600">{s.whaleCount}</p>
                </div>
                <div>
                  <p className="text-gray-500">Foreign</p>
                  <p className={`font-semibold ${s.totalForeign >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatForeign(s.totalForeign)}
                  </p>
                </div>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${s.avgChange >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(Math.abs(s.avgChange) * 10, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
