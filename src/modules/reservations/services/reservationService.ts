/**
 * ReservationService - Facade Pattern
 * 
 * Servicio principal que actúa como punto de entrada único para todas las operaciones
 * relacionadas con reservas. Delega responsabilidades a servicios especializados.
 * 
 * Arquitectura:
 * - ReservationCrudService: Operaciones CRUD básicas (Create, Read, Update, Delete)
 * - ReservationQueryService: Búsquedas, filtros y estadísticas
 * - AdditionalServicesService: Gestión de servicios adicionales
 * 
 * Beneficios del patrón Facade:
 * - Reduce complejidad ocultando subsistemas especializados
 * - Provee interfaz simple y consistente
 * - Facilita testing y mantenimiento
 * - Permite cambiar implementaciones sin afectar clientes
 * 
 * @module services
 */

import type { 
  SimpleReservationFormData, 
  Reservation 
} from '../types';
import type { 
  AdditionalService 
} from '../../../types/core/domain';
import type { 
  ReservationFilters, 
  CreateReservationDto, 
  AddReservationServiceDto 
} from '../types';

// Servicios especializados (solo API real)
import { reservationCrudService } from './crud/ReservationCrudService';
import { reservationQueryService } from './query/ReservationQueryService';
import { additionalServicesService } from './additional/AdditionalServicesService';

/**
 * Servicio Facade para gestión de reservas
 * 
 * Este servicio actúa como punto de entrada único y delega
 * a servicios especializados según la responsabilidad.
 * 
 * IMPORTANTE: Todos los datos se consumen directamente de la API del backend.
 * No hay datos mock ni datos quemados.
 */
class ReservationService {
  
  // =================== CRUD OPERATIONS ===================

  /**
   * Crea una nueva reserva (legacy API)
   * @deprecated Use createNewReservation para nueva implementación
   */
  async createReservation(
    reservationData: SimpleReservationFormData & { roomId: string }
  ): Promise<Reservation> {
    return reservationCrudService.create(reservationData);
  }

  /**
   * Crea una nueva reserva con múltiples habitaciones (nueva API)
   * POST /reservas
   */
  async createNewReservation(payload: CreateReservationDto): Promise<Reservation> {
    return reservationCrudService.createNew(payload);
  }

  /**
   * Obtiene una reserva por ID
   * GET /reservas/{id}
   */
  async getReservationById(id: string): Promise<Reservation | null> {
    return reservationCrudService.getById(id);
  }

  /**
   * Obtiene una reserva por número de confirmación
   * GET /reservas?confirmationNumber={number}
   */
  async getReservationByConfirmation(confirmationNumber: string): Promise<Reservation | null> {
    return reservationCrudService.getByConfirmation(confirmationNumber);
  }

  /**
   * Obtiene todas las reservas
   * GET /reservas
   */
  async getAllReservations(): Promise<Reservation[]> {
    return reservationCrudService.getAll();
  }

  /**
   * Obtiene reservas por rango de fechas
   * GET /reservas?fecha_llegada={start}&fecha_salida={end}
   */
  async getReservationsByDate(startDate: string, endDate?: string): Promise<Reservation[]> {
    return reservationCrudService.getByDateRange(startDate, endDate);
  }

  /**
   * Actualiza una reserva existente
   * PUT /reservas/{id}
   */
  async updateReservation(id: string, updates: Partial<Reservation>): Promise<Reservation | null> {
    return reservationCrudService.update(id, updates);
  }

  /**
   * Actualiza el estado de una reserva
   * PUT /reservas/{id}
   */
  async updateReservationStatus(id: string, status: Reservation['status']): Promise<Reservation | null> {
    return reservationCrudService.updateStatus(id, status);
  }

  /**
   * Cancela una reserva
   * POST /reservas/{id}/cancelar
   */
  async cancelReservation(
    id: string, 
    options?: { penalty?: number; note?: string }
  ): Promise<Reservation | null> {
    return reservationCrudService.cancel(id, options);
  }

  /**
   * Actualiza una habitación específica de una reserva
   * PUT /reservas/{reservaId}/habitaciones/{habitacionId}
   */
  async updateRoomDetails(
    reservaId: string,
    habitacionId: string,
    updates: {
      roomId?: number;
      checkInDate?: string;
      checkOutDate?: string;
      adults?: number;
      children?: number;
      babies?: number;
    }
  ): Promise<Reservation | null> {
    return reservationCrudService.updateRoomDetails(reservaId, habitacionId, updates);
  }

  // =================== QUERY & FILTER OPERATIONS ===================

  /**
   * Obtiene reservas aplicando filtros
   * GET /reservas?search={email}&estado={estado}&fuente={fuente}&desde={date}&hasta={date}
   */
  async getReservations(filters?: ReservationFilters): Promise<Reservation[]> {
    return reservationQueryService.getWithFilters(filters);
  }

  /**
   * Busca reservas según múltiples criterios
   */
  async searchReservations(query: {
    guestName?: string;
    email?: string;
    confirmationNumber?: string;
    status?: Reservation['status'];
    checkInDate?: string;
    checkOutDate?: string;
  }): Promise<Reservation[]> {
    // Para búsqueda compleja, obtenemos todas y filtramos localmente
    const allReservations = await reservationCrudService.getAll();
    return reservationQueryService.search(allReservations, query);
  }

  /**
   * Genera estadísticas de reservas
   */
  async getReservationStatistics(): Promise<{
    total: number;
    byStatus: Record<Reservation['status'], number>;
    revenue: number;
    averageStay: number;
  }> {
    const reservations = await this.getAllReservations();
    return reservationQueryService.calculateStatistics(reservations);
  }

  // =================== ADDITIONAL SERVICES OPERATIONS ===================

  /**
   * Obtiene todos los servicios adicionales
   * GET /servicios
   */
  async getAdditionalServices(): Promise<AdditionalService[]> {
    return additionalServicesService.getAll();
  }

  /**
   * Obtiene servicios por categoría
   * GET /servicios?category={category}
   */
  async getServicesByCategory(category: string): Promise<AdditionalService[]> {
    return additionalServicesService.getByCategory(category);
  }

  /**
   * Obtiene un servicio por ID
   * GET /servicios/{id}
   */
  async getServiceById(serviceId: string): Promise<AdditionalService | null> {
    return additionalServicesService.getById(serviceId);
  }

  /**
   * Agrega un servicio a una reserva existente
   * POST /reservas/{id}/servicios
   */
  async addServiceToReservation(
    reservationId: string, 
    payload: AddReservationServiceDto
  ): Promise<void> {
    return additionalServicesService.addToReservation(reservationId, payload);
  }
}

/**
 * Instancia singleton del servicio
 */
export const reservationService = new ReservationService();
