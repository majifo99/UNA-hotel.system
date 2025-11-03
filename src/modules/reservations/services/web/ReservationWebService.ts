/**
 * ReservationWebService
 * 
 * Servicio dedicado a operaciones de reservas WEB para clientes finales.
 * Usa endpoints /api/reservas-web con token de Cliente.
 * 
 * Características:
 * - El id_cliente se toma automáticamente del token (seguridad)
 * - Las reservas se crean en estado "Confirmada" (ID 3) automáticamente
 * - La fuente se establece como "Web" (ID 2) automáticamente
 * - Solo puede ver/modificar/cancelar sus propias reservas
 * 
 * Operaciones disponibles:
 * - Crear reserva (sin id_cliente en request)
 * - Listar mis reservas
 * - Ver detalle de mi reserva
 * - Modificar mi reserva (solo en estado Pendiente o Confirmada)
 * - Cancelar mi reserva
 * 
 * @module services/web
 */

import apiClient from '../../lib/apiClient';
import type {
  CreateReservaWebDto,
  UpdateReservaWebDto,
  CancelReservaWebDto,
  ReservaWebResponse,
  CancelReservaWebResponse,
  ReservaWebFilters,
} from '../../types/web';
import type { Reservation } from '../../types';
import { mapApiReservaFullToReservation } from '../../types';

/**
 * Servicio para reservas WEB (clientes)
 */
export class ReservationWebService {
  private readonly baseUrl = '/reservas-web';

  // =================== CREATE OPERATIONS ===================

