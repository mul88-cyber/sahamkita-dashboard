// app/emiten/[kode]/page.tsx
import { supabase } from '@/supabase'; // Sesuaikan path jika berbeda
import Link from 'next/link';
import StockChart from '@/components/StockChart';

// Memastikan data selalu up-to-date
export const dynamic = 'force-dynamic';

export default async function EmitenDetail({ params }: { params: { kode: string } }) {
  const stockCode = params.kode.toUpperCase();

  // Ambil data historis 30 hari perdagangan terakhir untuk saham ini
  const { data: historyData, error } = await supabase
    .from('daily_transactions')
    .select('*')
    .eq('stock_code', stockCode)
    .order('trading_date', { ascending: false })
    .limit(30);

  if (error || !historyData || historyData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Data tidak ditemukan</h1>
        <p className="text-gray-600 mb-6">Emiten {stockCode} belum ada di database.</p>
        <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  // Data terbaru ada di index 0 (karena diurutkan descending)
  const latestData = historyData[0];
  
  // Persiapkan data untuk chart (diurutkan ascending dari tanggal terlama ke terbaru)
  const chartData = [...historyData].reverse();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header navigasi simpel */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-blue-600 font-medium">
            &larr; Kembali
          </Link>
          <h1 className="text-xl font-bold text-blue-600">Detail {stockCode}</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Info Utama Emiten */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{stockCode}</h2>
              <p className="text-gray-500 mt-1">Sektor: {latestData.sector || '-'}</p>
            </div>
            <div className="text-left md:text-right">
              <div className="text-3xl font-bold text-gray-900">
                Rp {latestData.close?.toLocaleString()}
              </div>
              <div className={`text-lg font-semibold mt-1 ${latestData.change_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {latestData.change_percent >= 0 ? '+' : ''}{latestData.change_percent?.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        {/* Grid Analisis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500">
            <div className="text-sm text-gray-500 mb-1">Volume Perdagangan</div>
            <div className="text-xl font-semibold">{(latestData.volume / 1e6).toFixed(2)} Juta Lembar</div>
          </div>
          
          <div className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${latestData.net_foreign_flow >= 0 ? 'border-green-500' : 'border-red-500'}`}>
            <div className="text-sm text-gray-500 mb-1">Net Foreign Flow</div>
            <div className={`text-xl font-semibold ${latestData.net_foreign_flow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Rp {(latestData.net_foreign_flow / 1e9).toFixed(2)} Miliar
            </div>
          </div>

          <div className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${latestData.big_player_anomaly ? 'border-orange-500' : 'border-gray-300'}`}>
            <div className="text-sm text-gray-500 mb-1">Status Bandarmologi</div>
            <div className="text-lg font-semibold flex items-center gap-2">
              {latestData.final_signal}
              {latestData.big_player_anomaly && <span title="Big Player Anomaly">🐳</span>}
            </div>
          </div>
        </div>

        {/* Grafik Interaktif */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Pergerakan Harga & Volume (30 Hari)</h3>
          <StockChart data={chartData} />
        </div>
      </div>
    </div>
  );
}
