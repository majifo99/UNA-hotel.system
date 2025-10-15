/**
 * Report Colors Utility
 * 
 * Semantic colors for charts based on data meaning
 */

import type { ReservationStatus } from '../types/enums/ReservationStatus';

/**
 * Get semantic color for reservation status
 */
export function getStatusColor(status: ReservationStatus): string {
  const colorMap: Record<ReservationStatus, string> = {
    pending: '#FFA500',        // Orange - Waiting
    confirmed: '#4CAF50',      // Green - Good
    checked_in: '#2196F3',     // Blue - Active
    checked_out: '#9E9E9E',    // Gray - Completed
    cancelled: '#F44336',      // Red - Negative
    no_show: '#D32F2F',        // Dark Red - Critical
    waiting: '#FF9800',        // Amber - Attention
    completed: '#8BC34A'       // Light Green - Success
  };

  return colorMap[status] || '#9E9E9E';
}

/**
 * Get color for room type (using institutional palette)
 */
export function getRoomTypeColor(index: number): string {
  const colors = [
    '#1A3636', // Dark teal
    '#40534C', // Medium teal
    '#677D6A', // Light teal
    '#D6BD98', // Beige
    '#8B7355', // Brown
  ];
  
  return colors[index % colors.length];
}

/**
 * Get color for reservation source
 */
export function getSourceColor(source: string): string {
  const colorMap: Record<string, string> = {
    'Web': '#2196F3',      // Blue
    'Teléfono': '#4CAF50', // Green
    'Email': '#FF9800',    // Orange
    'Walk-in': '#9C27B0',  // Purple
    'Agencia': '#00BCD4',  // Cyan
  };

  return colorMap[source] || '#607D8B'; // Default gray
}

/**
 * Get chart metric color (for time series)
 */
export function getMetricColor(metric: string): string {
  const colorMap: Record<string, string> = {
    reservations: '#2196F3', // Blue
    revenue: '#4CAF50',      // Green
    occupancy: '#FF9800',    // Orange
    cancellations: '#F44336' // Red
  };

  return colorMap[metric] || '#1A3636';
}
