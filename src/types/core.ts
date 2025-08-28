/**
 * Centralized Type Definitions - UNA Hotel System
 * 
 * This file consolidates all shared types across modules to prevent duplication
 * and ensure consistency throughout the application.
 * 
 * Organization:
 * - Core entities (Guest, Room, Reservation)
 * - API responses and requests
 * - Form data and validation
 * - Utility types
 */

// =================== CORE ENTITIES ===================

/**
 * Core Guest entity - single source of truth
 */
export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Identity & Address
  documentType: 'passport' | 'license' | 'id_card';
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
  
  // Personal Details
  birthDate?: string;
  preferredLanguage?: string;
  
  // Hotel-specific
  allergies?: string[];
  specialRequests?: string;
  notes?: string;
  
  // System
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

/**
 * Core Room entity
 */
export interface Room {
  id: string;
  number?: string; // Room number (optional for backward compatibility)
  type: 'single' | 'double' | 'triple' | 'suite' | 'family' | 'deluxe';
  name: string;
  capacity: number;
  
  // Pricing (unified naming)
  basePrice?: number; // New standard naming
  pricePerNight: number; // Legacy support - required for compatibility
  
  // Features & Status
  amenities: string[];
  isAvailable: boolean;
  status?: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  
  // Additional properties (optional for future use)
  floor?: number;
  description?: string;
  images?: string[];
}

/**
 * Core Reservation entity
 */
export interface Reservation {
  id: string;
  confirmationNumber: string;
  
  // Guest & Room
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

// =================== ENUMS & LITERALS ===================

export type ReservationStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'checked_in' 
  | 'checked_out' 
  | 'cancelled' 
  | 'no_show';

export type PaymentMethod = 
  | 'credit_card' 
  | 'debit_card' 
  | 'cash' 
  | 'transfer';

export type RoomType = Room['type'];
export type RoomStatus = Room['status'];
export type DocumentType = Guest['documentType'];

// =================== FORM DATA TYPES ===================

/**
 * Simplified reservation form (without nested guest object)
 */
export interface SimpleReservationFormData {
  guestId: string;
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
  address?: string;
  city?: string;
  country?: string;
  birthDate?: string;
  preferredLanguage?: string;
  allergies?: string[];
  specialRequests?: string;
  notes?: string;
}

/**
 * Guest update form data
 */
export interface UpdateGuestData extends Partial<CreateGuestData> {
  id: string;
}

// =================== VALIDATION TYPES ===================

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

// =================== API RESPONSE TYPES ===================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Guest search filters
 */
export interface GuestSearchFilters {
  query?: string;
  nationality?: string;
  documentType?: DocumentType;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Guest list response
 */
export interface GuestListResponse extends PaginatedResponse<Guest> {}

// =================== SERVICE TYPES ===================

/**
 * Additional hotel service
 */
export interface AdditionalService {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'food' | 'spa' | 'transport' | 'entertainment' | 'other';
  isActive: boolean;
}

/**
 * Check-in data
 */
export interface CheckInData {
  reservationId: string;
  guestId: string;
  roomId: string;
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
  reservationId: string;
  roomId: string;
  actualCheckOutDate: string;
  finalBill: number;
  additionalCharges?: number;
  damageCharges?: number;
  refundAmount?: number;
}

// =================== UTILITY TYPES ===================

/**
 * Generic ID type for type safety
 */
export type ID = string;

/**
 * Date string in ISO format
 */
export type ISODateString = string;

/**
 * Email string type
 */
export type Email = string;

/**
 * Phone number string type
 */
export type PhoneNumber = string;

/**
 * Currency amount (in cents to avoid floating point issues)
 */
export type CurrencyAmount = number;

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

// =================== EXPORTS ===================

// All types are already exported inline above
// No need for re-export section
