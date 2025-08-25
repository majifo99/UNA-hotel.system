export interface Guest {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  documentType: 'passport' | 'id' | 'license';
  documentNumber: string;
}

export interface Room {
  id: string;
  type: 'single' | 'double' | 'triple' | 'suite' | 'family';
  name: string;
  capacity: number;
  pricePerNight: number;
  amenities: string[];
  isAvailable: boolean;
}

export interface AdditionalService {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'food' | 'spa' | 'transport' | 'entertainment' | 'other';
}

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
  paymentMethod?: 'credit_card' | 'debit_card' | 'cash' | 'transfer';
  depositRequired: number;
}

export interface ReservationValidationErrors {
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
