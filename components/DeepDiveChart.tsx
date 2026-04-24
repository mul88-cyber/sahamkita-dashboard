// =============================================
// components/DeepDiveChart.tsx
// 4 Panel Deep Dive Chart ala Bandarmology V3
// =============================================
'use client';

import { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

interface DeepDiveData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  aov_ratio?: number;
  avg_order_volume?: number;
  ma50_avg_order_volume?: number;
  net_foreign_flow?: number;
  vwma_20d?: number;
  volume_spike?: number;
  whale_signal?: boolean;
  split_signal?: boolean;
  big_player_anomaly?: number;
}

interface DeepDiveChartProps {
  data: DeepDiveData[];
  height?: number;
}

export default function DeepDiveChart({ data, height = 800 }: DeepDiveChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !data.length) return;

    // Cleanup
    while (chartContainerRef.current?.firstChild) {
      chartContainerRef.current.removeChild(chartContainerRef.current.firstChild);
    }

    // Panel Heights
    const panel1Height = height * 0.35;
    const panel2Height = height * 0.20;
    const panel3Height = height * 0.20;
    const panel4Height = height * 0.25;

    // ============================================
    // PANEL 1: PRICE + VWMA + WHALE MARKERS
    // ============================================
    const panel1Container = document.createElement('div');
    panel1Container.style.height = `${panel1Height}px`;
    chartContainerRef.current.appendChild(panel1Container);

    const chart1 = createChart(panel1Container, {
      layout: { background: { type: ColorType.Solid, color: 'white' }, textColor: '#333' },
      width: chartContainerRef.current.clientWidth,
      height: panel1Height,
      grid: { vertLines: { color: '#e5e7eb' }, horzLines: { color: '#e5e7eb' } },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: '#d1d5db' },
      timeScale: { borderColor: '#d1d5db', visible: false },
    });

    // Candlestick
    const candleSeries = chart1.addCandlestickSeries({
      upColor: '#26a69a', downColor: '#ef5350',
      borderUpColor: '#26a69a', borderDownColor: '#ef5350',
      wickUpColor: '#26a69a', wickDownColor: '#ef5350',
    });
    candleSeries.setData(data);

    // VWMA 20D Line
    if (data[0]?.vwma_20d !== undefined) {
      const vwmaSeries = chart1.addLineSeries({
        color: '#2962ff', lineWidth: 2, lineStyle: 2,
        title: 'VWMA 20D', priceScaleId: 'right',
      });
      vwmaSeries.setData(data.map(d => ({ time: d.time, value: d.vwma_20d || d.close })));
    }

    // 🐋 Whale Signal Markers
    const whaleData = data.filter(d => d.whale_signal);
    if (whaleData.length > 0) {
      const whaleMarkers = chart1.addLineSeries({
        color: '#00cc00', lineVisible: false, lastValueVisible: false,
        priceLineVisible: false, title: '🐋 Whale',
      });
      whaleMarkers.setData(whaleData.map(d => ({ time: d.time, value: d.high * 1.03 })));
    }

    // ⚡ Split Signal Markers
    const splitData = data.filter(d => d.split_signal);
    if (splitData.length > 0) {
      const splitMarkers = chart1.addLineSeries({
        color: '#ff4444', lineVisible: false, lastValueVisible: false,
        priceLineVisible: false, title: '⚡ Split',
      });
      splitMarkers.setData(splitData.map(d => ({ time: d.time, value: d.low * 0.97 })));
    }

    // ⭐ AOVol Spike Markers
    const spikeData = data.filter(d => (d.aov_ratio || 0) >= 1.5);
    if (spikeData.length > 0) {
      const spikeMarkers = chart1.addLineSeries({
        color: 'rgba(255, 215, 0, 0.9)', lineVisible: false,
        lastValueVisible: false, priceLineVisible: false, title: '⭐ AOVol Spike',
      });
      spikeMarkers.setData(spikeData.map(d => ({ time: d.time, value: d.high * 1.05 })));
    }

    // 💎 Big Player Anomaly Markers
    const anomalyData = data.filter(d => (d.big_player_anomaly || 0) > 3);
    if (anomalyData.length > 0) {
      const anomalyMarkers = chart1.addLineSeries({
        color: 'magenta', lineVisible: false, lastValueVisible: false,
        priceLineVisible: false, title: '💎 BP Anomaly',
      });
      anomalyMarkers.setData(anomalyData.map(d => ({ time: d.time, value: d.low * 0.95 })));
    }

    chart1.timeScale().fitContent();

    // ============================================
    // PANEL 2: AOVOL RATIO TRACKING
    // ============================================
    const panel2Container = document.createElement('div');
    panel2Container.style.height = `${panel2Height}px`;
    chartContainerRef.current.appendChild(panel2Container);

    const chart2 = createChart(panel2Container, {
      layout: { background: { type: ColorType.Solid, color: 'white' }, textColor: '#333' },
      width: chartContainerRef.current.clientWidth,
      height: panel2Height,
      grid: { vertLines: { color: '#e5e7eb' }, horzLines: { color: '#e5e7eb' } },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: '#d1d5db' },
      timeScale: { borderColor: '#d1d5db', visible: false },
    });

    if (data[0]?.aov_ratio !== undefined) {
      const aovSeries = chart2.addLineSeries({
        color: '#9c88ff', lineWidth: 2, title: 'AOVol Ratio',
      });
      aovSeries.setData(data.map(d => ({
        time: d.time,
        value: d.aov_ratio || 1,
        customData: {
          avgOrder: d.avg_order_volume || 0,
          ma50: d.ma50_avg_order_volume || 0,
        },
      })));

      // Reference lines
      aovSeries.createPriceLine({ price: 1.5, color: '#00cc00', lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: 'Whale 1.5x' });
      aovSeries.createPriceLine({ price: 0.6, color: '#ff4444', lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: 'Retail 0.6x' });
    }

    chart2.timeScale().fitContent();

    // ============================================
    // PANEL 3: VOLUME + TURNOVER
    // ============================================
    const panel3Container = document.createElement('div');
    panel3Container.style.height = `${panel3Height}px`;
    chartContainerRef.current.appendChild(panel3Container);

    const chart3 = createChart(panel3Container, {
      layout: { background: { type: ColorType.Solid, color: 'white' }, textColor: '#333' },
      width: chartContainerRef.current.clientWidth,
      height: panel3Height,
      grid: { vertLines: { color: '#e5e7eb' }, horzLines: { color: '#e5e7eb' } },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: '#d1d5db' },
      timeScale: { borderColor: '#d1d5db', visible: false },
    });

    const volumeSeries = chart3.addHistogramSeries({
      priceFormat: { type: 'volume' },
      title: 'Volume',
    });
    volumeSeries.setData(data.map(d => ({
      time: d.time,
      value: d.volume || 0,
      color: d.close >= d.open ? '#26a69a66' : '#ef535066',
    })));

    chart3.timeScale().fitContent();

    // ============================================
    // PANEL 4: FOREIGN FLOW
    // ============================================
    const panel4Container = document.createElement('div');
    panel4Container.style.height = `${panel4Height}px`;
    chartContainerRef.current.appendChild(panel4Container);

    const chart4 = createChart(panel4Container, {
      layout: { background: { type: ColorType.Solid, color: 'white' }, textColor: '#333' },
      width: chartContainerRef.current.clientWidth,
      height: panel4Height,
      grid: { vertLines: { color: '#e5e7eb' }, horzLines: { color: '#e5e7eb' } },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: '#d1d5db' },
      timeScale: { borderColor: '#d1d5db', timeVisible: true },
    });

    if (data[0]?.net_foreign_flow !== undefined) {
      const foreignSeries = chart4.addHistogramSeries({
        title: 'Foreign Flow (Lembar)',
      });
      foreignSeries.setData(data.map(d => ({
        time: d.time,
        value: (d.net_foreign_flow || 0) / 1e6,
        color: (d.net_foreign_flow || 0) >= 0 ? '#26a69a' : '#ef5350',
      })));
    }

    chart4.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        const w = chartContainerRef.current.clientWidth;
        chart1.applyOptions({ width: w });
        chart2.applyOptions({ width: w });
        chart3.applyOptions({ width: w });
        chart4.applyOptions({ width: w });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart1.remove();
      chart2.remove();
      chart3.remove();
      chart4.remove();
    };
  }, [data, height]);

  return (
    <div className="w-full">
      <div ref={chartContainerRef} className="w-full" />
      {/* Legend */}
      <div className="flex justify-center gap-4 mt-2 text-[10px] text-gray-400">
        <span>🐋 Whale</span>
        <span>⚡ Split</span>
        <span>⭐ AOVol Spike</span>
        <span>💎 BP Anomaly</span>
        <span>🔵 VWMA 20D</span>
      </div>
    </div>
  );
}
