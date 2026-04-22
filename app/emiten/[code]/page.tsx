'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Shareholder {
  INVESTOR_NAME: string;
  INVESTOR_TYPE: string;
  LOCAL_FOREIGN: string;
  PERCENTAGE: number;
  TOTAL_HOLDING_SHARES: number;
}

interface EmitenInfo {
  ISSUER_NAME: string;
  Sector: string;
  Free_Float: number;
}

export default function EmitenDetail() {
  const { code } = useParams();
  const [shareholders, setShareholders] = useState<Shareholder[]>([]);
  const [emitenInfo, setEmitenInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      const { data: holders, error } = await supabase
        .from('shareholders')
        .select('INVESTOR_NAME, INVESTOR_TYPE, LOCAL_FOREIGN, PERCENTAGE, TOTAL_HOLDING_SHARES')
        .eq('SHARE_CODE', code)
        .order('PERCENTAGE', { ascending: false });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      const { data: info } = await supabase
        .from('shareholders')
        .select('ISSUER_NAME, Sector, "Free Float"')
        .eq('SHARE_CODE', code)
        .limit(1);

      setShareholders(holders || []);
      if (info && info[0]) {
        setEmitenInfo(info[0]);
      }
      setLoading(false);
    }

    if (code) fetchData();
  }, [code]);

  const totalAsing = shareholders.reduce((sum, s) => sum + (s.LOCAL_FOREIGN === 'F' ? s.PERCENTAGE : 0), 0);
  const totalDomestik = shareholders.reduce((sum, s) => sum + (s.LOCAL_FOREIGN === 'D' ? s.PERCENTAGE : 0), 0);
  const top10 = shareholders.slice(0, 10);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="text-blue-600 hover:underline mb-2 inline-block">
            ← Kembali ke Dashboard
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{code}</h1>
            <p className="text-gray-500">{emitenInfo?.ISSUER_NAME}</p>
            <div className="flex gap-4 mt-2 text-sm">
              <span className="px-2 py-1 bg-gray-100 rounded">{emitenInfo?.Sector}</span>
              <span className="px-2 py-1 bg-gray-100 rounded">Free Float: {emitenInfo?.['Free Float']}%</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-gray-500 text-sm">Total Pemegang Saham</div>
            <div className="text-3xl font-bold text-gray-800">{shareholders.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-gray-500 text-sm">Kepemilikan Domestik</div>
            <div className="text-3xl font-bold text-green-600">{totalDomestik.toFixed(1)}%</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-gray-500 text-sm">Kepemilikan Asing</div>
            <div className="text-3xl font-bold text-blue-600">{totalAsing.toFixed(1)}%</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold text-gray-800">🌍 Komposisi Kepemilikan</h2>
          </div>
          <div className="p-4">
            <div className="flex h-8 rounded-full overflow-hidden">
              <div 
                className="bg-green-500 text-center text-xs text-white leading-8"
                style={{ width: `${totalDomestik}%` }}
              >
                {totalDomestik > 5 ? `${totalDomestik.toFixed(0)}%` : ''}
              </div>
              <div 
                className="bg-blue-500 text-center text-xs text-white leading-8"
                style={{ width: `${totalAsing}%` }}
              >
                {totalAsing > 5 ? `${totalAsing.toFixed(0)}%` : ''}
              </div>
            </div>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Domestik ({totalDomestik.toFixed(1)}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Asing ({totalAsing.toFixed(1)}%)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold text-gray-800">🏆 Top 10 Pemegang Saham</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">#</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Nama Investor</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Tipe</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Asing</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">% Saham</th>
                </tr>
              </thead>
              <tbody>
                {top10.map((holder, idx) => (
                  <tr key={holder.INVESTOR_NAME} className="border-t">
                    <td className="px-4 py-2 text-sm text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-800">{holder.INVESTOR_NAME}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{holder.INVESTOR_TYPE}</td>
                    <td className="px-4 py-2 text-sm text-right">
                      {holder.LOCAL_FOREIGN === 'F' ? (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">Asing</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">Domestik</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-right font-semibold">{holder.PERCENTAGE.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold text-gray-800">📊 Visualisasi Top 10</h2>
          </div>
          <div className="p-4 space-y-3">
            {top10.map((holder) => (
              <div key={holder.INVESTOR_NAME}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="truncate max-w-[200px]">{holder.INVESTOR_NAME}</span>
                  <span className="font-medium">{holder.PERCENTAGE.toFixed(2)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${holder.LOCAL_FOREIGN === 'F' ? 'bg-blue-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(holder.PERCENTAGE, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
