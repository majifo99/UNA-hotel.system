import apiClient from '../../../services/apiClient';
import type { 
  Room, 
  RoomFilters, 
  CreateRoom, 
  UpdateRoom, 
  QuickReservation, 
  CheckIn, 
  CheckOut, 
  DashboardStats,
  Reservation
} from '../types';
import { 
  RoomSchema, 
  ReservationSchema,
  QuickReservationSchema, 
  CheckInSchema, 
  CheckOutSchema 
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
 * 
 * En desarrollo usa datos simulados, en producción usa la API real
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
      simulateRandomError(0.05); // 5% chance de error
      
      let filteredRooms = [...mockRooms];
      
      if (filters?.status) {
        filteredRooms = filteredRooms.filter(room => room.status === filters.status);
      }
      if (filters?.type) {
        filteredRooms = filteredRooms.filter(room => room.type === filters.type);
      }
      if (filters?.floor) {
        filteredRooms = filteredRooms.filter(room => room.floor === filters.floor);
      }
      if (filters?.guestName) {
        filteredRooms = filteredRooms.filter(room => 
          room.guestName?.toLowerCase().includes(filters.guestName!.toLowerCase())
        );
      }
      if (filters?.roomNumber) {
        filteredRooms = filteredRooms.filter(room => 
          room.roomNumber.includes(filters.roomNumber!)
        );
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
      
      // Validar respuesta con Zod
      const rooms = response.data.map((room: any) => RoomSchema.parse(room));
      return rooms;
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw new Error('Error al obtener habitaciones');
    }
  }

  /**
   * Obtener habitación por ID
   */
  static async getRoomById(id: string): Promise<Room> {
    try {
      const response = await apiClient.get(`${this.baseURL}/rooms/${id}`);
      return RoomSchema.parse(response.data);
    } catch (error) {
      console.error('Error fetching room:', error);
      throw new Error('Error al obtener habitación');
    }
  }

  /**
   * Crear nueva habitación
   */
  static async createRoom(roomData: CreateRoom): Promise<Room> {
    try {
      const response = await apiClient.post(`${this.baseURL}/rooms`, roomData);
      return RoomSchema.parse(response.data);
    } catch (error) {
      console.error('Error creating room:', error);
      throw new Error('Error al crear habitación');
    }
  }

  /**
   * Actualizar habitación
   */
  static async updateRoom(id: string, updateData: UpdateRoom): Promise<Room> {
    try {
      const response = await apiClient.put(`${this.baseURL}/rooms/${id}`, updateData);
      return RoomSchema.parse(response.data);
    } catch (error) {
      console.error('Error updating room:', error);
      throw new Error('Error al actualizar habitación');
    }
  }

  /**
   * Cambiar estado de habitación
   */
  static async updateRoomStatus(id: string, status: Room['status']): Promise<Room> {
    if (this.isDevelopment) {
      await simulateNetworkDelay();
      simulateRandomError(0.05); // 5% chance de error
      
      const roomIndex = mockRooms.findIndex(room => room.id === id);
      if (roomIndex === -1) {
        throw new Error('Habitación no encontrada');
      }
      
      const updatedRoom = { 
        ...mockRooms[roomIndex], 
        status, 
        updatedAt: new Date().toISOString() 
      };
      
      // Simular actualización en el array (en una app real esto estaría en el estado global)
      mockRooms[roomIndex] = updatedRoom;
      
      return updatedRoom;
    }

    try {
      const response = await apiClient.patch(`${this.baseURL}/rooms/${id}/status`, { status });
      return RoomSchema.parse(response.data);
    } catch (error) {
      console.error('Error updating room status:', error);
      throw new Error('Error al actualizar estado de habitación');
    }
  }

  // =================== RESERVATIONS ===================
  
  /**
   * Crear reservación rápida
   */
  static async createQuickReservation(reservationData: QuickReservation): Promise<Reservation> {
    try {
      // Validar datos antes de enviar
      const validatedData = QuickReservationSchema.parse(reservationData);
      
      const response = await apiClient.post(`${this.baseURL}/reservations/quick`, validatedData);
      return ReservationSchema.parse(response.data);
    } catch (error) {
      console.error('Error creating quick reservation:', error);
      throw new Error('Error al crear reservación');
    }
  }

  /**
   * Obtener reservaciones por fecha
   */
  static async getReservationsByDate(date: string): Promise<Reservation[]> {
    try {
      const response = await apiClient.get(`${this.baseURL}/reservations/date/${date}`);
      const reservations = response.data.map((reservation: any) => ReservationSchema.parse(reservation));
      return reservations;
    } catch (error) {
      console.error('Error fetching reservations:', error);
      throw new Error('Error al obtener reservaciones');
    }
  }

  // =================== CHECK-IN / CHECK-OUT ===================
  
  /**
   * Realizar check-in
   */
  static async checkIn(checkInData: CheckIn): Promise<Room> {
    try {
      const validatedData = CheckInSchema.parse(checkInData);
      
      const response = await apiClient.post(`${this.baseURL}/checkin`, validatedData);
      return RoomSchema.parse(response.data);
    } catch (error) {
      console.error('Error during check-in:', error);
      throw new Error('Error al realizar check-in');
    }
  }

  /**
   * Realizar check-out
   */
  static async checkOut(checkOutData: CheckOut): Promise<Room> {
    try {
      const validatedData = CheckOutSchema.parse(checkOutData);
      
      const response = await apiClient.post(`${this.baseURL}/checkout`, validatedData);
      return RoomSchema.parse(response.data);
    } catch (error) {
      console.error('Error during check-out:', error);
      throw new Error('Error al realizar check-out');
    }
  }

  // =================== DASHBOARD DATA ===================
  
  /**
   * Obtener estadísticas del dashboard
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    if (this.isDevelopment) {
      await simulateNetworkDelay();
      simulateRandomError(0.03); // 3% chance de error
      return mockDashboardStats;
    }

    try {
      const response = await apiClient.get(`${this.baseURL}/dashboard/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error('Error al obtener estadísticas');
    }
  }

  /**
   * Obtener vista de calendario de habitaciones
   */
  static async getRoomCalendar(startDate: string, endDate: string): Promise<{
    roomId: string;
    roomNumber: string;
    type: string;
    reservations: Array<{
      id: string;
      guestName: string;
      checkIn: string;
      checkOut: string;
      status: string;
    }>;
  }[]> {
    try {
      const response = await apiClient.get(`${this.baseURL}/calendar`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching room calendar:', error);
      throw new Error('Error al obtener calendario');
    }
  }
}

// Exportar como default para compatibilidad
export default FrontdeskService;
