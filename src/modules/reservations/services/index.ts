/**
 * Services Index
 * 
 * Exporta todos los servicios especializados del módulo de reservas.
 * Todos los servicios consumen datos directamente del backend API.
 * 
 * Servicios disponibles:
 * - ReservationService (facade principal)
 * - ReservationCrudService (operaciones CRUD)
 * - ReservationQueryService (búsquedas y filtros)
 * - AdditionalServicesService (servicios adicionales)
 * 
 * @module services
 */

// Servicio principal (facade)
export { reservationService } from './reservationService';

// Servicios especializados (para uso avanzado)
export { reservationCrudService } from './crud/ReservationCrudService';
export { reservationQueryService } from './query/ReservationQueryService';
export { additionalServicesService } from './additional/AdditionalServicesService';

// Re-export de clases para testing
export { ReservationCrudService } from './crud/ReservationCrudService';
export { ReservationQueryService } from './query/ReservationQueryService';
export { AdditionalServicesService } from './additional/AdditionalServicesService';