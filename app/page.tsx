'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface EmitenSummary {
  share_code: string;
  issuer_name: string;
  sector: string;
  foreign_ownership: number;
  total_holders: number;
}

export default function Dashboard() {
  const [emitenList, setEmitenList] = useState<EmitenSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalEmiten: 0, totalInvestor: 0, avgForeign: 0 });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      // Ambil daftar emiten unik beserta ringkasannya
      const { data: shareholders, error } = await supabase
        .from('shareholders')
        .select('share_code, issuer_name, sector, percentage, is_foreign')
        .eq('period', '27-Feb-26');

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      // Proses data untuk summary per emiten
      const emitenMap = new Map<string, EmitenSummary>();
      const investorSet = new Set<string>();

      shareholders?.forEach(row => {
        investorSet.add(row.investor_name);
        
        if (!emitenMap.has(row.share_code)) {
          emitenMap.set(row.share_code, {
            share_code: row.share_code,
            issuer_name: row.issuer_name,
            sector: row.sector,
            foreign_ownership: 0,
            total_holders: 0,
          });
        }
        
        const emiten = emitenMap.get(row.share_code)!;
        emiten.total_holders++;
        if (row.is_foreign) {
          emiten.foreign_ownership += row.percentage;
        }
      });

      const emitenArray = Array.from(emitenMap.values());
      emitenArray.sort((a, b) => b.foreign_ownership - a.foreign_ownership);
      
      setEmitenList(emitenArray);
      setStats({
        totalEmiten: emitenArray.length,
        totalInvestor: investorSet.size,
        avgForeign: emitenArray.reduce((sum, e) => sum + e.foreign_ownership, 0) / emitenArray.length,
      });
      setLoading(false);
    }

    fetchData();
  }, []);

  const filteredEmiten = emitenList.filter(e => 
    e.share_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.issuer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-2xl font-bold text-blue-600">📊 SahamKita</h1>
            <div className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="Cari kode saham atau nama perusahaan..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-gray-500 text-sm">Total Emiten</div>
            <div className="text-3xl font-bold text-gray-800">{stats.totalEmiten}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-gray-500 text-sm">Total Investor Unik</div>
            <div className="text-3xl font-bold text-gray-800">{stats.totalInvestor.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-gray-500 text-sm">Rata-rata Kepemilikan Asing</div>
            <div className="text-3xl font-bold text-gray-800">{stats.avgForeign.toFixed(1)}%</div>
          </div>
        </div>

        {/* Top 5 Foreign Ownership */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold text-gray-800">🌍 Top 5 Emiten dengan Kepemilikan Asing Tertinggi</h2>
          </div>
          <div className="p-4">
            {emitenList.slice(0, 5).map((emiten, idx) => (
              <Link key={emiten.share_code} href={`/emiten/${emiten.share_code}`}>
                <div className="flex items-center justify-between py-2 border-b last:border-0 cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 w-6">{idx + 1}</span>
                    <div>
                      <div className="font-medium text-gray-800">{emiten.share_code}</div>
                      <div className="text-xs text-gray-500">{emiten.issuer_name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-blue-600">{emiten.foreign_ownership.toFixed(1)}%</div>
                    <div className="text-xs text-gray-400">{emiten.sector}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Daftar Semua Emiten */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold text-gray-800">📋 Daftar Emiten</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Kode</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Nama Perusahaan</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Sektor</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Kepemilikan Asing</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Total Pemegang</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmiten.map((emiten) => (
                  <tr key={emiten.share_code} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/emiten/${emiten.share_code}`}>
                    <td className="px-4 py-2 text-sm font-medium text-blue-600">{emiten.share_code}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{emiten.issuer_name}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{emiten.sector}</td>
                    <td className="px-4 py-2 text-sm text-right font-medium">{emiten.foreign_ownership.toFixed(1)}%</td>
                    <td className="px-4 py-2 text-sm text-right text-gray-500">{emiten.total_holders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
