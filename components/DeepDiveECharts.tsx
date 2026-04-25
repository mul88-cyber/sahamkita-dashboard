// =============================================
// components/DeepDiveECharts.tsx
// 4 Panel Linked Chart dengan ECharts
// =============================================
'use client';

import { useMemo, useRef, useEffect } from 'react';
import EChartsWrapper from '@/components/EChartsWrapper';

interface DeepDiveData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  aov_ratio?: number;
  net_foreign_value?: number;
  net_foreign_flow?: number;
  vwma_20d?: number;
  whale_signal?: boolean;
  split_signal?: boolean;
  big_player_anomaly?: number;
}

interface Props {
  data: DeepDiveData[];
}

export default function DeepDiveECharts({ data }: Props) {
  const groupId = useRef(`chart-group-${Math.random().toString(36).substr(2, 9)}`).current;

  const dates = useMemo(() => data.map(d => d.time), [data]);
  const closes = useMemo(() => data.map(d => d.close), [data]);
  const opens = useMemo(() => data.map(d => d.open), [data]);
  const highs = useMemo(() => data.map(d => d.high), [data]);
  const lows = useMemo(() => data.map(d => d.low), [data]);
  const volumes = useMemo(() => data.map(d => d.volume), [data]);
  const aovRatios = useMemo(() => data.map(d => d.aov_ratio || 1), [data]);
  const foreignFlows = useMemo(() => data.map(d => (d.net_foreign_value || d.net_foreign_flow || 0) / 1e9), [data]);
  const vwmaData = useMemo(() => data.map(d => d.vwma_20d || d.close), [data]);

  // Whale markers
  const whaleMarkers = useMemo(() => data
    .map((d, i) => d.whale_signal ? { coord: [dates[i], highs[i] * 1.03], value: '🐋' } : null)
    .filter(Boolean), [data, dates, highs]);

  // Split markers
  const splitMarkers = useMemo(() => data
    .map((d, i) => d.split_signal ? { coord: [dates[i], lows[i] * 0.97], value: '⚡' } : null)
    .filter(Boolean), [data, dates, lows]);

  // Volume colors
  const volumeColors = useMemo(() => data.map((d, i) => 
    closes[i] >= opens[i] ? '#26a69a' : '#ef5350'
  ), [data, closes, opens]);

  // Foreign colors
  const foreignColors = useMemo(() => foreignFlows.map(v => 
    v >= 0 ? '#26a69a' : '#ef5350'
  ), [foreignFlows]);

  // Panel 1: Candlestick
  const candleOption = useMemo(() => ({
    grid: { left: '8%', right: '3%', top: 10, bottom: 0 },
    xAxis: { type: 'category', data: dates, show: false },
    yAxis: { type: 'value', scale: true },
    series: [
      {
        type: 'candlestick',
        data: data.map((d, i) => [opens[i], closes[i], lows[i], highs[i]]),
        itemStyle: { color: '#26a69a', color0: '#ef5350', borderColor: '#26a69a', borderColor0: '#ef5350' },
      },
      {
        type: 'line',
        data: vwmaData,
        smooth: true,
        lineStyle: { color: '#2962ff', width: 1.5, type: 'dashed' },
        symbol: 'none',
        name: 'VWMA 20D',
      },
      ...(whaleMarkers.length > 0 ? [{
        type: 'scatter',
        data: whaleMarkers,
        symbolSize: 20,
        itemStyle: { color: '#00cc00' },
        name: '🐋 Whale',
      }] : []),
      ...(splitMarkers.length > 0 ? [{
        type: 'scatter',
        data: splitMarkers,
        symbolSize: 20,
        itemStyle: { color: '#ff4444' },
        name: '⚡ Split',
      }] : []),
    ],
    tooltip: { trigger: 'axis' },
  }), [data, dates, opens, closes, highs, lows, vwmaData, whaleMarkers, splitMarkers]);

  // Panel 2: AOVol Ratio
  const aovOption = useMemo(() => ({
    grid: { left: '8%', right: '3%', top: 10, bottom: 0 },
    xAxis: { type: 'category', data: dates, show: false },
    yAxis: { type: 'value', name: 'AOV (x)' },
    series: [
      {
        type: 'line',
        data: aovRatios,
        lineStyle: { color: '#9c88ff', width: 2 },
        areaStyle: { color: 'rgba(156, 136, 255, 0.1)' },
        symbol: 'none',
        markLine: {
          silent: true,
          data: [
            { yAxis: 1.5, lineStyle: { color: '#00cc00', type: 'dashed' }, label: { formatter: 'Whale 1.5x' } },
            { yAxis: 0.6, lineStyle: { color: '#ff4444', type: 'dashed' }, label: { formatter: 'Retail 0.6x' } },
          ],
        },
      },
    ],
    tooltip: { trigger: 'axis' },
  }), [dates, aovRatios]);

  // Panel 3: Volume
  const volumeOption = useMemo(() => ({
    grid: { left: '8%', right: '3%', top: 10, bottom: 0 },
    xAxis: { type: 'category', data: dates, show: false },
    yAxis: { type: 'value', name: 'Vol (Jt)' },
    series: [{
      type: 'bar',
      data: volumes.map((v, i) => ({ value: v / 1e6, itemStyle: { color: volumeColors[i] } })),
    }],
    tooltip: { trigger: 'axis' },
  }), [dates, volumes, volumeColors]);

  // Panel 4: Foreign Flow
  const foreignOption = useMemo(() => ({
    grid: { left: '8%', right: '3%', top: 10, bottom: '10%' },
    xAxis: { type: 'category', data: dates, axisLabel: { rotate: 45, fontSize: 10 } },
    yAxis: { type: 'value', name: 'Foreign (B)' },
    series: [{
      type: 'bar',
      data: foreignFlows.map((v, i) => ({ value: v, itemStyle: { color: foreignColors[i] } })),
    }],
    tooltip: { trigger: 'axis' },
  }), [dates, foreignFlows, foreignColors]);

  // Handle linked zoom
  const chartRefs = useRef<any[]>([]);

  useEffect(() => {
    if (chartRefs.current.length >= 4) {
      const [c1, c2, c3, c4] = chartRefs.current;
      if (c1 && c2 && c3 && c4) {
        const groupIdStr = groupId;
        c1.group = groupIdStr;
        c2.group = groupIdStr;
        c3.group = groupIdStr;
        c4.group = groupIdStr;
        
        // Connect charts
        try { c1.connect([c2, c3, c4]); } catch(e) {}
      }
    }
  }, [groupId]);

  return (
    <div className="space-y-0">
      <div className="border-b dark:border-gray-700">
        <EChartsWrapper 
          option={candleOption} 
          height={280} 
          theme="light"
          group={groupId}
          onChartReady={(chart) => { chartRefs.current[0] = chart; }}
        />
      </div>
      <div className="border-b dark:border-gray-700">
        <EChartsWrapper 
          option={aovOption} 
          height={160} 
          theme="light"
          group={groupId}
          onChartReady={(chart) => { chartRefs.current[1] = chart; }}
        />
      </div>
      <div className="border-b dark:border-gray-700">
        <EChartsWrapper 
          option={volumeOption} 
          height={160} 
          theme="light"
          group={groupId}
          onChartReady={(chart) => { chartRefs.current[2] = chart; }}
        />
      </div>
      <div>
        <EChartsWrapper 
          option={foreignOption} 
          height={200} 
          theme="light"
          group={groupId}
          onChartReady={(chart) => { chartRefs.current[3] = chart; }}
        />
      </div>
    </div>
  );
}
