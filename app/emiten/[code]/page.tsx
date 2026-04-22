'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface DailyData {
  trading_date: string;
  close: number;
  high: number;
  low: number;
  volume: number;
  vwma_20d: number;
  net_foreign_flow: number;
  big_player_anomaly: boolean;
  final_signal: string;
  avg_order_volume: number;
  ma50_avg_order_volume: number;
  bid_offer_imbalance: number;
}

export default function EmitenDetail() {
  const { code } = useParams();
  const [daily, setDaily] = useState<DailyData[]>([]);
  const [info, setInfo] = useState({ issuer_name: '', sector: '' });
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(90);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data: dailyData, error } = await supabase
        .from('daily_transactions')
        .select('*')
        .eq('stock_code', code)
        .gte('trading_date', startDate.toISOString().split('T')[0])
        .order('trading_date', { ascending: true });

      if (error) {
        console.error(error);
      }

      const { data: infoData } = await supabase
        .from('shareholders')
        .select('issuer_name, sector')
        .eq('share_code', code)
        .limit(1);

      setDaily(dailyData || []);
      if (infoData && infoData[0]) {
        setInfo({ issuer_name: infoData[0].issuer_name, sector: infoData[0].sector });
      }
      setLoading(false);
    }

    if (code) fetchData();
  }, [code, days]);

  const lastData = daily[daily.length - 1];
  const prevData = daily[daily.length - 2];
  const change = lastData && prevData ? ((lastData.close - prevData.close) / prevData.close * 100) : 0;
  const isAnomaly = daily.some(d => d.big_player_anomaly);

  // Hitung MA20 harga
  const ma20 = daily.slice(-20).reduce((sum, d) => sum + d.close, 0) / Math.min(20, daily.length);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Fungsi untuk membuat chart sederhana (menggunakan div progress bar)
  const maxClose = Math.max(...daily.map(d => d.close), 1);
  const maxVolume = Math.max(...daily.map(d => d.volume), 1);
  const maxForeign = Math.max(...daily.map(d => Math.abs(d.net_foreign_flow || 0)), 1);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Link href="/" className="text-blue-600 hover:underline text-sm">← Kembali</Link>
          <div className="mt-1">
            <h1 className="text-2xl font-bold">{code}</h1>
            <p className="text-gray-500 text-sm">{info.issuer_name}</p>
            <div className="flex gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">{info.sector}</span>
              {isAnomaly && <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded">🔥 Big Player Anomaly</span>}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Price Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-lg shadow p-3">
            <div className="text-gray-500 text-xs">Harga Terkini</div>
            <div className="text-xl font-bold">{lastData?.close?.toLocaleString()}</div>
            <div className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change.toFixed(2)}%
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-3">
            <div className="text-gray-500 text-xs">MA20 Harga</div>
            <div className="text-xl font-bold">{ma20.toFixed(0)}</div>
            <div className={`text-xs ${lastData?.close >= ma20 ? 'text-green-600' : 'text-red-600'}`}>
              {lastData?.close >= ma20 ? 'Above MA20' : 'Below MA20'}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-3">
            <div className="text-gray-500 text-xs">Volume (Hari Ini)</div>
            <div className="text-xl font-bold">{(lastData?.volume / 1e6).toFixed(1)}M</div>
          </div>
          <div className="bg-white rounded-lg shadow p-3">
            <div className="text-gray-500 text-xs">Final Signal</div>
            <div className={`text-xl font-bold ${
              lastData?.final_signal?.includes('Akum') ? 'text-green-600' : 
              lastData?.final_signal?.includes('Distribusi') ? 'text-red-600' : 'text-gray-600'
            }`}>
              {lastData?.final_signal || '-'}
            </div>
          </div>
        </div>

        {/* Price Chart (Simple Bar Chart) */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-4 py-2 border-b flex justify-between items-center">
            <h2 className="font-semibold">📈 Harga vs VWMA 20D</h2>
            <div className="flex gap-2">
              <button onClick={() => setDays(30)} className={`px-2 py-0.5 text-xs rounded ${days === 30 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>1M</button>
              <button onClick={() => setDays(90)} className={`px-2 py-0.5 text-xs rounded ${days === 90 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>3M</button>
              <button onClick={() => setDays(180)} className={`px-2 py-0.5 text-xs rounded ${days === 180 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>6M</button>
              <button onClick={() => setDays(365)} className={`px-2 py-0.5 text-xs rounded ${days === 365 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>1Y</button>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {daily.slice(-Math.min(60, daily.length)).map((d, i) => (
                <div key={d.trading_date} className="flex items-center gap-2 text-xs">
                  <div className="w-20 text-gray-500">{d.trading_date?.slice(5)}</div>
                  <div className="flex-1">
                    <div className="flex h-4">
                      <div className="bg-green-500 h-4" style={{ width: `${(d.close / maxClose) * 100}%` }}></div>
                      <div className="bg-blue-300 h-4" style={{ width: `${((d.vwma_20d || d.close) / maxClose) * 100 - (d.close / maxClose) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="w-16 text-right">{d.close?.toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-2 text-xs">
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500"></div> Harga</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-300"></div> VWMA 20D</div>
            </div>
          </div>
        </div>

        {/* Volume Chart */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-4 py-2 border-b">
            <h2 className="font-semibold">📊 Volume</h2>
          </div>
          <div className="p-4">
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {daily.slice(-Math.min(60, daily.length)).map((d) => (
                <div key={d.trading_date} className="flex items-center gap-2 text-xs">
                  <div className="w-20 text-gray-500">{d.trading_date?.slice(5)}</div>
                  <div className="flex-1">
                    <div className={`h-4 ${d.volume > (d.ma20_volume || 0) * 1.5 ? 'bg-orange-500' : 'bg-gray-400'}`} 
                         style={{ width: `${(d.volume / maxVolume) * 100}%` }}></div>
                  </div>
                  <div className="w-16 text-right">{(d.volume / 1e6).toFixed(1)}M</div>
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-2">*Warna oranye = Volume Spike (>1.5x MA20)</div>
          </div>
        </div>

        {/* Foreign Flow Chart */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-4 py-2 border-b">
            <h2 className="font-semibold">🌏 Net Foreign Flow</h2>
          </div>
          <div className="p-4">
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {daily.slice(-Math.min(60, daily.length)).map((d) => (
                <div key={d.trading_date} className="flex items-center gap-2 text-xs">
                  <div className="w-20 text-gray-500">{d.trading_date?.slice(5)}</div>
                  <div className="flex-1">
                    <div className={`h-4 ${(d.net_foreign_flow || 0) >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                         style={{ width: `${Math.abs(d.net_foreign_flow || 0) / maxForeign * 100}%` }}></div>
                  </div>
                  <div className="w-16 text-right">{(d.net_foreign_flow / 1e6).toFixed(0)}M</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bandarmology Indicators */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-2 border-b">
            <h2 className="font-semibold">🎯 Bandarmology Indicators</h2>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Avg Order Volume vs MA50</span>
                <span className={lastData?.avg_order_volume > (lastData?.ma50_avg_order_volume || 0) * 1.5 ? 'text-orange-600 font-bold' : ''}>
                  {(lastData?.avg_order_volume || 0).toFixed(0)} / {(lastData?.ma50_avg_order_volume || 0).toFixed(0)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min((lastData?.avg_order_volume || 0) / (lastData?.ma50_avg_order_volume || 1) * 100, 100)}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Bid/Offer Imbalance</span>
                <span className={lastData?.bid_offer_imbalance > 0.3 ? 'text-green-600' : lastData?.bid_offer_imbalance < -0.3 ? 'text-red-600' : ''}>
                  {((lastData?.bid_offer_imbalance || 0) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`h-2 rounded-full ${lastData?.bid_offer_imbalance >= 0 ? 'bg-green-500' : 'bg-red-500'}`} 
                     style={{ width: `${Math.abs(lastData?.bid_offer_imbalance || 0) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
