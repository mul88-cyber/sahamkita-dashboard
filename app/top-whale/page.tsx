// =============================================
// app/top-whale/page.tsx
// Top Whale Signals Hari Ini
// =============================================
import { supabase } from '@/supabase';
import Link from 'next/link';

export const revalidate = 3600;

export default async function TopWhalePage() {
  const { data: latestDate } = await supabase
    .from('daily_transactions')
    .select('trading_date')
    .order('trading_date', { ascending: false })
    .limit(1);

  const date = latestDate?.[0]?.trading_date || '';

  const { data: whales } = await supabase
    .from('daily_transactions')
    .select('*')
    .eq('trading_date', date)
    .eq('whale_signal', true)
    .order('aov_ratio', { ascending: false })
    .limit(50);

  const formatCurrency = (v: number) => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(v);

  const formatVolume = (v: number) => {
    if (v >= 1e9) return `${(v/1e9).toFixed(2)}B`;
    if (v >= 1e6) return `${(v/1e6).toFixed(2)}M`;
    return v?.toLocaleString('id-ID') || '0';
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🏆 Top Whale Signals Hari Ini</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Saham dengan sinyal Whale terkuat (AOV Ratio ≥ 1.5x)
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Data: {new Date(date).toLocaleDateString('id-ID')} | Total: {whales?.length || 0} saham
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(whales || []).map((w, idx) => (
            <Link
              key={w.stock_code}
              href={`/emiten/${w.stock_code}`}
              className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all p-5 border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{w.stock_code}</span>
                  {idx < 3 && <span className="text-lg">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>}
                </div>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
                  #{idx + 1}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Close</p>
                  <p className="font-semibold dark:text-white">{formatCurrency(w.close)}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Change</p>
                  <p className={`font-semibold ${w.change_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {w.change_percent >= 0 ? '+' : ''}{w.change_percent?.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">🐋 AOV Ratio</p>
                  <p className="font-bold text-green-600">{w.aov_ratio?.toFixed(2)}x</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Conviction</p>
                  <p className="font-bold text-blue-600">{w.conviction_score?.toFixed(0)}%</p>
                </div>
              </div>

              <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${Math.min(w.aov_ratio * 20, 100)}%` }}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
