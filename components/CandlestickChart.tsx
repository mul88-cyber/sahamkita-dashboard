// =============================================
// components/CandlestickChart.tsx
// Candlestick Chart dengan Lightweight Charts
// + VWMA 20D & Typical Price Overlay
// =============================================
'use client';

import { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi } from 'lightweight-charts';

interface CandlestickData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  typical_price?: number;   // 🆕
  vwma_20d?: number;        // 🆕
}

interface CandlestickChartProps {
  data: CandlestickData[];
  height?: number;
  showVolume?: boolean;
}

export default function CandlestickChart({ 
  data, 
  height = 500, 
  showVolume = true 
}: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !data.length) return;

    // Cleanup previous chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'white' },
        textColor: '#333',
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
      grid: {
        vertLines: { color: '#e5e7eb' },
        horzLines: { color: '#e5e7eb' },
      },
      crosshair: {
        mode: 1,
        vertLine: { width: 1, color: '#3b82f6', style: 3 },
        horzLine: { width: 1, color: '#3b82f6', style: 3 },
      },
      rightPriceScale: { borderColor: '#d1d5db' },
      timeScale: { borderColor: '#d1d5db', timeVisible: true },
    });

    chartRef.current = chart;

    // ============================================
    // 1. CANDLESTICK SERIES
    // ============================================
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#00cc00',
      downColor: '#ff4444',
      borderDownColor: '#ff4444',
      borderUpColor: '#00cc00',
      wickDownColor: '#ff4444',
      wickUpColor: '#00cc00',
    });

    candlestickSeries.setData(data);

    // ============================================
    // 🆕 AOVol SPIKES MARKERS (BINTANG EMAS)
    // ============================================
    const spikeData = data.filter((item: any) => (item.aov_ratio || 0) >= 1.5);
    
    if (spikeData.length > 0) {
      const markers = chart.addLineSeries({
        color: 'rgba(255, 215, 0, 0.9)',
        lineWidth: 0,
        lastValueVisible: false,
        priceLineVisible: false,
        title: '⭐ AOVol Spike',
      });
      
      markers.setData(spikeData.map((item: any) => ({
        time: item.time,
        value: item.high * 1.03,
      })));
    }

    // Fit content
    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [data, height, showVolume]);

  return (
    <div className="w-full">
      <div ref={chartContainerRef} className="w-full" style={{ height: `${height}px` }} />
      {/* Legend */}
      <div className="flex justify-center gap-6 mt-2 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-4 h-0.5 bg-blue-500 border-dashed border-t-2"></div>
          <span>Typical Price</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-0.5 bg-orange-500"></div>
          <span>VWMA 20D</span>
        </div>
      </div>
    </div>
  );
}
