/**
 * Mappers Index
 * 
 * Exporta todas las funciones de mapeo entre tipos.
 */

// Status mappers
export { mapEstadoIdToStatus, mapStatusToEstadoId } from './statusMappers';

// Legacy API mappers
export { mapApiReservationToReservation, mapSimpleFormToApiPayload } from './legacyMappers';

// New API mappers (re-export from mappers-new.ts for backwards compatibility)
export {
  mapApiClienteToGuest,
  mapApiHabitacionToRoom,
  mapEstadoNombreToStatus,
  mapApiReservaFullToReservation,
} from '../mappers-new';
