// =============================================
// app/whale-tracker/page.tsx
// Multi-Day Whale Accumulation Tracker
// =============================================
import { supabase } from '@/supabase';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function WhaleTrackerPage() {
  const { data: result } = await supabase.rpc('get_whale_accumulation', {
    p_days: 5,
    p_min_signals: 3
  });

  const signals = (result as any)?.signals || [];
  const latestDate = (result as any)?.latestDate || '';
  const totalDetected = (result as any)?.totalDetected || 0;

  const formatVolume = (v: number) => {
    if (v >= 1e9) return `${(v/1e9).toFixed(2)}B`;
    if (v >= 1e6) return `${(v/1e6).toFixed(2)}M`;
    return v?.toLocaleString('id-ID') || '0';
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🐋 Whale Accumulation Tracker</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Saham dengan Whale Signal ≥ 3x dalam 5 hari terakhir
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Data: {new Date(latestDate).toLocaleDateString('id-ID')} | Total: {totalDetected} saham
          </p>
        </div>

        {/* Results */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left dark:text-gray-200">Kode</th>
                  <th className="px-4 py-3 text-center dark:text-gray-200">🐋 Whale Days</th>
                  <th className="px-4 py-3 text-center dark:text-gray-200">Avg AOV</th>
                  <th className="px-4 py-3 text-center dark:text-gray-200">Avg Change</th>
                  <th className="px-4 py-3 text-right dark:text-gray-200">Total Foreign</th>
                  <th className="px-4 py-3 text-center dark:text-gray-200">Periode</th>
                </tr>
              </thead>
              <tbody>
                {signals.map((s: any, idx: number) => (
                  <tr key={idx} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-4 py-3">
                      <Link href={`/emiten/${s.stock_code}`} className="text-blue-600 hover:underline font-medium">
                        {s.stock_code}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
                        🐋 {s.whale_days}/{s.total_trading_days} days
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono">{s.avg_aov_ratio?.toFixed(2)}x</td>
                    <td className={`px-4 py-3 text-center font-medium ${s.avg_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {s.avg_change >= 0 ? '+' : ''}{s.avg_change?.toFixed(2)}%
                    </td>
                    <td className={`px-4 py-3 text-right ${s.total_foreign_flow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {s.total_foreign_flow >= 0 ? '+' : ''}{formatVolume(Math.abs(s.total_foreign_flow))}
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-500">
                      {new Date(s.first_signal_date).toLocaleDateString('id-ID', {day:'numeric',month:'short'})} - {new Date(s.last_signal_date).toLocaleDateString('id-ID', {day:'numeric',month:'short'})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
