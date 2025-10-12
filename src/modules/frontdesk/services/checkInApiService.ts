import { BaseApiService } from '../../../services/BaseApiService';
import type { 
  CheckInRequestDTO, 
  CheckInResponseDTO, 
  ApiErrorResponse
} from '../types/checkin-api';

/**
 * Servicio para operaciones de Check-In
 * Maneja la comunicación con el backend y validaciones previas
 */
export class CheckInApiService extends BaseApiService {
  private static readonly ENDPOINTS = {
    CHECKIN: (reservaId: number) => `/frontdesk/reserva/${reservaId}/checkin`,
    RESERVA: (reservaId: number) => `/frontdesk/reserva/${reservaId}`,
  } as const;

  /**
   * Método de debugging para verificar qué endpoints están disponibles
   */
  async debugEndpoints(reservaId: number, roomNumber: string): Promise<void> {
    console.log('🔍 Debugging endpoints disponibles:');
    
    try {
      // Verificar reserva
      console.log(`Probando GET ${CheckInApiService.ENDPOINTS.RESERVA(reservaId)}...`);
      const reserva = await this.get<any>(CheckInApiService.ENDPOINTS.RESERVA(reservaId));
      console.log('✅ Reserva:', reserva.data);
    } catch (error) {
      console.log('❌ Reserva no encontrada:', error);
    }
    
    try {
      // Verificar habitaciones
      console.log('Probando GET /frontdesk/habitaciones...');
      const habitaciones = await this.get<any>('/frontdesk/habitaciones');
      console.log('✅ Habitaciones:', habitaciones.data?.slice(0, 3)); // Solo primeras 3
    } catch (error) {
      console.log('❌ Habitaciones no encontradas:', error);
    }
    
    console.log('Datos que se enviarían al check-in:');
    console.log({
      reservaId,
      roomNumber,
      roomNumberAsInt: Number.parseInt(roomNumber, 10)
    });
  }
  async getHabitacionId(roomNumber: string): Promise<number> {
    try {
      // Intentar obtener lista de habitaciones o buscar por número
      const response = await this.get<any>(`/frontdesk/habitaciones?numero=${roomNumber}`);
      
      if (response.data && response.data.length > 0) {
        const habitacion = response.data[0];
        console.log('✓ Habitación encontrada:', habitacion);
        return habitacion.id;
      }
      
      // Si no se encuentra, usar el número como ID (fallback)
      const parsed = Number.parseInt(roomNumber, 10);
      console.warn('⚠️ Habitación no encontrada, usando número como ID:', parsed);
      return parsed;
      
    } catch (error) {
      console.error('Error obteniendo habitación:', error);
      // Fallback: usar el número como ID
      const parsed = parseInt(roomNumber, 10);
      console.warn('⚠️ Error en búsqueda, usando número como ID:', parsed);
      return parsed;
    }
  }

  /**
   * Convierte el número de habitación a ID numérico
   * Ahora intenta buscar el ID real en el sistema
   */
  private async parseRoomNumber(roomNumber: string): Promise<number> {
    const parsed = Number.parseInt(roomNumber, 10);
    if (isNaN(parsed) || parsed <= 0) {
      throw new Error(`Número de habitación inválido: ${roomNumber}`);
    }
    
    // Intentar obtener el ID real de la habitación
    return await this.getHabitacionId(roomNumber);
  }

  /**
   * Obtiene el ID del cliente desde la reserva
   */
  async getClienteFromReserva(reservaId: number): Promise<number> {
    try {
      const response = await this.get<any>(CheckInApiService.ENDPOINTS.RESERVA(reservaId));
      
      if (!response.data) {
        throw new Error('No se encontró la reserva');
      }

      const clienteId = response.data.cliente_id || response.data.id_cliente_titular;
      
      if (!clienteId || clienteId <= 0) {
        throw new Error('La reserva no tiene un cliente asociado válido');
      }

      console.log('✓ Cliente ID obtenido de reserva:', clienteId);
      return clienteId;
    } catch (error) {
      console.error('Error obteniendo cliente de reserva:', error);
      // Retornar 1 como fallback si no se puede obtener
      console.warn('⚠️ Usando cliente ID fallback: 1');
      return 1;
    }
  }

