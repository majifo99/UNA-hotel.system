/**
 * ReservationCrudService
 * 
 * Servicio dedicado a operaciones CRUD básicas de reservas.
 * Maneja la comunicación directa con la API para crear, leer, actualizar y eliminar reservas.
 * 
 * Responsabilidades:
 * - Create: Crear nuevas reservas
 * - Read: Obtener reservas por ID, confirmación, fecha
 * - Update: Actualizar datos de reservas existentes
 * - Delete/Cancel: Cancelar reservas
 * 
 * @module services/crud
 */

import type { 
  Reservation, 
  ApiCreateReservaPayload, 
  ApiReservation, 
  ApiReservaHabitacion,
  SimpleReservationFormData
} from '../../types/domain';
import type { ApiReservaFull, CreateReservationDto } from '../../types';
import { 
  mapSimpleFormToApiPayload, 
  mapApiReservationToReservation, 
  mapStatusToEstadoId, 
  mapApiReservaFullToReservation 
} from '../../types';
import apiClient from '../../lib/apiClient';

/**
 * Servicio CRUD para reservas
 */
export class ReservationCrudService {
  
  // =================== CREATE OPERATIONS ===================

  /**
   * Crea una reserva simple (legacy)
   * POST /reservas
   */
  async create(reservationData: SimpleReservationFormData & { roomId: string }): Promise<Reservation> {
    const payload: ApiCreateReservaPayload = mapSimpleFormToApiPayload(reservationData as SimpleReservationFormData);

    try {
      await this.ensureEstadoIfMissing(payload);

      console.debug('[API] POST /reservas payload:', payload);
      const res = await apiClient.post('/reservas', payload);

      const createdApiReserva = this.extractCreatedApiReserva(res);
      if (!createdApiReserva) {
        console.error('[API] Unexpected /reservas POST response:', res.status, res.data);
        throw new Error('Unexpected response from /reservas');
      }

      const reservaId = String(createdApiReserva.id_reserva);
      await this.postHabitacionIfNeeded(reservaId, reservationData);

      const reservation = mapApiReservationToReservation(createdApiReserva as ApiReservation);
      return reservation;
    } catch (error: any) {
      console.error('[API] Error creating reserva:', error?.message || error);
      if (error?.response?.data) {
        console.error('[API] /reservas error response body:', error.response.data);
      }
      throw error;
    }
  }

  /**
   * Crea una reserva con múltiples habitaciones (nueva API)
   * POST /reservas
   */
  async createNew(payload: CreateReservationDto): Promise<Reservation> {
    try {
      console.log('[API] POST /reservas with payload:', payload);
      
      const res = await apiClient.post<ApiReservaFull | { data: ApiReservaFull }>('/reservas', payload);
      
      const apiReserva: ApiReservaFull = (res.data as any)?.data ?? res.data;
      
      if (!apiReserva || !apiReserva.id_reserva) {
        throw new Error('Invalid API response structure');
      }

      const reservation = mapApiReservaFullToReservation(apiReserva);
      
      console.log('[API] Created reservation:', reservation);
      
      return reservation;
    } catch (error) {
      console.error('[API] Error creating reservation:', error);
      throw error;
    }
  }

  // =================== READ OPERATIONS ===================

  /**
   * Obtiene una reserva por ID
   * GET /reservas/{id}
   */
  async getById(id: string): Promise<Reservation | null> {
    try {
      const res = await apiClient.get<ApiReservaFull | { data: ApiReservaFull }>(`/reservas/${id}`);
      
      const apiReserva: ApiReservaFull = (res.data as any)?.data ?? res.data;
      
      if (!apiReserva || !apiReserva.id_reserva) {
        console.error('Invalid API response structure:', res.data);
        return null;
      }

      console.log('API Response:', apiReserva);
      
      const reservation = mapApiReservaFullToReservation(apiReserva);
      
      console.log('Mapped Reservation:', reservation);

      return reservation;
    } catch (error) {
      console.error('Error fetching reservation:', error);
      return null;
    }
  }

