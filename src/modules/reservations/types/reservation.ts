import type { Guest } from '../../../types/guest';
import type { Room } from './room';

// Simplified reservation form without guest data
export interface SimpleReservationFormData {
  // Guest selection
  guestId?: string; // ID of selected guest
  
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
  paymentMethod?: 'credit_card' | 'debit_card' | 'cash' | 'transfer';
  depositRequired: number;
}

export interface ReservationFormData {
  // Guest information (ID optional for forms)
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
  paymentMethod?: 'credit_card' | 'debit_card' | 'cash' | 'transfer';
  depositRequired: number;
}

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

export type ReservationStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'checked_in' 
  | 'checked_out' 
  | 'cancelled' 
  | 'no_show';

export interface Reservation extends ReservationFormData {
  id: string;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
  confirmationNumber: string;
}