  /**
   * Versión simplificada para testing - usa valores conocidos que funcionen
   */
  async performSimpleCheckIn(
    reservaId: number,
    frontendData: {
      roomNumber: string;
      checkInDate: string;
      checkOutDate: string;
      observacion_checkin?: string;
    }
  ): Promise<CheckInResponseDTO> {
    try {
      // Datos simplificados usando valores que sabemos funcionan
      const backendData = {
        id_cliente_titular: 1, // Valor fijo para testing
        fecha_llegada: frontendData.checkInDate,
        fecha_salida: frontendData.checkOutDate,
        id_hab: 1, // Valor fijo para testing - habitación ID 1
        nombre_asignacion: 'Test desde FrontDesk',
        observacion_checkin: frontendData.observacion_checkin || 'Check-in de prueba'
      };

      console.log('🧪 Testing check-in simple:', {
        endpoint: CheckInApiService.ENDPOINTS.CHECKIN(reservaId),
        backendData
      });

      const response = await this.post<CheckInResponseDTO>(
        CheckInApiService.ENDPOINTS.CHECKIN(reservaId),
        backendData
      );

      console.log('✅ Check-in simple exitoso:', response.data);
      if (!response.data) {
        throw new Error('No se recibió respuesta del servidor');
      }
      return response.data;

    } catch (error) {
      console.error('❌ Error en check-in simple:', error);
      throw error;
    }
  }

  /**
   * Realiza el check-in directo con validaciones mejoradas
   * El backend debe manejar internamente la asociación del cliente
   */
  async performDirectCheckIn(
    reservaId: number,
    frontendData: {
      reservationId: string;
      roomNumber: string;
      checkInDate: string;
      checkOutDate: string;
      observacion_checkin?: string;
    }
  ): Promise<CheckInResponseDTO> {
    try {
      // 0. Debug endpoints si es necesario (solo en desarrollo)
      if (import.meta.env.DEV) {
        await this.debugEndpoints(reservaId, frontendData.roomNumber);
      }
      
      // 1. Obtener el ID del cliente real de la reserva
      const clienteId = await this.getClienteFromReserva(reservaId);
      
      // 2. Obtener el ID real de la habitación
      const habitacionId = await this.parseRoomNumber(frontendData.roomNumber);
      
      // 3. Mapear datos al formato del backend
      const backendData: CheckInRequestDTO = {
        id_cliente_titular: clienteId,
        fecha_llegada: frontendData.checkInDate,
        fecha_salida: frontendData.checkOutDate,
        id_hab: habitacionId,
        nombre_asignacion: 'Asignación desde FrontDesk',
        observacion_checkin: frontendData.observacion_checkin?.trim() || undefined
      };

      // 4. Log para debugging detallado
      console.log('🚀 Realizando check-in directo:', {
        endpoint: CheckInApiService.ENDPOINTS.CHECKIN(reservaId),
        reservaId,
        clienteId,
        habitacionId,
        frontendData,
        backendData
      });

      // 5. Realizar el POST directo
      const response = await this.post<CheckInResponseDTO>(
        CheckInApiService.ENDPOINTS.CHECKIN(reservaId),
        backendData
      );

      if (!response.data) {
        throw new Error('No se recibió respuesta del servidor');
      }

      console.log('✅ Check-in completado exitosamente:', response.data);
      return response.data as CheckInResponseDTO;

    } catch (error) {
      console.error('❌ Error en check-in directo:', error);
      
      // Manejo específico de errores de la API
      if (this.isApiError(error)) {
        const apiError = error.response?.data as ApiErrorResponse;
        
        if (apiError?.errors) {
          const errorMessages = Object.entries(apiError.errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('\n');
          
          throw new Error(`Error de validación del servidor:\n${errorMessages}`);
        }
        
        throw new Error(apiError?.message || 'Error en el servidor');
      }
      
      // Re-lanzar errores personalizados
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Error desconocido durante el check-in');
    }
  }

  /**
   * Verifica si el error es de la API
   */
  private isApiError(error: unknown): error is { response: { data: ApiErrorResponse } } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof (error as any).response === 'object' &&
      'data' in (error as any).response
    );
  }
}

// Instancia singleton del servicio
export const checkInApiService = new CheckInApiService();