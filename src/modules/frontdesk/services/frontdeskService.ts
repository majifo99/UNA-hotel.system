import apiClient from '../../../services/apiClient';
import type { Room } from '../../../types/core';
import type { 
  RoomFilters, 
  DashboardStats
} from '../types';
import type { LaravelRoomResponse } from '../types/laravelApi';
import { mapLaravelRoomToRoom } from '../types/laravelApi';

// Importar datos simulados para desarrollo
import { 
  mockRooms, 
  mockDashboardStats, 
  simulateNetworkDelay, 
  simulateRandomError 
} from '../data/mockData';

/**
 * Servicio de Frontdesk - Manejo de habitaciones y operaciones
 */
export class FrontdeskService {
  private static baseURL = '/frontdesk';
  private static readonly useMocks = (import.meta.env.VITE_USE_MOCKS === 'true');

  // =================== ROOMS ===================
  
  /**
   * Obtener todas las habitaciones con filtros opcionales
   */
  static async getRooms(filters?: RoomFilters): Promise<Room[]> {
    if (this.useMocks) {
      await simulateNetworkDelay();
      
      if (simulateRandomError()) { 
        throw new Error('Error de red simulado');
      }
      
      let filteredRooms = [...mockRooms];
      
      if (filters?.status) {
        filteredRooms = filteredRooms.filter(room => room.status === filters.status);
      }
      
      if (filters?.floor) {
        filteredRooms = filteredRooms.filter(room => room.floor === filters.floor);
      }
      
      return filteredRooms;
    }

    try {
      const params = new URLSearchParams();
      if (filters?.status) {
        // Mapear estado interno a estado del Laravel backend
        const laravelStatus = this.mapStatusToLaravel(filters.status);
        if (laravelStatus) {
          params.append('estado', laravelStatus);
        }
      }
      
      if (filters?.floor) {
        params.append('piso', filters.floor.toString());
      }

      const url = params.toString() ? `/habitaciones?${params.toString()}` : '/habitaciones';
      const response = await apiClient.get<LaravelRoomResponse>(url);
      
      // Mapear datos del Laravel backend a estructura interna
      const rooms = response.data.data.map(mapLaravelRoomToRoom);
      
      return rooms;
    } catch (error) {
      console.error('Error al obtener habitaciones del Laravel backend:', error);
      throw error;
    }
  }

  /**
   * Mapear estado interno a estado del Laravel backend
   */
  private static mapStatusToLaravel(status: string): string | null {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'occupied':
        return 'Ocupada';
      case 'maintenance':
        return 'Mantenimiento';
      case 'cleaning':
        return 'Sucia';
      default:
        return null;
    }
  }

  /**
   * Obtener una habitación por ID o número
   */
  static async getRoomById(identifier: string): Promise<Room> {
    if (this.useMocks) {
      await simulateNetworkDelay();
      
      // Buscar por ID o por número de habitación
      const room = mockRooms.find(r => r.id === identifier || r.number === identifier);
      if (!room) {
        throw new Error(`Habitación con identificador ${identifier} no encontrada`);
      }
      return room;
    }

    try {
      // Primero intentar obtener todas las habitaciones y buscar por número
      const allRoomsResponse = await apiClient.get<LaravelRoomResponse>('/habitaciones');
      
      // Buscar la habitación por número o ID
      const laravelRoom = allRoomsResponse.data.data.find(room => 
        room.numero === identifier || 
        room.id_habitacion.toString() === identifier
      );
      
      if (!laravelRoom) {
        throw new Error(`Habitación con identificador ${identifier} no encontrada`);
      }
      
      const mappedRoom = mapLaravelRoomToRoom(laravelRoom);
      
      return mappedRoom;
    } catch (error) {
      console.error('Error al obtener habitación del Laravel backend:', error);
      throw error;
    }
  }

  /**
   * Actualizar estado de una habitación
   */
  static async updateRoomStatus(id: string, status: Room['status']): Promise<Room> {
    if (this.useMocks) {
      await simulateNetworkDelay();
      
      if (simulateRandomError()) {
        throw new Error('Error al actualizar habitación');
      }

      const roomIndex = mockRooms.findIndex((room: Room) => room.id === id);
      if (roomIndex === -1) {
        throw new Error(`Habitación con ID ${id} no encontrada`);
      }

      mockRooms[roomIndex] = {
        ...mockRooms[roomIndex],
        status,
        isAvailable: status === 'available'
      };

      return mockRooms[roomIndex];
    }

    try {
      const response = await apiClient.patch(`${this.baseURL}/rooms/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar estado de habitación:', error);
      throw error;
    }
  }

  // =================== DASHBOARD ===================
  
  /**
   * Obtener estadísticas del dashboard
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    if (this.useMocks) {
      await simulateNetworkDelay();
      
      if (simulateRandomError()) {
        throw new Error('Error al obtener estadísticas del dashboard');
      }
      
      return mockDashboardStats;
    }

    try {
      const response = await apiClient.get(`${this.baseURL}/dashboard/stats`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas del dashboard:', error);
      throw error;
    }
  }
  
  /**
   * Obtener asignaciones actuales de habitaciones con información de huéspedes
   */
  static async getCurrentRoomAssignments(): Promise<Array<{
    roomId: string;
    roomNumber: string;
    guestName: string;
    reservationId: string;
    checkInDate: string;
    checkOutDate: string;
  }>> {
    if (this.useMocks) {
      await simulateNetworkDelay();
      
      if (simulateRandomError()) {
        throw new Error('Error al obtener asignaciones de habitaciones');
      }

      // Mock current assignments
      return [
        {
          roomId: '1',
          roomNumber: '101',
          guestName: 'Juan Pérez',
          reservationId: 'RES-001',
          checkInDate: '2024-10-05',
          checkOutDate: '2024-10-08'
        },
        {
          roomId: '4',
          roomNumber: '202',
          guestName: 'María González',
          reservationId: 'RES-002',
          checkInDate: '2024-10-06',
          checkOutDate: '2024-10-10'
        }
      ];
    }

    try {
      // In a real implementation, this would call an endpoint that returns current room assignments
      // For now, we'll return an empty array as the real API structure isn't defined
      const response = await apiClient.get(`${this.baseURL}/current-assignments`);
      return response.data || [];
    } catch (error) {
      console.error('Error al obtener asignaciones actuales:', error);
      throw error;
    }
  }
}

export default FrontdeskService;
