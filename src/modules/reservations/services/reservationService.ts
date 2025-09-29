import type { SimpleReservationFormData, Reservation, ApiCreateReservaPayload, ApiReservation, ApiReservaHabitacion } from '../types/domain';
import { mapSimpleFormToApiPayload, mapApiReservationToReservation, mapStatusToEstadoId } from '../types';
import type { AdditionalService } from '../../../types/core/domain';
import { simulateApiCall, cloneData } from '../utils/mockApi';
import { servicesData } from '../data/servicesData';
import { reservationsData } from '../data/reservationsData';
import apiClient from '../lib/apiClient';

const USE_MOCKS = (import.meta.env.VITE_USE_MOCKS === 'true');

class ReservationService {
  async createReservation(reservationData: SimpleReservationFormData & { roomId: string }): Promise<Reservation> {
    // Simulate API call with realistic delay for creating a reservation
    const payload: ApiCreateReservaPayload = mapSimpleFormToApiPayload(reservationData as SimpleReservationFormData);

    if (USE_MOCKS) {
      await simulateApiCall(null, 1200);
      const reservation: Reservation = {
        ...reservationData,
        id: `res-${Date.now()}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        confirmationNumber: `CONF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        guest: {
          id: reservationData.guestId,
          firstName: 'Pendiente',
          lastName: 'Asignación',
          email: 'pending@example.com',
          phone: '',
          nationality: '',
          documentType: 'id_card',
          documentNumber: '',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      };

      // eslint-disable-next-line no-console
      console.debug('Create Reserva payload (mock):', payload);
      return reservation;
    }

    // Real API call
    try {
      // Ensure we provide a valid id_estado_res if not present in the payload
      if (payload.id_estado_res === undefined) {
        try {
          const estadosRes = await apiClient.get('/estados-reserva');
          const list: any[] = estadosRes.data?.data || estadosRes.data || [];
          // Prefer explicit id 2 or a name containing 'pend'
          const preferred = list.find(e => Number(e.id_estado_res) === 2)
            || list.find(e => String(e.nombre || '').toLowerCase().includes('pend'))
            || list[0];
          if (preferred) {
            // eslint-disable-next-line no-console
            console.debug('[API] Selected id_estado_res for new reserva:', preferred.id_estado_res);
            payload.id_estado_res = Number(preferred.id_estado_res);
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn('[API] Could not fetch estados-reserva, proceeding without id_estado_res:', String(err));
        }
      }

      // eslint-disable-next-line no-console
      console.debug('[API] POST /reservas payload:', payload);
      const res = await apiClient.post('/reservas', payload);
      // Backend may return the created resource inside data or directly
      const apiRes: ApiReservation = res.data?.data ? res.data.data : res.data;

      // If backend returned a paginated-like envelope, try to extract first element
      let createdApiReserva: ApiReservation | null = null;
      if (!apiRes) {
        createdApiReserva = null;
      } else if (Array.isArray(apiRes)) {
        createdApiReserva = apiRes[0] as ApiReservation;
      } else {
        createdApiReserva = apiRes as ApiReservation;
      }

      if (!createdApiReserva) {
        // eslint-disable-next-line no-console
        console.error('[API] Unexpected /reservas POST response:', res.status, res.data);
        throw new Error('Unexpected response from /reservas');
      }

      // If room assignment info is present on the request, attach a reserva_habitacion
      const reservaId = String(createdApiReserva.id_reserva);

      // If reservationData includes roomId and dates, post a habitacion
      if (reservationData.roomId && reservationData.checkInDate && reservationData.checkOutDate) {
        try {
          const habitacionPayload = {
            id_habitacion: Number(reservationData.roomId),
            fecha_llegada: reservationData.checkInDate,
            fecha_salida: reservationData.checkOutDate,
            pax_total: Number(reservationData.numberOfGuests || 1),
          };
          // eslint-disable-next-line no-console
          console.debug('[API] POST /reservas/' + reservaId + '/habitaciones payload:', habitacionPayload);
          await apiClient.post(`/reservas/${reservaId}/habitaciones`, habitacionPayload);
        } catch (err: any) {
          // eslint-disable-next-line no-console
          console.error('[API] Failed to create reserva_habitacion:', err?.message || err);
          // Do not fail the whole flow — reservation was created; surface warning
        }
      }

      const reservation = mapApiReservationToReservation(createdApiReserva as ApiReservation);
      return reservation;
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('[API] Error creating reserva:', error?.message || error);
      // If backend provided validation errors, log them for debugging
      if (error?.response?.data) {
        // eslint-disable-next-line no-console
        console.error('[API] /reservas error response body:', error.response.data);
      }
      throw error;
    }
  }

  async getAdditionalServices(): Promise<AdditionalService[]> {
    if (USE_MOCKS) {
      const services = await simulateApiCall(cloneData(servicesData), 500);
      return services;
    }

    try {
      const res = await apiClient.get('/servicios');
      // eslint-disable-next-line no-console
      console.debug('[API] /servicios response:', res.status, res.data);
      return res.data?.data || res.data || [];
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('[API] Error fetching /servicios:', error?.message || error);
      throw error;
    }
  }

  async getServicesByCategory(category: string): Promise<AdditionalService[]> {
    if (USE_MOCKS) {
      const services = await simulateApiCall(cloneData(servicesData), 500);
      return services.filter(service => service.category === category);
    }

    const res = await apiClient.get('/servicios', { params: { category } });
    return res.data?.data || res.data || [];
  }

  async getServiceById(serviceId: string): Promise<AdditionalService | null> {
    if (USE_MOCKS) {
      const services = await simulateApiCall(cloneData(servicesData), 500);
      return services.find(service => service.id === serviceId) || null;
    }

    try {
      const res = await apiClient.get(`/servicios/${serviceId}`);
      // eslint-disable-next-line no-console
      console.debug('[API] /servicios/{id} response:', res.status, res.data);
      return res.data?.data || res.data || null;
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error(`[API] Error fetching /servicios/${serviceId}:`, error?.message || error);
      throw error;
    }
  }

  async getReservationById(id: string): Promise<Reservation | null> {
    if (USE_MOCKS) {
      const reservations = await simulateApiCall(cloneData(reservationsData), 500);
      const reservation = reservations.find((r: Reservation) => r.id === id);
      return reservation || null;
    }

    const res = await apiClient.get(`/reservas/${id}`);
    const apiRes: ApiReservation = res.data?.data ? res.data.data : res.data;
    if (!apiRes) return null;

    // Fetch habitaciones for this reserva
    const roomsRes = await apiClient.get(`/reservas/${id}/habitaciones`);
    const apiHab: ApiReservaHabitacion[] = Array.isArray(roomsRes.data) ? roomsRes.data : (roomsRes.data?.data || []);

    const reservation = mapApiReservationToReservation(apiRes as ApiReservation, undefined, undefined, apiHab);

    return reservation;
  }

  async getReservationByConfirmation(confirmationNumber: string): Promise<Reservation | null> {
    if (USE_MOCKS) {
      const reservations = await simulateApiCall(cloneData(reservationsData), 500);
      const reservation = reservations.find((r: Reservation) => r.confirmationNumber === confirmationNumber);
      return reservation || null;
    }

    const res = await apiClient.get('/reservas', { params: { confirmationNumber } });
    const data: ApiReservation[] = res.data?.data || res.data || [];
    if (!data || data.length === 0) return null;
    const apiRes = data[0] as ApiReservation & { cliente?: any };

    // If the list item includes habitaciones inline, use them; otherwise fetch detalles when needed
    if ((apiRes as any).habitaciones && Array.isArray((apiRes as any).habitaciones)) {
      return mapApiReservationToReservation(apiRes, undefined, undefined, (apiRes as any).habitaciones);
    }

    // Otherwise return mapped reservation without habitaciones
    return mapApiReservationToReservation(apiRes);
  }

  async getAllReservations(): Promise<Reservation[]> {
    if (USE_MOCKS) {
      return simulateApiCall(cloneData(reservationsData), 500);
    }

    const res = await apiClient.get('/reservas');
    const payload = res.data as { data?: ApiReservation[] };
    const apiList = Array.isArray(payload?.data) ? payload.data! : (Array.isArray(res.data) ? res.data : []);

    const reservations = await Promise.all((apiList as ApiReservation[]).map(async (apiReservation) => {
      let habitaciones: ApiReservaHabitacion[] | undefined;

      if (Array.isArray((apiReservation as any).habitaciones)) {
        habitaciones = (apiReservation as any).habitaciones as ApiReservaHabitacion[];
      } else {
        try {
          const habitacionesRes = await apiClient.get(`/reservas/${apiReservation.id_reserva}/habitaciones`);
          const habitacionesPayload = habitacionesRes.data as { data?: ApiReservaHabitacion[] };
          const list = Array.isArray(habitacionesPayload?.data) ? habitacionesPayload.data! : (Array.isArray(habitacionesRes.data) ? habitacionesRes.data : []);
          habitaciones = list as ApiReservaHabitacion[];
        } catch (error: any) {
          console.warn(`[API] No se pudieron obtener las habitaciones para la reserva ${apiReservation.id_reserva}:`, error?.message || error);
        }
      }

      return mapApiReservationToReservation(apiReservation, undefined, undefined, habitaciones);
    }));

    return reservations;
  }

  async getReservationsByDate(startDate: string, endDate?: string): Promise<Reservation[]> {
    if (USE_MOCKS) {
      const reservations = await simulateApiCall(cloneData(reservationsData), 500);

      const start = new Date(startDate);
      const end = endDate ? new Date(endDate) : new Date(startDate);

      const filteredReservations = reservations.filter((reservation: Reservation) => {
        const checkIn = new Date(reservation.checkInDate);
        const checkOut = new Date(reservation.checkOutDate);
        return checkIn <= end && checkOut >= start;
      });

      return filteredReservations;
    }

    const res = await apiClient.get('/reservas', { params: { fecha_llegada: startDate, fecha_salida: endDate } });
    const payload = res.data as { data?: ApiReservation[] };
    return (payload.data || []).map(api => mapApiReservationToReservation(api as ApiReservation));
  }

  async updateReservation(id: string, updates: Partial<Reservation>): Promise<Reservation | null> {
    const normalizedUpdates: Partial<Reservation> = { ...updates };

    if (normalizedUpdates.checkInDate && normalizedUpdates.checkOutDate) {
      try {
        const checkIn = new Date(normalizedUpdates.checkInDate);
        const checkOut = new Date(normalizedUpdates.checkOutDate);
        const diff = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
        normalizedUpdates.numberOfNights = diff;
      } catch (error) {
        console.warn('[Reservations] No se pudo calcular el n�mero de noches:', error);
      }
    }

    if (USE_MOCKS) {
      await simulateApiCall(null, 800);

      const reservations = cloneData(reservationsData);
      const reservationIndex = reservations.findIndex((r: Reservation) => r.id === id);

      if (reservationIndex === -1) return null;

      const existing = reservations[reservationIndex];
      const updatedReservation: Reservation = {
        ...existing,
        ...normalizedUpdates,
        numberOfNights: normalizedUpdates.numberOfNights ?? existing.numberOfNights,
        updatedAt: new Date().toISOString(),
      };

      return updatedReservation;
    }

    const payload: Partial<ApiCreateReservaPayload> = {};
    if (normalizedUpdates.specialRequests !== undefined) payload.notas = normalizedUpdates.specialRequests;
    if (normalizedUpdates.total !== undefined) payload.total_monto_reserva = normalizedUpdates.total;
    if (normalizedUpdates.status !== undefined) payload.id_estado_res = mapStatusToEstadoId(normalizedUpdates.status);
    if (normalizedUpdates.numberOfGuests !== undefined) {
      payload.adultos = Math.max(1, Math.round(normalizedUpdates.numberOfGuests));
      payload.ninos = 0;
      payload.bebes = 0;
    }

    try {
      if (Object.keys(payload).length > 0) {
        await apiClient.put(`/reservas/${id}`, payload);
      }
    } catch (error: any) {
      console.error('[API] Error actualizando /reservas/:id', error?.message || error);
    }

    if (
      normalizedUpdates.checkInDate ||
      normalizedUpdates.checkOutDate ||
      normalizedUpdates.numberOfGuests !== undefined ||
      normalizedUpdates.roomId
    ) {
      const habitacionPayload: Partial<ApiReservaHabitacion> = {};
      if (normalizedUpdates.roomId) habitacionPayload.id_habitacion = Number(normalizedUpdates.roomId);
      if (normalizedUpdates.checkInDate) habitacionPayload.fecha_llegada = normalizedUpdates.checkInDate;
      if (normalizedUpdates.checkOutDate) habitacionPayload.fecha_salida = normalizedUpdates.checkOutDate;
      if (normalizedUpdates.numberOfGuests !== undefined) habitacionPayload.pax_total = Number(normalizedUpdates.numberOfGuests);

      try {
        await apiClient.put(`/reservas/${id}/habitaciones`, habitacionPayload);
      } catch (error: any) {
        console.warn('[API] No se pudo actualizar la reserva_habitacion:', error?.message || error);
      }
    }

    const latest = await this.getReservationById(id);
    if (!latest) {
      return null;
    }

    return {
      ...latest,
      ...normalizedUpdates,
      updatedAt: new Date().toISOString(),
    };
  }

  async cancelReservation(id: string, options?: { penalty?: number; note?: string }): Promise<Reservation | null> {
    if (USE_MOCKS) {
      await simulateApiCall(null, 600);
      return this.updateReservation(id, {
        status: 'cancelled',
        updatedAt: new Date().toISOString(),
      });
    }

    let cancelledReservation: Reservation | null = null;

    try {
      await apiClient.post(`/reservas/${id}/cancel`, {
        motivo: options?.note,
        penalidad: options?.penalty,
      });
      cancelledReservation = await this.getReservationById(id);
    } catch (error: any) {
      console.warn('[API] Endpoint /reservas/:id/cancel no disponible, usando actualizaci�n est�ndar:', error?.message || error);
    }

    if (cancelledReservation && cancelledReservation.status === 'cancelled') {
      return {
        ...cancelledReservation,
        updatedAt: new Date().toISOString(),
      };
    }

    return this.updateReservation(id, {
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    });
  }

  async updateReservationStatus(id: string, status: Reservation['status']): Promise<Reservation | null> {
    return this.updateReservation(id, { status });
  }

  async searchReservations(query: {
    guestName?: string;
    email?: string;
    confirmationNumber?: string;
    status?: Reservation['status'];
    checkInDate?: string;
    checkOutDate?: string;
  }): Promise<Reservation[]> {
    const reservations = await simulateApiCall(cloneData(reservationsData), 500);
    
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

  async getReservationStatistics(): Promise<{
    total: number;
    byStatus: Record<Reservation['status'], number>;
    revenue: number;
    averageStay: number;
  }> {
    const reservations = await simulateApiCall(cloneData(reservationsData), 500);
    
    const stats = {
      total: reservations.length,
      byStatus: {} as Record<Reservation['status'], number>,
      revenue: 0,
      averageStay: 0
    };

    let totalNights = 0;

    reservations.forEach((reservation: Reservation) => {
      stats.byStatus[reservation.status] = (stats.byStatus[reservation.status] || 0) + 1;
      
      if (reservation.status === 'confirmed' || reservation.status === 'checked_out') {
        stats.revenue += reservation.total;
      }
      
      totalNights += reservation.numberOfNights;
    });

    stats.averageStay = reservations.length > 0 ? totalNights / reservations.length : 0;

    return stats;
  }

}

export const reservationService = new ReservationService();
