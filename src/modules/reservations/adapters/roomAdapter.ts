import type { Room } from '../../../types/core/domain';

// Legacy room interface (from old adapters)
interface LegacyRoom {
  id: string;
  number?: string;
  type: string;
  name: string;
  capacity: number;
  pricePerNight: number;
  basePrice?: number;
  amenities: string[];
  isAvailable: boolean;
  status?: string;
  floor?: number;
  description?: string;
  images?: string[];
}

/**
 * Adapts legacy rooms to the new domain format
 */
export const adaptLegacyRooms = (legacyRooms: LegacyRoom[]): Room[] => {
  return legacyRooms.map((room): Room => ({
    id: room.id,
    number: room.number,
    type: mapLegacyRoomType(room.type),
    name: room.name,
    capacity: room.capacity,
    pricePerNight: room.pricePerNight,
    basePrice: room.basePrice || room.pricePerNight,
    amenities: room.amenities,
    isAvailable: room.isAvailable,
    status: mapLegacyRoomStatus(room.status),
    floor: room.floor,
    description: room.description,
    images: room.images,
  }));
};

function mapLegacyRoomType(legacyType: string): Room['type'] {
  const typeMap: Record<string, Room['type']> = {
    'Standard': 'single',
    'Deluxe': 'deluxe',
    'Suite': 'suite',
    'Presidential': 'suite',
    'single': 'single',
    'double': 'double',
    'triple': 'triple',
    'suite': 'suite',
    'family': 'family',
    'deluxe': 'deluxe',
  };
  
  return typeMap[legacyType] || 'single';
}

function mapLegacyRoomStatus(legacyStatus?: string): Room['status'] {
  const statusMap: Record<string, Room['status']> = {
    'available': 'available',
    'occupied': 'occupied',
    'maintenance': 'maintenance',
    'cleaning': 'cleaning',
    'checked-in': 'occupied',
    'checked-out': 'cleaning',
    'reserved': 'available', // Reserved but not yet occupied
  };
  
  return legacyStatus ? statusMap[legacyStatus] : 'available';
}
