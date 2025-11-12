// src/modules/mantenimiento/services/mantenimientoService.ts
import type {
  MantenimientoItem,
  MantenimientoPaginatedResponse,
  MantenimientoFilters,
  MantenimientoCreateDTO,
} from "../types/mantenimiento";
import { toQueryString } from "../../housekeeping/utils/formatters";

import apiClient from "../lib/apiClient";


/* ======================
 * DTOs específicos
 * ====================== */
export type MantenimientoUpdateDTO = Partial<MantenimientoCreateDTO>;

export type MantenimientoFinalizarDTO = {
  fecha_final: string; // ISO 8601
  notas?: string | null;
};

/* ======================
 * Servicio principal
 * ====================== */
export const mantenimientoService = {
  /**
   * GET /mantenimientos — lista paginada
   */
  async getMantenimientos(
    filters: MantenimientoFilters = {},
    opts?: { signal?: AbortSignal }
  ): Promise<MantenimientoPaginatedResponse> {
    const query = toQueryString({
      per_page: filters.per_page,
      prioridad: filters.prioridad,
      pendientes: filters.pendientes,
      id_habitacion: filters.id_habitacion,
      estado_id: filters.estado_id,
      tipo: filters.tipo,
      desde: filters.desde,
      hasta: filters.hasta,
      page: (filters as any).page,
    });

    const response = await apiClient.get<MantenimientoPaginatedResponse>(`/mantenimientos${query}`, { signal: opts?.signal });
    return response.data;
  },

  /**
   * GET /mantenimientos/{id}
   */
  async getMantenimientoById(id: number): Promise<{ data: MantenimientoItem }> {
    const response = await apiClient.get<{ data: MantenimientoItem }>(`/mantenimientos/${id}`);
    return response.data;
  },

  /**
   * POST /mantenimientos — crear
   */
  async createMantenimiento(body: MantenimientoCreateDTO): Promise<{ data: MantenimientoItem }> {
    const response = await apiClient.post<{ data: MantenimientoItem }>(`/mantenimientos`, body);
    return response.data;
  },

  /**
   * PATCH/PUT /mantenimientos/{id} — actualizar
   */
  async updateMantenimiento(
    id: number,
    body: MantenimientoUpdateDTO,
    opts?: { method?: "PUT" | "PATCH" }
  ): Promise<{ data: MantenimientoItem }> {
    const method = opts?.method ?? "PATCH";
    const response = method === "PATCH"
      ? await apiClient.patch<{ data: MantenimientoItem }>(`/mantenimientos/${id}`, body)
      : await apiClient.put<{ data: MantenimientoItem }>(`/mantenimientos/${id}`, body);
    return response.data;
  },

  /**
   * PATCH /mantenimientos/{id}/finalizar — marcar como finalizado
   */
  async finalizarMantenimiento(
    id: number,
    body: MantenimientoFinalizarDTO
  ): Promise<{ data: MantenimientoItem }> {
    const response = await apiClient.patch<{ data: MantenimientoItem }>(`/mantenimientos/${id}/finalizar`, body);
    return response.data;
  },

  /**
   * DELETE /mantenimientos/{id}
   */
  async deleteMantenimiento(id: number): Promise<void> {
    await apiClient.delete(`/mantenimientos/${id}`);
  },

  /**
   * (Opcional) GET /mantenimientos/{id}/historial
   */
  async getHistorial(id: number): Promise<{ data: any[] }> {
    const response = await apiClient.get<{ data: any[] }>(`/mantenimientos/${id}/historial`);
    return response.data;
  },
};

/* ============================================================
 * Compat con hooks antiguos (useMaintenance)
 * ============================================================ */
export async function fetchMaintenance(
  filters: MantenimientoFilters = {}
): Promise<MantenimientoItem[]> {
  const res = await mantenimientoService.getMantenimientos(filters);
  return res.data;
}

export default mantenimientoService;
