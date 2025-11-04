/**
 * Room Mapping Utilities
 * 
 * Utilities to convert between different room types across modules
 */

import type { Room } from '../../../types/core/domain';
import type { FrontdeskRoom, FrontdeskRoomStatus, FrontdeskRoomType } from '../types/domain';

/**
 * Maps a core Room status to FrontdeskRoomStatus
 */
const mapRoomStatus = (status: Room['status']): FrontdeskRoomStatus => {
  switch (status) {
    case 'available':
      return 'available';
    case 'occupied':
      return 'occupied';
    case 'maintenance':
      return 'maintenance';
    case 'cleaning':
      return 'cleaning';
    default:
      return 'available';
  }
};

/**
 * Maps a core Room type to FrontdeskRoomType
 */
const mapRoomType = (type: Room['type']): FrontdeskRoomType => {
  switch (type) {
    case 'suite':
      return 'Suite';
    case 'deluxe':
      return 'Deluxe';
    case 'single':
    case 'double':
    case 'triple':
    case 'family':
    default:
      return 'Standard';
  }
};

/**
 * Converts a Room to a FrontdeskRoom
 */
export const mapRoomToFrontdeskRoom = (room: Room): FrontdeskRoom => {
  return {
    ...room,
    status: mapRoomStatus(room.status),
    type: mapRoomType(room.type),
    roomNumber: room.number || room.id,
    // Ensure all required FrontdeskRoom properties are present
    name: room.name,
    capacity: room.capacity,
    pricePerNight: room.pricePerNight,
    amenities: room.amenities,
    isAvailable: room.isAvailable,
  };
};

/**
 * Converts an array of Rooms to an array of FrontdeskRooms
 */
export const mapRoomsToFrontdeskRooms = (rooms: Room[]): FrontdeskRoom[] => {
  return rooms.map(mapRoomToFrontdeskRoom);
};

/**
 * Converts a FrontdeskRoom back to a Room (if needed)
 */
export const mapFrontdeskRoomToRoom = (frontdeskRoom: FrontdeskRoom): Room => {
  // Map frontdesk status back to core Room status
  let coreStatus: Room['status'];
  switch (frontdeskRoom.status) {
    case 'checked-in':
      coreStatus = 'occupied';
      break;
    case 'checked-out':
    case 'reserved':
      coreStatus = 'available';
      break;
    default:
      coreStatus = frontdeskRoom.status as Room['status'];
  }

  return {
    id: frontdeskRoom.id,
    number: frontdeskRoom.roomNumber || frontdeskRoom.id,
    type: frontdeskRoom.type.toLowerCase() as Room['type'],
    name: frontdeskRoom.name,
    capacity: frontdeskRoom.capacity,
    pricePerNight: frontdeskRoom.pricePerNight,
    amenities: frontdeskRoom.amenities,
    isAvailable: frontdeskRoom.isAvailable,
    status: coreStatus,
    floor: frontdeskRoom.floor,
    description: frontdeskRoom.description,
  };
};