  /**
   * Crea una nueva reserva web
   * 
   * POST /api/reservas-web
   * 
   * El id_cliente se toma automáticamente del token de autenticación.
   * El estado se establece en "Confirmada" (ID 3) automáticamente.
   * La fuente se establece en "Web" (ID 2) automáticamente.
   * 
   * @param payload - Datos de la reserva (SIN id_cliente)
   * @returns Reserva creada
   * @throws Error si falla la creación o el cliente no está autenticado
   * 
   * @example
   * ```typescript
   * const reserva = await reservationWebService.create({
   *   notas: "Reserva para aniversario",
   *   habitaciones: [{
   *     id_habitacion: 1,
   *     fecha_llegada: "2026-08-20",
   *     fecha_salida: "2026-08-26",
   *     adultos: 2,
   *     ninos: 0,
   *     bebes: 0
   *   }]
   * });
   * ```
   */
  async create(payload: CreateReservaWebDto): Promise<Reservation> {
    try {
      console.log('[ReservationWebService] Creating web reservation:', payload);

      // Validación básica
      if (!payload.habitaciones || payload.habitaciones.length === 0) {
        throw new Error('Debe incluir al menos una habitación');
      }

      const res = await apiClient.post<ReservaWebResponse>(this.baseUrl, payload);

      console.log('[ReservationWebService] Reservation created:', res.data);

      // Mapear respuesta a formato interno
      const reservation = mapApiReservaFullToReservation(res.data as any);

      return reservation;
    } catch (error) {
      console.error('[ReservationWebService] Error creating reservation:', error);

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: any } };
        if (axiosError.response?.status === 401) {
          throw new Error('No autenticado. Inicia sesión como cliente para crear una reserva.');
        }
        if (axiosError.response?.status === 403) {
          throw new Error('No tienes permisos para crear reservas web.');
        }
        if (axiosError.response?.data?.message) {
          throw new Error(axiosError.response.data.message);
        }
      }

      throw error;
    }
  }

  // =================== READ OPERATIONS ===================

  /**
   * Obtiene todas las reservas del cliente autenticado
   * 
   * GET /api/reservas-web
   * 
   * Solo retorna las reservas del cliente que está autenticado.
   * Soporta filtros opcionales.
   * 
   * @param filters - Filtros opcionales (estado, fechas)
   * @returns Lista de reservas propias
   * 
   * @example
   * ```typescript
   * // Todas mis reservas
   * const reservas = await reservationWebService.getAll();
   * 
   * // Solo confirmadas
   * const confirmadas = await reservationWebService.getAll({ estado: 'Confirmada' });
   * ```
   */
  async getAll(filters?: ReservaWebFilters): Promise<Reservation[]> {
    try {
      const params = new URLSearchParams();

      if (filters?.estado) {
        params.append('estado', filters.estado);
      }
      if (filters?.desde) {
        params.append('desde', filters.desde);
      }
      if (filters?.hasta) {
        params.append('hasta', filters.hasta);
      }

      const url = params.toString() ? `${this.baseUrl}?${params.toString()}` : this.baseUrl;

      console.log('[ReservationWebService] Fetching my reservations:', url);

      const res = await apiClient.get<ReservaWebResponse[]>(url);

      console.log('[ReservationWebService] Found', res.data.length, 'reservations');

      // Mapear respuesta a formato interno
      return res.data.map((apiReserva) => mapApiReservaFullToReservation(apiReserva as any));
    } catch (error) {
      console.error('[ReservationWebService] Error fetching reservations:', error);
      throw error;
    }
  }

  /**
   * Obtiene el detalle de una reserva específica
   * 
   * GET /api/reservas-web/{id}
   * 
   * Valida que la reserva pertenezca al cliente autenticado.
   * Si intenta acceder a una reserva de otro cliente, retorna 403.
   * 
   * @param id - ID de la reserva
   * @returns Detalle de la reserva o null si no se encuentra
   * 
   * @example
   * ```typescript
   * const reserva = await reservationWebService.getById('123');
   * ```
   */
  async getById(id: string): Promise<Reservation | null> {
    try {
      console.log('[ReservationWebService] Fetching reservation:', id);

      const res = await apiClient.get<ReservaWebResponse>(`${this.baseUrl}/${id}`);

      console.log('[ReservationWebService] Reservation found:', res.data);

      return mapApiReservaFullToReservation(res.data as any);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        console.warn('[ReservationWebService] Reservation not found:', id);
        return null;
      }

      if (error?.response?.status === 403) {
        throw new Error('No tienes permiso para ver esta reserva');
      }

      console.error('[ReservationWebService] Error fetching reservation:', error);
      throw error;
    }
  }

  // =================== UPDATE OPERATIONS ===================

  /**
   * Actualiza una reserva propia
   * 
   * PUT /api/reservas-web/{id}
   * 
   * Solo se puede modificar si está en estado "Pendiente" o "Confirmada".
   * Solo puede modificar sus propias reservas (validado por backend).
   * Si modifica habitaciones, se recalcula el total automáticamente.
   * 
   * @param id - ID de la reserva
   * @param updates - Campos a actualizar
   * @returns Reserva actualizada o null si no se encuentra
   * 
   * @example
   * ```typescript
   * const reserva = await reservationWebService.update('123', {
   *   notas: "Actualización de reserva",
   *   numero_adultos: 3
   * });
   * ```
   */
  async update(id: string, updates: UpdateReservaWebDto): Promise<Reservation | null> {
    try {
      console.log('[ReservationWebService] Updating reservation:', id, updates);

      const res = await apiClient.put<ReservaWebResponse>(`${this.baseUrl}/${id}`, updates);

      console.log('[ReservationWebService] Reservation updated:', res.data);

      return mapApiReservaFullToReservation(res.data as any);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null;
      }

      if (error?.response?.status === 403) {
        throw new Error('No tienes permiso para modificar esta reserva');
      }

      if (error?.response?.status === 422) {
        const message = error?.response?.data?.message || 'No se puede modificar esta reserva';
        throw new Error(message);
      }

      console.error('[ReservationWebService] Error updating reservation:', error);
      throw error;
    }
  }

  // =================== CANCEL OPERATIONS ===================

  /**
   * Cancela una reserva propia
   * 
   * POST /api/reservas-web/{id}/cancelar
   * 
   * Solo puede cancelar sus propias reservas.
   * No se puede cancelar una reserva ya cancelada.
   * Cambia el estado a "Cancelada" (ID 3).
   * 
   * @param id - ID de la reserva
   * @param payload - Motivo de cancelación (opcional)
   * @returns Reserva cancelada
   * 
   * @example
   * ```typescript
   * const reserva = await reservationWebService.cancel('123', {
   *   notas: "Cancelación por cambio de planes"
   * });
   * ```
   */
  async cancel(id: string, payload?: CancelReservaWebDto): Promise<Reservation> {
    try {
      console.log('[ReservationWebService] Canceling reservation:', id);

      const res = await apiClient.post<CancelReservaWebResponse>(
        `${this.baseUrl}/${id}/cancelar`,
        payload || {}
      );

      console.log('[ReservationWebService] Reservation canceled:', res.data);

      return mapApiReservaFullToReservation(res.data.data as any);
    } catch (error: any) {
      if (error?.response?.status === 403) {
        throw new Error('No tienes permiso para cancelar esta reserva');
      }

      if (error?.response?.status === 422) {
        const message = error?.response?.data?.message || 'No se puede cancelar esta reserva';
        throw new Error(message);
      }

      console.error('[ReservationWebService] Error canceling reservation:', error);
      throw error;
    }
  }
}

/**
 * Instancia singleton del servicio web
 */
export const reservationWebService = new ReservationWebService();
