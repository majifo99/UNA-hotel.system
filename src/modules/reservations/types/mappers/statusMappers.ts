/**
 * Status Mappers
 * 
 * Funciones para mapear estados entre backend (IDs numéricos) y frontend (strings).
 */

import type { ReservationStatus } from '../enums';

/**
 * mapEstadoIdToStatus
 * 
 * Convierte el ID numérico del estado del backend al tipo ReservationStatus del frontend.
 * 
 * Mapeo según la base de datos:
 * 1 - Pendiente, 2 - Cancelada, 3 - Confirmada, 4 - Check-in, 
 * 5 - Check-out, 6 - No show, 7 - En espera, 8 - Finalizada
 * 
 * @param id - ID del estado en la base de datos
 * @returns Estado en formato frontend
 */
export function mapEstadoIdToStatus(id?: number): ReservationStatus {
  switch (id) {
    case 1:
      return 'pending';
    case 2:
      return 'cancelled';
    case 3:
      return 'confirmed';
    case 4:
      return 'checked_in';
    case 5:
      return 'checked_out';
    case 6:
      return 'no_show';
    case 7:
      return 'waiting';
    case 8:
      return 'completed';
    default:
      return 'pending';
  }
}

/**
 * mapStatusToEstadoId
 * 
 * Convierte el ReservationStatus del frontend al ID numérico del backend.
 * 
 * @param status - Estado en formato frontend
 * @returns ID del estado para enviar al backend
 */
export function mapStatusToEstadoId(status: ReservationStatus): number {
  switch (status) {
    case 'pending':
      return 1;
    case 'cancelled':
      return 2;
    case 'confirmed':
      return 3;
    case 'checked_in':
      return 4;
    case 'checked_out':
      return 5;
    case 'no_show':
      return 6;
    case 'waiting':
      return 7;
    case 'completed':
      return 8;
    default:
      return 1; // Default to pending
  }
}
