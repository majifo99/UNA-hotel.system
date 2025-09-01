/**
 * Core Domain Entities - UNA Hotel System
 * 
 * These are the central domain concepts that are shared across all modules.
 * Only truly shared business entities should be here.
 */

// =================== SHARED DOMAIN ENTITIES ===================

/**
 * Core Guest entity - central to the hotel business domain
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
  dateOfBirth?: string;  // Alternative naming for compatibility
  preferredLanguage?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  
  // Hotel-specific
  allergies?: string[];
  specialRequests?: string;
  notes?: string;
  
  // Medical and dietary information
  medicalNotes?: string;
  dietaryRestrictions?: string[];
  
  // Communication preferences
  communicationPreferences?: {
    email?: boolean;
    sms?: boolean;
    phone?: boolean;
    whatsapp?: boolean;
  };
  
  // Room preferences
  roomPreferences?: {
    floor?: 'low' | 'high' | 'middle';
    view?: 'ocean' | 'mountain' | 'city' | 'garden';
    bedType?: 'single' | 'double' | 'queen' | 'king' | 'twin';
    smokingAllowed?: boolean;
  };
  
  // Emergency contact
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
    email?: string;
  };
  
  // VIP and loyalty
  vipStatus?: boolean;
  loyaltyProgram?: {
    memberId?: string;
    tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
    points?: number;
  };
  
  // System
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

/**
 * Core Room entity - physical resource shared across modules
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
 * Additional Service - shared across reservation and frontdesk modules
 */
export interface AdditionalService {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: 'room_service' | 'spa' | 'restaurant' | 'transport' | 'food' | 'entertainment' | 'other';
  isActive: boolean;
}
