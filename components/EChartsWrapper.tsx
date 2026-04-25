// =============================================
// components/EChartsWrapper.tsx
// Wrapper untuk ECharts di Next.js
// =============================================
'use client';

import ReactECharts from 'echarts-for-react';
import { useEffect, useRef } from 'react';

interface EChartsWrapperProps {
  option: any;
  height?: number | string;
  theme?: 'light' | 'dark';
  onChartReady?: (chart: any) => void;
  group?: string;
}

export default function EChartsWrapper({ option, height = 500, theme = 'light', onChartReady, group }: EChartsWrapperProps) {
  const chartRef = useRef<any>(null);

  // Handle chart ready
  const handleChartReady = (echarts: any) => {
    const chart = echarts.getEchartsInstance();
    if (group) {
      chart.group = group;
    }
    if (onChartReady) {
      onChartReady(chart);
    }
  };

  return (
    <ReactECharts
      ref={chartRef}
      option={option}
      style={{ height: typeof height === 'number' ? `${height}px` : height, width: '100%' }}
      theme={theme}
      onChartReady={handleChartReady}
      opts={{ renderer: 'canvas' }}
    />
  );
}
