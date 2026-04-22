import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '90');
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    // Ambil data harian
    const { data: daily, error } = await supabase
      .from('daily_transactions')
      .select('*')
      .eq('stock_code', code)
      .gte('trading_date', startDateStr)
      .order('trading_date', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Ambil info emiten dari shareholders
    const { data: info } = await supabase
      .from('shareholders')
      .select('issuer_name, sector')
      .eq('share_code', code)
      .limit(1);

    return NextResponse.json({
      success: true,
      data: {
        stock_code: code,
        issuer_name: info?.[0]?.issuer_name || code,
        sector: info?.[0]?.sector || 'Unknown',
        daily: daily || [],
        total_days: daily?.length || 0
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
