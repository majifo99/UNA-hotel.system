/**
 * Full Guest Creation Types - Single POST endpoint
 * Matches the new API structure for creating guests in one request
 */

export interface RoomPreferences {
  bedType: 'single' | 'double' | 'queen' | 'king' | 'twin';
  floor: 'low' | 'middle' | 'high';
  view: 'ocean' | 'mountain' | 'city' | 'garden';
  smokingAllowed: boolean;
}

export interface Companions {
  typicalTravelGroup: 'solo' | 'couple' | 'family' | 'business' | 'group';
  hasChildren: boolean;
  childrenAgeRanges: string[]; // e.g., ["0-2", "8-12"]
  preferredOccupancy: number;
  needsConnectedRooms: boolean;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email: string;
}

export interface CreateGuestFullRequest {
  // Basic Information
  nombre: string;
  apellido1: string;
  apellido2?: string; // Second last name
  email: string;
  telefono: string;
  nacionalidad: string;

  // Document Information
  id_tipo_doc: number; // 1=ID, 2=Passport, etc.
  numero_doc: string;

  // Additional Information
  direccion?: string;
  fecha_nacimiento?: string; // YYYY-MM-DD
  genero?: 'M' | 'F' | 'O'; // Male, Female, Other
  es_vip?: boolean;
  notas_personal?: string;

  // Preferences and Requirements
  roomPreferences?: RoomPreferences;
  companions?: Companions;
  allergies?: string[];
  dietaryRestrictions?: string[];
  medicalNotes?: string;
  emergencyContact?: EmergencyContact;
}

export interface CreateGuestFullResponse {
  success: boolean;
  data?: {
    id: string;
    nombre: string;
    apellido1: string;
    email: string;
    telefono: string;
    nacionalidad: string;
  };
  error?: string;
  message?: string;
}