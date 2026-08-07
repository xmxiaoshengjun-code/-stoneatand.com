'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface HourlyTrafficChartProps {
  data: Array<{ hour: string; pv: number }>;
}

/**
 * 24-hour traffic trend line chart.
 * Uses Recharts LineChart with ResponsiveContainer for width adaptation.
 */
export function HourlyTrafficChart({ data }: HourlyTrafficChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="hour"
          tick={{ fontSize: 11 }}
          interval={2}
        />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            fontSize: '13px',
          }}
        />
        <Line
          type="monotone"
          dataKey="pv"
          stroke="#EF6C00"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
          name="页面浏览量"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
