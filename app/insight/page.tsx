// =============================================
// app/insight/page.tsx
// Market Insight - Gabungan Heatmap, Breadth, Map, Whale
// =============================================
import { supabase } from '@/supabase';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function InsightPage() {
  // Fetch data untuk semua insight
  const { data: latestDate } = await supabase.from('daily_transactions').select('trading_date').order('trading_date', { ascending: false }).limit(1);
  const date = latestDate?.[0]?.trading_date || '';

  // Market Breadth
  const { data: breadth } = await supabase.rpc('get_market_breadth', { p_days: 1 });
  const latest = (breadth as any)?.breadth?.[0] || null;

  // Top Whale
  const { data: whales } = await supabase.from('daily_transactions').select('*').eq('trading_date', date).eq('whale_signal', true).order('aov_ratio', { ascending: false }).limit(10);

  // Sector stats
  const { data: sectors } = await supabase.from('daily_transactions').select('sector, close, change_percent, volume, whale_signal, net_foreign_value').eq('trading_date', date);
  const sectorMap = new Map<string, any[]>();
  sectors?.forEach((s: any) => { if (!s.sector) return; const arr = sectorMap.get(s.sector) || []; arr.push(s); sectorMap.set(s.sector, arr); });
  const sectorStats = Array.from(sectorMap.entries()).map(([sector, stocks]) => ({
    sector,
    count: stocks.length,
    avgChange: stocks.reduce((sum, s) => sum + (s.change_percent || 0), 0) / stocks.length,
    whaleCount: stocks.filter((s: any) => s.whale_signal).length,
    totalForeign: stocks.reduce((sum: number, s: any) => sum + (s.net_foreign_value || 0), 0),
  })).sort((a, b) => b.avgChange - a.avgChange);

  const formatVolume = (v: number) => {
    if (v >= 1e12) return `${(v/1e12).toFixed(1)}T`;
    if (v >= 1e9) return `${(v/1e9).toFixed(1)}B`;
    if (v >= 1e6) return `${(v/1e6).toFixed(1)}M`;
    return v?.toLocaleString('id-ID') || '0';
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">💡 Market Insight</h1>

        {/* Grid 2 kolom */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Market Breadth */}
          {latest && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
              <h3 className="font-semibold mb-3">📈 Market Breadth</h3>
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <p className="text-xs text-gray-500">Advancers</p>
                  <p className="text-2xl font-bold text-green-600">{latest.advancers}</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-xs text-gray-500">Decliners</p>
                  <p className="text-2xl font-bold text-red-600">{latest.decliners}</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-xs text-gray-500">Unchanged</p>
                  <p className="text-2xl font-bold text-gray-600">{latest.unchanged}</p>
                </div>
              </div>
            </div>
          )}

          {/* Top Whale */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
            <h3 className="font-semibold mb-3">🐋 Top Whale Today</h3>
            <div className="space-y-2">
              {(whales || []).slice(0, 5).map((w: any, idx: number) => (
                <Link key={idx} href={`/emiten/${w.stock_code}`} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-750 rounded">
                  <span className="font-medium text-blue-600">{w.stock_code}</span>
                  <span className="text-green-600 font-bold">{w.aov_ratio?.toFixed(2)}x</span>
                  <span className="text-sm">{w.change_percent?.toFixed(2)}%</span>
                  <span>{formatVolume(w.net_foreign_value || 0)}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Sector Heatmap */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <h3 className="font-semibold mb-3">🔥 Sector Heatmap</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {sectorStats.map((s) => (
              <div key={s.sector} className="p-3 border dark:border-gray-700 rounded-lg">
                <p className="font-medium text-sm">{s.sector}</p>
                <p className={`text-lg font-bold ${s.avgChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {s.avgChange >= 0 ? '+' : ''}{s.avgChange.toFixed(2)}%
                </p>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{s.count} saham</span>
                  <span>🐋 {s.whaleCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
