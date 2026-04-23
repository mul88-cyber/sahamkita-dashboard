// =============================================
// app/emiten/[code]/ownership/page.tsx
// Halaman Detail Kepemilikan Saham
// =============================================
import { supabase } from '@/supabase';  // ✅ PERBAIKAN: ganti dari @/lib/supabase
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function OwnershipPage({ params }: { params: { code: string } }) {
  const stockCode = params.code.toUpperCase();
  
  // Fetch ownership summary
  const { data: summaryData } = await supabase.rpc('get_ownership_summary', {
    p_stock_code: stockCode
  });
  
  // Fetch top shareholders
  const { data: shareholders } = await supabase.rpc('get_top_shareholders', {
    p_stock_code: stockCode,
    p_limit: 20
  });
  
  const summary = summaryData as any;
  
  if (summary?.error || !summary) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Data Kepemilikan Tidak Tersedia</h1>
          <p className="text-gray-600 mb-6">Saham {stockCode} belum memiliki data kepemilikan.</p>
          <Link href={`/emiten/${stockCode}`} className="text-blue-600">← Kembali ke Detail</Link>
        </div>
      </div>
    );
  }
  
  const formatPercent = (val: number) => `${val?.toFixed(2)}%`;
  const formatShares = (val: number) => {
    if (val >= 1_000_000_000) return `${(val/1_000_000_000).toFixed(2)}B`;
    if (val >= 1_000_000) return `${(val/1_000_000).toFixed(2)}M`;
    return val?.toLocaleString('id-ID') || '0';
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="text-sm text-gray-500 mb-2">
            <Link href="/" className="hover:text-blue-600">Dashboard</Link>
            <span className="mx-2">/</span>
            <Link href={`/emiten/${stockCode}`} className="hover:text-blue-600">{stockCode}</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Kepemilikan</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">{stockCode} - Struktur Kepemilikan</h1>
          <p className="text-sm text-gray-500">Data per: {summary.report_date}</p>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">🏛️ Institusi</p>
            <p className="text-2xl font-bold text-blue-700">{formatPercent(summary.institutional_pct)}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">👤 Ritel</p>
            <p className="text-2xl font-bold text-green-700">{formatPercent(summary.retail_pct)}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">🌏 Asing</p>
            <p className="text-2xl font-bold text-purple-700">{formatPercent(summary.foreign_pct)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">🇮🇩 Lokal</p>
            <p className="text-2xl font-bold text-gray-700">{formatPercent(summary.local_pct)}</p>
          </div>
        </div>
        
        {/* Top Shareholder */}
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg shadow p-5 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500 mb-1">🏆 Pemilik Terbesar</p>
          <p className="text-xl font-bold">{summary.top_shareholder}</p>
          <p className="text-2xl font-bold text-yellow-700">{formatPercent(summary.top_shareholder_pct)}</p>
          <p className="text-sm text-gray-500 mt-1">{summary.top_shareholder_type}</p>
        </div>
        
        {/* Shareholders Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h3 className="font-semibold">📋 Daftar Pemegang Saham ({'>'}1%)</h3>
            <p className="text-sm text-gray-500">Total: {summary.total_shareholders} pemegang saham</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Investor</th>
                  <th className="px-4 py-3 text-left">Tipe</th>
                  <th className="px-4 py-3 text-center">L/F</th>
                  <th className="px-4 py-3 text-left">Negara</th>
                  <th className="px-4 py-3 text-right">Jumlah Saham</th>
                  <th className="px-4 py-3 text-right">Persentase</th>
                </tr>
              </thead>
              <tbody>
                {(shareholders as any[])?.map((sh, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{sh.investor_name}</td>
                    <td className="px-4 py-3">{sh.investor_type || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        sh.local_foreign === 'F' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {sh.local_foreign === 'F' ? 'Asing' : 'Lokal'}
                      </span>
                    </td>
                    <td className="px-4 py-3">{sh.nationality || '-'}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatShares(sh.total_shares)}</td>
                    <td className="px-4 py-3 text-right font-bold">{formatPercent(sh.percentage)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="text-center">
          <Link href={`/emiten/${stockCode}`} className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg">
            ← Kembali ke Detail Saham
          </Link>
        </div>
      </main>
    </div>
  );
}
