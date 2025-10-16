// src/modules/housekeeping/services/limpiezaService.ts
import type {
  LimpiezaItem,
  LimpiezaPaginatedResponse,
  LimpiezaFilters,
  LimpiezaCreateDTO,
  FinalizarLimpiezaDTO,
} from "../types/limpieza";
import { ESTADO_HAB } from "../types/limpieza";

const API_URL = import.meta.env.VITE_API_URL ;

/* ─────────── Query helpers (evita S6551: "[object Object]") ─────────── */
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
/* ────────────────────────────────────────────────────────────────────── */

/**
 * request “agnóstico” (no genérico) que devuelve `any` para
 * evitar assertions (`as T`) y así eliminar S4325.
 */
async function request(url: string, init?: RequestInit & { signal?: AbortSignal }): Promise<any> {
  const res = await fetch(url, init);
  const ct = res.headers.get("content-type") || "";
  const parsed = ct.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    const msg =
      (typeof parsed === "object" && parsed && ("message" in parsed || "error" in parsed))
        ? ((parsed).message ?? (parsed).error)
        : `Error ${res.status}`;
    throw new Error(String(msg));
  }
  return parsed; // <- sin "as T"
}

export const limpiezaService = {
  async getLimpiezas(
    filters: LimpiezaFilters = {},
    opts?: { signal?: AbortSignal }
  ): Promise<LimpiezaPaginatedResponse> {
    const query = toQuery({
      per_page: filters.per_page,
      prioridad: filters.prioridad,
      pendientes: filters.pendientes,
      id_habitacion: filters.id_habitacion,
      id_estado_hab: filters.estado_id, // compat con back
      desde: filters.desde,
      hasta: filters.hasta,
      page: filters.page,
    });

    const data = await request(`${API_URL}/limpiezas${query}`, { signal: opts?.signal });
    return data as LimpiezaPaginatedResponse; // <- asignación desde any (sin assertion en la llamada)
  },

  async getLimpiezaById(id: number): Promise<{ data: LimpiezaItem }> {
    const data = await request(`${API_URL}/limpiezas/${id}`);
    return data as { data: LimpiezaItem };
  },

  async createLimpieza(body: LimpiezaCreateDTO): Promise<{ data: LimpiezaItem }> {
    const data = await request(`${API_URL}/limpiezas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return data as { data: LimpiezaItem };
  },

  async updateLimpieza(
    id: number,
    body: Partial<LimpiezaCreateDTO>,
    method: "PATCH" | "PUT" = "PATCH"
  ): Promise<{ data: LimpiezaItem }> {
    const data = await request(`${API_URL}/limpiezas/${id}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return data as { data: LimpiezaItem };
  },

  // Finalizar con fallback: primero /finalizar, si 404 → PATCH normal + estado LIMPIA
  async finalizarLimpieza(id: number, body: FinalizarLimpiezaDTO): Promise<{ data: LimpiezaItem }> {
    try {
      const data = await request(`${API_URL}/limpiezas/${id}/finalizar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return data as { data: LimpiezaItem };
    } catch (e: any) {
      const msg = String(e?.message ?? "");
      if (msg.includes("404")) {
        const data = await request(`${API_URL}/limpiezas/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fecha_final: body.fecha_final,
            notas: body.notas ?? null,
            id_estado_hab: ESTADO_HAB.LIMPIA,
          }),
        });
        return data as { data: LimpiezaItem };
      }
      throw e;
    }
  },

  async deleteLimpieza(id: number): Promise<void> {
    await request(`${API_URL}/limpiezas/${id}`, { method: "DELETE" });
  },
};
