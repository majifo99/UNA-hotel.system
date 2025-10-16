import type {
  MantenimientoItem,
  MantenimientoPaginatedResponse,
  MantenimientoFilters,
  MantenimientoCreateDTO,
} from "../types/mantenimiento";

const API_URL = import.meta.env.VITE_API_URL;

async function handleJson(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text as unknown;
  }
}

/** DTOs para updates */
export type MantenimientoUpdateDTO = Partial<MantenimientoCreateDTO>;

export type MantenimientoFinalizarDTO = {
  fecha_final: string; // ISO 8601
  notas?: string | null;
};

/** ======================
 *  Servicio principal
 * ====================== */
export const mantenimientoService = {
  /**
   * GET /mantenimientos — lista paginada (usa MantenimientoResource)
   */
  async getMantenimientos(
    filters: MantenimientoFilters = {}
  ): Promise<MantenimientoPaginatedResponse> {
    const params = new URLSearchParams();
    if (filters.per_page) params.append("per_page", String(filters.per_page));
    if (filters.prioridad) params.append("prioridad", filters.prioridad);
    if (filters.pendientes) params.append("pendientes", "1");
    if (filters.id_habitacion) params.append("id_habitacion", String(filters.id_habitacion));
    if (filters.estado_id) params.append("estado_id", String(filters.estado_id));
    if (filters.tipo) params.append("tipo", filters.tipo);
    if (filters.desde) params.append("desde", filters.desde);
    if (filters.hasta) params.append("hasta", filters.hasta);

    const url = `${API_URL}/mantenimientos?${params.toString()}`;
    const res = await fetch(url, { method: "GET", cache: "no-store" }); // 👈 evita cache

    if (!res.ok) {
      const payload = await handleJson(res);
      throw new Error(`GET /mantenimientos falló (${res.status}): ${JSON.stringify(payload)}`);
    }

    return (await handleJson(res)) as MantenimientoPaginatedResponse;
  },

  /**
   * GET /mantenimientos/{id}
   */
  async getMantenimientoById(id: number): Promise<{ data: MantenimientoItem }> {
    const res = await fetch(`${API_URL}/mantenimientos/${id}`, { method: "GET", cache: "no-store" });
    if (!res.ok) {
      const payload = await handleJson(res);
      throw new Error(`GET /mantenimientos/${id} falló (${res.status}): ${JSON.stringify(payload)}`);
    }
    return (await handleJson(res)) as { data: MantenimientoItem };
  },

  /**
   * POST /mantenimientos — crear nuevo mantenimiento
   */
  async createMantenimiento(body: MantenimientoCreateDTO): Promise<{ data: MantenimientoItem }> {
    const res = await fetch(`${API_URL}/mantenimientos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const payload = await handleJson(res);
      throw new Error(`POST /mantenimientos falló (${res.status}): ${JSON.stringify(payload)}`);
    }
    return (await handleJson(res)) as { data: MantenimientoItem };
  },

  /**
   * PATCH /mantenimientos/{id} — actualizar mantenimiento
   */
  async updateMantenimiento(
    id: number,
    body: MantenimientoUpdateDTO,
    opts?: { method?: "PUT" | "PATCH" }
  ): Promise<{ data: MantenimientoItem }> {
    const method = opts?.method ?? "PATCH";
    const res = await fetch(`${API_URL}/mantenimientos/${id}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const payload = await handleJson(res);
      throw new Error(`${method} /mantenimientos/${id} falló (${res.status}): ${JSON.stringify(payload)}`);
    }
    return (await handleJson(res)) as { data: MantenimientoItem };
  },

  /**
   * PATCH /mantenimientos/{id}/finalizar — marcar como finalizado
   */
  async finalizarMantenimiento(
    id: number,
    body: MantenimientoFinalizarDTO
  ): Promise<{ data: MantenimientoItem }> {
    const res = await fetch(`${API_URL}/mantenimientos/${id}/finalizar`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const payload = await handleJson(res);
      throw new Error(
        `PATCH /mantenimientos/${id}/finalizar falló (${res.status}): ${JSON.stringify(payload)}`
      );
    }
    return (await handleJson(res)) as { data: MantenimientoItem };
  },

  /**
   * DELETE /mantenimientos/{id}
   */
  async deleteMantenimiento(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/mantenimientos/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const payload = await handleJson(res);
      throw new Error(`DELETE /mantenimientos/${id} falló (${res.status}): ${JSON.stringify(payload)}`);
    }
  },

  /**
   * (Opcional) GET /mantenimientos/{id}/historial
   */
  async getHistorial(id: number): Promise<{ data: any[] }> {
    const res = await fetch(`${API_URL}/mantenimientos/${id}/historial`, { method: "GET", cache: "no-store" });
    if (!res.ok) {
      const payload = await handleJson(res);
      throw new Error(
        `GET /mantenimientos/${id}/historial falló (${res.status}): ${JSON.stringify(payload)}`
      );
    }
    return (await handleJson(res)) as { data: any[] };
  },
};

/** ============================================================
 *  Compatibilidad con hooks antiguos (useMaintenance)
 * ============================================================ */
export async function fetchMaintenance(
  filters: MantenimientoFilters = {}
): Promise<MantenimientoItem[]> {
  const res = await mantenimientoService.getMantenimientos(filters);
  return res.data;
}

export default mantenimientoService;
