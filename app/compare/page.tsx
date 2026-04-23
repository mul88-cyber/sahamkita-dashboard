// =============================================
// app/compare/page.tsx
// Compare multiple stocks side by side
// =============================================
import { supabase } from '@/supabase';
import Link from 'next/link';
import CandlestickChart from '@/components/CandlestickChart';

export const dynamic = 'force-dynamic';

export default async function ComparePage({
  searchParams,
}: {
  searchParams: { codes?: string };
}) {
  const codes = searchParams.codes?.toUpperCase().split(',').slice(0, 5) || [];

  const { data: latestDate } = await supabase
    .from('daily_transactions')
    .select('trading_date')
    .order('trading_date', { ascending: false })
    .limit(1);

  const date = latestDate?.[0]?.trading_date || '';

  let stocksData: any[] = [];
  let chartData: Record<string, any[]> = {};

  if (codes.length > 0) {
    const { data: stocks } = await supabase
      .from('daily_transactions')
      .select('*')
      .eq('trading_date', date)
      .in('stock_code', codes);

    stocksData = stocks || [];

    for (const code of codes) {
      const { data: history } = await supabase
        .from('daily_transactions')
        .select('trading_date, close, volume')
        .eq('stock_code', code)
        .order('trading_date', { ascending: false })
        .limit(30);
      
      chartData[code] = (history || []).reverse().map(item => ({
        time: item.trading_date,
        value: item.close,
      }));
    }
  }

  const formatCurrency = (v: number) => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(v);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">⚖️ Compare Stocks</h1>
          <p className="text-sm text-gray-500">
            Bandingkan hingga 5 saham sekaligus
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Search */}
        <div className="bg-white rounded-lg shadow p-4">
          <form method="GET" className="flex gap-2">
            <input
              type="text"
              name="codes"
              defaultValue={codes.join(',')}
              placeholder="Contoh: BBCA,TLKM,ASII"
              className="flex-1 px-4 py-2 border rounded-lg uppercase"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Compare
            </button>
          </form>
        </div>

        {codes.length > 0 && (
          <>
            {/* Comparison Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Metrik</th>
                    {stocksData.map(s => (
                      <th key={s.stock_code} className="px-4 py-3 text-center">
                        <Link href={`/emiten/${s.stock_code}`} className="text-blue-600 hover:underline">
                          {s.stock_code}
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {['close', 'change_percent', 'volume', 'aov_ratio', 'whale_signal', 'final_signal', 'free_float'].map(metric => (
                    <tr key={metric} className="border-t">
                      <td className="px-4 py-3 font-medium text-gray-700">{metric}</td>
                      {stocksData.map(s => (
                        <td key={s.stock_code} className="px-4 py-3 text-center">
                          {metric === 'close' ? formatCurrency(s[metric] || 0) :
                           metric === 'whale_signal' ? (s[metric] ? '🐋' : '-') :
                           metric === 'change_percent' ? 
                            <span className={s[metric] >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {s[metric] >= 0 ? '+' : ''}{s[metric]?.toFixed(2)}%
                            </span> :
                           String(s[metric] || '-')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
