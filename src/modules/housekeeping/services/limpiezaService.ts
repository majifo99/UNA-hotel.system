// src/modules/housekeeping/services/limpiezaService.ts
import type {
  LimpiezaItem,
  LimpiezaPaginatedResponse,
  LimpiezaFilters,
  LimpiezaCreateDTO,
} from "../types/limpieza";

const API_URL =
  import.meta.env.VITE_API_URL || "https://backendhotelt.onrender.com/api";

async function handleJson(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    // Si no es JSON válido (p. ej. respuesta vacía), devolvemos el texto crudo
    return text as unknown;
  }
}

export const limpiezaService = {
  /**
   * GET /limpiezas — lista paginada con filtros básicos
   */
  async getLimpiezas(
    filters: LimpiezaFilters = {}
  ): Promise<LimpiezaPaginatedResponse> {
    const params = new URLSearchParams();
    if (filters.per_page) params.append("per_page", String(filters.per_page));
    if (filters.prioridad) params.append("prioridad", filters.prioridad);
    if (filters.pendientes) params.append("pendientes", "1");
    if (filters.id_habitacion)
      params.append("id_habitacion", String(filters.id_habitacion));
    if (filters.estado_id)
      params.append("estado_id", String(filters.estado_id));

    const url = `${API_URL}/limpiezas?${params.toString()}`;
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) {
      const payload = await handleJson(res);
      throw new Error(
        `GET /limpiezas fallo (${res.status}): ${JSON.stringify(payload)}`
      );
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
      throw new Error(
        `GET /limpiezas/${id} fallo (${res.status}): ${JSON.stringify(payload)}`
      );
    }
    return (await handleJson(res)) as { data: LimpiezaItem };
  },

  /**
   * POST /limpiezas — crea una limpieza
   * Alineado con el DTO que usas en el hook.
   */
  async createLimpieza(
    body: LimpiezaCreateDTO
  ): Promise<{ data: LimpiezaItem }> {
    const res = await fetch(`${API_URL}/limpiezas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Agrega Authorization si tu backend la requiere
        // Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const payload = await handleJson(res);
      // Laravel suele devolver 422 con errores de validación
      throw new Error(
        `POST /limpiezas fallo (${res.status}): ${JSON.stringify(payload)}`
      );
    }

    return (await handleJson(res)) as { data: LimpiezaItem };
  },
};
