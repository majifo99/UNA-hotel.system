/**
 * Distribution Chart Component
 * 
 * Pie chart for displaying distribution by category
 */

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import type { DistributionDataPoint } from '../../types/reports';
import { getPaletteColor } from '../../utils/colorUtils';
import { getDistributionColor } from '../../utils/reportColors';

export interface DistributionChartProps {
  readonly data: readonly DistributionDataPoint[];
  readonly title: string;
  readonly isLoading?: boolean;
  readonly category?: 'status' | 'roomType' | 'source';
}

export const DistributionChart: React.FC<DistributionChartProps> = ({
  data,
  title,
  isLoading = false,
  category
}) => {
  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center bg-neutral-50 rounded-lg animate-pulse">
        <p className="text-neutral-500">Cargando gráfico...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center bg-neutral-50 rounded-lg">
        <p className="text-neutral-500">No hay datos disponibles</p>
      </div>
    );
  }

  const chartData = data.map((item, idx) => ({
    name: item.name,
    value: item.value,
    percentage: item.percentage,
    color: item.color || (category 
      ? getDistributionColor(item.name, category, idx)
      : getPaletteColor(item.name || idx))
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry) => (
              <Cell key={`cell-${entry.name}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              padding: '8px 12px'
            }}
            formatter={(value: number, name: string, props) => [
              `${value} (${props.payload.percentage.toFixed(1)}%)`,
              name
            ]}
          />
          <Legend 
            verticalAlign="bottom"
            height={36}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
