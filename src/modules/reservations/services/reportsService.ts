/**
 * Reservation Reports Service
 * 
 * Handles API calls for reservation analytics and reporting.
 * Integrates with backend endpoints for KPIs, time series, distributions, and PDF export.
 * 
 * @module services/reports
 */

import apiClient from '../../../services/apiClient';
import type { 
  ReservationReportDto, 
  ReservationReportFilters,
  ReservationKpiDto,
  ReservationChartDataDto,
  ReservationReportRow
} from '../types/reports';

/**
 * Backend API response wrapper
 */
interface ApiResponse<T> {
  readonly success: boolean;
  readonly data: T;
}

/**
 * Service class for reservation reports
 */
export class ReservationReportsService {
  private readonly baseUrl = '/reservas/reportes';

  /**
   * Get complete report data with KPIs, charts, and table
   * 
   * @param filters - Report filters (date range, status, room type, etc.)
   * @returns Complete report with KPIs, time series, distributions, and rows
   */
  async getReport(filters: ReservationReportFilters): Promise<ReservationReportDto> {
    // Fetch all data in parallel for better performance
    const [kpisResponse, chartsResponse] = await Promise.all([
      this.getKPIs(filters),
      this.getChartData(filters)
    ]);

    return {
      kpis: kpisResponse,
      charts: chartsResponse,
      rows: [], // Table data not needed for now (optimize performance)
      filters,
      totalRecords: 0
    };
  }

  /**
   * Get only KPI metrics
   * 
   * @param filters - Report filters
   * @returns Key performance indicators (occupancy, revenue, etc.)
   */
  async getKPIs(filters: ReservationReportFilters): Promise<ReservationKpiDto> {
    const params = this.buildQueryParams(filters);
    const response = await apiClient.get<ApiResponse<ReservationKpiDto>>(
      `${this.baseUrl}/kpis`, 
      { params }
    );
    return response.data.data;
  }

  /**
   * Get only chart data (time series + distributions)
   * 
   * @param filters - Report filters
   * @returns Chart data for visualizations
   */
  async getChartData(filters: ReservationReportFilters): Promise<ReservationChartDataDto> {
    const params = this.buildQueryParams(filters);
    
    // Fetch time series and distributions in parallel
    const [timeSeriesResponse, distributionsResponse] = await Promise.all([
      apiClient.get<ApiResponse<ReservationChartDataDto['timeSeries']>>(
        `${this.baseUrl}/series-temporales`,
        { params }
      ),
      apiClient.get<ApiResponse<Pick<ReservationChartDataDto, 'byRoomType' | 'bySource' | 'byStatus'>>>(
        `${this.baseUrl}/distribuciones`,
        { params }
      )
    ]);

    return {
      timeSeries: timeSeriesResponse.data.data,
      byRoomType: distributionsResponse.data.data.byRoomType,
      bySource: distributionsResponse.data.data.bySource,
      byStatus: distributionsResponse.data.data.byStatus
    };
  }

  /**
   * Export report data to CSV (frontend implementation)
   * 
   * @param rows - Report rows to export
   * @returns CSV file as Blob
   */
  async exportToCSV(rows: readonly ReservationReportRow[]): Promise<Blob> {
    // Generate CSV content with proper escaping
    const headers = [
      'Confirmación',
      'Huésped',
      'Habitación',
      'Check-in',
      'Check-out',
      'Noches',
      'Estado',
      'Fuente',
      'Total'
    ];

    const csvRows = [
      headers.join(','),
      ...rows.map(row => [
        row.confirmationNumber,
        `"${row.guestName.replaceAll('"', '""')}"`, // Escape quotes
        `"${row.roomType.replaceAll('"', '""')}"`,
        row.checkInDate,
        row.checkOutDate,
        row.nights.toString(),
        row.status,
        `"${row.source.replaceAll('"', '""')}"`,
        row.totalAmount.toString()
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  /**
   * Export report data to PDF (backend implementation)
   * 
   * @param filters - Report filters
   * @returns PDF file as Blob
   */
  async exportToPDF(filters: ReservationReportFilters): Promise<Blob> {
    const params = this.buildQueryParams(filters);
    const response = await apiClient.get(`${this.baseUrl}/export/pdf`, {
      params,
      responseType: 'blob',
    });
    return response.data as Blob;
  }

  /**
   * Build query parameters from filters
   * 
   * @param filters - Report filters
   * @returns Query parameters object
   */
  private buildQueryParams(filters: ReservationReportFilters): Record<string, string> {
    const params: Record<string, string> = {};

    // Time period filter (preferred over date range)
    if (filters.period && filters.period !== 'custom') {
      params.periodo = filters.period;
    } else {
      // Date filters (used when period is 'custom' or not specified)
      if (filters.startDate) {
        params.fecha_desde = filters.startDate;
      }

      if (filters.endDate) {
        params.fecha_hasta = filters.endDate;
      }
    }

    // Room type filter
    if (filters.roomType) {
      params.tipo_habitacion = filters.roomType;
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      params.estado = filters.status;
    }

    // Source filter
    if (filters.source) {
      params.fuente = filters.source;
    }

    return params;
  }
}

// Singleton instance
export const reservationReportsService = new ReservationReportsService();
