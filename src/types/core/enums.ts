/**
 * Enums and Type Literals - UNA Hotel System
 * 
 * Central location for all enumerated types and literal unions
 * used across the application.
 */

// =================== RESERVATION TYPES ===================

export type ReservationStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'checked_in' 
  | 'checked_out' 
  | 'cancelled' 
  | 'no_show';

// =================== PAYMENT TYPES ===================

export type PaymentMethod = 
  | 'credit_card' 
  | 'debit_card' 
  | 'cash' 
  | 'transfer'
  | 'card';  // Legacy support for frontdesk module

// =================== ROOM TYPES ===================

export type RoomType = 'single' | 'double' | 'triple' | 'suite' | 'family' | 'deluxe';

export type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'cleaning';

// Additional frontdesk specific types for compatibility
export type FrontdeskRoomStatus = 'available' | 'reserved' | 'checked-in' | 'checked-out' | 'maintenance';
export type FrontdeskRoomType = 'Deluxe' | 'Standard' | 'Suite';
export type FrontdeskPaymentMethod = 'cash' | 'card' | 'transfer';

// =================== GUEST TYPES ===================

export type DocumentType = 'passport' | 'license' | 'id_card';

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export type PreferredFloor = 'low' | 'high' | 'middle';

export type RoomView = 'ocean' | 'mountain' | 'city' | 'garden';

export type BedType = 'single' | 'double' | 'queen' | 'king' | 'twin';

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';

// =================== SERVICE TYPES ===================

export type ServiceCategory = 'food' | 'spa' | 'transport' | 'entertainment' | 'other';

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
