/**
 * Reservation Reports Service
 * 
 * Handles API calls for reservation analytics and reporting.
 * Integrates with backend endpoints for KPIs, time series, distributions, and PDF export.
 * Uses extended timeout client for heavy queries.
 * 
 * @module services/reports
 */

import { apiClientExtended } from '../../../../../services/apiClient';
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
 * Maximum date range in days before requiring pagination
 */
const MAX_DATE_RANGE_DAYS = 365;

/**
 * Service class for reservation reports
 * Aligned with backend API endpoints documented in API-REPORTES-ENDPOINTS.md
 */
export class ReservationReportsService {
  private readonly baseUrl = '/reservas/reportes';

  /**
   * Validate date range and warn if too large
   * @param filters - Report filters
   * @returns Validation result with warning if applicable
   */
  private validateDateRange(filters: ReservationReportFilters): { valid: boolean; warning?: string } {
    if (!filters.startDate || !filters.endDate) {
      return { valid: true };
    }

    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays > MAX_DATE_RANGE_DAYS) {
      return {
        valid: true,
        warning: `⚠️ Rango de fechas grande (${diffDays} días). La consulta puede tardar más de lo usual.`
      };
    }

    return { valid: true };
  }

  /**
   * Get complete report data with KPIs, charts, and table
   * 
   * @param filters - Report filters (date range, status, room type, etc.)
   * @param signal - Optional AbortSignal for request cancellation
   * @returns Complete report with KPIs, time series, distributions, and rows
   */
  async getReport(filters: ReservationReportFilters, signal?: AbortSignal): Promise<ReservationReportDto> {
    // Validate date range
    const validation = this.validateDateRange(filters);
    if (validation.warning) {
      console.warn(`[ReportsService] ${validation.warning}`);
    }

    try {
      // Fetch KPIs and charts in parallel (these endpoints are implemented)
      // Note: /tabla endpoint is NOT yet implemented in backend, so we skip it
      // Use extended client for potentially large queries
      const [kpisResponse, chartsResponse] = await Promise.all([
        this.getKPIs(filters, signal),
        this.getChartData(filters, signal)
      ]);

      return {
        kpis: kpisResponse,
        charts: chartsResponse,
        rows: [], // Table data endpoint not yet implemented in backend
        filters,
        totalRecords: 0
      };
    } catch (error) {
      // Log error but don't fail silently
      console.error('[ReportsService] Error fetching report data:', error);
      throw error;
    }
  }

  /**
   * Get only KPI metrics
   * Backend endpoint: GET /api/reservas/reportes/kpis
   * 
   * @param filters - Report filters
   * @param signal - Optional AbortSignal for request cancellation
   * @returns Key performance indicators (occupancy, revenue, etc.)
   */
  async getKPIs(filters: ReservationReportFilters, signal?: AbortSignal): Promise<ReservationKpiDto> {
    const params = this.buildQueryParams(filters);
    
    // Use extended client for potentially large queries
    const response = await apiClientExtended.get<ApiResponse<ReservationKpiDto>>(
      `${this.baseUrl}/kpis`, 
      { params, signal }
    );
    return response.data.data;
  }

  /**
   * Get only chart data (time series + distributions)
   * Backend endpoints: 
   * - GET /api/reservas/reportes/series-temporales
   * - GET /api/reservas/reportes/distribuciones
   * 
   * @param filters - Report filters
   * @param signal - Optional AbortSignal for request cancellation
   * @returns Chart data for visualizations
   */
  async getChartData(filters: ReservationReportFilters, signal?: AbortSignal): Promise<ReservationChartDataDto> {
    const params = this.buildQueryParams(filters);
    
    // Fetch time series and distributions in parallel using extended client
    const [timeSeriesResponse, distributionsResponse] = await Promise.all([
      apiClientExtended.get<ApiResponse<ReservationChartDataDto['timeSeries']>>(
        `${this.baseUrl}/series-temporales`,
        { params, signal }
      ),
      apiClientExtended.get<ApiResponse<Pick<ReservationChartDataDto, 'byRoomType' | 'bySource' | 'byStatus'>>>(
        `${this.baseUrl}/distribuciones`,
        { params, signal }
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
   * Get table data for detailed report
   * 
   * NOTE: This endpoint (/tabla) is NOT yet implemented in the backend.
   * For now, we return empty array to avoid 404 errors.
   * When backend implements it, this will work automatically.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getTableData(_filters: ReservationReportFilters, _signal?: AbortSignal): Promise<readonly ReservationReportRow[]> {
    // TEMPORARY: Return empty array until backend implements /tabla endpoint
    // When backend is ready, uncomment this code:
    // const params = this.buildQueryParams(_filters);
    // const response = await apiClientExtended.get<ApiResponse<readonly ReservationReportRow[]>>(
    //   `${this.baseUrl}/tabla`,
    //   { params, signal: _signal }
    // );
    // return response.data.data;
    
    console.warn('[ReportsService] ⚠️ Table data endpoint not yet implemented in backend. Returning empty array.');
    return [];
  }

  /**
   * Export report to PDF using backend endpoint
   * Backend endpoint: GET /api/reservas/reportes/export/pdf
   * 
   * @param filters - Report filters
   * @param options - Export options (incluir_graficos, incluir_tabla)
   * @returns PDF file as Blob
   */
  async exportToPDFFromBackend(
    filters: ReservationReportFilters,
    options: { incluirGraficos?: boolean; incluirTabla?: boolean } = {}
  ): Promise<Blob> {
    // Build query params exactly as backend expects
    const baseParams = this.buildQueryParams(filters);
    
    // Backend expects boolean values as '1' or '0', not 'true'/'false'
    const params = {
      ...baseParams,
      incluir_graficos: (options.incluirGraficos !== false) ? '1' : '0',
      incluir_tabla: (options.incluirTabla !== false) ? '1' : '0',
      idioma: 'es'
    };

    console.log('[ReportsService] 📄 Exporting PDF with params:', params);

    try {
      // Use extended client with longer timeout for PDF generation
      const response = await apiClientExtended.get(
        `${this.baseUrl}/export/pdf`,
        { 
          params, 
          responseType: 'blob', // Important: get binary data
          timeout: 120000, // 120s timeout for PDF generation
          headers: {
            'Accept': 'application/pdf'
          }
        }
      );

      console.log('[ReportsService] ✅ PDF generated successfully, size:', response.data.size);

      // Check if response is actually a PDF (not JSON error)
      if (response.data.type === 'application/json') {
        // Backend returned JSON error instead of PDF
        const text = await response.data.text();
        const error = JSON.parse(text);
        throw new Error(error.message || 'Error generando PDF desde el servidor');
      }

      return response.data;
    } catch (error) {
      // Parse backend error message if available
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: { data?: Blob } };
        if (axiosError.response?.data instanceof Blob && axiosError.response.data.type === 'application/json') {
          try {
            const text = await axiosError.response.data.text();
            const errorData = JSON.parse(text);
            console.error('[ReportsService] ❌ Backend validation error:', errorData);
            throw new Error(errorData.message || 'Error en los parámetros del reporte');
          } catch {
            // If parsing fails, continue with original error
          }
        }
      }
      
      console.error('[ReportsService] ❌ Error exporting PDF from backend:', error);
      throw error;
    }
  }

  /**
   * Export report to CSV using backend endpoint (if available)
   * Backend endpoint: GET /api/reservas/reportes/export/csv
   * 
   * @param filters - Report filters
   * @returns CSV file as Blob
   */
  async exportToCSVFromBackend(filters: ReservationReportFilters): Promise<Blob> {
    const params = this.buildQueryParams(filters);

    try {
      const response = await apiClientExtended.get(
        `${this.baseUrl}/export/csv`,
        { 
          params, 
          responseType: 'blob',
          timeout: 60000 // 60s timeout
        }
      );

      return response.data;
    } catch (error) {
      console.error('[ReportsService] Error exporting CSV from backend:', error);
      throw error;
    }
  }

  /**
   * Export report data to CSV (frontend implementation)
   * Generates a professional-looking CSV with proper formatting
   * 
   * @param reportData - Complete report data including rows
   * @param filters - Applied filters for context
   * @returns CSV file as Blob with UTF-8 BOM for Excel compatibility
   */
  async exportToCSV(reportData: ReservationReportDto, filters: ReservationReportFilters): Promise<Blob> {
    const rows = reportData.rows;
    
    if (!rows || rows.length === 0) {
      throw new Error('No hay datos disponibles para exportar');
    }

    // Build CSV content with metadata header
    const lines: string[] = [
      'Reporte de Reservaciones',
      `Generado: ${new Date().toLocaleString('es-CR')}`,
      `Período: ${this.formatFilterPeriod(filters)}`,
      ...(filters.status && filters.status !== 'all' ? [`Estado: ${filters.status}`] : []),
      ...(filters.roomType ? [`Tipo de Habitación: ${filters.roomType}`] : []),
      '', // Empty line
      'Resumen',
      `Total de Registros,${rows.length}`,
      `Ocupación Promedio,${reportData.kpis.occupancyRate.toFixed(2)}%`,
      `Ingresos Totales,₡${reportData.kpis.totalRevenue.toLocaleString('es-CR')}`,
      `Reservas Confirmadas,${reportData.kpis.confirmedReservations}`,
      `Cancelaciones,${reportData.kpis.cancelledReservations}`,
      '', // Empty line
    ];
    
    // Add table headers
    const headers = [
      'Confirmación',
      'Huésped',
      'Habitación',
      'Check-in',
      'Check-out',
      'Noches',
      'Estado',
      'Fuente',
      'Total (₡)'
    ];
    lines.push(headers.join(','));

    // Add data rows with proper CSV escaping
    for (const row of rows) {
      const csvRow = [
        row.confirmationNumber,
        this.escapeCSV(row.guestName),
        this.escapeCSV(row.roomType),
        row.checkInDate,
        row.checkOutDate,
        row.nights.toString(),
        this.escapeCSV(row.status),
        this.escapeCSV(row.source),
        row.totalAmount.toString()
      ];
      lines.push(csvRow.join(','));
    }

    // Convert to blob with BOM for Excel compatibility
    const csvContent = '\uFEFF' + lines.join('\n');
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  /**
   * Export report data to PDF (frontend implementation using window.print)
   * Creates a styled print view with all report data
   * 
   * @param reportData - Complete report data
   * @param filters - Applied filters
   * @returns Empty blob (print dialog handles the PDF generation)
   */
  async exportToPDF(reportData: ReservationReportDto, filters: ReservationReportFilters): Promise<Blob> {
    const html = this.generatePrintableHTML(reportData, filters);
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=1200,height=800');
    if (!printWindow) {
      throw new Error('No se pudo abrir la ventana de impresión. Verifica que los pop-ups estén habilitados.');
    }
    
    // Write content to the new window
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        // Close window after printing (user can cancel)
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      }, 500);
    };
    
    // Return empty blob as we're using print dialog
    return new Blob([], { type: 'application/pdf' });
  }

  /**
   * Generate printable HTML for PDF export
   * 
   * @param reportData - Complete report data
   * @param filters - Applied filters
   * @returns HTML string ready for printing
   */
  private generatePrintableHTML(reportData: ReservationReportDto, filters: ReservationReportFilters): string {
    const timestamp = new Date().toLocaleString('es-CR');
    const period = this.formatFilterPeriod(filters);
    
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Reporte de Reservaciones - ${timestamp}</title>
  <style>
    @media print {
      @page { margin: 2cm; size: letter landscape; }
      body { margin: 0; }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 10pt;
      line-height: 1.4;
      color: #333;
    }
    .header {
      background: linear-gradient(135deg, #1A3636 0%, #40534C 100%);
      color: white;
      padding: 20px;
      margin-bottom: 20px;
    }
    .header h1 { font-size: 20pt; margin-bottom: 8px; }
    .header .meta { font-size: 9pt; opacity: 0.9; }
    .kpis {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    .kpi-card {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      padding: 12px;
      text-align: center;
    }
    .kpi-card .label {
      font-size: 8pt;
      color: #6c757d;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .kpi-card .value {
      font-size: 16pt;
      font-weight: bold;
      color: #1A3636;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9pt;
      page-break-inside: auto;
    }
    thead {
      background: #1A3636;
      color: white;
    }
    thead th {
      padding: 10px 8px;
      text-align: left;
      font-weight: 600;
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    tbody tr {
      border-bottom: 1px solid #e9ecef;
      page-break-inside: avoid;
    }
    tbody tr:nth-child(even) {
      background: #f8f9fa;
    }
    tbody td {
      padding: 8px;
    }
    .footer {
      margin-top: 20px;
      padding-top: 12px;
      border-top: 2px solid #dee2e6;
      font-size: 8pt;
      color: #6c757d;
      text-align: center;
    }
    .status-badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 8pt;
      font-weight: 600;
    }
    .status-confirmed { background: #d4edda; color: #155724; }
    .status-pending { background: #fff3cd; color: #856404; }
    .status-cancelled { background: #f8d7da; color: #721c24; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Reporte de Reservaciones</h1>
    <div class="meta">
      Generado: ${timestamp} | Período: ${period}
      ${filters.status && filters.status !== 'all' ? ` | Estado: ${filters.status}` : ''}
      ${filters.roomType ? ` | Tipo: ${filters.roomType}` : ''}
    </div>
  </div>
  
  <div class="kpis">
    <div class="kpi-card">
      <div class="label">Ocupación</div>
      <div class="value">${reportData.kpis.occupancyRate.toFixed(1)}%</div>
    </div>
    <div class="kpi-card">
      <div class="label">Ingresos</div>
      <div class="value">₡${reportData.kpis.totalRevenue.toLocaleString('es-CR')}</div>
    </div>
    <div class="kpi-card">
      <div class="label">Confirmadas</div>
      <div class="value">${reportData.kpis.confirmedReservations}</div>
    </div>
    <div class="kpi-card">
      <div class="label">Cancelaciones</div>
      <div class="value">${reportData.kpis.cancelledReservations}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Confirmación</th>
        <th>Huésped</th>
        <th>Habitación</th>
        <th>Check-in</th>
        <th>Check-out</th>
        <th>Noches</th>
        <th>Estado</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${reportData.rows.map(row => `
        <tr>
          <td>${row.confirmationNumber}</td>
          <td>${this.escapeHTML(row.guestName)}</td>
          <td>${this.escapeHTML(row.roomType)}</td>
          <td>${new Date(row.checkInDate).toLocaleDateString('es-CR')}</td>
          <td>${new Date(row.checkOutDate).toLocaleDateString('es-CR')}</td>
          <td>${row.nights}</td>
          <td><span class="status-badge status-${row.status}">${row.status}</span></td>
          <td>₡${row.totalAmount.toLocaleString('es-CR')}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>Total de registros: ${reportData.rows.length} | Sistema de Gestión Hotelera UNA</p>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Format filter period for display
   */
  private formatFilterPeriod(filters: ReservationReportFilters): string {
    if (filters.period === 'custom' || (!filters.period && (filters.startDate || filters.endDate))) {
      const start = filters.startDate || 'N/A';
      const end = filters.endDate || 'N/A';
      return `${start} a ${end}`;
    }
    
    const periodLabels: Record<string, string> = {
      '7d': 'Últimos 7 días',
      '30d': 'Último mes',
      '3m': 'Últimos 3 meses',
      '6m': 'Últimos 6 meses',
      '1y': 'Último año',
      'all': 'Todo el historial'
    };
    
    return periodLabels[filters.period || 'all'] || 'Personalizado';
  }

  /**
   * Escape CSV value (wrap in quotes if contains comma, quote, or newline)
   */
  private escapeCSV(value: string): string {
    if (!value) return '';
    
    const needsEscape = value.includes(',') || value.includes('"') || value.includes('\n');
    
    if (needsEscape) {
      return `"${value.replaceAll('"', '""')}"`;
    }
    
    return value;
  }

  /**
   * Escape HTML special characters
   */
  private escapeHTML(value: string): string {
    if (!value) return '';
    
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
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
