/**
 * Reservation Reports Hook
 * 
 * Custom hook for managing reservation reports data and state
 */

import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { reservationReportsService } from '../services/reportsService';
import type {
  ReservationReportDto,
  ReservationReportFilters,
  ExportFormat,
  ExportStatus
} from '../types/reports';
import { toast } from 'sonner';

/**
 * Hook return type
 */
interface UseReservationReportsReturn {
  /** Report data */
  readonly data: ReservationReportDto | undefined;
  /** Loading state */
  readonly isLoading: boolean;
  /** Error state */
  readonly error: Error | null;
  /** Current filters */
  readonly filters: ReservationReportFilters;
  /** Update filters */
  readonly setFilters: (filters: ReservationReportFilters) => void;
  /** Export data */
  readonly exportData: (format: ExportFormat) => Promise<void>;
  /** Export status */
  readonly exportStatus: ExportStatus;
  /** Refetch data */
  readonly refetch: () => void;
}

/**
 * Default filters - show all reservations
 */
const DEFAULT_FILTERS: ReservationReportFilters = {
  period: 'all',
  status: 'all',
  metric: 'reservations'
};

/**
 * Hook for reservation reports
 */
export function useReservationReports(): UseReservationReportsReturn {
  const [filters, setFilters] = useState<ReservationReportFilters>(DEFAULT_FILTERS);
  const [exportStatus, setExportStatus] = useState<ExportStatus>({ isExporting: false });

  // Query for report data
  const {
    data,
    isLoading,
    error,
    refetch
  }: UseQueryResult<ReservationReportDto, Error> = useQuery({
    queryKey: ['reservation-reports', filters],
    queryFn: () => reservationReportsService.getReport(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  /**
   * Export data to specified format
   * 
   * @param format - Export format (csv or pdf)
   */
  const exportData = useCallback(async (format: ExportFormat): Promise<void> => {
    setExportStatus({ isExporting: true });

    try {
      let blob: Blob;
      
      if (format === 'csv') {
        // For CSV, we need table data (currently not fetched for performance)
        // In the future, fetch table data separately when exporting
        toast.info('La exportación CSV estará disponible próximamente');
        setExportStatus({ isExporting: false });
        return;
      } else {
        // PDF export is handled by backend
        blob = await reservationReportsService.exportToPDF(filters);
      }

      // Create download link
      const url = globalThis.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reservas-reporte-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      globalThis.URL.revokeObjectURL(url);

      setExportStatus({ isExporting: false });
      toast.success(`Reporte exportado exitosamente en formato ${format.toUpperCase()}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setExportStatus({ 
        isExporting: false, 
        error: errorMessage 
      });
      toast.error(`Error al exportar: ${errorMessage}`);
    }
  }, [filters]);

  return {
    data,
    isLoading,
    error,
    filters,
    setFilters,
    exportData,
    exportStatus,
    refetch: () => {
      refetch();
    },
  };
}
