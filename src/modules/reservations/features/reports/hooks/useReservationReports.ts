/**
 * Reservation Reports Hook
 * 
 * Custom hook for managing reservation reports data and state
 * Optimized to prevent infinite loops and unnecessary re-renders
 */

import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import axios from 'axios';
import { reservationReportsService } from '../services/reportsService';
import type {
  ReservationReportDto,
  ReservationReportFilters,
  ExportFormat,
  ExportStatus
} from '../types/reports';
import { toast } from 'sonner';

/**
 * Debounce delay in milliseconds for filter changes
 */
const DEBOUNCE_DELAY = 400;

/**
 * Hook return type
 */
interface UseReservationReportsReturn {
  /** Report data */
  readonly data: ReservationReportDto | undefined;
  /** Loading state */
  readonly isLoading: boolean;
  /** Success state */
  readonly isSuccess: boolean;
  /** Error state */
  readonly isError: boolean;
  /** Error object */
  readonly error: Error | null;
  /** Current filters */
  readonly filters: ReservationReportFilters;
  /** Update filters */
  readonly setFilters: (filters: ReservationReportFilters) => void;
  /** Export data */
  readonly exportData: (format: ExportFormat, useBackend?: boolean) => Promise<void>;
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
 * Helper: Generate export blob based on format and source
 */
async function generateExportBlob(
  format: ExportFormat,
  useBackend: boolean,
  data: ReservationReportDto | undefined,
  filters: ReservationReportFilters,
  service: typeof reservationReportsService
): Promise<Blob> {
  if (format === 'csv') {
    if (useBackend) {
      return await service.exportToCSVFromBackend(filters);
    }
    if (!data) throw new Error('No hay datos disponibles');
    return await service.exportToCSV(data, filters);
  }
  
  // PDF format
  if (useBackend) {
    return await service.exportToPDFFromBackend(filters, {
      incluirGraficos: true,
      incluirTabla: true
    });
  }
  if (!data) throw new Error('No hay datos disponibles');
  return await service.exportToPDF(data, filters);
}

/**
 * Helper: Trigger browser download of blob
 */
function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = globalThis.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  setTimeout(() => {
    link.remove();
    globalThis.URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Hook for reservation reports
 * Implements best practices to prevent infinite loops and optimize performance
 * Includes debouncing for filter changes and AbortController for cancellations
 */
export function useReservationReports(): UseReservationReportsReturn {
  const [debouncedFilters, setDebouncedFilters] = useState<ReservationReportFilters>(DEFAULT_FILTERS);
  const [exportStatus, setExportStatus] = useState<ExportStatus>({ isExporting: false });
  
  // Use ref to track if we've already logged to prevent spam
  const hasLoggedRef = useRef(false);
  
  // Debounce timer ref
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  // Debounced filter setter - prevents rapid-fire requests
  const setFilters = useCallback((newFilters: ReservationReportFilters) => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set new timer - wait for user to stop typing/clicking
    debounceTimerRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      
      // Check if filters actually changed (distinctUntilChanged equivalent)
      setDebouncedFilters(prev => {
        const changed = JSON.stringify(prev) !== JSON.stringify(newFilters);
        if (changed) {
          console.log('[useReservationReports] 🔄 Filters changed (debounced), will refetch');
        }
        return newFilters;
      });
    }, DEBOUNCE_DELAY);
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Query for report data with optimized configuration
  const {
    data,
    isLoading,
    isSuccess,
    isError,
    error,
    refetch
  }: UseQueryResult<ReservationReportDto, Error> = useQuery({
    // Use debounced filters in query key to prevent unnecessary refetches
    queryKey: [
      'reservation-reports',
      debouncedFilters.period,
      debouncedFilters.startDate,
      debouncedFilters.endDate,
      debouncedFilters.status,
      debouncedFilters.roomType,
      debouncedFilters.source
    ] as const,
    queryFn: async ({ signal }) => {
      // Log only once per query
      if (!hasLoggedRef.current) {
        console.log('[useReservationReports] 🔄 Fetching report data with filters:', {
          period: debouncedFilters.period,
          dates: debouncedFilters.startDate && debouncedFilters.endDate ? `${debouncedFilters.startDate} to ${debouncedFilters.endDate}` : 'N/A',
          status: debouncedFilters.status,
          roomType: debouncedFilters.roomType || 'all',
        });
        hasLoggedRef.current = true;
      }
      
      try {
        // Pass abort signal to service for cancellation support
        const result = await reservationReportsService.getReport(debouncedFilters, signal);
        
        if (isMountedRef.current) {
          console.log('[useReservationReports] ✅ Data fetched successfully:', {
            kpis: result.kpis,
            timeSeriesPoints: result.charts.timeSeries.length,
            rows: result.rows.length
          });
          hasLoggedRef.current = false;
        }
        
        return result;
      } catch (err) {
        if (isMountedRef.current) {
          hasLoggedRef.current = false;
          
          // Don't log canceled requests (they're normal when user changes filters)
          if (axios.isCancel(err)) {
            console.log('[useReservationReports] ⚠️ Request canceled (filters changed)');
          } else {
            console.error('[useReservationReports] ❌ Error fetching data:', err);
          }
        }
        
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh
    gcTime: 10 * 60 * 1000, // 10 minutes - cache time
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnMount: false, // Prevent refetch on component remount if data is fresh
    retry: false, // Disable retries to avoid multiple failed attempts on 404
    retryDelay: 1000, // 1 second delay between retries (only if retry is enabled)
    placeholderData: (previousData) => previousData, // Keep previous data while loading new data
    // Prevent double execution in React Strict Mode
    notifyOnChangeProps: ['data', 'error', 'isLoading'],
  });

  /**
   * Export data to specified format
   * 
   * @param format - Export format (csv or pdf)
   * @param useBackend - If true, use backend export endpoint; otherwise use frontend generation
   */
  const exportData = useCallback(async (format: ExportFormat, useBackend = true): Promise<void> => {
    // For backend export, we don't need current data
    if (!data && !useBackend) {
      toast.error('No hay datos disponibles para exportar');
      return;
    }

    if (!isMountedRef.current) return;

    setExportStatus({ isExporting: true });

    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `reservas-reporte-${timestamp}.${format}`;
      
      // Show appropriate toast based on source
      const source = useBackend ? 'desde el servidor' : 'localmente';
      toast.info(`Generando ${format.toUpperCase()} ${source}...`, { duration: 5000 });
      
      console.log(`[useReservationReports] 📥 Exporting ${format.toUpperCase()} (backend: ${useBackend})`);
      
      // Generate blob using helper
      const blob = await generateExportBlob(format, useBackend, data, debouncedFilters, reservationReportsService);
      
      if (!isMountedRef.current) return;
      
      console.log(`[useReservationReports] ✅ ${format.toUpperCase()} generated successfully (${blob.size} bytes)`);
      
      // Trigger download using helper
      triggerBlobDownload(blob, filename);

      setExportStatus({ isExporting: false });
      toast.success(`Reporte exportado exitosamente como ${filename}`, { duration: 3000 });
    } catch (err) {
      if (!isMountedRef.current) return;
      
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al exportar';
      console.error('[useReservationReports] ❌ Export error:', err);
      
      setExportStatus({ 
        isExporting: false, 
        error: errorMessage 
      });
      
      // Show user-friendly error message
      if (errorMessage.includes('400') || errorMessage.includes('Bad Request')) {
        toast.error('Error en los parámetros del reporte. Verifica el rango de fechas seleccionado.', { duration: 5000 });
      } else if (errorMessage.includes('timeout')) {
        toast.error('La generación del reporte tardó demasiado. Intenta con un rango de fechas más corto.', { duration: 5000 });
      } else {
        toast.error(`Error al exportar: ${errorMessage}`, { duration: 5000 });
      }
    }
  }, [data, debouncedFilters]);

  // Memoized return object to prevent unnecessary re-renders
  return useMemo(() => ({
    data,
    isLoading,
    isSuccess,
    isError,
    error,
    filters: debouncedFilters, // Return debounced filters to reflect actual query state
    setFilters, // This is the debounced setter
    exportData,
    exportStatus,
    refetch: () => {
      console.log('[useReservationReports] Manual refetch triggered');
      hasLoggedRef.current = false;
      refetch();
    },
  }), [
    data,
    isLoading,
    isSuccess,
    isError,
    error,
    debouncedFilters,
    setFilters,
    exportData,
    exportStatus,
    refetch
  ]);
}
