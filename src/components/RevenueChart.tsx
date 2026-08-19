'use client';

import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface ChartDataProps {
  data: {
    name: string;
    revenue: number;
  }[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-brand-gray-100 bg-white/90 p-4 shadow-premium backdrop-blur-md">
        <p className="mb-1 text-xs font-bold text-brand-gray-500 uppercase">{label}</p>
        <p className="text-sm font-black text-brand-orange-600">
          {new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
          }).format(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export default function RevenueChart({ data }: ChartDataProps) {
  // Jika semua revenue 0, kita biarkan saja (grafik akan rata bawah)
  
  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 600 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9CA3AF', fontSize: 11 }}
            tickFormatter={(value) => {
              if (value >= 1000000) return `Rp${(value / 1000000).toFixed(1)}Jt`;
              if (value >= 1000) return `Rp${(value / 1000).toFixed(0)}Rb`;
              return `Rp${value}`;
            }}
          />
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ stroke: '#F97316', strokeWidth: 1, strokeDasharray: '4 4' }} 
          />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="#F97316" 
            strokeWidth={4}
            dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#F97316' }}
            activeDot={{ r: 6, fill: '#F97316', stroke: '#fff', strokeWidth: 3 }}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
