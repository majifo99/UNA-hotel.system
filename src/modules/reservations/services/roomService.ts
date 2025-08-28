/**
 * Room Service - Standardized API Service
 * 
 * Handles all room-related operations using the standardized BaseApiService pattern.
 * Includes proper error handling, mocking support, and type safety.
 */

import { BaseApiService, ApiError } from '../../../services/BaseApiService';
import type { Room } from '../../../types/core';
import { simulateApiCall, cloneData } from '../utils/mockApi';
import { roomsData } from '../data/roomsData';
import { adaptLegacyRooms } from '../adapters/roomAdapter';

class RoomService extends BaseApiService {
  constructor() {
    super({
      // Override base config if needed
      enableMocking: true, // Always enable mocking for rooms for now
    });
  }

  /**
   * Get available rooms for given dates and criteria
   */
  async getAvailableRooms(
    checkIn: string | Date, 
    checkOut: string | Date, 
    numberOfGuests?: number, 
    roomType?: string
  ): Promise<Room[]> {
    try {
      // Convert strings to dates if needed
      const checkInDate = typeof checkIn === 'string' ? new Date(checkIn) : checkIn;
      const checkOutDate = typeof checkOut === 'string' ? new Date(checkOut) : checkOut;
      
      // Validate dates
      if (checkInDate >= checkOutDate) {
        throw new ApiError('Check-out date must be after check-in date', 400, 'INVALID_DATES');
      }

      // Use mock data for now
      if (this.config.enableMocking) {
        return this.getMockAvailableRooms(checkInDate, checkOutDate, numberOfGuests, roomType);
      }

      // Real API call would be:
      const response = await this.get<Room[]>('/rooms/availability', {
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString(),
        numberOfGuests,
        roomType,
      });

      return response.data || [];

    } catch (error) {
      console.error('Error fetching available rooms:', error);
      throw error instanceof ApiError ? error : new ApiError('Failed to fetch available rooms');
    }
  }

  /**
   * Get room by ID
   */
  async getRoomById(roomId: string): Promise<Room | null> {
    try {
      if (this.config.enableMocking) {
        const legacyRooms = await simulateApiCall(cloneData(roomsData), 300);
        const adaptedRooms = adaptLegacyRooms(legacyRooms);
        return adaptedRooms.find(room => room.id === roomId) || null;
      }

      const response = await this.get<Room>(`/rooms/${roomId}`);
      return response.data || null;

    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      console.error('Error fetching room by ID:', error);
      throw error instanceof ApiError ? error : new ApiError('Failed to fetch room');
    }
  }

  /**
   * Get rooms by type
   */
  async getRoomsByType(roomType: string): Promise<Room[]> {
    try {
      if (this.config.enableMocking) {
        const legacyRooms = await simulateApiCall(cloneData(roomsData), 400);
        const adaptedRooms = adaptLegacyRooms(legacyRooms);
        return adaptedRooms.filter(room => room.type === roomType);
      }

      const response = await this.get<Room[]>('/rooms', { type: roomType });
      return response.data || [];

    } catch (error) {
      console.error('Error fetching rooms by type:', error);
      throw error instanceof ApiError ? error : new ApiError('Failed to fetch rooms by type');
    }
  }

  /**
   * Check room availability for specific dates
   */
  async checkRoomAvailability(roomId: string, checkIn: Date, checkOut: Date): Promise<boolean> {
    try {
      if (this.config.enableMocking) {
        await simulateApiCall(true, 300);
        return Math.random() > 0.2; // 80% chance of being available
      }

      const response = await this.get<{ available: boolean }>(`/rooms/${roomId}/availability`, {
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
      });

      return response.data?.available || false;

    } catch (error) {
      console.error('Error checking room availability:', error);
      throw error instanceof ApiError ? error : new ApiError('Failed to check room availability');
    }
  }

  /**
   * Get all room types
   */
  async getAllRoomTypes(): Promise<Array<{ type: string; name: string; basePrice: number }>> {
    try {
      if (this.config.enableMocking) {
        const legacyRooms = await simulateApiCall(cloneData(roomsData), 200);
        const adaptedRooms = adaptLegacyRooms(legacyRooms);
        const uniqueTypes = Array.from(new Set(adaptedRooms.map(room => room.type)));
        
        return uniqueTypes.map(type => {
          const roomOfType = adaptedRooms.find(room => room.type === type)!;
          return {
            type,
            name: roomOfType.name,
            basePrice: roomOfType.basePrice || roomOfType.pricePerNight || 0,
          };
        });
      }

      const response = await this.get<Array<{ type: string; name: string; basePrice: number }>>('/rooms/types');
      return response.data || [];

    } catch (error) {
      console.error('Error fetching room types:', error);
      throw error instanceof ApiError ? error : new ApiError('Failed to fetch room types');
    }
  }

  // =================== PRIVATE MOCK METHODS ===================

  private async getMockAvailableRooms(
    _checkInDate: Date,
    _checkOutDate: Date,
    numberOfGuests?: number,
    roomType?: string
  ): Promise<Room[]> {
    const legacyRooms = await simulateApiCall(cloneData(roomsData), 800);
    let adaptedRooms = adaptLegacyRooms(legacyRooms);

    // Filter by room type if specified
    if (roomType) {
      adaptedRooms = adaptedRooms.filter(room => room.type === roomType);
    }

    // Filter by guest capacity if specified
    if (numberOfGuests) {
      adaptedRooms = adaptedRooms.filter(room => room.capacity >= numberOfGuests);
    }

    // Simulate availability checking
    return adaptedRooms.map(room => ({
      ...room,
      isAvailable: Math.random() > 0.1 // 90% availability rate
    }));
  }
}

// Export singleton instance
export const roomService = new RoomService();
export default roomService;
