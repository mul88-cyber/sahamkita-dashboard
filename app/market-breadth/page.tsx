// =============================================
// app/market-breadth/page.tsx
// Market Breadth Indicator (Advance/Decline Line)
// =============================================
import { supabase } from '@/supabase';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function MarketBreadthPage() {
  const { data: breadthResult } = await supabase.rpc('get_market_breadth', {
    p_days: 30
  });

  const breadthData = (breadthResult as any)?.breadth || [];
  const latestDate = (breadthResult as any)?.latestDate || '';

  // Hitung A/D Ratio dan Cumulative A/D Line
  let cumulativeAD = 0;
  const enrichedData = breadthData.map((day: any) => {
    const adRatio = day.advancers - day.decliners;
    cumulativeAD += adRatio;
    return {
      ...day,
      ad_ratio: adRatio,
      cumulative_ad: cumulativeAD,
      ad_percent: day.total_stocks > 0 ? ((day.advancers / day.total_stocks) * 100).toFixed(1) : 0,
    };
  });

  const latest = enrichedData[enrichedData.length - 1];
  const prev = enrichedData[enrichedData.length - 2];

  const formatVolume = (v: number) => {
    if (v >= 1e12) return `${(v/1e12).toFixed(2)}T`;
    if (v >= 1e9) return `${(v/1e9).toFixed(2)}B`;
    if (v >= 1e6) return `${(v/1e6).toFixed(2)}M`;
    return v?.toLocaleString('id-ID') || '0';
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📊 Market Breadth Indicator</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Advance/Decline Line - Kesehatan Pasar Secara Keseluruhan
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Data: {new Date(latestDate).toLocaleDateString('id-ID')}
          </p>
        </div>

        {/* Today's Summary */}
        {latest && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">📈 Advancers</p>
              <p className="text-2xl font-bold text-green-600">{latest.advancers}</p>
              <p className="text-xs text-gray-400">{latest.ad_percent}%</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">📉 Decliners</p>
              <p className="text-2xl font-bold text-red-600">{latest.decliners}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">➖ Unchanged</p>
              <p className="text-2xl font-bold text-gray-600">{latest.unchanged}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">📊 A/D Ratio</p>
              <p className={`text-2xl font-bold ${latest.ad_ratio >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {latest.ad_ratio >= 0 ? '+' : ''}{latest.ad_ratio}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">📈 Sentiment</p>
              <p className={`text-lg font-bold ${latest.ad_ratio >= 50 ? 'text-green-600' : latest.ad_ratio >= -50 ? 'text-yellow-600' : 'text-red-600'}`}>
                {latest.ad_ratio >= 100 ? '🟢 Bullish' : latest.ad_ratio >= 0 ? '🟡 Neutral Bullish' : latest.ad_ratio >= -100 ? '🟠 Neutral Bearish' : '🔴 Bearish'}
              </p>
            </div>
          </div>
        )}

        {/* Cumulative A/D Line Chart (Simple Bar) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">📈 Cumulative Advance/Decline Line</h3>
          <div className="space-y-2">
            {enrichedData.slice(-20).map((day: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 dark:text-gray-400 w-12">
                  {new Date(day.trading_date).toLocaleDateString('id-ID', {day:'numeric',month:'short'})}
                </span>
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-6 relative overflow-hidden">
                  <div
                    className={`h-full rounded-full ${day.ad_ratio >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ 
                      width: `${Math.min(Math.abs(day.ad_ratio), 300) / 3}%`,
                      marginLeft: day.ad_ratio >= 0 ? 0 : 'auto'
                    }}
                  />
                </div>
                <span className={`text-sm font-medium w-16 text-right ${day.ad_ratio >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {day.ad_ratio >= 0 ? '+' : ''}{day.ad_ratio}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left dark:text-gray-200">Tanggal</th>
                <th className="px-4 py-3 text-right dark:text-gray-200">Advance</th>
                <th className="px-4 py-3 text-right dark:text-gray-200">Decline</th>
                <th className="px-4 py-3 text-right dark:text-gray-200">A/D Ratio</th>
                <th className="px-4 py-3 text-right dark:text-gray-200">Cumulative A/D</th>
                <th className="px-4 py-3 text-right dark:text-gray-200">Avg Change</th>
                <th className="px-4 py-3 text-right dark:text-gray-200">Total Volume</th>
                <th className="px-4 py-3 text-right dark:text-gray-200">Foreign Flow</th>
              </tr>
            </thead>
            <tbody>
              {enrichedData.reverse().map((day: any, idx: number) => (
                <tr key={idx} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="px-4 py-3 dark:text-gray-300">
                    {new Date(day.trading_date).toLocaleDateString('id-ID', {day:'numeric',month:'short',year:'numeric'})}
                  </td>
                  <td className="px-4 py-3 text-right text-green-600">{day.advancers}</td>
                  <td className="px-4 py-3 text-right text-red-600">{day.decliners}</td>
                  <td className={`px-4 py-3 text-right font-medium ${day.ad_ratio >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {day.ad_ratio >= 0 ? '+' : ''}{day.ad_ratio}
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${day.cumulative_ad >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {day.cumulative_ad}
                  </td>
                  <td className={`px-4 py-3 text-right ${day.avg_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {day.avg_change >= 0 ? '+' : ''}{day.avg_change}%
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{formatVolume(day.total_volume)}</td>
                  <td className={`px-4 py-3 text-right ${day.total_foreign_flow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {day.total_foreign_flow >= 0 ? '+' : ''}{formatVolume(Math.abs(day.total_foreign_flow))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
