/**
 * Semantic Color System
 * 
 * Mapea estados de negocio (reservation status, KPIs) a tokens de diseño.
 * Este es el ÚNICO lugar donde se define el significado visual de cada estado.
 */

import { colors } from './tokens';
import type { ReservationStatus } from '../../modules/reservations/types';

/**
 * Color configuration for a status
 */
export interface StatusColors {
  /** Background color (hex) */
  bg: string;
  /** Text color (hex) */
  text: string;
  /** Border color (hex) - optional */
  border?: string;
  /** Tailwind CSS classes for quick usage */
  classes: string;
  /** Human-readable label in Spanish */
  label: string;
}

/**
 * Semantic color map for reservation statuses
 * 
 * Single source of truth for status colors across:
 * - Badges
 * - Charts
 * - Reports
 * - Tables
 */
export const reservationStatusColors: Record<ReservationStatus, StatusColors> = {
  pending: {
    bg: colors.warning[100],
    text: colors.warning[800],
    border: colors.warning[200],
    classes: 'bg-amber-100 text-amber-800 border-amber-200',
    label: 'Pendiente',
  },
  confirmed: {
    bg: colors.success[100],
    text: colors.success[800],
    border: colors.success[200],
    classes: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    label: 'Confirmada',
  },
  checked_in: {
    bg: colors.info[100],
    text: colors.info[800],
    border: colors.info[200],
    classes: 'bg-blue-100 text-blue-800 border-blue-200',
    label: 'Check-in',
  },
  checked_out: {
    bg: '#f3e8ff', // Purple 100
    text: '#6b21a8', // Purple 800
    border: '#e9d5ff', // Purple 200
    classes: 'bg-purple-100 text-purple-800 border-purple-200',
    label: 'Check-out',
  },
  cancelled: {
    bg: colors.danger[100],
    text: colors.danger[800],
    border: colors.danger[200],
    classes: 'bg-rose-100 text-rose-800 border-rose-200',
    label: 'Cancelada',
  },
  no_show: {
    bg: colors.surface[200],
    text: colors.surface[700],
    border: colors.surface[300],
    classes: 'bg-gray-200 text-gray-700 border-gray-300',
    label: 'No Show',
  },
  waiting: {
    bg: '#ffedd5', // Orange 100
    text: '#9a3412', // Orange 800
    border: '#fed7aa', // Orange 200
    classes: 'bg-orange-100 text-orange-800 border-orange-200',
    label: 'En espera',
  },
  completed: {
    bg: colors.neutral[100],
    text: colors.neutral[700],
    border: colors.neutral[200],
    classes: 'bg-slate-100 text-slate-700 border-slate-200',
    label: 'Finalizada',
  },
};

/**
 * Get color configuration for a reservation status
 * 
 * @param status - Reservation status enum value
 * @returns Color configuration object
 * 
 * @example
 * ```ts
 * const colors = getStatusColors('confirmed');
 * // { bg: '#dcfce7', text: '#166534', border: '#bbf7d0', classes: '...', label: 'Confirmada' }
 * ```
 */
export function getStatusColors(status: ReservationStatus): StatusColors {
  return reservationStatusColors[status] ?? reservationStatusColors.pending;
}

/**
 * Get hex color for chart usage (background/fill)
 * 
 * @param status - Reservation status enum value
 * @returns Hex color string for charts
 */
export function getStatusChartColor(status: ReservationStatus): string {
  // For charts, we use stronger colors (500 level) for better visibility
  const chartColorMap: Record<ReservationStatus, string> = {
    pending: colors.warning[500],        // Orange
    confirmed: colors.success[500],      // Green
    checked_in: colors.info[500],        // Blue
    checked_out: '#a855f7',              // Purple 500
    cancelled: colors.danger[500],       // Red
    no_show: colors.danger[600],         // Dark Red
    waiting: '#f97316',                  // Orange 500
    completed: '#8BC34A',                // Light Green
  };
  
  return chartColorMap[status] ?? colors.neutral[500];
}

/**
 * KPI Color Variants
 */
export type KpiVariant = 'ok' | 'warn' | 'bad' | 'neutral';

/**
 * Get color for KPI indicators
 * 
 * @param kind - KPI variant ('ok', 'warn', 'bad', 'neutral')
 * @returns Hex color string
 * 
 * @example
 * ```ts
 * getKpiColor('ok')   // Green - metrics are good
 * getKpiColor('warn') // Orange - needs attention
 * getKpiColor('bad')  // Red - critical issue
 * ```
 */
export function getKpiColor(kind: KpiVariant): string {
  const kpiColors: Record<KpiVariant, string> = {
    ok: colors.success[500],
    warn: colors.warning[500],
    bad: colors.danger[500],
    neutral: colors.neutral[500],
  };
  
  return kpiColors[kind];
}

/**
 * Room Type Colors (for distribution charts)
 * Uses institutional palette for brand consistency
 */
export const roomTypeColors = [
  colors.primary[600],  // Dark teal
  colors.primary[700],  // Medium teal
  colors.primary[800],  // Light teal
  colors.accent[300],   // Beige
  colors.accent[500],   // Brown
] as const;

/**
 * Get color for room type by index
 * 
 * @param index - Room type index in array
 * @returns Hex color string
 */
export function getRoomTypeColor(index: number): string {
  return roomTypeColors[index % roomTypeColors.length];
}

/**
 * Source Channel Colors (for marketing analytics)
 */
export const sourceColors: Record<string, string> = {
  Web: colors.info[500],        // Blue
  'Booking.com': colors.info[500],
  Teléfono: colors.success[500], // Green
  Telefono: colors.success[500],
  Email: colors.warning[500],    // Orange
  Correo: colors.warning[500],
  'Walk-in': '#a855f7',          // Purple
  Agencia: '#06b6d4',            // Cyan
};

/**
 * Get color for reservation source
 * 
 * @param source - Source name (Web, Teléfono, etc.)
 * @returns Hex color string
 */
export function getSourceColor(source: string): string {
  return sourceColors[source] ?? colors.neutral[600];
}

/**
 * Metric Colors (for time series charts)
 */
export const metricColors: Record<string, string> = {
  reservations: colors.info[500],     // Blue
  revenue: colors.success[500],       // Green
  occupancy: colors.warning[500],     // Orange
  cancellations: colors.danger[500],  // Red
  average: colors.neutral[500],       // Gray
};

/**
 * Get color for metric type
 * 
 * @param metric - Metric name
 * @returns Hex color string
 */
export function getMetricColor(metric: string): string {
  return metricColors[metric] ?? colors.primary[600];
}
