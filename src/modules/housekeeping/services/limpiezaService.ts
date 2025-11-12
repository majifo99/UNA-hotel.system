// src/modules/housekeeping/services/limpiezaService.ts
import type {
  LimpiezaItem,
  LimpiezaPaginatedResponse,
  LimpiezaFilters,
  LimpiezaCreateDTO,
  FinalizarLimpiezaDTO,
} from "../types/limpieza";
import { ESTADO_HAB } from "../types/limpieza";
import { toQueryString } from "../utils/formatters";

import apiClient from "../lib/apiClient";

import { authenticatedRequest } from "../utils/apiHelpers";
import { getApiBaseUrl } from "../../../config/api";

const API_URL = getApiBaseUrl();


export const limpiezaService = {
  async getLimpiezas(
    filters: LimpiezaFilters = {},
    opts?: { signal?: AbortSignal }
  ): Promise<LimpiezaPaginatedResponse> {
    const query = toQueryString({
      per_page: filters.per_page,
      prioridad: filters.prioridad,
      pendientes: filters.pendientes,
      id_habitacion: filters.id_habitacion,
      id_estado_hab: filters.estado_id,
      desde: filters.desde,
      hasta: filters.hasta,
      page: filters.page,
    });

    const response = await apiClient.get<LimpiezaPaginatedResponse>(`/limpiezas${query}`, { signal: opts?.signal });
    return response.data;
  },

  async getLimpiezaById(id: number): Promise<{ data: LimpiezaItem }> {
    const response = await apiClient.get<{ data: LimpiezaItem }>(`/limpiezas/${id}`);
    return response.data;
  },

  async createLimpieza(body: LimpiezaCreateDTO): Promise<{ data: LimpiezaItem }> {
    const response = await apiClient.post<{ data: LimpiezaItem }>(`/limpiezas`, body);
    return response.data;
  },

  async updateLimpieza(
    id: number,
    body: Partial<LimpiezaCreateDTO>,
    method: "PATCH" | "PUT" = "PATCH"
  ): Promise<{ data: LimpiezaItem }> {
    const response = method === "PATCH"
      ? await apiClient.patch<{ data: LimpiezaItem }>(`/limpiezas/${id}`, body)
      : await apiClient.put<{ data: LimpiezaItem }>(`/limpiezas/${id}`, body);
    return response.data;
  },

  async finalizarLimpieza(id: number, body: FinalizarLimpiezaDTO): Promise<{ data: LimpiezaItem }> {
    // Usar directamente el endpoint estándar PATCH en lugar de /finalizar
    // para evitar el error 404 y la demora de dos peticiones
    const response = await apiClient.patch<{ data: LimpiezaItem }>(`/limpiezas/${id}`, {
      fecha_final: body.fecha_final,
      notas: body.notas ?? null,
      id_estado_hab: ESTADO_HAB.LIMPIA,
      id_usuario_asigna: null, // ✅ Limpiar usuario asignado al finalizar
    });
    return response.data;
  },

  async deleteLimpieza(id: number): Promise<void> {
    await apiClient.delete(`/limpiezas/${id}`);
  },

  // ✅ Obtener historial de limpiezas de una habitación (últimas 3)
  async getHistorialLimpiezas(id_habitacion: number): Promise<{ data: LimpiezaItem[] }> {
    const query = toQueryString({
      id_habitacion,
      per_page: 3,
      // Ordenar por fecha_final desc para obtener las más recientes
    });
    const response = await apiClient.get<{ data: LimpiezaItem[] }>(`/limpiezas${query}`);
    return response.data;
  },
};
