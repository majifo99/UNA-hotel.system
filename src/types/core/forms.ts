/**
 * Form Data Types and Validation - UNA Hotel System
 * 
 * Form interfaces and validation error types used throughout
 * the application for data input and validation.
 */

import type { Guest, Room } from './entities';
import type { 
  DocumentType,
  Gender,
  PreferredFloor,
  RoomView,
  BedType,
  LoyaltyTier,
  RoomType,
  PaymentMethod,
  FrontdeskRoomType,
  FrontdeskPaymentMethod,
  ID
} from './enums';

// =================== GUEST FORM TYPES ===================

/**
 * Guest creation form data
 */
export interface CreateGuestData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  documentType: DocumentType;
  documentNumber: string;
  nationality: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  city?: string;
  country?: string;
  birthDate?: string;
  dateOfBirth?: string;  // Alternative naming for compatibility
  preferredLanguage?: string;
  gender?: Gender;
  allergies?: string[];
  specialRequests?: string;
  notes?: string;
  medicalNotes?: string;
  dietaryRestrictions?: string[];
  communicationPreferences?: {
    email?: boolean;
    sms?: boolean;
    phone?: boolean;
    whatsapp?: boolean;
  };
  roomPreferences?: {
    floor?: PreferredFloor;
    view?: RoomView;
    bedType?: BedType;
    smokingAllowed?: boolean;
  };
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
    email?: string;
  };
  vipStatus?: boolean;
  loyaltyProgram?: {
    memberId?: string;
    tier?: LoyaltyTier;
    points?: number;
  };
  isActive?: boolean;
}

/**
 * Guest update form data
 */
export interface UpdateGuestData extends Partial<CreateGuestData> {
  id: ID;
}

// =================== RESERVATION FORM TYPES ===================

/**
 * Simplified reservation form (without nested guest object)
 */
export interface SimpleReservationFormData {
  guestId: ID;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  numberOfNights: number;
  roomType: RoomType;
  additionalServices: string[];
  subtotal: number;
  servicesTotal: number;
  taxes: number;
  total: number;
  depositRequired: number;
  specialRequests?: string;
}

/**
 * Complete reservation form data with guest
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
  roomId?: ID;
  
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

// =================== FRONTDESK FORM TYPES ===================

/**
 * Check-in form data (frontdesk specific)
 */
export interface CheckInForm {
  reservationId: string | null;
  guest: Omit<Guest, 'id'>;
  roomNumber: string;
  type: FrontdeskRoomType;
  adults: number;
  children: number;
  checkIn: string;
  checkInTime: string;
  checkOut: string;
  payment: FrontdeskPaymentMethod;
  cardLast4?: string;
  extras: {
    breakfast: boolean;
    parking: boolean;
    lateCheckout: boolean;
  };
  notes: string;
}

/**
 * Check-in data
 */
export interface CheckInData {
  reservationId: ID;
  guestId: ID;
  roomId: ID;
  actualCheckInDate: string;
  numberOfGuests: number;
  paymentMethod: PaymentMethod;
  depositPaid: number;
  specialRequests?: string;
}

/**
 * Check-out data
 */
export interface CheckOutData {
  reservationId: ID;
  roomId: ID;
  actualCheckOutDate: string;
  finalBill: number;
  additionalCharges?: number;
  damageCharges?: number;
  refundAmount?: number;
}

// =================== VALIDATION ERROR TYPES ===================

export interface ReservationValidationErrors {
  guestId?: string;
  checkInDate?: string;
  checkOutDate?: string;
  numberOfGuests?: string;
  roomType?: string;
  general?: string;
}

export interface GuestValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  documentNumber?: string;
  nationality?: string;
  general?: string;
}

// =================== UTILITY STATE TYPES ===================

/**
 * Generic loading state
 */
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

/**
 * Generic form state
 */
export interface FormState<T, E = Record<string, string>> extends LoadingState {
  data: T;
  errors: E;
  isDirty: boolean;
  isValid: boolean;
}
