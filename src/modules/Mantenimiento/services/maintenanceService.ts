// src/modules/mantenimiento/services/mantenimientoService.ts
import type {
  MantenimientoItem,
  MantenimientoPaginatedResponse,
  MantenimientoFilters,
  MantenimientoCreateDTO,
} from "../types/mantenimiento";
import { toQueryString } from "../../housekeeping/utils/formatters";
import { authenticatedRequest } from "../../housekeeping/utils/apiHelpers";

const API_URL = import.meta.env.VITE_API_URL;

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

    return await authenticatedRequest<MantenimientoPaginatedResponse>(`${API_URL}/mantenimientos${query}`, {
      method: "GET",
      signal: opts?.signal,
    });
  },

  /**
   * GET /mantenimientos/{id}
   */
  async getMantenimientoById(id: number): Promise<{ data: MantenimientoItem }> {
    return await authenticatedRequest<{ data: MantenimientoItem }>(`${API_URL}/mantenimientos/${id}`, {
      method: "GET",
    });
  },

  /**
   * POST /mantenimientos — crear
   */
  async createMantenimiento(body: MantenimientoCreateDTO): Promise<{ data: MantenimientoItem }> {
    return await authenticatedRequest<{ data: MantenimientoItem }>(`${API_URL}/mantenimientos`, {
      method: "POST",
      body: JSON.stringify(body),
    });
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
    return await authenticatedRequest<{ data: MantenimientoItem }>(`${API_URL}/mantenimientos/${id}`, {
      method,
      body: JSON.stringify(body),
    });
  },

  /**
   * PATCH /mantenimientos/{id}/finalizar — marcar como finalizado
   */
  async finalizarMantenimiento(
    id: number,
    body: MantenimientoFinalizarDTO
  ): Promise<{ data: MantenimientoItem }> {
    return await authenticatedRequest<{ data: MantenimientoItem }>(`${API_URL}/mantenimientos/${id}/finalizar`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  /**
   * DELETE /mantenimientos/{id}
   */
  async deleteMantenimiento(id: number): Promise<void> {
    await authenticatedRequest<void>(`${API_URL}/mantenimientos/${id}`, { method: "DELETE" });
  },

  /**
   * (Opcional) GET /mantenimientos/{id}/historial
   */
  async getHistorial(id: number): Promise<{ data: any[] }> {
    return await authenticatedRequest<{ data: any[] }>(`${API_URL}/mantenimientos/${id}/historial`, {
      method: "GET",
    });
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
