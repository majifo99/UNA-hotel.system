import type { Guest } from '../../../../types/guest';
import type { Room } from '../room';

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
