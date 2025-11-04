/**
 * Local Room Mapping for Frontdesk Component
 * 
 * Utilities to convert the local Room type used in Frontdesk.tsx to FrontdeskRoom
 */

import type { FrontdeskRoom, FrontdeskRoomStatus, FrontdeskRoomType } from '../modules/frontdesk/types/domain';

// Local Room type from Frontdesk.tsx
type LocalRoom = {
  id: string;
  roomNumber: string;
  type: 'Deluxe' | 'Standard' | 'Suite';
  guestName: string | null;
  checkIn: string | null;
  checkOut: string | null;
  status: 'available' | 'reserved' | 'occupied' | 'cleaning' | 'maintenance' | 'checked-out';
  reservationStatus?: 'pending' | 'cancelled' | 'confirmed' | 'checked-in' | 'checked-out' | 'no-show' | 'waiting' | 'completed';
};

// Alternative Local Room type with string type (from DashboardWithStats.tsx)
type LocalRoomFlexible = {
  id: string;
  roomNumber: string;
  type: string;
  guestName: string | null;
  checkIn: string | null;
  checkOut: string | null;
  status: 'available' | 'reserved' | 'checked-in' | 'checked-out' | 'maintenance';
};

/**
 * Maps local Room status to FrontdeskRoomStatus
 */
const mapLocalRoomStatus = (status: LocalRoom['status']): FrontdeskRoomStatus => {
  switch (status) {
    case 'available':
      return 'available';
    case 'reserved':
      return 'reserved';
    case 'occupied':
      return 'occupied';
    case 'cleaning':
      return 'cleaning';
    case 'maintenance':
      return 'maintenance';
    case 'checked-out':
      return 'checked-out';
    default:
      return 'available';
  }
};

/**
 * Maps local Room type to FrontdeskRoomType (more flexible version)
 */
const mapLocalRoomTypeFlexible = (type: string): FrontdeskRoomType => {
  switch (type) {
    case 'Suite':
      return 'Suite';
    case 'Deluxe':
      return 'Deluxe';
    case 'Standard':
    default:
      return 'Standard';
  }
};
/**
 * Maps local Room type to FrontdeskRoomType
 */
const mapLocalRoomType = (type: LocalRoom['type']): FrontdeskRoomType => {
  return type; // They're already compatible
};

/**
 * Maps local Room status to FrontdeskRoomStatus (flexible version)
 */
const mapLocalRoomStatusFlexible = (status: string): FrontdeskRoomStatus => {
  switch (status) {
    case 'available':
      return 'available';
    case 'reserved':
      return 'reserved';
    case 'occupied':
      return 'occupied';
    case 'checked-in':
      return 'checked-in';
    case 'checked-out':
      return 'checked-out';
    case 'cleaning':
      return 'cleaning';
    case 'maintenance':
      return 'maintenance';
    default:
      return 'available';
  }
};

/**
 * Converts a flexible local Room to a FrontdeskRoom
 */
export const mapFlexibleLocalRoomToFrontdeskRoom = (room: LocalRoomFlexible): FrontdeskRoom => {
  // Calculate capacity based on room type
  let capacity: number;
  switch (room.type) {
    case 'Suite':
      capacity = 4;
      break;
    case 'Deluxe':
      capacity = 3;
      break;
    default:
      capacity = 2;
  }

  // Calculate price based on room type
  let pricePerNight: number;
  switch (room.type) {
    case 'Suite':
      pricePerNight = 150;
      break;
    case 'Deluxe':
      pricePerNight = 120;
      break;
    default:
      pricePerNight = 80;
  }

  // Set amenities based on room type
  let amenities: string[];
  switch (room.type) {
    case 'Suite':
      amenities = ['WiFi', 'TV', 'Minibar', 'Jacuzzi', 'Balcón'];
      break;
    case 'Deluxe':
      amenities = ['WiFi', 'TV', 'Minibar', 'Balcón'];
      break;
    default:
      amenities = ['WiFi', 'TV'];
  }

  return {
    id: room.id,
    roomNumber: room.roomNumber,
    status: mapLocalRoomStatusFlexible(room.status),
    type: mapLocalRoomTypeFlexible(room.type),
    guestName: room.guestName || undefined,
    checkIn: room.checkIn || undefined,
    checkOut: room.checkOut || undefined,
    
    // Required FrontdeskRoom properties - using calculated values
    name: `Habitación ${room.roomNumber}`,
    capacity,
    pricePerNight,
    amenities,
    isAvailable: room.status === 'available',
    
    // Optional frontdesk-specific fields
    currentGuest: room.guestName ? {
      name: room.guestName,
      checkIn: room.checkIn || '',
      checkOut: room.checkOut || '',
    } : undefined,
  };
};

/**
 * Converts an array of flexible local Rooms to an array of FrontdeskRooms
 */
export const mapFlexibleLocalRoomsToFrontdeskRooms = (rooms: LocalRoomFlexible[]): FrontdeskRoom[] => {
  return rooms.map(mapFlexibleLocalRoomToFrontdeskRoom);
};

/**
 * Converts a local Room to a FrontdeskRoom
 */
export const mapLocalRoomToFrontdeskRoom = (room: LocalRoom): FrontdeskRoom => {
  // Calculate capacity based on room type
  let capacity: number;
  switch (room.type) {
    case 'Suite':
      capacity = 4;
      break;
    case 'Deluxe':
      capacity = 3;
      break;
    default:
      capacity = 2;
  }

  // Calculate price based on room type
  let pricePerNight: number;
  switch (room.type) {
    case 'Suite':
      pricePerNight = 150;
      break;
    case 'Deluxe':
      pricePerNight = 120;
      break;
    default:
      pricePerNight = 80;
  }

  // Set amenities based on room type
  let amenities: string[];
  switch (room.type) {
    case 'Suite':
      amenities = ['WiFi', 'TV', 'Minibar', 'Jacuzzi', 'Balcón'];
      break;
    case 'Deluxe':
      amenities = ['WiFi', 'TV', 'Minibar', 'Balcón'];
      break;
    default:
      amenities = ['WiFi', 'TV'];
  }

  return {
    id: room.id,
    roomNumber: room.roomNumber,
    status: mapLocalRoomStatus(room.status),
    type: mapLocalRoomType(room.type),
    guestName: room.guestName || undefined,
    checkIn: room.checkIn || undefined,
    checkOut: room.checkOut || undefined,
    
    // Required FrontdeskRoom properties - using calculated values
    name: `Habitación ${room.roomNumber}`,
    capacity,
    pricePerNight,
    amenities,
    isAvailable: room.status === 'available',
    
    // Optional frontdesk-specific fields
    currentGuest: room.guestName ? {
      name: room.guestName,
      checkIn: room.checkIn || '',
      checkOut: room.checkOut || '',
    } : undefined,
  };
};

/**
 * Converts an array of local Rooms to an array of FrontdeskRooms
 */
export const mapLocalRoomsToFrontdeskRooms = (rooms: LocalRoom[]): FrontdeskRoom[] => {
  return rooms.map(mapLocalRoomToFrontdeskRoom);
};