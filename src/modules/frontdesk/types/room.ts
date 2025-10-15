// Tipos para información de habitaciones
export interface RoomInfo {
  number: string;
  type: string;
  capacity: {
    adults: number;
    children: number;
    total: number;
  };
  floor: number;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  amenities: string[];
  price: {
    base: number;
    currency: string;
  };
  features: {
    hasBalcony: boolean;
    hasSeaView: boolean;
    hasKitchen: boolean;
    smokingAllowed: boolean;
  };
  guestName?: string; // Name of the guest occupying the room
}

export interface RoomSearchFilters {
  checkIn: string;
  checkOut: string;
  guests: number;
  roomType?: string;
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface RoomAvailability {
  room: RoomInfo;
  isAvailable: boolean;
  conflictingReservations?: string[];
  nextAvailableDate?: string;
}

// Tipos para el estado del selector de habitación
export interface RoomSelectionState {
  selectedRoom: RoomInfo | null;
  availableRooms: RoomInfo[];
  isLoading: boolean;
  searchFilters: RoomSearchFilters;
  suggestions: string[];
}