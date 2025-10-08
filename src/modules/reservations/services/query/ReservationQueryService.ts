/**
 * ReservationQueryService
 * 
 * Servicio dedicado a operaciones de consulta y análisis de reservas.
 * Maneja filtros avanzados, búsquedas y generación de estadísticas.
 * 
 * Responsabilidades:
 * - Búsqueda avanzada de reservas
 * - Aplicación de filtros combinados
 * - Generación de estadísticas y reportes
 * - Análisis de datos de reservas
 * 
 * @module services/query
 */

import type { Reservation } from '../../types/domain';
import type { ApiReservaFull, ReservationFilters } from '../../types';
import { mapApiReservaFullToReservation } from '../../types';
import apiClient from '../../lib/apiClient';

/**
 * Servicio de consultas para reservas
 */
export class ReservationQueryService {
  
  /**
   * Obtiene reservas aplicando filtros
   * GET /reservas?search={email}&estado={estado}&fuente={fuente}&desde={date}&hasta={date}
   * 
   * Filtros disponibles:
   * - search: Búsqueda por email del cliente
   * - estado: Filtrar por estado de la reserva
   * - fuente: Filtrar por fuente (Booking.com, Directo, etc.)
   * - desde: Fecha de inicio
   * - hasta: Fecha de fin
   * - page: Número de página para paginación
   * - per_page: Cantidad de resultados por página
   */
  async getWithFilters(filters?: ReservationFilters): Promise<Reservation[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.search) params.append('search', filters.search);
      if (filters?.estado) params.append('estado', filters.estado);
      if (filters?.fuente) params.append('fuente', filters.fuente);
      if (filters?.desde) params.append('desde', filters.desde);
      if (filters?.hasta) params.append('hasta', filters.hasta);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.per_page) params.append('per_page', filters.per_page.toString());

      const queryString = params.toString();
      const url = `/reservas${queryString ? `?${queryString}` : ''}`;
      
      console.log('[API] GET', url);

      const res = await apiClient.get<ApiReservaFull[] | { data: ApiReservaFull[] }>(url);
      
      const apiReservas: ApiReservaFull[] = Array.isArray(res.data) 
        ? res.data 
        : (res.data as any)?.data || [];

      const reservations = apiReservas.map(apiReserva => 
        mapApiReservaFullToReservation(apiReserva)
      );

      console.log(`[API] Loaded ${reservations.length} reservations with filters:`, filters);
      
      return reservations;
    } catch (error) {
      console.error('[API] Error fetching reservations with filters:', error);
      throw error;
    }
  }

  /**
   * Busca reservas según múltiples criterios
   * 
   * Esta es una búsqueda local sobre datos ya cargados,
   * útil para filtrado en memoria sin hacer llamadas al servidor
   */
  search(
    reservations: Reservation[],
    query: {
      guestName?: string;
      email?: string;
      confirmationNumber?: string;
      status?: Reservation['status'];
      checkInDate?: string;
      checkOutDate?: string;
    }
  ): Reservation[] {
    return reservations.filter((reservation: Reservation) => {
      const matchesGuestName = !query.guestName || 
        (reservation.guest?.firstName?.toLowerCase().includes(query.guestName.toLowerCase()) ||
         reservation.guest?.firstLastName?.toLowerCase().includes(query.guestName.toLowerCase()) ||
         reservation.guest?.secondLastName?.toLowerCase().includes(query.guestName.toLowerCase()));
      
      const matchesEmail = !query.email || 
        reservation.guest?.email?.toLowerCase().includes(query.email.toLowerCase());
      
      const matchesConfirmation = !query.confirmationNumber || 
        reservation.confirmationNumber.toLowerCase().includes(query.confirmationNumber.toLowerCase());
      
      const matchesStatus = !query.status || reservation.status === query.status;
      const matchesCheckIn = !query.checkInDate || reservation.checkInDate === query.checkInDate;
      const matchesCheckOut = !query.checkOutDate || reservation.checkOutDate === query.checkOutDate;

      return matchesGuestName && matchesEmail && matchesConfirmation && 
             matchesStatus && matchesCheckIn && matchesCheckOut;
    });
  }

  /**
   * Genera estadísticas agregadas de reservas
   * 
   * Calcula:
   * - Total de reservas
   * - Distribución por estado
   * - Ingresos totales y promedio
   * - Duración promedio de estadía
   */
  calculateStatistics(reservations: Reservation[]): {
    total: number;
    byStatus: Record<Reservation['status'], number>;
    revenue: number;
    averageStay: number;
  } {
    const stats = {
      total: reservations.length,
      byStatus: {} as Record<Reservation['status'], number>,
      revenue: 0,
      averageStay: 0
    };

    let totalNights = 0;

    reservations.forEach((reservation: Reservation) => {
      // Count by status
      stats.byStatus[reservation.status] = (stats.byStatus[reservation.status] || 0) + 1;
      
      // Calculate revenue only for confirmed and completed reservations
      if (reservation.status === 'confirmed' || reservation.status === 'checked_out') {
        stats.revenue += reservation.total;
      }
      
      // Sum total nights
      totalNights += reservation.numberOfNights;
    });

    // Calculate average stay
    stats.averageStay = reservations.length > 0 ? totalNights / reservations.length : 0;

    return stats;
  }

  /**
   * Filtra reservas por rango de fechas
   * 
   * Útil para calendarios y vistas de disponibilidad
   */
  filterByDateRange(reservations: Reservation[], startDate: string, endDate?: string): Reservation[] {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(startDate);

    return reservations.filter((reservation: Reservation) => {
      const checkIn = new Date(reservation.checkInDate);
      const checkOut = new Date(reservation.checkOutDate);
      return checkIn <= end && checkOut >= start;
    });
  }

  /**
   * Filtra reservas por estado
   */
  filterByStatus(reservations: Reservation[], status: Reservation['status']): Reservation[] {
    return reservations.filter(r => r.status === status);
  }

  /**
   * Filtra reservas por huésped
   */
  filterByGuest(reservations: Reservation[], guestId: string): Reservation[] {
    return reservations.filter(r => r.guestId === guestId || r.guest?.id === guestId);
  }

  /**
   * Obtiene reservas que requieren atención
   * (pendientes, check-in hoy, problemas de pago, etc.)
   */
  getRequiringAttention(reservations: Reservation[]): Reservation[] {
    const today = new Date().toISOString().split('T')[0];

    return reservations.filter(reservation => {
      // Pending reservations
      if (reservation.status === 'pending') return true;

      // Check-in today
      if (reservation.checkInDate === today && reservation.status === 'confirmed') return true;

      // Check-out today
      if (reservation.checkOutDate === today && reservation.status === 'checked_in') return true;

      return false;
    });
  }

  /**
   * Agrupa reservas por mes
   * Útil para reportes y gráficos
   */
  groupByMonth(reservations: Reservation[]): Map<string, Reservation[]> {
    const grouped = new Map<string, Reservation[]>();

    reservations.forEach(reservation => {
      const date = new Date(reservation.checkInDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!grouped.has(monthKey)) {
        grouped.set(monthKey, []);
      }
      grouped.get(monthKey)!.push(reservation);
    });

    return grouped;
  }
}

export const reservationQueryService = new ReservationQueryService();
