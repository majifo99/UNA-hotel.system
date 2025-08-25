import type { Room } from '../types';
import { simulateApiCall, cloneData } from '../utils/mockApi';
import { roomsData } from '../data/roomsData';

class RoomService {
  async getAvailableRooms(checkIn: string | Date, checkOut: string | Date, numberOfGuests?: number, roomType?: string): Promise<Room[]> {
    // Convert strings to dates if needed
    const checkInDate = typeof checkIn === 'string' ? new Date(checkIn) : checkIn;
    const checkOutDate = typeof checkOut === 'string' ? new Date(checkOut) : checkOut;
    
    // Validate dates
    if (checkInDate >= checkOutDate) {
      throw new Error('Check-out date must be after check-in date');
    }
    
    // Simulate API call with realistic delay
    const rooms = await simulateApiCall(cloneData(roomsData), 800);

    // Filter by room type if specified
    let filteredRooms = roomType 
      ? rooms.filter(room => room.type === roomType)
      : rooms;

    // Filter by guest capacity if specified
    if (numberOfGuests) {
      filteredRooms = filteredRooms.filter(room => room.capacity >= numberOfGuests);
    }

    // In a real API, this would check against actual reservations for the dates
    // checkInDate and checkOutDate would be used for actual availability checking
    return filteredRooms.map(room => ({
      ...room,
      isAvailable: Math.random() > 0.1 // 90% availability rate
    }));
  }

  async getRoomById(roomId: string): Promise<Room | null> {
    const rooms = await simulateApiCall(cloneData(roomsData), 300);
    return rooms.find(room => room.id === roomId) || null;
  }

  async getRoomsByType(roomType: string): Promise<Room[]> {
    const rooms = await simulateApiCall(cloneData(roomsData), 400);
    return rooms.filter(room => room.type === roomType);
  }

  async checkRoomAvailability(_roomId: string, _checkIn: Date, _checkOut: Date): Promise<boolean> {
    // Simulate checking availability against reservations database
    await simulateApiCall(true, 300);
    
    // In a real implementation, this would check if the room is booked for these dates
    // For now, return true with high probability
    return Math.random() > 0.2; // 80% chance of being available
  }

  async getAllRoomTypes(): Promise<Array<{ type: string; name: string; basePrice: number }>> {
    const rooms = await simulateApiCall(cloneData(roomsData), 200);
    
    // Group rooms by type and get the cheapest option for each type
    const roomTypes = rooms.reduce((acc, room) => {
      if (!acc[room.type] || room.pricePerNight < acc[room.type].basePrice) {
        acc[room.type] = {
          type: room.type,
          name: room.name.split(' ').slice(0, 2).join(' '), // Simplified name
          basePrice: room.pricePerNight
        };
      }
      return acc;
    }, {} as Record<string, { type: string; name: string; basePrice: number }>);

    return Object.values(roomTypes);
  }
}

export const roomService = new RoomService();
