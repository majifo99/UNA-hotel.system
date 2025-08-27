/**
 * Tipos centralizados para manejo de huéspedes
 * 
 * Este archivo centraliza todos los tipos relacionados con huéspedes
 * para evitar duplicidades entre módulos.
 */

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;                    // con código internacional (+506...)
  nationality: string;              // código ISO como 'CR', 'US', 'ES'
  documentType: 'passport' | 'id' | 'license';
  documentNumber: string;
  
  // Información personal adicional
  dateOfBirth?: string;             // YYYY-MM-DD
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  
  // Dirección
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  
  // Información médica y preferencias
  allergies?: string[];             // ['nuts', 'shellfish', 'dairy']
  medicalNotes?: string;            // Notas médicas adicionales
  dietaryRestrictions?: string[];   // ['vegetarian', 'vegan', 'gluten_free']
  
  // Preferencias de comunicación
  preferredLanguage?: string;       // 'es', 'en', 'fr'
  communicationPreferences?: {
    email?: boolean;
    sms?: boolean;
    phone?: boolean;
    whatsapp?: boolean;
  };
  
  // Preferencias de habitación
  roomPreferences?: {
    floor?: 'low' | 'high' | 'middle';
    view?: 'ocean' | 'mountain' | 'city' | 'garden';
    bedType?: 'single' | 'double' | 'queen' | 'king' | 'twin';
    smokingAllowed?: boolean;
  };
  
  // Información de contacto de emergencia
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
    email?: string;
  };
  
  // Notas generales
  notes?: string;                   // Notas adicionales del staff
  vipStatus?: boolean;              // Cliente VIP
  loyaltyProgram?: {
    memberId?: string;
    tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
    points?: number;
  };
  
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGuestData extends Omit<Guest, 'id' | 'createdAt' | 'updatedAt'> {}

export interface UpdateGuestData extends Partial<CreateGuestData> {}

export interface GuestSearchFilters {
  query?: string;
  nationality?: string;
  documentType?: Guest['documentType'];
}

export interface GuestListResponse {
  guests: Guest[];
  total: number;
  page: number;
  limit: number;
}
