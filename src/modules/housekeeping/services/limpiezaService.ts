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

const API_URL = import.meta.env.VITE_API_URL;

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
    try {
      return await authenticatedRequest(`${API_URL}/limpiezas/${id}/finalizar`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
    } catch (e: any) {
      const msg = String(e?.message ?? "");
      if (msg.includes("404")) {
        return await authenticatedRequest(`${API_URL}/limpiezas/${id}`, {
          method: "PATCH",
          body: JSON.stringify({
            fecha_final: body.fecha_final,
            notas: body.notas ?? null,
            id_estado_hab: ESTADO_HAB.LIMPIA,
          }),
        });
      }
      throw e;
    }
  },

  async deleteLimpieza(id: number): Promise<void> {
    await authenticatedRequest(`${API_URL}/limpiezas/${id}`, { method: "DELETE" });
  },
};
