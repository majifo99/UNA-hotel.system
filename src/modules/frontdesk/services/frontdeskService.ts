import apiClient from '../../../services/apiClient';
import type { Room } from '../../../types/core';
import type { 
  RoomFilters, 
  DashboardStats
} from '../types';

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
  private static baseURL = '/api/frontdesk';
  private static isDevelopment = import.meta.env.DEV;

  // =================== ROOMS ===================
  
  /**
   * Obtener todas las habitaciones con filtros opcionales
   */
  static async getRooms(filters?: RoomFilters): Promise<Room[]> {
    if (this.isDevelopment) {
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
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      const response = await apiClient.get(`${this.baseURL}/rooms?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener habitaciones:', error);
      throw error;
    }
  }

  /**
   * Obtener una habitación por ID
   */
  static async getRoomById(id: string): Promise<Room> {
    if (this.isDevelopment) {
      await simulateNetworkDelay();
      const room = mockRooms.find(r => r.id === id);
      if (!room) {
        throw new Error(`Habitación con ID ${id} no encontrada`);
      }
      return room;
    }

    try {
      const response = await apiClient.get(`${this.baseURL}/rooms/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener habitación:', error);
      throw error;
    }
  }

  /**
   * Actualizar estado de una habitación
   */
  static async updateRoomStatus(id: string, status: Room['status']): Promise<Room> {
    if (this.isDevelopment) {
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
    if (this.isDevelopment) {
      await simulateNetworkDelay();
      
      if (simulateRandomError()) {
        throw new Error('Error al obtener estadísticas');
      }

      return mockDashboardStats;
    }

    try {
      const response = await apiClient.get(`${this.baseURL}/dashboard/stats`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }
}

export default FrontdeskService;
