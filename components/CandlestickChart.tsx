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
    // 2. VOLUME SERIES (Optional)
    // ============================================
    if (showVolume && data[0]?.volume !== undefined) {
      const volumeSeries = chart.addHistogramSeries({
        color: '#93c5fd',
        priceFormat: { type: 'volume' },
        priceScaleId: 'volume',
      });

      chart.priceScale('volume').applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      });

      volumeSeries.setData(data.map(item => ({
        time: item.time,
        value: item.volume || 0,
        color: item.close >= item.open ? '#00cc3366' : '#ff444466',
      })));
    }

    // ============================================
    // 3. 🆕 TYPICAL PRICE LINE (Biru Putus-putus)
    // ============================================
    if (data[0]?.typical_price !== undefined) {
      const typicalPriceSeries = chart.addLineSeries({
        color: '#3b82f6',      // Biru
        lineWidth: 1,
        lineStyle: 2,          // Putus-putus
        title: 'Typical Price',
        priceScaleId: 'right',
      });
      
      typicalPriceSeries.setData(data.map(item => ({
        time: item.time,
        value: item.typical_price || (item.high + item.low + item.close) / 3, // Fallback
      })));
    }

    // ============================================
    // 4. 🆕 VWMA 20D LINE (Orange Solid)
    // ============================================
    if (data[0]?.vwma_20d !== undefined) {
      const vwmaSeries = chart.addLineSeries({
        color: '#f59e0b',      // Orange
        lineWidth: 2,
        title: 'VWMA 20D',
        priceScaleId: 'right',
      });
      
      vwmaSeries.setData(data.map(item => ({
        time: item.time,
        value: item.vwma_20d,
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
