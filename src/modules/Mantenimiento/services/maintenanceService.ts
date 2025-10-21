// src/modules/mantenimiento/services/mantenimientoService.ts
import type {
  MantenimientoItem,
  MantenimientoPaginatedResponse,
  MantenimientoFilters,
  MantenimientoCreateDTO,
} from "../types/mantenimiento";

/* ======================
 * Config
 * ====================== */
const API_URL = import.meta.env.VITE_API_URL;

/* ======================
 * Helpers
 * ====================== */
function serializeParam(v: unknown): string {
  if (v === undefined || v === null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "bigint") return String(v);
  if (typeof v === "boolean") return v ? "1" : "0";
  if (v instanceof Date) return v.toISOString();
  try {
    return JSON.stringify(v);
  } catch {
    return "";
  }
}

function toQuery(params: Record<string, unknown>) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    q.append(k, serializeParam(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

/* ======================
 * Auth token
 * ====================== */
function getAuthToken(): string | null {
  const raw =
    localStorage.getItem("adminAuthToken") ||
    localStorage.getItem("authToken") ||
    null;

  if (!raw) return null;
  // Limpia posibles comillas guardadas por accidente
  return raw.replace(/^"(.*)"$/, "$1").trim();
}

/* ======================
 * Request (Bearer + sin cookies)
 * ====================== */
async function request<T = any>(url: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers || {});
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAuthToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: "omit", // sin cookies para evitar CORS
    mode: "cors",
  });

  const ct = res.headers.get("content-type") || "";
  const parsed = ct.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    const msg =
      typeof parsed === "object" && parsed && ("message" in parsed || "error" in parsed)
        ? (parsed).message ?? (parsed).error
        : `Error ${res.status}`;
    throw new Error(String(msg));
  }

  return parsed as T;
}

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
    const query = toQuery({
      per_page: filters.per_page,
      prioridad: filters.prioridad,
      pendientes: filters.pendientes,          // boolean → "1"/"0"
      id_habitacion: filters.id_habitacion,
      estado_id: filters.estado_id,            // respeta nombre del backend de mantenimiento
      tipo: filters.tipo,
      desde: filters.desde,
      hasta: filters.hasta,
      page: (filters as any).page,             // por si tu paginación usa page
    });

    return await request<MantenimientoPaginatedResponse>(`${API_URL}/mantenimientos${query}`, {
      method: "GET",
      signal: opts?.signal,
    });
  },

  /**
   * GET /mantenimientos/{id}
   */
  async getMantenimientoById(id: number): Promise<{ data: MantenimientoItem }> {
    return await request<{ data: MantenimientoItem }>(`${API_URL}/mantenimientos/${id}`, {
      method: "GET",
    });
  },

  /**
   * POST /mantenimientos — crear
   */
  async createMantenimiento(body: MantenimientoCreateDTO): Promise<{ data: MantenimientoItem }> {
    return await request<{ data: MantenimientoItem }>(`${API_URL}/mantenimientos`, {
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
    return await request<{ data: MantenimientoItem }>(`${API_URL}/mantenimientos/${id}`, {
      method,
      body: JSON.stringify(body),
    });
  },

  /**
   * PATCH /mantenimientos/{id}/finalizar — marcar como finalizado
   * (si tu backend no tiene esta ruta, puedes eliminarla o hacer fallback como en limpieza)
   */
  async finalizarMantenimiento(
    id: number,
    body: MantenimientoFinalizarDTO
  ): Promise<{ data: MantenimientoItem }> {
    return await request<{ data: MantenimientoItem }>(`${API_URL}/mantenimientos/${id}/finalizar`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  /**
   * DELETE /mantenimientos/{id}
   */
  async deleteMantenimiento(id: number): Promise<void> {
    await request<void>(`${API_URL}/mantenimientos/${id}`, { method: "DELETE" });
  },

  /**
   * (Opcional) GET /mantenimientos/{id}/historial
   */
  async getHistorial(id: number): Promise<{ data: any[] }> {
    return await request<{ data: any[] }>(`${API_URL}/mantenimientos/${id}/historial`, {
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
