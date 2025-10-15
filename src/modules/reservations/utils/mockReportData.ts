/**
 * Mock Data Generator for Reports
 * 
 * Generates realistic mock data for development and testing
 * This will be replaced with real API calls in production
 */

import type {
  ReservationReportDto,
  ReservationKpiDto,
  ReservationChartDataDto,
  TimeSeriesDataPoint,
  DistributionDataPoint,
  ReservationReportRow,
  ReservationReportFilters
} from '../types/reports';
import type { ReservationStatus } from '../types/enums/ReservationStatus';

/**
 * Colors for chart elements
 */
const CHART_COLORS = {
  roomTypes: ['#1A3636', '#40534C', '#677D6A', '#D6BD98', '#BAD9B1'],
  sources: ['#40534C', '#677D6A', '#1A3636', '#D6BD98'],
  statuses: ['#677D6A', '#40534C', '#D6BD98', '#1A3636', '#BAD9B1', '#E1F2E2', '#D8EAD3', '#D3E2D2'],
};

/**
 * Generate KPI data
 */
function generateKPIs(): ReservationKpiDto {
  return {
    occupancyRate: 78.5,
    totalRevenue: 15850000,
    confirmedReservations: 142,
    cancelledReservations: 18,
    totalReservations: 165,
    averageDailyRate: 85000,
    revPAR: 66750,
  };
}

/**
 * Generate time series data
 */
function generateTimeSeries(): readonly TimeSeriesDataPoint[] {
  const data: TimeSeriesDataPoint[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      reservations: Math.floor(Math.random() * 20) + 10,
      revenue: Math.floor(Math.random() * 500000) + 300000,
      occupancy: Math.floor(Math.random() * 30) + 60,
      cancellations: Math.floor(Math.random() * 3),
    });
  }

  return data;
}

/**
 * Generate distribution by room type
 */
function generateByRoomType(): readonly DistributionDataPoint[] {
  const total = 142;
  const data = [
    { name: 'Suite', value: 35, percentage: 0, color: CHART_COLORS.roomTypes[0] },
    { name: 'Doble', value: 48, percentage: 0, color: CHART_COLORS.roomTypes[1] },
    { name: 'Sencilla', value: 32, percentage: 0, color: CHART_COLORS.roomTypes[2] },
    { name: 'Familiar', value: 18, percentage: 0, color: CHART_COLORS.roomTypes[3] },
    { name: 'Triple', value: 9, percentage: 0, color: CHART_COLORS.roomTypes[4] },
  ];

  return data.map(item => ({
    ...item,
    percentage: (item.value / total) * 100,
  }));
}

/**
 * Generate distribution by source
 */
function generateBySource(): readonly DistributionDataPoint[] {
  const total = 142;
  const data = [
    { name: 'Directo', value: 65, percentage: 0, color: CHART_COLORS.sources[0] },
    { name: 'Booking.com', value: 42, percentage: 0, color: CHART_COLORS.sources[1] },
    { name: 'Expedia', value: 25, percentage: 0, color: CHART_COLORS.sources[2] },
    { name: 'Agencia', value: 10, percentage: 0, color: CHART_COLORS.sources[3] },
  ];

  return data.map(item => ({
    ...item,
    percentage: (item.value / total) * 100,
  }));
}

/**
 * Generate distribution by status
 */
function generateByStatus(): readonly DistributionDataPoint[] {
  const total = 165;
  const data = [
    { name: 'Confirmadas', value: 85, percentage: 0, color: CHART_COLORS.statuses[0] },
    { name: 'Check-in', value: 32, percentage: 0, color: CHART_COLORS.statuses[1] },
    { name: 'Pendientes', value: 15, percentage: 0, color: CHART_COLORS.statuses[2] },
    { name: 'Check-out', value: 10, percentage: 0, color: CHART_COLORS.statuses[3] },
    { name: 'Canceladas', value: 18, percentage: 0, color: CHART_COLORS.statuses[4] },
    { name: 'En espera', value: 3, percentage: 0, color: CHART_COLORS.statuses[5] },
    { name: 'No show', value: 2, percentage: 0, color: CHART_COLORS.statuses[6] },
  ];

  return data.map(item => ({
    ...item,
    percentage: (item.value / total) * 100,
  }));
}

/**
 * Generate chart data
 */
function generateChartData(): ReservationChartDataDto {
  return {
    timeSeries: generateTimeSeries(),
    byRoomType: generateByRoomType(),
    bySource: generateBySource(),
    byStatus: generateByStatus(),
  };
}

/**
 * Generate table rows
 */
function generateRows(): readonly ReservationReportRow[] {
  const statuses: ReservationStatus[] = ['confirmed', 'checked_in', 'checked_out', 'pending', 'cancelled'];
  const roomTypes = ['Suite', 'Doble', 'Sencilla', 'Familiar', 'Triple'];
  const sources = ['Directo', 'Booking.com', 'Expedia', 'Agencia'];
  const guests = [
    'Juan Pérez', 'María González', 'Carlos Rodríguez', 'Ana Martínez',
    'Luis Fernández', 'Carmen López', 'Miguel Sánchez', 'Laura Torres',
    'Pedro Ramírez', 'Sofia Castro', 'Diego Morales', 'Elena Vargas'
  ];

  const rows: ReservationReportRow[] = [];
  const today = new Date();

  for (let i = 0; i < 50; i++) {
    const checkInDate = new Date(today);
    checkInDate.setDate(today.getDate() + Math.floor(Math.random() * 60) - 30);
    
    const nights = Math.floor(Math.random() * 7) + 1;
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkInDate.getDate() + nights);

    rows.push({
      id: `RSV-${String(i + 1).padStart(4, '0')}`,
      confirmationNumber: `CNF${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`,
      guestName: guests[Math.floor(Math.random() * guests.length)],
      roomType: roomTypes[Math.floor(Math.random() * roomTypes.length)],
      checkInDate: checkInDate.toISOString().split('T')[0],
      checkOutDate: checkOutDate.toISOString().split('T')[0],
      nights,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      totalAmount: Math.floor(Math.random() * 300000) + 100000,
    });
  }

  return rows.sort((a, b) => 
    new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime()
  );
}

/**
 * Generate complete report data
 */
export function generateMockReportData(
  filters: ReservationReportFilters
): ReservationReportDto {
  return {
    kpis: generateKPIs(),
    charts: generateChartData(),
    rows: generateRows(),
    filters,
    totalRecords: 50,
  };
}
