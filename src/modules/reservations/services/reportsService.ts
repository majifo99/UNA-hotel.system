/**
 * Reservation Reports Service
 * 
 * Handles API calls for reservation analytics and reporting
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
 * Service class for reservation reports
 */
export class ReservationReportsService {
  private readonly baseUrl = '/reservas/reportes';

  /**
   * Get complete report data with KPIs, charts, and table
   */
  async getReport(filters: ReservationReportFilters): Promise<ReservationReportDto> {
    const params = this.buildQueryParams(filters);
    const response = await apiClient.get<ReservationReportDto>(`${this.baseUrl}`, { params });
    return response.data;
  }

  /**
   * Get only KPI metrics
   */
  async getKPIs(filters: ReservationReportFilters): Promise<ReservationKpiDto> {
    const params = this.buildQueryParams(filters);
    const response = await apiClient.get<ReservationKpiDto>(`${this.baseUrl}/kpis`, { params });
    return response.data;
  }

  /**
   * Get only chart data
   */
  async getChartData(filters: ReservationReportFilters): Promise<ReservationChartDataDto> {
    const params = this.buildQueryParams(filters);
    const response = await apiClient.get<ReservationChartDataDto>(`${this.baseUrl}/charts`, { params });
    return response.data;
  }

  /**
   * Export report data to CSV (frontend implementation)
   */
  async exportToCSV(rows: readonly ReservationReportRow[]): Promise<Blob> {
    // Generate CSV content
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
        `"${row.guestName}"`,
        `"${row.roomType}"`,
        row.checkInDate,
        row.checkOutDate,
        row.nights,
        row.status,
        `"${row.source}"`,
        row.totalAmount
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  /**
   * Export report data to PDF
   */
  async exportToPDF(filters: ReservationReportFilters): Promise<Blob> {
    const params = this.buildQueryParams(filters);
    const response = await apiClient.get(`${this.baseUrl}/export/pdf`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Build query parameters from filters
   */
  private buildQueryParams(filters: ReservationReportFilters): Record<string, string> {
    const params: Record<string, string> = {};

    if (filters.startDate) {
      params.fecha_desde = filters.startDate;
    }

    if (filters.endDate) {
      params.fecha_hasta = filters.endDate;
    }

    if (filters.roomType) {
      params.tipo_habitacion = filters.roomType;
    }

    if (filters.status && filters.status !== 'all') {
      params.estado = filters.status;
    }

    if (filters.source) {
      params.fuente = filters.source;
    }

    return params;
  }
}

// Singleton instance
export const reservationReportsService = new ReservationReportsService();
