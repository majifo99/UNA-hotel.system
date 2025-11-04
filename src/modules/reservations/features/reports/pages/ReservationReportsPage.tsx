/**
 * Reservation Reports Page
 * 
 * Main page for reservation analytics and reporting
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Download, TrendingUp, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useReservationReports } from '../hooks/useReservationReports';
import { ReportFilters } from '../components/ReportFilters';
import { KpiCard } from '../components/KpiCard';
import { TimeSeriesChart } from '../components/TimeSeriesChart';
import { DistributionChart } from '../components/DistributionChart';
import { ReportsTable } from '../components/ReportsTable';
import { Alert, PageHeader, ContentContainer } from '../../../../../components/ui';
import { ReportsDashboardSkeleton } from '../../../components/ui/Skeleton';
import type { ChartMetric, ExportFormat, ReservationReportFilters } from '../types/reports';

const CHART_METRICS: Array<{ value: ChartMetric; label: string }> = [
  { value: 'reservations', label: 'Reservas' },
  { value: 'revenue', label: 'Ingresos' },
  { value: 'occupancy', label: 'Ocupación' },
  { value: 'cancellations', label: 'Cancelaciones' },
];

export const ReservationReportsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMetric, setSelectedMetric] = useState<ChartMetric>('reservations');
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    data,
    isLoading,
    error,
    filters,
    setFilters,
    exportData,
    exportStatus,
    refetch
  } = useReservationReports();

  // Initialize filters from URL only once on mount
  useEffect(() => {
    if (isInitialized) return;
    
    const period = searchParams.get('periodo') || searchParams.get('period');
    const status = searchParams.get('estado') || searchParams.get('status');
    const roomType = searchParams.get('tipo_habitacion') || searchParams.get('roomType');
    const startDate = searchParams.get('fecha_desde') || searchParams.get('startDate');
    const endDate = searchParams.get('fecha_hasta') || searchParams.get('endDate');

    const hasUrlParams = period || status || roomType || startDate || endDate;
    
    if (hasUrlParams) {
      setFilters({
        period: (period as ReservationReportFilters['period']) || 'all',
        status: (status as ReservationReportFilters['status']) || 'all',
        roomType: roomType || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        metric: 'reservations'
      });
    }
    
    setIsInitialized(true);
  }, [isInitialized, searchParams, setFilters]);

  // Update URL when filters change (but not on initial mount)
  useEffect(() => {
    if (!isInitialized) return;
    
    const params = new URLSearchParams();
    
    if (filters.period && filters.period !== 'all') {
      params.set('periodo', filters.period);
    }
    if (filters.status && filters.status !== 'all') {
      params.set('estado', filters.status);
    }
    if (filters.roomType) {
      params.set('tipo_habitacion', filters.roomType);
    }
    if (filters.startDate) {
      params.set('fecha_desde', filters.startDate);
    }
    if (filters.endDate) {
      params.set('fecha_hasta', filters.endDate);
    }

    setSearchParams(params, { replace: true });
  }, [filters, isInitialized, setSearchParams]);

  const handleFiltersChange = useCallback((newFilters: ReservationReportFilters) => {
    setFilters(newFilters);
  }, [setFilters]);

  const handleApplyFilters = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleClearFilters = useCallback(() => {
    const defaultFilters: ReservationReportFilters = { 
      period: 'all',
      status: 'all', 
      metric: 'reservations' 
    };
    setFilters(defaultFilters);
  }, [setFilters]);

  const handleExport = useCallback(async (format: ExportFormat) => {
    // CSV from frontend, PDF from backend
    const useBackend = format === 'pdf';
    await exportData(format, useBackend);
  }, [exportData]);

  return (
    <ContentContainer>
      {/* Header */}
      <PageHeader
        title="Reportes de Reservaciones"
        subtitle="Análisis y métricas de desempeño del sistema de reservaciones"
        actions={
          <>
            <button
              type="button"
              onClick={() => handleExport('csv')}
              disabled={exportStatus.isExporting || isLoading || !data}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Exportar datos a formato CSV"
            >
              <Download className="w-4 h-4 mr-2" />
              {exportStatus.isExporting ? 'Generando...' : 'Exportar CSV'}
            </button>
            <button
              type="button"
              onClick={() => handleExport('pdf')}
              disabled={exportStatus.isExporting || isLoading || !data}
              className="inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Exportar reporte completo a PDF"
            >
              <Download className="w-4 h-4 mr-2" />
              {exportStatus.isExporting ? 'Generando...' : 'Exportar PDF'}
            </button>
          </>
        }
      />

      {/* Filters */}
      <ReportFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />

      {/* Loading State - Full Dashboard Skeleton */}
      {isLoading && (
        <ReportsDashboardSkeleton />
      )}

      {/* Error State */}
      {error && (
        <div className="mb-6">
          <Alert type="error" title="Error al cargar reportes" message={error.message} />
        </div>
      )}

      {/* Empty State - No data */}
      {!isLoading && !error && data?.kpis.totalReservations === 0 && (
        <div className="mb-6">
          <Alert 
            type="info" 
            title="Sin datos disponibles"
            message="No se encontraron reservas para los filtros seleccionados. Intenta ajustar los filtros o seleccionar un período diferente."
          />
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard
          icon={TrendingUp}
          title="Ocupación Promedio"
          value={data ? `${data.kpis.occupancyRate.toFixed(1)}%` : '-'}
          subtitle="Porcentaje de ocupación"
          color="#1A3636"
          isLoading={isLoading}
        />
        <KpiCard
          icon={DollarSign}
          title="Ingresos Totales"
          value={data ? `₡${data.kpis.totalRevenue.toLocaleString('es-CR')}` : '-'}
          subtitle="Período seleccionado"
          color="#677D6A"
          isLoading={isLoading}
        />
        <KpiCard
          icon={CheckCircle}
          title="Reservas Confirmadas"
          value={data ? data.kpis.confirmedReservations : '-'}
          subtitle={`${data ? data.kpis.totalReservations : 0} totales`}
          color="#40534C"
          isLoading={isLoading}
        />
        <KpiCard
          icon={XCircle}
          title="Cancelaciones"
          value={data ? data.kpis.cancelledReservations : '-'}
          subtitle="Reservas canceladas"
          color="#D6BD98"
          isLoading={isLoading}
        />
      </div>

      {/* Metric selector for time series chart */}
      <div className="mb-4">
        <p className="block text-sm font-medium text-neutral-700 mb-2">
          Métrica a visualizar:
        </p>
        <div className="flex space-x-2">
          {CHART_METRICS.map((metric) => (
            <button
              key={metric.value}
              type="button"
              onClick={() => setSelectedMetric(metric.value)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedMetric === metric.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50'
              }`}
            >
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <TimeSeriesChart
          data={data?.charts.timeSeries || []}
          metric={selectedMetric}
          isLoading={isLoading}
        />
        <DistributionChart
          data={data?.charts.byRoomType || []}
          title="Distribución por Tipo de Habitación"
          category="roomType"
          isLoading={isLoading}
        />
      </div>

      {/* Additional distribution charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DistributionChart
          data={data?.charts.bySource || []}
          title="Distribución por Fuente"
          category="source"
          isLoading={isLoading}
        />
        <DistributionChart
          data={data?.charts.byStatus || []}
          title="Distribución por Estado"
          category="status"
          isLoading={isLoading}
        />
      </div>

      {/* Table */}
      <ReportsTable
        data={data?.rows || []}
        isLoading={isLoading}
      />
    </ContentContainer>
  );
};
