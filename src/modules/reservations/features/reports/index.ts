/**
 * Reports Feature - Main Entry Point
 * 
 * Exporta todos los elementos públicos de la feature de reportes:
 * - Componentes UI
 * - Hooks de datos
 * - Tipos y constantes
 * - Servicios API
 */

// Página principal
export { ReservationReportsPage } from './pages/ReservationReportsPage';

// Componentes
export {
  ReportFilters,
  KpiCard,
  TimeSeriesChart,
  DistributionChart,
  ReportsTable,
} from './components';

// Hook principal
export { useReservationReports } from './hooks/useReservationReports';

// Tipos principales
export type {
  ReservationReportFilters,
  ReservationReportDto,
  ReservationKpiDto,
  TimeSeriesDataPoint,
  DistributionDataPoint,
  ExportFormat,
  ChartMetric,
} from './types/reports';
