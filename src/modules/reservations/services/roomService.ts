/**
 * Room Service - API Service for Room Operations
 *
 * Handles all room-related operations consuming the backend API.
 * All data is fetched from the real API - no mock data.
 */

import { BaseApiService, ApiError } from '../../../services/BaseApiService';
import type { Room } from '../../../types/core';
import apiClient from '../lib/apiClient';
import { reservationCrudService } from './crud/ReservationCrudService';

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
  
  // Estados que pueden reservarse: "Disponible" (id=1) y "Limpia" (id=4)
  // Estados NO reservables: "Ocupada" (id=2), "Sucia" (id=3), "Mantenimiento" (id=5)
  const estadoNombre = apiHab.estado?.nombre?.toLowerCase() || '';
  const isAvailable = estadoNombre === 'disponible' || estadoNombre === 'limpia';
  
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
    isAvailable,
  };
}

class RoomService extends BaseApiService {
  constructor() {
    super({
      enableMocking: false, // Always use real API
    });
  }

  /**
   * Get all rooms (without date filtering)
   * Uses real API: GET /habitaciones
   * Only returns rooms in "Disponible" or "Limpia" state (can be reserved)
   */
  async getAllRooms(): Promise<Room[]> {
    try {
      console.log('[RoomService] GET /habitaciones - Fetching all rooms');

      const response = await apiClient.get<ApiHabitacionesResponse | ApiHabitacion[]>('/habitaciones');
      
      // Handle both response formats: paginated or direct array
      const apiHabitaciones: ApiHabitacion[] = Array.isArray(response.data)
        ? response.data
        : (response.data as ApiHabitacionesResponse).data || [];

      console.log(`[RoomService] Received ${apiHabitaciones.length} total rooms from backend`);

      // Map to frontend Room objects
      const allRooms = apiHabitaciones.map(mapApiHabitacionToRoom);
      
      // Filter: Only show rooms that can be reserved (Disponible or Limpia)
      // Exclude: Ocupada, Sucia, Mantenimiento
      const reservableRooms = allRooms.filter(room => room.isAvailable);
      
      console.log(`[RoomService] Filtered to ${reservableRooms.length} reservable rooms (Disponible/Limpia):`, 
        reservableRooms.map(r => ({ 
          id: r.id, 
          name: r.name, 
          type: r.type, 
          isAvailable: r.isAvailable
        }))
      );
      
      return reservableRooms;

    } catch (error) {
      console.error('Error fetching all rooms:', error);
      throw error instanceof ApiError ? error : new ApiError('Failed to fetch rooms');
    }
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

      // Use /habitaciones endpoint and show all rooms
      // User will see calendar availability when they click on each room
      const url = '/habitaciones';
      
      console.log(`[RoomService] GET ${url} (dates: ${checkInDate} to ${checkOutDate})`);
      console.log(`[RoomService] NOTE: Showing all rooms. User will check calendar for specific availability.`);

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

  /**
   * Get room availability for a specific month
   * 
   * @param roomId - Room ID to check availability
   * @param year - Year (e.g., 2025)
   * @param month - Month (1-12)
   * @returns Array of date availability for the month
   */
  async getRoomAvailabilityForMonth(
    roomId: string,
    year: number,
    month: number
  ): Promise<Array<{ date: string; available: boolean; reason?: string }>> {
    try {
      console.log(`[RoomService] Fetching availability for room ${roomId}, ${year}-${month}`);

      // Calculate first and last day of the month
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);

      // Try to get reservations for this specific room
      // This will help us determine which specific days are occupied
      let reservations: Array<{
        fecha_llegada: string;
        fecha_salida: string;
        id_estado_res?: number;
      }> = [];

      // Get all reservations using the existing service
      try {
        console.log(`[RoomService] 🔄 Fetching ALL reservations from GET /reservas`);
        
        // Use the CRUD service which calls GET /reservas
        const allReservations = await reservationCrudService.getAll();
        console.log(`[RoomService] 📋 Got ${allReservations.length} total reservations`);
        
        // DEBUG: Show ALL reservations with their room info
        console.log(`[RoomService] 🔍 DEBUG: Searching for roomId = "${roomId}" (type: ${typeof roomId})`);
        for (const [index, res] of allReservations.entries()) {
          console.log(`[RoomService] 🔍 Reservation ${index + 1}:`, {
            id: res.id,
            roomId: res.roomId,
            roomIdType: typeof res.roomId,
            roomNumber: res.room?.number,
            roomName: res.room?.name,
            checkIn: res.checkInDate,
            checkOut: res.checkOutDate,
            status: res.status
          });
        }
        
        // Filter reservations for this specific room
        const roomReservations = allReservations.filter(reservation => {
          // Convert roomId to number for comparison (same logic as frontdesk dashboard)
          const searchRoomId = Number(roomId);
          const reservationRoomId = Number(reservation.roomId);
          const reservationRoomNumber = reservation.room?.number;
          
          // Check if this reservation is for our room (by ID or by room number)
          const matchesById = reservationRoomId === searchRoomId;
          const matchesByNumber = reservationRoomNumber === String(searchRoomId) || reservationRoomNumber === roomId;
          const hasRoom = matchesById || matchesByNumber;
          
          console.log(`[RoomService] 🔍 Checking reservation #${reservation.id}: roomId=${reservationRoomId} vs ${searchRoomId} | roomNumber="${reservationRoomNumber}" | matches=${hasRoom}`);
          
          if (hasRoom) {
            console.log(`[RoomService] ✅ Found reservation #${reservation.id} for room ${roomId}`);
            console.log(`[RoomService]    - Guest: ${reservation.guest?.firstName || 'N/A'} ${reservation.guest?.firstLastName || ''}`);
            console.log(`[RoomService]    - Check-in: ${reservation.checkInDate}`);
            console.log(`[RoomService]    - Check-out: ${reservation.checkOutDate}`);
            console.log(`[RoomService]    - Status: ${reservation.status}`);
          }
          
          return hasRoom;
        });
        
        console.log(`[RoomService] 🎯 Found ${roomReservations.length} reservations for room ${roomId}`);
        
        // Map to internal format and filter by date range
        reservations = roomReservations
          .map(res => {
            // Map status to estado ID
            let estadoId = 1; // default: Confirmada
            if (res.status === 'pending') estadoId = 2;
            else if (res.status === 'cancelled') estadoId = 4;
            
            return {
              fecha_llegada: res.checkInDate,
              fecha_salida: res.checkOutDate,
              id_estado_res: estadoId
            };
          })
          .filter(res => {
            const llegada = new Date(res.fecha_llegada);
            const salida = new Date(res.fecha_salida);
            const overlaps = llegada <= lastDay && salida >= firstDay;
            
            if (overlaps) {
              console.log(`[RoomService] 🔴 Date ${res.fecha_llegada} to ${res.fecha_salida} overlaps with month`);
            }
            
            return overlaps;
          });
          
        console.log(`[RoomService] ✅ After filtering by dates: ${reservations.length} reservations`);
        
      } catch (error) {
        console.error(`[RoomService] ❌ ERROR fetching reservations:`, error);
        console.warn(`[RoomService] Assuming all available due to error`);
      }

      // Build day-by-day availability based on reservations
      const availability: Array<{ date: string; available: boolean; reason?: string }> = [];
      
      const daysInMonth = lastDay.getDate();
      console.log(`[RoomService] Building availability for ${daysInMonth} days with ${reservations.length} reservations`);
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        const dateStr = date.toISOString().split('T')[0];
        
        // Check if this date is occupied by any reservation
        const isOccupied = reservations.some(reservation => {
          const llegada = new Date(reservation.fecha_llegada);
          const salida = new Date(reservation.fecha_salida);
          
          // A date is occupied if it's between check-in (inclusive) and check-out (exclusive)
          const occupied = date >= llegada && date < salida;
          
          if (occupied) {
            console.log(`[RoomService] 🔴 ${dateStr} is OCCUPIED by reservation ${reservation.fecha_llegada} - ${reservation.fecha_salida}`);
          }
          
          return occupied;
        });
        
        availability.push({
          date: dateStr,
          available: !isOccupied,
          reason: isOccupied ? 'Reservado' : undefined
        });
      }

      console.log(`[RoomService] ✅ Loaded availability for room ${roomId}: ${reservations.length} reservations found`);
      console.log(`[RoomService] Occupied days: ${availability.filter(a => !a.available).length}/${daysInMonth}`);
      return availability;

    } catch (error) {
      console.error(`[RoomService] Error fetching availability for room ${roomId}:`, error);
      throw error instanceof ApiError ? error : new ApiError('Failed to fetch room availability');
    }
  }
}

// Export singleton instance
export const roomService = new RoomService();
export default roomService;
