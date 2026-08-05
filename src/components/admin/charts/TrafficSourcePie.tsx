'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TrafficSourcePieProps {
  data: Array<{ source: string; count: number }>;
}

const SOURCE_COLORS: Record<string, string> = {
  search: '#EF6C00',
  social: '#FB8C00',
  direct: '#FFA040',
  referral: '#FFB74D',
};

const DEFAULT_COLOR = '#FFCC80';

const SOURCE_LABELS: Record<string, string> = {
  search: 'Search',
  social: 'Social',
  direct: 'Direct',
  referral: 'Referral',
};

/**
 * Traffic source distribution pie chart.
 * Uses Recharts PieChart with ResponsiveContainer for width adaptation.
 */
export function TrafficSourcePie({ data }: TrafficSourcePieProps) {
  const chartData = data.map((item) => ({
    name: SOURCE_LABELS[item.source] || item.source,
    value: item.count,
    color: SOURCE_COLORS[item.source] || DEFAULT_COLOR,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label={(entry: { name?: string; percent?: number }) => {
            const name = entry.name || '';
            const percent = entry.percent ?? 0;
            return `${name}: ${(percent * 100).toFixed(0)}%`;
          }}
          labelLine={false}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            fontSize: '13px',
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          wrapperStyle={{ fontSize: '12px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
