/**
 * Reservation Domain Types - Specific to Reservations Module
 * 
 * These types represent the reservation workflow and business logic
 * that are specific to the reservations module. They should not be
 * shared across other modules.
 */

import type { Guest, Room } from '../../../types/core/domain';

// =================== RESERVATION ENTITIES ===================

/**
 * Reservation Status - specific to reservation workflow
 */
export type ReservationStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'checked_in' 
  | 'checked_out' 
  | 'cancelled' 
  | 'no_show';

/**
 * Payment Method - for reservation payments
 */
export type PaymentMethod = 
  | 'credit_card' 
  | 'debit_card' 
  | 'cash' 
  | 'transfer';

/**
 * Reservation entity - specific to the reservations module
 */
export interface Reservation {
  id: string;
  confirmationNumber: string;
  
  // Guest & Room references
  guestId: string;
  guest?: Guest; // Populated in some contexts
  roomId: string;
  roomType?: string; // Room type for compatibility
  room?: Room; // Populated in some contexts
  
  // Dates & Stay
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  numberOfNights: number;
  
  // Services & Pricing
  additionalServices: string[];
  subtotal: number;
  servicesTotal: number;
  taxes: number;
  total: number;
  depositRequired: number;
  
  // Status & Metadata
  status: ReservationStatus;
  specialRequests?: string;
  paymentMethod?: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

// =================== FORM DATA TYPES ===================

/**
 * Complete reservation form data (includes guest object)
 */
export interface ReservationFormData {
  // Guest information
  guest: Guest;
  
  // Reservation details
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  numberOfNights: number;
  
  // Room selection
  roomType: Room['type'];
  roomId?: string;
  
  // Additional services
  additionalServices: string[]; // Array of service IDs
  
  // Pricing
  subtotal: number;
  servicesTotal: number;
  taxes: number;
  total: number;
  
  // Special requests
  specialRequests?: string;
  
  // Payment
  paymentMethod?: PaymentMethod;
  depositRequired: number;
}

/**
 * Simplified reservation form (uses guest ID instead of guest object)
 */
export interface SimpleReservationFormData {
  // Guest selection
  guestId: string; // ID of selected guest (required)
  
  // Reservation details
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  numberOfNights: number;
  
  // Room selection
  roomType: Room['type'];
  roomId?: string;
  
  // Additional services
  additionalServices: string[]; // Array of service IDs
  
  // Pricing
  subtotal: number;
  servicesTotal: number;
  taxes: number;
  total: number;
  
  // Special requests
  specialRequests?: string;
  
  // Payment
  paymentMethod?: PaymentMethod;
  depositRequired: number;
}

// =================== VALIDATION TYPES ===================

/**
 * Validation errors for reservation forms
 */
export interface ReservationValidationErrors {
  guestId?: string;
  guest?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    documentNumber?: string;
  };
  checkInDate?: string;
  checkOutDate?: string;
  numberOfGuests?: string;
  roomType?: string;
  general?: string;
}
