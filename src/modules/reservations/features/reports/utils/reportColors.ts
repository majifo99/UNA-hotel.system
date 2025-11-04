/**
 * Report Colors Utility
 * 
 * RE-EXPORTS semantic color functions from core theme system.
 * This file exists for backwards compatibility with existing report components.
 * 
 * @deprecated Import directly from '@core/theme/semantic' for new code
 */

import type { ReservationStatus } from '../types/enums/ReservationStatus';
import {
  getStatusChartColor,
  getRoomTypeColor,
  getSourceColor,
  getMetricColor,
} from '../../../../../core/theme/semantic';

/**
 * Get semantic color for reservation status
 * 
 * @deprecated Use `getStatusChartColor` from '@core/theme/semantic'
 */
export function getStatusColor(status: ReservationStatus): string {
  return getStatusChartColor(status);
}

/**
 * Get color for room type (using institutional palette)
 * 
 * @deprecated Use `getRoomTypeColor` from '@core/theme/semantic'
 */
export { getRoomTypeColor };

/**
 * Get color for reservation source
 * 
 * @deprecated Use `getSourceColor` from '@core/theme/semantic'
 */
export { getSourceColor };

/**
 * Get chart metric color (for time series)
 * 
 * @deprecated Use `getMetricColor` from '@core/theme/semantic'
 */
export { getMetricColor };

/**
 * Map distribution colors based on category type
 * Uses semantic color functions for meaningful color assignment
 */
export function getDistributionColor(
  name: string, 
  category: 'status' | 'roomType' | 'source', 
  index: number
): string {
  if (category === 'status') {
    // Map Spanish status names to enum values
    const statusMap: Record<string, ReservationStatus> = {
      'Confirmada': 'confirmed',
      'Pendiente': 'pending',
      'Check-in': 'checked_in',
      'Check-out': 'checked_out',
      'Cancelada': 'cancelled',
      'No Show': 'no_show',
      'En Espera': 'waiting',
      'Completada': 'completed'
    };
    
    const status = statusMap[name];
    if (status) {
      return getStatusChartColor(status);
    }
  }
  
  if (category === 'roomType') {
    return getRoomTypeColor(index);
  }
  
  if (category === 'source') {
    // Map common Spanish source names
    const sourceMap: Record<string, string> = {
      'Booking.com': 'Web',
      'Telefono': 'Teléfono',
      'Teléfono': 'Teléfono',
      'Correo': 'Email',
      'Walk-in': 'Walk-in',
      'Agencia': 'Agencia'
    };
    
    return getSourceColor(sourceMap[name] || name);
  }
  
  // Fallback to institutional palette
  return getRoomTypeColor(index);
}

