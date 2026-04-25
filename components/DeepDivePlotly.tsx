// =============================================
// components/DeepDivePlotly.tsx
// 4 Panel Chart dengan Plotly (Seperti Streamlit)
// =============================================
'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

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
}

interface Props {
  data: DeepDiveData[];
}

export default function DeepDivePlotly({ data }: Props) {
  
  const dates = useMemo(() => data.map(d => d.time), [data]);

  // Whale markers
  const whaleX = useMemo(() => data.filter(d => d.whale_signal).map(d => d.time), [data]);
  const whaleY = useMemo(() => data.filter(d => d.whale_signal).map(d => d.high * 1.03), [data]);

  // Split markers
  const splitX = useMemo(() => data.filter(d => d.split_signal).map(d => d.time), [data]);
  const splitY = useMemo(() => data.filter(d => d.split_signal).map(d => d.low * 0.97), [data]);

  // Volume colors
  const volColors = useMemo(() => data.map(d => 
    d.close >= d.open ? '#26a69a66' : '#ef535066'
  ), [data]);

  // Foreign colors
  const foreignColors = useMemo(() => data.map(d => 
    (d.net_foreign_value || d.net_foreign_flow || 0) >= 0 ? '#26a69a' : '#ef5350'
  ), [data]);

  return (
    <Plot
      data={[
        // Panel 1: Candlestick
        {
          type: 'candlestick',
          x: dates,
          open: data.map(d => d.open),
          high: data.map(d => d.high),
          low: data.map(d => d.low),
          close: data.map(d => d.close),
          increasing: { line: { color: '#26a69a' } },
          decreasing: { line: { color: '#ef5350' } },
          name: 'Price',
          xaxis: 'x',
          yaxis: 'y',
        } as any,
        // VWMA 20D
        {
          type: 'scatter',
          x: dates,
          y: data.map(d => d.vwma_20d || d.close),
          mode: 'lines',
          line: { color: '#2962ff', width: 2, dash: 'dot' },
          name: 'VWMA 20D',
          xaxis: 'x',
          yaxis: 'y',
        } as any,
        // Whale Markers
        ...(whaleX.length > 0 ? [{
          type: 'scatter',
          x: whaleX,
          y: whaleY,
          mode: 'markers',
          marker: { symbol: 'triangle-down', size: 14, color: '#00cc00', line: { width: 1, color: 'black' } },
          name: '🐋 Whale',
          xaxis: 'x',
          yaxis: 'y',
        } as any] : []),
        // Split Markers
        ...(splitX.length > 0 ? [{
          type: 'scatter',
          x: splitX,
          y: splitY,
          mode: 'markers',
          marker: { symbol: 'triangle-up', size: 14, color: '#ff4444', line: { width: 1, color: 'black' } },
          name: '⚡ Split',
          xaxis: 'x',
          yaxis: 'y',
        } as any] : []),
        // Panel 2: AOVol Ratio
        {
          type: 'scatter',
          x: dates,
          y: data.map(d => d.aov_ratio || 1),
          mode: 'lines',
          line: { color: '#9c88ff', width: 2 },
          fill: 'tozeroy',
          fillcolor: 'rgba(156, 136, 255, 0.15)',
          name: 'AOVol Ratio',
          xaxis: 'x2',
          yaxis: 'y2',
        } as any,
        // Panel 3: Volume
        {
          type: 'bar',
          x: dates,
          y: data.map(d => d.volume / 1e6),
          marker: { color: volColors },
          name: 'Volume (Jt)',
          xaxis: 'x3',
          yaxis: 'y3',
        } as any,
        // Panel 4: Foreign Flow
        {
          type: 'bar',
          x: dates,
          y: data.map(d => (d.net_foreign_value || d.net_foreign_flow || 0) / 1e9),
          marker: { color: foreignColors },
          name: 'Foreign (B)',
          xaxis: 'x4',
          yaxis: 'y4',
        } as any,
      ]}
      layout={{
        height: 850,
        grid: { rows: 4, columns: 1, roworder: 'top to bottom', pattern: 'independent' },
        hovermode: 'x unified',
        showlegend: false,
        margin: { t: 20, b: 30, l: 50, r: 10 },
        xaxis: { type: 'category', showticklabels: false },
        xaxis2: { type: 'category', showticklabels: false },
        xaxis3: { type: 'category', showticklabels: false },
        xaxis4: { type: 'category', tickangle: -45, nticks: 20 },
      }}
      config={{
        responsive: true,
        displayModeBar: false,
        scrollZoom: true,
      }}
      useResizeHandler={true}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
