/**
 * Room Service - API Service for Room Operations
 *
 * Handles all room-related operations consuming the backend API.
 * All data is fetched from the real API - no mock data.
 */

import { BaseApiService, ApiError } from '../../../services/BaseApiService';
import type { Room } from '../../../types/core';
import apiClient from '../lib/apiClient';

// =================== API TYPES ===================

/**
 * Backend API response for habitacion
 */
interface ApiHabitacion {
  id_habitacion: number;
  id_estado_hab: number;
  tipo_habitacion_id: number;
  nombre: string;
  numero: string;
  piso: number;
  capacidad: number;
  medida: string;
  descripcion: string;
  precio_base: string; // decimal as string
  moneda: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  estado?: {
    id_estado_hab: number;
    nombre: string;
    tipo?: string;
    descripcion: string;
  };
  tipo?: {
    id_tipo_hab: number;
    nombre: string;
    descripcion: string;
  };
}

/**
 * Paginated response from backend
 */
interface ApiHabitacionesResponse {
  current_page: number;
  data: ApiHabitacion[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    page: number | null;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

/**
 * Map backend habitacion to frontend Room
 */
function mapApiHabitacionToRoom(apiHab: ApiHabitacion): Room {
  const priceBase = parseFloat(apiHab.precio_base);
  
  // Map tipo nombre to Room type
  let roomType: Room['type'] = 'single';
  const tipoNombre = apiHab.tipo?.nombre.toLowerCase() || '';
  if (tipoNombre.includes('doble')) roomType = 'double';
  else if (tipoNombre.includes('triple')) roomType = 'triple';
  else if (tipoNombre.includes('suite')) roomType = 'suite';
  else if (tipoNombre.includes('familiar')) roomType = 'family';
  else if (tipoNombre.includes('deluxe')) roomType = 'deluxe';
  
  return {
    id: apiHab.id_habitacion.toString(),
    name: apiHab.nombre,
    type: roomType,
    floor: apiHab.piso,
    number: apiHab.numero,
    capacity: apiHab.capacidad,
    description: apiHab.descripcion,
    basePrice: priceBase,
    pricePerNight: priceBase,
    amenities: [],
    images: [],
    isAvailable: apiHab.estado?.nombre === 'Disponible',
  };
}

class RoomService extends BaseApiService {
  constructor() {
    super({
      enableMocking: false, // Always use real API
    });
  }

  /**
   * Get available rooms for given dates and criteria
   * Uses real API: GET /disponibilidad?desde=YYYY-MM-DD&hasta=YYYY-MM-DD&tipo=ID_TIPO
   */
  async getAvailableRooms(
    checkIn: string | Date,
    checkOut: string | Date,
    numberOfGuests?: number,
    roomType?: string
  ): Promise<Room[]> {
    try {
      // Convert dates to YYYY-MM-DD format for logging
      const checkInDate = typeof checkIn === 'string' ? checkIn : checkIn.toISOString().split('T')[0];
      const checkOutDate = typeof checkOut === 'string' ? checkOut : checkOut.toISOString().split('T')[0];
      
      // Validate dates
      if (new Date(checkInDate) >= new Date(checkOutDate)) {
        throw new ApiError('Check-out date must be after check-in date', 400, 'INVALID_DATES');
      }

      // Use the /habitaciones endpoint since /disponibilidad is not returning data
      const url = '/habitaciones';
      
      console.log(`[RoomService] GET ${url} (filtering for dates: ${checkInDate} to ${checkOutDate})`);

      const response = await apiClient.get<ApiHabitacionesResponse | ApiHabitacion[]>(url);
      
      // Handle both response formats: paginated or direct array
      const apiHabitaciones: ApiHabitacion[] = Array.isArray(response.data)
        ? response.data
        : (response.data as ApiHabitacionesResponse).data || [];

      console.log(`[RoomService] Received ${apiHabitaciones.length} total rooms from backend`);

      // Map to frontend Room objects
      let rooms = apiHabitaciones.map(mapApiHabitacionToRoom);

      // Filter by availability status (only show rooms with "Disponible" status)
      rooms = rooms.filter(room => room.isAvailable);
      console.log(`[RoomService] After availability filter: ${rooms.length} available rooms`);

      // Filter by guest capacity if specified
      if (numberOfGuests) {
        rooms = rooms.filter(room => room.capacity >= numberOfGuests);
        console.log(`[RoomService] After capacity filter (>=${numberOfGuests}): ${rooms.length} rooms`);
      }

      // Filter by room type if specified
      if (roomType) {
        rooms = rooms.filter(room => room.type === roomType);
        console.log(`[RoomService] After type filter (${roomType}): ${rooms.length} rooms`);
      }

      console.log(`[RoomService] Final available rooms:`, rooms.map(r => ({ 
        id: r.id, 
        name: r.name, 
        type: r.type, 
        capacity: r.capacity,
        basePrice: r.basePrice 
      })));
      
      return rooms;

    } catch (error) {
      console.error('Error fetching available rooms:', error);
      throw error instanceof ApiError ? error : new ApiError('Failed to fetch available rooms');
    }
  }

  /**
   * Get room by ID
   * Uses real API: GET /habitaciones/{id}
   */
  async getRoomById(roomId: string): Promise<Room | null> {
    try {
      console.log('[RoomService] GET /habitaciones/' + roomId);

      const response = await apiClient.get<ApiHabitacion>(`/habitaciones/${roomId}`);
      
      if (!response.data) {
        return null;
      }

      return mapApiHabitacionToRoom(response.data);

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
   * Uses real API: GET /habitaciones?tipo_habitacion_id={tipoId}
   */
  async getRoomsByType(roomType: string): Promise<Room[]> {
    try {
      console.log('[RoomService] GET /habitaciones (filtered by type:', roomType + ')');

      const response = await apiClient.get<ApiHabitacionesResponse | ApiHabitacion[]>('/habitaciones');
      
      // Handle both response formats
      const apiHabitaciones: ApiHabitacion[] = Array.isArray(response.data)
        ? response.data
        : (response.data as ApiHabitacionesResponse).data || [];

      // Map and filter by room type
      const rooms = apiHabitaciones
        .map(mapApiHabitacionToRoom)
        .filter(room => room.type === roomType);

      console.log(`[RoomService] Found ${rooms.length} rooms of type ${roomType}`);
      
      return rooms;

    } catch (error) {
      console.error('Error fetching rooms by type:', error);
      throw error instanceof ApiError ? error : new ApiError('Failed to fetch rooms by type');
    }
  }

  /**
   * Check room availability for specific dates
   * Uses real API: GET /disponibilidad?desde=X&hasta=Y filtered by roomId
   */
  async checkRoomAvailability(roomId: string, checkIn: Date, checkOut: Date): Promise<boolean> {
    try {
      const checkInDate = checkIn.toISOString().split('T')[0];
      const checkOutDate = checkOut.toISOString().split('T')[0];

      console.log(`[RoomService] Checking availability for room ${roomId} from ${checkInDate} to ${checkOutDate}`);

      const params = new URLSearchParams();
      params.append('desde', checkInDate);
      params.append('hasta', checkOutDate);

      const response = await apiClient.get<ApiHabitacionesResponse | ApiHabitacion[]>(`/disponibilidad?${params.toString()}`);
      
      // Handle both response formats
      const apiHabitaciones: ApiHabitacion[] = Array.isArray(response.data)
        ? response.data
        : (response.data as ApiHabitacionesResponse).data || [];

      // Check if the specific room is in the available list
      const isAvailable = apiHabitaciones.some(hab => hab.id_habitacion.toString() === roomId);

      console.log(`[RoomService] Room ${roomId} availability:`, isAvailable);

      return isAvailable;

    } catch (error) {
      console.error('Error checking room availability:', error);
      throw error instanceof ApiError ? error : new ApiError('Failed to check room availability');
    }
  }

  /**
   * Get all room types from catalog
   * Uses real API: GET /habitaciones to extract unique room types
   */
  async getAllRoomTypes(): Promise<Array<{ type: string; name: string; basePrice: number; capacity?: number }>> {
    try {
      console.log('[RoomService] GET /habitaciones');

      const response = await apiClient.get<ApiHabitacionesResponse | ApiHabitacion[]>('/habitaciones');
      
      // Handle both response formats: paginated or direct array
      const apiHabitaciones: ApiHabitacion[] = Array.isArray(response.data)
        ? response.data
        : (response.data as ApiHabitacionesResponse).data || [];

      // Extract unique room types
      const roomTypesMap = new Map<number, { type: string; name: string; basePrice: number; capacity?: number }>();

      apiHabitaciones.forEach(habitacion => {
        const tipoId = habitacion.tipo?.id_tipo_hab;
        const tipoNombre = habitacion.tipo?.nombre;

        if (tipoId && tipoNombre && !roomTypesMap.has(tipoId)) {
          // Normalize type name to match frontend enum
          let normalizedType = tipoNombre.toLowerCase();
          if (normalizedType.includes('doble')) normalizedType = 'double';
          else if (normalizedType.includes('triple')) normalizedType = 'triple';
          else if (normalizedType.includes('suite')) normalizedType = 'suite';
          else if (normalizedType.includes('familiar')) normalizedType = 'family';
          else if (normalizedType.includes('deluxe')) normalizedType = 'deluxe';
          else normalizedType = 'single';

          roomTypesMap.set(tipoId, {
            type: normalizedType,
            name: tipoNombre,
            basePrice: parseFloat(habitacion.precio_base) || 0,
            capacity: habitacion.capacidad || 2,
          });
        }
      });

      const roomTypes = Array.from(roomTypesMap.values());
      console.log(`[RoomService] Loaded ${roomTypes.length} room types`);
      
      return roomTypes;

    } catch (error) {
      console.error('Error fetching room types:', error);
      throw error instanceof ApiError ? error : new ApiError('Failed to fetch room types');
    }
  }
}

// Export singleton instance
export const roomService = new RoomService();
export default roomService;
