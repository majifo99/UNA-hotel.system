/**
 * Frontdesk Reservation Service
 * Servicio para obtener reservas en el contexto del calendario de frontdesk
 */

import apiClient from '../../../services/apiClient';

// Tipos para la respuesta del API de reservas
export interface ApiReservaCliente {
  id_cliente: number;
  nombre: string;
  apellido1: string;
  apellido2: string | null;
  email: string;
  telefono: string;
  nombre_completo: string;
}

export interface ApiReservaEstado {
  id_estado_res: number;
  nombre: string;
}

export interface ApiReservaHabitacion {
  id_reserva_hab: number;
  id_reserva: number;
  id_habitacion: number;
  fecha_llegada: string;
  fecha_salida: string;
  adultos: number;
  ninos: number;
  bebes: number;
  subtotal: number;
  habitacion: {
    id_habitacion: number;
    nombre: string;
    numero: string;
    piso: number;
  };
}

export interface ApiReservaItem {
  id_reserva: number;
  codigo_reserva: string | null;
  id_cliente: number;
  id_estado_res: number;
  fecha_creacion: string;
  total_monto_reserva: number;
  monto_pagado: string;
  monto_pendiente: string;
  notas: string | null;
  cliente: ApiReservaCliente;
  estado: ApiReservaEstado;
  habitaciones: ApiReservaHabitacion[];
}

export interface ApiReservasResponse {
  current_page: number;
  data: ApiReservaItem[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

// Tipo para reserva de calendario en frontdesk
export interface CalendarReservation {
  id: string;
  roomId: number;
  roomNumber: string;
  guestName: string;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'confirmed' | 'cancelled';
  adults: number;
  children: number;
  infants: number;
}

class FrontdeskReservationService {
  /**
   * Obtiene todas las reservas en un rango de fechas
   * @param startDate Fecha de inicio en formato YYYY-MM-DD
   * @param endDate Fecha de fin en formato YYYY-MM-DD
   * @returns Promesa con array de reservas del calendario
   */
  async getReservationsByDateRange(startDate: string, endDate: string): Promise<CalendarReservation[]> {
    try {
      // Verificar que haya token antes de hacer la petición
      const adminToken = localStorage.getItem('adminAuthToken');
      const publicToken = localStorage.getItem('authToken');
      const token = adminToken || publicToken;
      
      if (!token) {
        console.warn('[Frontdesk] No hay token de autenticación disponible');
        return [];
      }
      
      console.debug('[Frontdesk] Obteniendo reservas desde', startDate, 'hasta', endDate);
      console.debug('[Frontdesk] Usando token:', token ? 'Token presente' : 'Sin token');
      
      const response = await apiClient.get<ApiReservasResponse>('/reservas', {
        params: {
          desde: startDate,
          hasta: endDate
        }
      });

      const apiReservas = response.data.data || [];
      console.debug('[Frontdesk] Reservas obtenidas:', apiReservas.length);

      // Transformar cada reserva del API a formato de calendario
      const calendarReservations: CalendarReservation[] = [];

      apiReservas.forEach(reserva => {
        // Cada reserva puede tener múltiples habitaciones
        if (reserva.habitaciones && reserva.habitaciones.length > 0) {
          reserva.habitaciones.forEach(hab => {
            calendarReservations.push({
              id: `${reserva.id_reserva}-${hab.id_reserva_hab}`,
              roomId: hab.id_habitacion,
              roomNumber: hab.habitacion.numero,
              guestName: reserva.cliente.nombre_completo,
              startDate: new Date(hab.fecha_llegada),
              endDate: new Date(hab.fecha_salida),
              status: this.mapEstadoToStatus(reserva.estado.nombre),
              adults: hab.adultos,
              children: hab.ninos,
              infants: hab.bebes
            });
          });
        }
      });

      console.debug('[Frontdesk] Reservas de calendario generadas:', calendarReservations.length);
      return calendarReservations;
    } catch (error: any) {
      console.error('[Frontdesk] Error obteniendo reservas:', error?.message || error);
      
      // Si es un error 401, es probable que el token haya expirado
      if (error?.response?.status === 401) {
        console.error('[Frontdesk] Error de autenticación - el token puede haber expirado');
      }
      
      // No lanzar el error, retornar array vacío para no romper la UI
      return [];
    }
  }

  /**
   * Obtiene reservas para una habitación específica en un rango de fechas
   * @param roomId ID de la habitación
   * @param startDate Fecha de inicio
   * @param endDate Fecha de fin
   * @returns Reservas para esa habitación
   */
  async getReservationsForRoom(roomId: number, startDate: string, endDate: string): Promise<CalendarReservation[]> {
    const allReservations = await this.getReservationsByDateRange(startDate, endDate);
    return allReservations.filter(res => res.roomId === roomId);
  }

  /**
   * Mapea el estado del API al estado del calendario
   */
  private mapEstadoToStatus(estadoNombre: string): 'pending' | 'confirmed' | 'cancelled' {
    const lowerEstado = estadoNombre.toLowerCase();
    
    if (lowerEstado.includes('confirm')) {
      return 'confirmed';
    } else if (lowerEstado.includes('cancel')) {
      return 'cancelled';
    } else {
      return 'pending';
    }
  }
}

export const frontdeskReservationService = new FrontdeskReservationService();
