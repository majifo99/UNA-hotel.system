import type { HistorialMantPagination } from "../types/historialMantenimiento";
import { getApiBaseUrl } from "../../../config/api";

const API_URL = getApiBaseUrl();

function serializeParam(v: unknown): string {
  if (v === undefined || v === null) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number" || typeof v === "bigint") return String(v);
  if (typeof v === "boolean") return v ? "1" : "0";
  if (v instanceof Date) return v.toISOString();
  try { return JSON.stringify(v); } catch { return ""; }
}
function toQuery(params: Record<string, unknown>) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    const s = serializeParam(v);
    if (s) q.append(k, s);
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

function pickMsg(parsed: unknown): string | undefined {
  if (typeof parsed === "string") return parsed;
  if (parsed && typeof parsed === "object") {
    const v = (parsed as any).message ?? (parsed as any).error;
    if (typeof v === "string") return v;
    if (v !== undefined) { try { return JSON.stringify(v); } catch { /* ignore */ } }
  }
  return undefined;
}

async function request(url: string, init?: RequestInit & { signal?: AbortSignal }): Promise<unknown> {
  const res = await fetch(url, init);
  const ct = res.headers.get("content-type") || "";
  const parsed: unknown = ct.includes("application/json") ? await res.json() : await res.text();
  if (!res.ok) throw new Error(pickMsg(parsed) ?? `Error ${res.status}`);
  return parsed;
}

/** GET /historial-mantenimientos (paginado + filtros) */
export async function fetchHistorialMantenimientos(params?: {
  page?: number; per_page?: number; q?: string; desde?: string; hasta?: string; signal?: AbortSignal;
}): Promise<HistorialMantPagination> {
  const query = toQuery({
    page: params?.page,
    per_page: params?.per_page,
    q: params?.q,
    desde: params?.desde,
    hasta: params?.hasta,
  });
  const data = await request(`${API_URL}/historial-mantenimientos${query}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal: params?.signal,
  });
  return data as HistorialMantPagination;
}

/** GET /mantenimientos/:id/historial (sin paginar en tu backend actual) */
export async function fetchHistorialPorMantenimiento(idMantenimiento: number, params?: {
  signal?: AbortSignal;
}): Promise<HistorialMantPagination> {
  const data = await request(`${API_URL}/mantenimientos/${idMantenimiento}/historial`, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal: params?.signal,
  });
  // si tu backend NO pagina aquí, adaptamos para que el hook sea consistente
  const arr = (data as any)?.data ?? data;
  return {
    data: Array.isArray(arr) ? arr : [],
    current_page: 1,
    per_page: Array.isArray(arr) ? arr.length : 0,
    total: Array.isArray(arr) ? arr.length : 0,
  };
}

/**
 * GET /historial-mantenimientos para una habitación específica (últimas N finalizadas)
 */
export async function fetchHistorialByHabitacion(
  id_habitacion: number,
  limit: number = 3
): Promise<{ data: any[] }> {
  const query = toQuery({
    id_habitacion,
    per_page: limit,
  });

  const data = await request(`${API_URL}/historial-mantenimientos${query}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  return data as { data: any[] };
}
