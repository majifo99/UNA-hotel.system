/**
 * Room Data Adapter
 * 
 * Handles conversion between legacy Room interfaces and the new consolidated Room interface.
 * This ensures backward compatibility during the migration process.
 */

import type { Room } from '../../../types/core';

// Legacy Room interface (from reservations module)
interface LegacyRoom {
  id: string;
  type: 'single' | 'double' | 'triple' | 'suite' | 'family' | 'deluxe';
  name: string;
  capacity: number;
  pricePerNight: number;
  amenities: string[];
  isAvailable: boolean;
}

/**
 * Convert legacy room data to new Room interface
 */
export function adaptLegacyRoom(legacyRoom: LegacyRoom): Room {
  return {
    ...legacyRoom,
    basePrice: legacyRoom.pricePerNight,
    status: legacyRoom.isAvailable ? 'available' : 'occupied',
    // Add default values for new properties
    number: `${legacyRoom.id.split('-')[1] || '000'}`,
    floor: 1, // Default floor
  };
}

/**
 * Convert array of legacy rooms to new Room interface
 */
export function adaptLegacyRooms(legacyRooms: LegacyRoom[]): Room[] {
  return legacyRooms.map(adaptLegacyRoom);
}

/**
 * Convert new Room interface back to legacy format (for backward compatibility)
 */
export function toLegacyRoom(room: Room): LegacyRoom {
  return {
    id: room.id,
    type: room.type as LegacyRoom['type'],
    name: room.name,
    capacity: room.capacity,
    pricePerNight: room.pricePerNight || room.basePrice || 0,
    amenities: room.amenities,
    isAvailable: room.isAvailable,
  };
}

export default {
  adaptLegacyRoom,
  adaptLegacyRooms,
  toLegacyRoom,
};
