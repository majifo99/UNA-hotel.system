/**
 * Time Series Chart Component
 * 
 * Line chart for displaying trends over time
 */

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import type { TimeSeriesDataPoint, ChartMetric } from '../../types/reports';
import { getMetricColor } from '../../utils/reportColors';

export interface TimeSeriesChartProps {
  readonly data: readonly TimeSeriesDataPoint[];
  readonly metric: ChartMetric;
  readonly isLoading?: boolean;
}

const METRIC_CONFIG = {
  reservations: {
    key: 'reservations',
    name: 'Reservas',
    color: getMetricColor('reservations'), // Blue
    unit: ''
  },
  revenue: {
    key: 'revenue',
    name: 'Ingresos',
    color: getMetricColor('revenue'), // Green
    unit: '₡'
  },
  occupancy: {
    key: 'occupancy',
    name: 'Ocupación',
    color: getMetricColor('occupancy'), // Orange
    unit: '%'
  },
  cancellations: {
    key: 'cancellations',
    name: 'Cancelaciones',
    color: getMetricColor('cancellations'), // Red
    unit: ''
  }
} as const;

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  metric,
  isLoading = false
}) => {
  const config = METRIC_CONFIG[metric];

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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">
        Tendencia de {config.name}
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={[...data]} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="date" 
            stroke="#6B7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6B7280"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `${config.unit}${value.toLocaleString()}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              padding: '8px 12px'
            }}
            formatter={(value: number) => [
              `${config.unit}${value.toLocaleString()}`,
              config.name
            ]}
            labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey={config.key}
            stroke={config.color}
            strokeWidth={2}
            dot={{ fill: config.color, r: 4 }}
            activeDot={{ r: 6 }}
            name={config.name}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
