/**
 * Reservations Module Types - Central Export
 * 
 * All types specific to the reservations module.
 * For shared domain entities (Guest, Room), import from @/types/core
 */

// Core domain entities (shared)
export type { Guest, Room, AdditionalService } from '../../../types/core';

// Reservation-specific domain types
export type { 
  Reservation,
  ReservationStatus,
  PaymentMethod,
  ReservationFormData,
  SimpleReservationFormData,
  ReservationValidationErrors
} from './domain';
