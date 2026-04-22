// components/StockChart.tsx
'use client';

import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface ChartData {
  trading_date: string;
  close: number;
  volume: number;
}

export default function StockChart({ data }: { data: ChartData[] }) {
  // Format angka untuk Tooltip
  const formatRupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;
  const formatVolume = (value: number) => `${(value / 1e6).toFixed(1)}M Lembar`;

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          
          <XAxis 
            dataKey="trading_date" 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickMargin={10}
          />
          
          {/* Axis Kiri untuk Harga (Line) */}
          <YAxis 
            yAxisId="left" 
            tickFormatter={(val) => val.toLocaleString('id-ID')}
            domain={['auto', 'auto']}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          
          {/* Axis Kanan untuk Volume (Bar) */}
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            tickFormatter={(val) => `${(val / 1e6).toFixed(0)}M`}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />

          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value: number, name: string) => {
              if (name === 'Harga') return [formatRupiah(value), name];
              if (name === 'Volume') return [formatVolume(value), name];
              return [value, name];
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />

          {/* Bar Chart untuk Volume diletakkan di belakang (opacity rendah) */}
          <Bar 
            yAxisId="right" 
            dataKey="volume" 
            name="Volume" 
            fill="#bfdbfe" 
            opacity={0.6} 
            radius={[4, 4, 0, 0]}
          />
          
          {/* Line Chart untuk Harga diletakkan di depan */}
          <Line 
            yAxisId="left" 
            type="monotone" 
            dataKey="close" 
            name="Harga" 
            stroke="#2563eb" 
            strokeWidth={3} 
            dot={false}
            activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }} 
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