  /**
   * Obtiene una reserva por número de confirmación
   * GET /reservas?confirmationNumber={number}
   */
  async getByConfirmation(confirmationNumber: string): Promise<Reservation | null> {
    try {
      const res = await apiClient.get('/reservas', { params: { confirmationNumber } });
      const data: ApiReservation[] = res.data?.data || res.data || [];
      
      if (!data || data.length === 0) return null;
      
      const apiRes = data[0] as ApiReservation & { cliente?: any };

      if ((apiRes as any).habitaciones && Array.isArray((apiRes as any).habitaciones)) {
        return mapApiReservationToReservation(apiRes, undefined, undefined, (apiRes as any).habitaciones);
      }

      return mapApiReservationToReservation(apiRes);
    } catch (error) {
      console.error('Error fetching reservation by confirmation:', error);
      return null;
    }
  }

  /**
   * Obtiene todas las reservas
   * GET /reservas
   */
  async getAll(): Promise<Reservation[]> {
    try {
      const res = await apiClient.get('/reservas');
      const payload = res.data as { data?: ApiReservation[] } | ApiReservation[] | undefined;
      
      let apiList: ApiReservation[] = [];
      if (Array.isArray((payload as any)?.data)) {
        apiList = (payload as any).data as ApiReservation[];
      } else if (Array.isArray(payload)) {
        apiList = payload as ApiReservation[];
      }

      const reservations = await Promise.all((apiList as ApiReservation[]).map(async (apiReservation) => {
        let habitaciones: ApiReservaHabitacion[] | undefined;

        if (Array.isArray((apiReservation as any).habitaciones)) {
          habitaciones = (apiReservation as any).habitaciones as ApiReservaHabitacion[];
        } else {
          try {
            const habitacionesRes = await apiClient.get(`/reservas/${apiReservation.id_reserva}/habitaciones`);
            const habitacionesPayload = habitacionesRes.data as { data?: ApiReservaHabitacion[] } | ApiReservaHabitacion[] | undefined;
            
            let habitacionesList: ApiReservaHabitacion[] = [];
            if (Array.isArray((habitacionesPayload as any)?.data)) {
              habitacionesList = (habitacionesPayload as any).data as ApiReservaHabitacion[];
            } else if (Array.isArray(habitacionesPayload)) {
              habitacionesList = habitacionesPayload as ApiReservaHabitacion[];
            }
            habitaciones = habitacionesList as ApiReservaHabitacion[];
          } catch (error: any) {
            console.warn(`[API] No se pudieron obtener las habitaciones para la reserva ${apiReservation.id_reserva}:`, error?.message || error);
          }
        }

        return mapApiReservationToReservation(apiReservation, undefined, undefined, habitaciones);
      }));

      return reservations;
    } catch (error) {
      console.error('Error fetching all reservations:', error);
      throw error;
    }
  }

  /**
   * Obtiene reservas por rango de fechas
   * GET /reservas?fecha_llegada={start}&fecha_salida={end}
   */
  async getByDateRange(startDate: string, endDate?: string): Promise<Reservation[]> {
    try {
      const res = await apiClient.get('/reservas', { 
        params: { fecha_llegada: startDate, fecha_salida: endDate } 
      });
      
      const apiList = (res.data && (res.data.data ?? res.data)) as ApiReservation[] | undefined;
      const list = Array.isArray(apiList) ? apiList : [];
      
      return list.map(api => mapApiReservationToReservation(api as ApiReservation));
    } catch (error) {
      console.error('Error fetching reservations by date:', error);
      throw error;
    }
  }

  // =================== UPDATE OPERATIONS ===================

