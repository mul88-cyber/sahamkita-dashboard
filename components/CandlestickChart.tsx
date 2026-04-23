// =============================================
// components/CandlestickChart.tsx
// Candlestick Chart dengan Lightweight Charts
// =============================================
'use client';

import { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';

interface CandlestickData {
  time: string;      // Format: YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
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
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

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
        vertLine: {
          width: 1,
          color: '#3b82f6',
          style: 3,
        },
        horzLine: {
          width: 1,
          color: '#3b82f6',
          style: 3,
        },
      },
      rightPriceScale: {
        borderColor: '#d1d5db',
      },
      timeScale: {
        borderColor: '#d1d5db',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Add Candlestick Series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#00cc00',
      downColor: '#ff4444',
      borderDownColor: '#ff4444',
      borderUpColor: '#00cc00',
      wickDownColor: '#ff4444',
      wickUpColor: '#00cc00',
    });
    candlestickSeriesRef.current = candlestickSeries;

    // Format data untuk candlestick
    const candlestickData = data.map(item => ({
      time: item.time,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    }));

    candlestickSeries.setData(candlestickData);

    // Add Volume Series (optional)
    if (showVolume && data[0]?.volume !== undefined) {
      const volumeSeries = chart.addHistogramSeries({
        color: '#93c5fd',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: 'volume',
      });
      volumeSeriesRef.current = volumeSeries;

      // Konfigurasi volume scale
      chart.priceScale('volume').applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      const volumeData = data.map(item => ({
        time: item.time,
        value: item.volume || 0,
        color: item.close >= item.open ? '#00cc3366' : '#ff444466',
      }));

      volumeSeries.setData(volumeData);
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
    </div>
  );
}
