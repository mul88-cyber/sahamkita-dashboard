// =============================================
// app/market-map/page.tsx
// Market Map - Foreign Flow Scatter
// =============================================
import { supabase } from '@/supabase';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function MarketMapPage() {
  const { data: latestDate } = await supabase
    .from('daily_transactions')
    .select('trading_date')
    .order('trading_date', { ascending: false })
    .limit(1);

  const date = latestDate?.[0]?.trading_date || '';

  // Fetch all stocks for today
  const { data: stocks } = await supabase
    .from('daily_transactions')
    .select('stock_code, close, change_percent, volume, value, net_foreign_flow, sector, whale_signal')
    .eq('trading_date', date)
    .order('net_foreign_flow', { ascending: false });

  const formatVolume = (v: number) => {
    if (v >= 1e12) return `${(v/1e12).toFixed(2)}T`;
    if (v >= 1e9) return `${(v/1e9).toFixed(2)}B`;
    if (v >= 1e6) return `${(v/1e6).toFixed(2)}M`;
    return v?.toLocaleString('id-ID') || '0';
  };

  // Split data
  const topBuy = (stocks || []).filter((s: any) => s.net_foreign_flow > 0).slice(0, 30);
  const topSell = (stocks || []).filter((s: any) => s.net_foreign_flow < 0)
    .sort((a: any, b: any) => a.net_foreign_flow - b.net_foreign_flow).slice(0, 30);

  // Market summary
  const totalInflow = (stocks || []).filter((s: any) => s.net_foreign_flow > 0)
    .reduce((sum: number, s: any) => sum + s.net_foreign_flow, 0);
  const totalOutflow = (stocks || []).filter((s: any) => s.net_foreign_flow < 0)
    .reduce((sum: number, s: any) => sum + s.net_foreign_flow, 0);
  const netFlow = totalInflow + totalOutflow;

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🗺️ Market Map</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Foreign Flow Scatter - {new Date(date).toLocaleDateString('id-ID')}
          </p>
        </div>

        {/* Market Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">🟢 Total Inflow</p>
            <p className="text-2xl font-bold text-green-700">{formatVolume(totalInflow)}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">🔴 Total Outflow</p>
            <p className="text-2xl font-bold text-red-700">{formatVolume(Math.abs(totalOutflow))}</p>
          </div>
          <div className={`rounded-lg p-4 ${netFlow >= 0 ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}>
            <p className="text-sm text-gray-600 dark:text-gray-400">📊 Net Flow</p>
            <p className={`text-2xl font-bold ${netFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {netFlow >= 0 ? '+' : ''}{formatVolume(netFlow)}
            </p>
          </div>
        </div>

        {/* Visual Bar Chart (Simple CSS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Buy */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="font-semibold mb-4">🟢 Top 30 Foreign Buy</h3>
            <div className="space-y-1.5 max-h-[600px] overflow-y-auto">
              {topBuy.map((s: any, idx: number) => {
                const maxVal = topBuy[0]?.net_foreign_flow || 1;
                const pct = (s.net_foreign_flow / maxVal) * 100;
                return (
                  <Link key={idx} href={`/emiten/${s.stock_code}`} className="flex items-center gap-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded group">
                    <span className="w-12 font-medium text-blue-600 group-hover:underline">{s.stock_code}</span>
                    <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                      <div className="bg-green-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-20 text-right font-quant text-green-600">{formatVolume(s.net_foreign_flow)}</span>
                    <span className="w-12 text-right text-gray-400">{s.change_percent?.toFixed(1)}%</span>
                    {s.whale_signal && <span>🐋</span>}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Top Sell */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="font-semibold mb-4">🔴 Top 30 Foreign Sell</h3>
            <div className="space-y-1.5 max-h-[600px] overflow-y-auto">
              {topSell.map((s: any, idx: number) => {
                const maxVal = Math.abs(topSell[0]?.net_foreign_flow) || 1;
                const pct = (Math.abs(s.net_foreign_flow) / maxVal) * 100;
                return (
                  <Link key={idx} href={`/emiten/${s.stock_code}`} className="flex items-center gap-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded group">
                    <span className="w-12 font-medium text-blue-600 group-hover:underline">{s.stock_code}</span>
                    <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                      <div className="bg-red-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-20 text-right font-quant text-red-600">{formatVolume(s.net_foreign_flow)}</span>
                    <span className="w-12 text-right text-gray-400">{s.change_percent?.toFixed(1)}%</span>
                    {s.whale_signal && <span>🐋</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="inline-flex items-center px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg">
            ← Kembali ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
