'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface CountryBarChartProps {
  data: Array<{ country: string; count: number }>;
}

const BAR_COLORS = [
  '#EF6C00',
  '#FB8C00',
  '#FFA040',
  '#FFB74D',
  '#FFCC80',
  '#FFD54F',
  '#FFE082',
  '#FFECB3',
  '#F57C00',
  '#E65100',
];

/**
 * Top 10 countries bar chart.
 * Uses Recharts BarChart with ResponsiveContainer for width adaptation.
 */
export function CountryBarChart({ data }: CountryBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 20, bottom: 5, left: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="country"
          tick={{ fontSize: 11 }}
          width={55}
        />
        <Tooltip
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            fontSize: '13px',
          }}
        />
        <Bar dataKey="count" name="访问次数" radius={[0, 4, 4, 0]}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
