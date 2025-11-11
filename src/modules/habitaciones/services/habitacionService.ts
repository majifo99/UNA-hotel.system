// src/modules/habitaciones/services/habitacionService.ts
/**
 * Servicio para gestión de habitaciones
 * Usa apiClient local para evitar problemas de CORS (withCredentials: false)
 */

import apiClient from '../lib/apiClient';
import type {
  HabitacionesResponse,
  EstadoHabitacion,
  TipoHabitacion,
} from '../types/habitacion';

const BASE_URL = '/habitaciones';

/**
 * Obtener todas las habitaciones con paginación
 * GET /habitaciones
 */
export async function fetchHabitaciones(params?: {
  page?: number;
  per_page?: number;
  estado?: number;
  tipo?: number;
}): Promise<HabitacionesResponse> {
  try {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    if (params?.estado) searchParams.append('estado', params.estado.toString());
    if (params?.tipo) searchParams.append('tipo', params.tipo.toString());

    const url = searchParams.toString()
      ? `${BASE_URL}?${searchParams.toString()}`
      : BASE_URL;

    const response = await apiClient.get<HabitacionesResponse>(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching habitaciones:', error);
    throw error;
  }
}

/**
 * Obtener todos los tipos de habitación
 * GET /tipos-habitacion
 */
export async function fetchTiposHabitacion(): Promise<TipoHabitacion[]> {
  try {
    const response = await apiClient.get<{ data?: TipoHabitacion[] } | TipoHabitacion[]>('/tipos-habitacion');

    // El backend puede envolver la respuesta en un objeto "data"
    const data = response.data;
    if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
      return data.data;
    }
    return data as TipoHabitacion[];
  } catch (error) {
    console.error('Error fetching tipos habitacion:', error);
    throw error;
  }
}

/**
 * Obtener todos los estados de habitación
 * GET /estados-habitacion
 */
export async function fetchEstadosHabitacion(): Promise<EstadoHabitacion[]> {
  try {
    const response = await apiClient.get<{ data?: EstadoHabitacion[] } | EstadoHabitacion[]>('/estados-habitacion');

    // El backend puede envolver la respuesta en un objeto "data"
    const data = response.data;
    if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
      return data.data;
    }
    return data as EstadoHabitacion[];
  } catch (error) {
    console.error('Error fetching estados habitacion:', error);
    throw error;
  }
}

/**
 * Consultar disponibilidad de habitaciones por fechas
 * GET /disponibilidad?desde={fecha}&hasta={fecha}&tipo={tipo_opcional}
 */
export async function checkDisponibilidad(params: {
  desde: string;
  hasta: string;
  tipo?: number;
}): Promise<HabitacionesResponse> {
  try {
    const searchParams = new URLSearchParams();
    searchParams.append('desde', params.desde);
    searchParams.append('hasta', params.hasta);
    if (params.tipo) {
      searchParams.append('tipo', params.tipo.toString());
    }

    const url = `/disponibilidad?${searchParams.toString()}`;
    const response = await apiClient.get<HabitacionesResponse>(url);

    return response.data;
  } catch (error) {
    console.error('Error checking disponibilidad:', error);
    throw error;
  }
}

/**
 * Crear una nueva habitación
 * POST /habitaciones
 */
export async function createHabitacion(data: {
  nombre: string;
  numero: string;
  piso: number;
  capacidad: number;
  medida: string;
  descripcion: string;
  tipo_habitacion_id: number;
  id_estado_hab: number;
  precio_base?: number;
  moneda?: string;
}): Promise<void> {
  try {
    await apiClient.post(BASE_URL, data);
  } catch (error) {
    console.error('Error creating habitacion:', error);
    throw error;
  }
}

/**
 * Actualizar una habitación existente
 * PATCH /habitaciones/{id}
 */
export async function updateHabitacion(
  id: number,
  data: {
    nombre: string;
    numero: string;
    piso: number;
    capacidad: number;
    medida: string;
    descripcion: string;
    tipo_habitacion_id: number;
    id_estado_hab: number;
    precio_base?: number;
    moneda?: string;
  }
): Promise<void> {
  try {
    await apiClient.patch(`${BASE_URL}/${id}`, data);
  } catch (error) {
    console.error('Error updating habitacion:', error);
    throw error;
  }
}

/**
 * Cambiar el estado de una habitación
 * PATCH /habitaciones/{id}/estado
 */
export async function changeEstadoHabitacion(
  id: number,
  idEstado: number
): Promise<void> {
  try {
    await apiClient.patch(`${BASE_URL}/${id}/estado`, { id_estado: idEstado });
  } catch (error) {
    console.error('Error changing estado habitacion:', error);
    throw error;
  }
}
