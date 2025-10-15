/**
 * Reservation Reports Page
 * 
 * Main page for reservation analytics and reporting
 */

import React, { useState } from 'react';
import { Download, TrendingUp, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { useReservationReports } from '../hooks/useReservationReports';
import { ReportFilters } from '../components/reports/ReportFilters';
import { KpiCard } from '../components/reports/KpiCard';
import { TimeSeriesChart } from '../components/reports/TimeSeriesChart';
import { DistributionChart } from '../components/reports/DistributionChart';
import { ReportsTable } from '../components/reports/ReportsTable';
import type { ChartMetric, ExportFormat } from '../types/reports';

const CHART_METRICS: Array<{ value: ChartMetric; label: string }> = [
  { value: 'reservations', label: 'Reservas' },
  { value: 'revenue', label: 'Ingresos' },
  { value: 'occupancy', label: 'Ocupación' },
  { value: 'cancellations', label: 'Cancelaciones' },
];

export const ReservationReportsPage: React.FC = () => {
  const {
    data,
    isLoading,
    filters,
    setFilters,
    exportData,
    exportStatus,
    refetch
  } = useReservationReports();

  const [selectedMetric, setSelectedMetric] = useState<ChartMetric>('reservations');
  const [tempFilters, setTempFilters] = useState(filters);

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    refetch();
  };

  const handleClearFilters = () => {
    const defaultFilters = { status: 'all', metric: 'reservations' };
    setTempFilters(defaultFilters as typeof filters);
    setFilters(defaultFilters as typeof filters);
  };

  const handleExport = async (format: ExportFormat) => {
    await exportData(format);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Reportes de Reservaciones
            </h1>
            <p className="mt-2 text-sm text-neutral-600">
              Análisis y métricas de desempeño del sistema de reservaciones
            </p>
          </div>
          
          {/* Export buttons */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => handleExport('csv')}
              disabled={exportStatus.isExporting || isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              {exportStatus.isExporting ? 'Exportando...' : 'Exportar CSV'}
            </button>
            <button
              type="button"
              onClick={() => handleExport('pdf')}
              disabled={exportStatus.isExporting || isLoading}
              className="inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              {exportStatus.isExporting ? 'Exportando...' : 'Exportar PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <ReportFilters
        filters={tempFilters}
        onFiltersChange={setTempFilters}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />

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
          isLoading={isLoading}
        />
      </div>

      {/* Additional distribution charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DistributionChart
          data={data?.charts.bySource || []}
          title="Distribución por Fuente"
          isLoading={isLoading}
        />
        <DistributionChart
          data={data?.charts.byStatus || []}
          title="Distribución por Estado"
          isLoading={isLoading}
        />
      </div>

      {/* Table */}
      <ReportsTable
        data={data?.rows || []}
        isLoading={isLoading}
      />
    </div>
  );
};
