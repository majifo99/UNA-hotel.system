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
import type { AddReservationServiceDto, BackendAdditionalService } from '../../types';
import apiClient from '../../lib/apiClient';

/**
 * Servicio para gestión de servicios adicionales
 */
export class AdditionalServicesService {
  /**
   * Mapea un servicio del backend al formato del frontend
   */
  private mapBackendService(backendService: BackendAdditionalService): AdditionalService {
    // Mapeo de categorías del backend al frontend
    const categoryMap: Record<string, AdditionalService['category']> = {
      'food': 'food',
      'spa': 'spa',
      'transport': 'transport',
      'entertainment': 'entertainment',
      'room_service': 'room_service',
      'restaurant': 'restaurant'
    };

    const category = backendService.categoria 
      ? categoryMap[backendService.categoria.toLowerCase()] || 'other'
      : 'other';

    return {
      id: String(backendService.id_servicio),
      name: backendService.nombre,
      description: backendService.descripcion || '',
      price: backendService.precio,
      category,
      isActive: true
    };
  }

  /**
   * Obtiene todos los servicios adicionales disponibles
   * GET /servicios
   */
  async getAll(): Promise<AdditionalService[]> {
    try {
      const res = await apiClient.get('/servicios');
      console.debug('[API] /servicios response:', res.status, res.data);
      
      const backendServices: BackendAdditionalService[] = res.data?.data || res.data || [];
      return backendServices.map(service => this.mapBackendService(service));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[API] Error fetching /servicios:', errorMessage);
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
      const backendServices: BackendAdditionalService[] = res.data?.data || res.data || [];
      return backendServices.map(service => this.mapBackendService(service));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[API] Error fetching services by category:', errorMessage);
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
      
      const backendService: BackendAdditionalService | null = res.data?.data || res.data || null;
      return backendService ? this.mapBackendService(backendService) : null;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[API] Error fetching /servicios/${serviceId}:`, errorMessage);
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
