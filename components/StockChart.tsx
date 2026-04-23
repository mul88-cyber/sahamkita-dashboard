// =============================================
// components/StockChart.tsx
// Komponen grafik menggunakan Recharts
// =============================================
'use client';

import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Area
} from 'recharts';

interface ChartData {
  trading_date: string;
  close: number;
  volume: number;
  change_percent?: number;
}

interface StockChartProps {
  data: ChartData[];
}

export default function StockChart({ data }: StockChartProps) {
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;
    
    const dateStr = payload[0]?.payload?.trading_date;
    const date = dateStr ? new Date(dateStr) : new Date();
    
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border">
        <p className="font-semibold text-gray-900 mb-2">
          {date.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </p>
        <div className="space-y-1 text-sm">
          <p className="text-blue-600 font-medium">
            💰 Harga: Rp {payload[0]?.value?.toLocaleString('id-ID')}
          </p>
          <p className="text-gray-600">
            📊 Volume: {(payload[1]?.value / 1_000_000).toFixed(2)}M lembar
          </p>
          {payload[0]?.payload?.change_percent !== undefined && (
            <p className={payload[0].payload.change_percent >= 0 ? 'text-green-600' : 'text-red-600'}>
              {payload[0].payload.change_percent >= 0 ? '📈' : '📉'} 
              {' '}{payload[0].payload.change_percent > 0 ? '+' : ''}
              {payload[0].payload.change_percent}%
            </p>
          )}
        </div>
      </div>
    );
  };

  const formatXAxis = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const formatPrice = (value: number) => {
    if (value >= 10000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toLocaleString('id-ID');
  };

  const formatVolume = (value: number) => {
    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(1)}B`;
    }
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(0)}K`;
    }
    return value.toString();
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          
          <XAxis 
            dataKey="trading_date" 
            tickFormatter={formatXAxis}
            fontSize={12}
            tickMargin={10}
          />
          
          <YAxis 
            yAxisId="left" 
            orientation="left" 
            tickFormatter={formatPrice}
            fontSize={12}
            domain={['auto', 'auto']}
          />
          
          <YAxis 
            yAxisId="right" 
            orientation="right"
            tickFormatter={formatVolume}
            fontSize={12}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Legend 
            verticalAlign="top" 
            height={36}
            formatter={(value) => {
              return <span className="text-sm text-gray-700">{value}</span>;
            }}
          />
          
          <Bar 
            yAxisId="right" 
            dataKey="volume" 
            fill="#93c5fd" 
            opacity={0.6} 
            name="Volume"
            barSize={20}
          />
          
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="close"
            fill="url(#colorPrice)"
            stroke="#2563eb"
            strokeWidth={2}
            name="Harga"
            dot={false}
            activeDot={{ r: 6, fill: '#2563eb' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
