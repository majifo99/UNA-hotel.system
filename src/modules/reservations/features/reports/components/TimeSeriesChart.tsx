/**
 * Time Series Chart Component
 * 
 * Line chart for displaying trends over time
 */

import React, { useMemo } from 'react';
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
import type { TimeSeriesDataPoint, ChartMetric } from '../types/reports';
import { getMetricColor } from '../utils/reportColors';

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

  // compute sensible ticks based on range length
  const ticks = useMemo(() => {
    if (!data || data.length === 0) return [] as string[];

    const dates = data.map(d => new Date(d.date));
  const min = dates[0];
  const max = dates.at(-1) as Date;
    const msRange = max.getTime() - min.getTime();
    const days = Math.max(1, Math.round(msRange / (1000 * 60 * 60 * 24)));

    // Choose tick count and granularity
    let step = 1; // days
    if (days > 365) {
      // monthly
      step = Math.max(1, Math.floor(days / 12));
    } else if (days > 120) {
      // weekly
      step = 7;
    } else if (days > 30) {
      // every 3 days
      step = 3;
    }

    const result: string[] = [];
    for (let i = 0; i < dates.length; i += step) {
      result.push(data[i].date);
    }

    // ensure last date present
    if (result.at(-1) !== data.at(-1)?.date) {
      result.push(data.at(-1)?.date ?? '');
    }

    return result;
  }, [data]);

  const labelFormatter = (isoDate: string) => {
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return isoDate;
    // short date for compactness
    return new Intl.DateTimeFormat('es-CR', { month: 'short', day: 'numeric' }).format(d);
  };

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
            ticks={ticks}
            tickFormatter={labelFormatter}
            interval={0}
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
