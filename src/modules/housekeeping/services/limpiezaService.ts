// src/modules/housekeeping/services/limpiezaService.ts
import type {
  LimpiezaItem,
  LimpiezaPaginatedResponse,
  LimpiezaFilters,
  LimpiezaCreateDTO,
  FinalizarLimpiezaDTO,
} from "../types/limpieza";
import { ESTADO_HAB } from "../types/limpieza";

const API_URL = import.meta.env.VITE_API_URL;

/* Helpers */
function serializeParam(v: unknown): string {
  if (v === undefined || v === null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "bigint") return String(v);
  if (typeof v === "boolean") return v ? "1" : "0";
  if (v instanceof Date) return v.toISOString();
  try { return JSON.stringify(v); } catch { return ""; }
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

/* Token */
function getAuthToken(): string | null {
  const raw =
    localStorage.getItem("adminAuthToken") ||
    localStorage.getItem("authToken") ||
    null;

  if (!raw) return null;
  return raw.replace(/^"(.*)"$/, "$1").trim(); // limpia comillas
}

/* Request Bearer (sin cookies → sin CORS) */
async function request(url: string, init: RequestInit = {}): Promise<any> {
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
    credentials: "omit", // ⚠️ IMPORTANTE: sin cookies
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
  return parsed;
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
      id_estado_hab: filters.estado_id,
      desde: filters.desde,
      hasta: filters.hasta,
      page: filters.page,
    });

    return await request(`${API_URL}/limpiezas${query}`, { signal: opts?.signal });
  },

  async getLimpiezaById(id: number): Promise<{ data: LimpiezaItem }> {
    return await request(`${API_URL}/limpiezas/${id}`);
  },

  async createLimpieza(body: LimpiezaCreateDTO): Promise<{ data: LimpiezaItem }> {
    return await request(`${API_URL}/limpiezas`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async updateLimpieza(
    id: number,
    body: Partial<LimpiezaCreateDTO>,
    method: "PATCH" | "PUT" = "PATCH"
  ): Promise<{ data: LimpiezaItem }> {
    return await request(`${API_URL}/limpiezas/${id}`, {
      method,
      body: JSON.stringify(body),
    });
  },

  async finalizarLimpieza(id: number, body: FinalizarLimpiezaDTO): Promise<{ data: LimpiezaItem }> {
    try {
      return await request(`${API_URL}/limpiezas/${id}/finalizar`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
    } catch (e: any) {
      const msg = String(e?.message ?? "");
      if (msg.includes("404")) {
        return await request(`${API_URL}/limpiezas/${id}`, {
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
    await request(`${API_URL}/limpiezas/${id}`, { method: "DELETE" });
  },
};
