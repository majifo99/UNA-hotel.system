/**
 * Reservation Reports Types
 * 
 * Type definitions for reservation analytics and reporting
 */

import type { ReservationStatus } from './enums/ReservationStatus';

// =================== KPI TYPES ===================

/**
 * Key Performance Indicators for reservations
 */
export interface ReservationKpiDto {
  /** Average occupancy percentage */
  readonly occupancyRate: number;
  /** Total revenue in local currency */
  readonly totalRevenue: number;
  /** Number of confirmed reservations */
  readonly confirmedReservations: number;
  /** Number of cancelled reservations */
  readonly cancelledReservations: number;
  /** Total number of reservations */
  readonly totalReservations: number;
  /** Average daily rate */
  readonly averageDailyRate: number;
  /** Revenue per available room */
  readonly revPAR: number;
}

// =================== CHART DATA TYPES ===================

/**
 * Data point for time series charts (line/bar)
 */
export interface TimeSeriesDataPoint {
  /** Date in YYYY-MM-DD format */
  readonly date: string;
  /** Number of reservations */
  readonly reservations: number;
  /** Revenue amount */
  readonly revenue: number;
  /** Occupancy rate */
  readonly occupancy: number;
  /** Number of cancellations */
  readonly cancellations: number;
}

/**
 * Data point for distribution charts (pie/donut)
 */
export interface DistributionDataPoint {
  /** Category name (e.g., room type, source) */
  readonly name: string;
  /** Value for this category */
  readonly value: number;
  /** Percentage of total */
  readonly percentage: number;
  /** Color for chart display */
  readonly color: string;
}

/**
 * Complete chart data structure
 */
export interface ReservationChartDataDto {
  /** Time series data for trend analysis */
  readonly timeSeries: readonly TimeSeriesDataPoint[];
  /** Distribution by room type */
  readonly byRoomType: readonly DistributionDataPoint[];
  /** Distribution by reservation source */
  readonly bySource: readonly DistributionDataPoint[];
  /** Distribution by status */
  readonly byStatus: readonly DistributionDataPoint[];
}

// =================== TABLE DATA TYPES ===================

/**
 * Summary row for reports table
 */
export interface ReservationReportRow {
  readonly id: string;
  readonly confirmationNumber: string;
  readonly guestName: string;
  readonly roomType: string;
  readonly checkInDate: string;
  readonly checkOutDate: string;
  readonly nights: number;
  readonly status: ReservationStatus;
  readonly source: string;
  readonly totalAmount: number;
}

/**
 * Complete report data structure
 */
export interface ReservationReportDto {
  /** KPI metrics */
  readonly kpis: ReservationKpiDto;
  /** Chart data */
  readonly charts: ReservationChartDataDto;
  /** Detailed rows for table */
  readonly rows: readonly ReservationReportRow[];
  /** Applied filters */
  readonly filters: ReservationReportFilters;
  /** Total number of records (before pagination) */
  readonly totalRecords: number;
}

// =================== FILTER TYPES ===================

/**
 * Available metrics for chart display
 */
export type ChartMetric = 'reservations' | 'revenue' | 'occupancy' | 'cancellations';

/**
 * Filters for report generation
 */
export interface ReservationReportFilters {
  /** Start date (YYYY-MM-DD) */
  readonly startDate?: string;
  /** End date (YYYY-MM-DD) */
  readonly endDate?: string;
  /** Filter by room type */
  readonly roomType?: string;
  /** Filter by reservation status */
  readonly status?: ReservationStatus | 'all';
  /** Filter by reservation source */
  readonly source?: string;
  /** Currently selected metric for charts */
  readonly metric?: ChartMetric;
}

// =================== EXPORT TYPES ===================

/**
 * Export format options
 */
export type ExportFormat = 'csv' | 'pdf';

/**
 * Export configuration
 */
export interface ExportConfig {
  readonly format: ExportFormat;
  readonly filename: string;
  readonly includeCharts?: boolean;
  readonly includeKPIs?: boolean;
}

/**
 * Export status
 */
export interface ExportStatus {
  readonly isExporting: boolean;
  readonly progress?: number;
  readonly error?: string;
}
