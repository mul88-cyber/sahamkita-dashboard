// =============================================
// app/screener/page.tsx - V3 UPGRADE
// =============================================
import { supabase } from '@/supabase';
import ScreenerClientV3 from '@/components/ScreenerClientV3';

export const dynamic = 'force-dynamic';
export const revalidate = 1800; // 30 menit

export default async function ScreenerPage({
  searchParams,
}: {
  searchParams: { mode?: string; context?: string; start?: string; end?: string };
}) {
  const mode = searchParams.mode || 'whale';
  const priceContext = searchParams.context || 'all';
  
  // Default: 30 hari terakhir
  const endDate = searchParams.end || new Date().toISOString().split('T')[0];
  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() - 30);
  const startDate = searchParams.start || defaultStart.toISOString().split('T')[0];

  const { data: result } = await supabase.rpc('get_screener_v3', {
    p_start_date: startDate,
    p_end_date: endDate,
    p_mode: mode,
    p_min_avg_value: 1000000000, // 1M
    p_min_price: 0,
    p_min_signals: 1,
    p_min_turnover: 0.5,
    p_price_context: priceContext,
    p_limit: 100
  });

  const stocks = (result as any)?.stocks || [];
  const totalCount = (result as any)?.totalCount || 0;

  return (
    <ScreenerClientV3 
      initialStocks={stocks}
      totalCount={totalCount}
      defaultMode={mode}
      defaultContext={priceContext}
      startDate={startDate}
      endDate={endDate}
    />
  );
}
