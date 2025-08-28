export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;                    // con código internacional (+506...)
  nationality: string;              // código ISO como 'CR', 'US', 'ES'
  documentType: 'passport' | 'id_card' | 'license';
  documentNumber: string;
  
  // Core system fields
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
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
}
