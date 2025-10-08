/**
 * AdditionalServicesService
 * 
 * Servicio dedicado a la gestión de servicios adicionales de reservas.
 * Maneja todo lo relacionado con servicios (desayuno, spa, tours, etc.)
 * 
 * Responsabilidades:
 * - CRUD de servicios adicionales
 * - Filtrado por categoría
 * - Agregar servicios a reservas existentes
 * 
 * @module services/additional
 */

import type { AdditionalService } from '../../../../types/core/domain';
import type { AddReservationServiceDto } from '../../types';
import apiClient from '../../lib/apiClient';

/**
 * Servicio para gestión de servicios adicionales
 */
export class AdditionalServicesService {
  /**
   * Obtiene todos los servicios adicionales disponibles
   * GET /servicios
   */
  async getAll(): Promise<AdditionalService[]> {
    try {
      const res = await apiClient.get('/servicios');
      console.debug('[API] /servicios response:', res.status, res.data);
      return res.data?.data || res.data || [];
    } catch (error: any) {
      console.error('[API] Error fetching /servicios:', error?.message || error);
      throw error;
    }
  }

  /**
   * Obtiene servicios filtrados por categoría
   * GET /servicios?category={category}
   */
  async getByCategory(category: string): Promise<AdditionalService[]> {
    try {
      const res = await apiClient.get('/servicios', { params: { category } });
      return res.data?.data || res.data || [];
    } catch (error: any) {
      console.error('[API] Error fetching services by category:', error?.message || error);
      throw error;
    }
  }

  /**
   * Obtiene un servicio específico por ID
   * GET /servicios/{id}
   */
  async getById(serviceId: string): Promise<AdditionalService | null> {
    try {
      const res = await apiClient.get(`/servicios/${serviceId}`);
      console.debug('[API] /servicios/{id} response:', res.status, res.data);
      return res.data?.data || res.data || null;
    } catch (error: any) {
      console.error(`[API] Error fetching /servicios/${serviceId}:`, error?.message || error);
      throw error;
    }
  }

  /**
   * Agrega un servicio a una reserva existente
   * POST /reservas/{id}/servicios
   */
  async addToReservation(reservationId: string, payload: AddReservationServiceDto): Promise<void> {
    try {
      console.log(`[API] POST /reservas/${reservationId}/servicios with payload:`, payload);
      
      await apiClient.post(`/reservas/${reservationId}/servicios`, payload);
      
      console.log(`[API] Service added to reservation ${reservationId}`);
    } catch (error) {
      console.error('[API] Error adding service to reservation:', error);
      throw error;
    }
  }
}

export const additionalServicesService = new AdditionalServicesService();
