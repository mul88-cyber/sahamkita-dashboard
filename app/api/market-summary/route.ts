import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // 1. Top gainer hari ini (terbaru)
    const { data: latestDate } = await supabase
      .from('daily_transactions')
      .select('trading_date')
      .order('trading_date', { ascending: false })
      .limit(1)
      .single();

    // 2. Data untuk top gainer/loser
    const { data: dailyData } = await supabase
      .from('daily_transactions')
      .select('stock_code, close, change_percent, volume, sector')
      .eq('trading_date', latestDate?.trading_date)
      .not('change_percent', 'is', null);

    if (!dailyData) {
      return NextResponse.json({ error: 'No data' }, { status: 404 });
    }

    // Top gainer (change_percent tertinggi)
    const topGainer = [...dailyData]
      .sort((a, b) => b.change_percent - a.change_percent)
      .slice(0, 5);

    // Top loser (change_percent terendah)
    const topLoser = [...dailyData]
      .sort((a, b) => a.change_percent - b.change_percent)
      .slice(0, 5);

    // Top volume
    const topVolume = [...dailyData]
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5);

    // 3. Net foreign flow agregat
    const { data: foreignData } = await supabase
      .from('daily_transactions')
      .select('trading_date, net_foreign_flow')
      .eq('trading_date', latestDate?.trading_date);

    const totalNetForeign = foreignData?.reduce((sum, row) => 
      sum + (row.net_foreign_flow || 0), 0) || 0;

    // 4. Bandarmology watchlist (Big Player Anomaly)
    const { data: anomalyData } = await supabase
      .from('daily_transactions')
      .select('stock_code, avg_order_volume, ma50_avg_order_volume, final_signal, close')
      .eq('trading_date', latestDate?.trading_date)
      .eq('big_player_anomaly', true)
      .limit(10);

    return NextResponse.json({
      success: true,
      data: {
        last_date: latestDate?.trading_date,
        top_gainer: topGainer,
        top_loser: topLoser,
        top_volume: topVolume,
        total_net_foreign: totalNetForeign,
        bandarmology_watchlist: anomalyData || [],
        market_count: dailyData.length
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
