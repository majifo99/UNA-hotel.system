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

    return await authenticatedRequest(`${API_URL}/limpiezas${query}`, { signal: opts?.signal });
  },

  async getLimpiezaById(id: number): Promise<{ data: LimpiezaItem }> {
    return await authenticatedRequest(`${API_URL}/limpiezas/${id}`);
  },

  async createLimpieza(body: LimpiezaCreateDTO): Promise<{ data: LimpiezaItem }> {
    return await authenticatedRequest(`${API_URL}/limpiezas`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async updateLimpieza(
    id: number,
    body: Partial<LimpiezaCreateDTO>,
    method: "PATCH" | "PUT" = "PATCH"
  ): Promise<{ data: LimpiezaItem }> {
    return await authenticatedRequest(`${API_URL}/limpiezas/${id}`, {
      method,
      body: JSON.stringify(body),
    });
  },

  async finalizarLimpieza(id: number, body: FinalizarLimpiezaDTO): Promise<{ data: LimpiezaItem }> {
    // Usar directamente el endpoint estándar PATCH en lugar de /finalizar
    // para evitar el error 404 y la demora de dos peticiones
    return await authenticatedRequest(`${API_URL}/limpiezas/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        fecha_final: body.fecha_final,
        notas: body.notas ?? null,
        id_estado_hab: ESTADO_HAB.LIMPIA,
        id_usuario_asigna: null, // ✅ Limpiar usuario asignado al finalizar
      }),
    });
  },

  async deleteLimpieza(id: number): Promise<void> {
    await authenticatedRequest(`${API_URL}/limpiezas/${id}`, { method: "DELETE" });
  },

  // ✅ Obtener historial de limpiezas de una habitación (últimas 3)
  async getHistorialLimpiezas(id_habitacion: number): Promise<{ data: LimpiezaItem[] }> {
    const query = toQueryString({
      id_habitacion,
      per_page: 3,
      // Ordenar por fecha_final desc para obtener las más recientes
    });
    return await authenticatedRequest(`${API_URL}/limpiezas${query}`);
  },
};
