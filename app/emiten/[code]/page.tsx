// =============================================
// app/emiten/[kode]/page.tsx
// VERSI DEBUG - Menampilkan error detail
// =============================================
import { supabase } from '@/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import StockChart from '@/components/StockChart';

export const dynamic = 'force-dynamic'; // Disable cache untuk debug

export default async function EmitenDetail({ 
  params 
}: { 
  params: { kode: string } 
}) {
  const stockCode = params.kode.toUpperCase();
  
  try {
    // DEBUG: Log untuk cek parameter
    console.log('DEBUG: Mencari saham:', stockCode);
    
    // Cek apakah tabel ada
    const { data: tableCheck, error: tableError } = await supabase
      .from('daily_transactions')
      .select('count')
      .limit(1);
    
    if (tableError) {
      console.error('Table error:', tableError);
      throw new Error(`Tabel tidak ditemukan: ${tableError.message}`);
    }
    
    // Fetch data historis
    const { data: historyData, error } = await supabase
      .from('daily_transactions')
      .select('*')
      .eq('stock_code', stockCode)
      .order('trading_date', { ascending: false })
      .limit(30);

    if (error) {
      console.error('Query error:', error);
      throw new Error(`Query error: ${error.message} (Code: ${error.code})`);
    }

    console.log('DEBUG: Data ditemukan:', historyData?.length || 0, 'baris');

    if (!historyData || historyData.length === 0) {
      // Coba cek apakah kode saham ada di database sama sekali
      const { data: anyStock, error: anyError } = await supabase
        .from('daily_transactions')
        .select('stock_code')
        .ilike('stock_code', `%${stockCode}%`)
        .limit(5);
      
      console.log('DEBUG: Pencarian similar:', anyStock);
      
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Saham "{stockCode}" Tidak Ditemukan
            </h2>
            {anyStock && anyStock.length > 0 && (
              <div className="mb-4 text-left">
                <p className="text-gray-600 mb-2">Mungkin maksud Anda:</p>
                <ul className="space-y-1">
                  {anyStock.map(s => (
                    <li key={s.stock_code}>
                      <Link href={`/emiten/${s.stock_code}`} className="text-blue-600 hover:underline">
                        {s.stock_code}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Link
              href="/"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      );
    }

    // Kalau data ada, render normal
    const latestData = historyData[0];
    const chartData = [...historyData].reverse();

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <nav className="text-sm text-gray-500 mb-2">
              <Link href="/" className="hover:text-blue-600">Dashboard</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900 font-medium">{stockCode}</span>
            </nav>
            
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">{stockCode}</h1>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  Rp {latestData.close?.toLocaleString('id-ID') || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6">
          {/* DEBUG: Tampilkan raw data */}
          <div className="bg-yellow-50 p-4 rounded-lg mb-4">
            <p className="font-semibold">🐛 DEBUG INFO:</p>
            <p>Kode: {stockCode}</p>
            <p>Data ditemukan: {historyData.length} baris</p>
            <p>Kolom tersedia: {Object.keys(latestData || {}).join(', ')}</p>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Pergerakan Harga (30 Hari)</h2>
            <StockChart data={chartData} />
          </div>

          <div className="text-center mt-6">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              ← Kembali ke Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
    
  } catch (error) {
    console.error('FATAL ERROR:', error);
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-2xl">
          <div className="text-6xl mb-4">🔥</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Debug Info
          </h2>
          <div className="bg-gray-100 p-4 rounded-lg text-left mb-4">
            <p className="font-mono text-sm">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
            {error instanceof Error && error.stack && (
              <pre className="text-xs mt-2 overflow-auto max-h-60">
                {error.stack}
              </pre>
            )}
          </div>
          <p className="text-gray-600 mb-4">
            Kode saham: <strong>{params.kode}</strong>
          </p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Coba Lagi
            </button>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

// Metadata sementara
export async function generateMetadata({ params }: { params: { kode: string } }) {
  return {
    title: `${params.kode.toUpperCase()} | SahamKita`,
  };
}
