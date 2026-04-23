// =============================================
// components/LastUpdatedBadge.tsx
// Badge menunjukkan kapan data terakhir diupdate
// =============================================
import { supabase } from '@/supabase';

export const dynamic = 'force-dynamic';

export default async function LastUpdatedBadge() {
  const { data } = await supabase
    .from('daily_transactions')
    .select('trading_date')
    .order('trading_date', { ascending: false })
    .limit(1);

  const lastDate = data?.[0]?.trading_date;
  
  if (!lastDate) return null;

  const formattedDate = new Date(lastDate).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const isToday = new Date(lastDate).toDateString() === new Date().toDateString();
  const isYesterday = new Date(lastDate).toDateString() === new Date(Date.now() - 86400000).toDateString();

  return (
    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
      isToday 
        ? 'bg-green-100 text-green-800' 
        : isYesterday 
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-red-100 text-red-800'
    }`}>
      {isToday ? '🟢 Data Hari Ini' : isYesterday ? '🟡 Data Kemarin' : `🔴 ${formattedDate}`}
    </span>
  );
}
