import type {
  LimpiezaItem,
  LimpiezaPaginatedResponse,
  LimpiezaFilters,
  LimpiezaCreateDTO,
} from "../types/limpieza";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

async function handleJson(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text as unknown;
  }
}

/** DTOs sugeridos para tipar mejor los PATCH/PUT del front */
export type LimpiezaUpdateDTO = Partial<
  Omit<
    LimpiezaCreateDTO,
    // el backend ignora/forza estos en store/update, mejor no enviarlos
    "id_usuario_reporta" | "fecha_reporte"
  >
>;

export type LimpiezaFinalizarDTO = {
  fecha_final: string; // ISO 8601 (p.ej. "2025-09-24T10:30:00")
  notas?: string | null;
};

export const limpiezaService = {
  /**
   * GET /limpiezas — lista paginada con filtros
   */
  async getLimpiezas(filters: LimpiezaFilters = {}): Promise<LimpiezaPaginatedResponse> {
    const params = new URLSearchParams();
    if (filters.per_page) params.append("per_page", String(filters.per_page));
    if (filters.prioridad) params.append("prioridad", filters.prioridad);
    if (filters.pendientes) params.append("pendientes", "1");
    if (filters.id_habitacion) params.append("id_habitacion", String(filters.id_habitacion));
    if (filters.estado_id) params.append("estado_id", String(filters.estado_id));
    // nuevos filtros soportados por tu back:
    if ((filters as any).desde) params.append("desde", String((filters as any).desde));
    if ((filters as any).hasta) params.append("hasta", String((filters as any).hasta));

    const url = `${API_URL}/limpiezas?${params.toString()}`;
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) {
      const payload = await handleJson(res);
      throw new Error(`GET /limpiezas fallo (${res.status}): ${JSON.stringify(payload)}`);
    }
    return (await handleJson(res)) as LimpiezaPaginatedResponse;
  },

  /**
   * GET /limpiezas/{id} — detalle
   */
  async getLimpiezaById(id: number): Promise<{ data: LimpiezaItem }> {
    const res = await fetch(`${API_URL}/limpiezas/${id}`, { method: "GET" });
    if (!res.ok) {
      const payload = await handleJson(res);
      throw new Error(`GET /limpiezas/${id} fallo (${res.status}): ${JSON.stringify(payload)}`);
    }
    return (await handleJson(res)) as { data: LimpiezaItem };
  },

  /**
   * POST /limpiezas — crea una limpieza
   */
  async createLimpieza(body: LimpiezaCreateDTO): Promise<{ data: LimpiezaItem }> {
    const res = await fetch(`${API_URL}/limpiezas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const payload = await handleJson(res);
      throw new Error(`POST /limpiezas fallo (${res.status}): ${JSON.stringify(payload)}`);
    }
    return (await handleJson(res)) as { data: LimpiezaItem };
  },

  /**
   * PUT/PATCH /limpiezas/{id} — actualiza una limpieza (usa PATCH por defecto)
   * Nota: el back ignora/forza fecha_reporte e id_usuario_reporta.
   */
  async updateLimpieza(id: number, body: LimpiezaUpdateDTO, opts?: { method?: "PUT" | "PATCH" }): Promise<{ data: LimpiezaItem }> {
    const method = opts?.method ?? "PATCH";
    const res = await fetch(`${API_URL}/limpiezas/${id}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const payload = await handleJson(res);
      throw new Error(`${method} /limpiezas/${id} fallo (${res.status}): ${JSON.stringify(payload)}`);
    }
    return (await handleJson(res)) as { data: LimpiezaItem };
  },

  /**
   * PATCH /limpiezas/{id}/finalizar — marca fecha_final y (opcional) notas
   * El back valida: fecha_final >= fecha_inicio
   */
  async finalizarLimpieza(id: number, body: LimpiezaFinalizarDTO): Promise<{ data: LimpiezaItem }> {
    const res = await fetch(`${API_URL}/limpiezas/${id}/finalizar`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const payload = await handleJson(res);
      throw new Error(`PATCH /limpiezas/${id}/finalizar fallo (${res.status}): ${JSON.stringify(payload)}`);
    }
    return (await handleJson(res)) as { data: LimpiezaItem };
  },

  /**
   * DELETE /limpiezas/{id} — elimina una limpieza
   */
  async deleteLimpieza(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/limpiezas/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const payload = await handleJson(res);
      throw new Error(`DELETE /limpiezas/${id} fallo (${res.status}): ${JSON.stringify(payload)}`);
    }
  },
};