  /**
   * Actualiza una reserva existente
   * PUT /reservas/{id}
   */
  async update(id: string, updates: Partial<Reservation>): Promise<Reservation | null> {
    const normalizedUpdates: Partial<Reservation> = { ...updates };

    this.calculateNightsIfNeeded(normalizedUpdates);

    const payload = this.buildApiPayloadFromUpdates(normalizedUpdates);
    await this.updateApiReservation(id, payload);
    await this.updateHabitacionIfNeeded(id, normalizedUpdates);

    const latest = await this.getById(id);
    if (!latest) return null;

    return {
      ...latest,
      ...normalizedUpdates,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Actualiza el estado de una reserva
   * PUT /reservas/{id}
   */
  async updateStatus(id: string, status: Reservation['status']): Promise<Reservation | null> {
    return this.update(id, { status });
  }

  // =================== DELETE/CANCEL OPERATIONS ===================

  /**
   * Cancela una reserva
   * POST /reservas/{id}/cancel
   */
  async cancel(id: string, options?: { penalty?: number; note?: string }): Promise<Reservation | null> {
    let cancelledReservation: Reservation | null = null;

    try {
      await apiClient.post(`/reservas/${id}/cancel`, {
        motivo: options?.note,
        penalidad: options?.penalty,
      });
      cancelledReservation = await this.getById(id);
    } catch (error: any) {
      console.warn('[API] Endpoint /reservas/:id/cancel no disponible, usando actualización estándar:', error?.message || error);
    }

    if (cancelledReservation && cancelledReservation.status === 'cancelled') {
      return {
        ...cancelledReservation,
        updatedAt: new Date().toISOString(),
      };
    }

    return this.update(id, {
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    });
  }

  // =================== PRIVATE HELPER METHODS ===================

  private async ensureEstadoIfMissing(payload: ApiCreateReservaPayload): Promise<void> {
    if (payload.id_estado_res !== undefined) return;

    try {
      const estadosRes = await apiClient.get('/estados-reserva');
      const list: any[] = estadosRes.data?.data || estadosRes.data || [];
      
      const preferred = list.find(e => Number(e.id_estado_res) === 2)
        || list.find(e => Number(e.id_estado_res) === 7)
        || list.find(e => String(e.nombre || '').toLowerCase().includes('pend'))
        || list.find(e => String(e.nombre || '').toLowerCase().includes('esper'))
        || list.find(e => Number(e.id_estado_res) !== 1)
        || list[0];
      
      if (preferred) {
        console.debug('[API] Selected id_estado_res for new reserva:', preferred.id_estado_res);
        payload.id_estado_res = Number(preferred.id_estado_res);
      }
    } catch (err) {
      console.warn('[API] Could not fetch estados-reserva, proceeding without id_estado_res:', String(err));
    }
  }

  private extractCreatedApiReserva(res: any): ApiReservation | null {
    const apiRes: ApiReservation = res.data?.data ? res.data.data : res.data;

    if (!apiRes) return null;
    if (Array.isArray(apiRes)) return apiRes[0] as ApiReservation;
    return apiRes as ApiReservation;
  }

  private async postHabitacionIfNeeded(
    reservaId: string, 
    reservationData: SimpleReservationFormData & { roomId: string }
  ): Promise<void> {
    if (!reservationData.roomId || !reservationData.checkInDate || !reservationData.checkOutDate) return;

    try {
      const habitacionPayload = {
        id_habitacion: Number(reservationData.roomId),
        fecha_llegada: reservationData.checkInDate,
        fecha_salida: reservationData.checkOutDate,
        pax_total: Number(reservationData.numberOfGuests || 1),
      };
      
      console.debug('[API] POST /reservas/' + reservaId + '/habitaciones payload:', habitacionPayload);
      await apiClient.post(`/reservas/${reservaId}/habitaciones`, habitacionPayload);
    } catch (err: any) {
      console.error('[API] Failed to create reserva_habitacion:', err?.message || err);
    }
  }

  private calculateNightsIfNeeded(normalizedUpdates: Partial<Reservation>): void {
    if (!(normalizedUpdates.checkInDate && normalizedUpdates.checkOutDate)) return;

    try {
      const checkIn = new Date(normalizedUpdates.checkInDate as string);
      const checkOut = new Date(normalizedUpdates.checkOutDate as string);
      const diff = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
      normalizedUpdates.numberOfNights = diff;
    } catch (error) {
      console.warn('[Reservations] No se pudo calcular el número de noches:', error);
    }
  }

  private buildApiPayloadFromUpdates(normalizedUpdates: Partial<Reservation>): Partial<ApiCreateReservaPayload> {
    const payload: Partial<ApiCreateReservaPayload> = {};
    
    if (normalizedUpdates.specialRequests !== undefined) {
      payload.notas = normalizedUpdates.specialRequests;
    }
    if (normalizedUpdates.total !== undefined) {
      payload.total_monto_reserva = normalizedUpdates.total;
    }
    if (normalizedUpdates.status !== undefined) {
      payload.id_estado_res = mapStatusToEstadoId(normalizedUpdates.status);
    }

    const adults = normalizedUpdates.numberOfAdults;
    const children = normalizedUpdates.numberOfChildren;
    const infants = normalizedUpdates.numberOfInfants;

    if (adults !== undefined || children !== undefined || infants !== undefined) {
      const safeAdults = Math.max(0, Math.round(adults ?? 0));
      const safeChildren = Math.max(0, Math.round(children ?? 0));
      const safeInfants = Math.max(0, Math.round(infants ?? 0));
      
      payload.adultos = safeAdults;
      payload.ninos = safeChildren;
      payload.bebes = safeInfants;
      
      const totalPax = safeAdults + safeChildren + safeInfants;
      if (totalPax > 0 && payload.adultos === 0) {
        payload.adultos = Math.min(totalPax, Math.max(1, totalPax - safeChildren - safeInfants));
      }
      if (totalPax > 0) {
        normalizedUpdates.numberOfGuests = totalPax;
      }
    } else if (normalizedUpdates.numberOfGuests !== undefined) {
      const totalGuests = Math.max(0, Math.round(normalizedUpdates.numberOfGuests));
      payload.adultos = totalGuests > 0 ? totalGuests : 0;
      payload.ninos = 0;
      payload.bebes = 0;
    }
    
    return payload;
  }

  private async updateApiReservation(id: string, payload: Partial<ApiCreateReservaPayload>): Promise<void> {
    try {
      if (Object.keys(payload).length > 0) {
        await apiClient.put(`/reservas/${id}`, payload);
      }
    } catch (error: any) {
      console.error('[API] Error actualizando /reservas/:id', error?.message || error);
    }
  }

  private async updateHabitacionIfNeeded(id: string, normalizedUpdates: Partial<Reservation>): Promise<void> {
    if (
      !(
        normalizedUpdates.checkInDate ||
        normalizedUpdates.checkOutDate ||
        normalizedUpdates.numberOfGuests !== undefined ||
        normalizedUpdates.roomId
      )
    ) return;

    const habitacionPayload: Partial<ApiReservaHabitacion> = {};
    
    if (normalizedUpdates.roomId) {
      habitacionPayload.id_habitacion = Number(normalizedUpdates.roomId);
    }
    if (normalizedUpdates.checkInDate) {
      habitacionPayload.fecha_llegada = normalizedUpdates.checkInDate;
    }
    if (normalizedUpdates.checkOutDate) {
      habitacionPayload.fecha_salida = normalizedUpdates.checkOutDate;
    }
    if (normalizedUpdates.numberOfGuests !== undefined) {
      habitacionPayload.pax_total = Number(normalizedUpdates.numberOfGuests);
    }

    try {
      await apiClient.put(`/reservas/${id}/habitaciones`, habitacionPayload);
    } catch (error: any) {
      console.warn('[API] No se pudo actualizar la reserva_habitacion:', error?.message || error);
    }
  }
}

export const reservationCrudService = new ReservationCrudService();
