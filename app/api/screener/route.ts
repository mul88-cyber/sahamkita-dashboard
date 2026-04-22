import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const anomaly = searchParams.get('anomaly') === 'true';
    const signal = searchParams.get('signal');
    const minForeign = parseInt(searchParams.get('minForeign') || '0');
    const sector = searchParams.get('sector');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Ambil tanggal terbaru
    const { data: latestDate } = await supabase
      .from('daily_transactions')
      .select('trading_date')
      .order('trading_date', { ascending: false })
      .limit(1)
      .single();

    let query = supabase
      .from('daily_transactions')
      .select('stock_code, close, change_percent, volume, net_foreign_flow, big_player_anomaly, final_signal, sector')
      .eq('trading_date', latestDate?.trading_date);

    if (anomaly) {
      query = query.eq('big_player_anomaly', true);
    }
    if (signal && signal !== 'all') {
      query = query.eq('final_signal', signal);
    }
    if (sector && sector !== 'all') {
      query = query.eq('sector', sector);
    }
    if (minForeign > 0) {
      query = query.gte('net_foreign_flow', minForeign);
    }

    const { data, error } = await query.limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Ambil daftar sektor unik untuk filter
    const { data: sectors } = await supabase
      .from('daily_transactions')
      .select('sector')
      .not('sector', 'is', null)
      .eq('trading_date', latestDate?.trading_date);

    const uniqueSectors = [...new Set(sectors?.map(s => s.sector) || [])];

    return NextResponse.json({
      success: true,
      data: {
        stocks: data || [],
        sectors: uniqueSectors,
        total: data?.length || 0,
        last_date: latestDate?.trading_date
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
