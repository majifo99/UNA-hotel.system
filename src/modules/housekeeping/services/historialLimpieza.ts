// src/modules/housekeeping/services/historialLimpieza.ts
import type { HistorialPagination } from "../types/historial";

const API_URL = import.meta.env.VITE_API_URL;

/* ─── helpers ─── */
function serializeParam(v: unknown): string {
  if (v === undefined || v === null) return "";
  if (typeof v === "string") return v.trim();
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

// Intenta extraer un mensaje legible desde un "parsed" desconocido
function pickMsg(parsed: unknown): string | undefined {
  if (typeof parsed === "string") return parsed;
  if (typeof parsed === "object" && parsed !== null) {
    const obj = parsed as Record<string, unknown>;
    const val = obj.message ?? obj.error;
    if (typeof val === "string") return val;
    if (val !== undefined) {
      try {
        return JSON.stringify(val);
      } catch {
        /* ignore */
      }
    }
  }
  return undefined;
}

async function request(
  url: string,
  init?: RequestInit & { signal?: AbortSignal }
): Promise<unknown> {
  const res = await fetch(url, init); // <- SIN credentials

  // Evitamos "any" para no disparar S4325
  let parsed: unknown;
  const ct = res.headers.get("content-type") || "";

  if (ct.includes("application/json")) {
    parsed = await res.json(); // unknown
  } else {
    parsed = await res.text(); // string (subtipo de unknown)
  }

  if (!res.ok) {
    const msg = pickMsg(parsed) ?? `Error ${res.status}`;
    throw new Error(String(msg));
  }

  return parsed;
}
/* ─────────────── */

/**
 * GET /historial-limpiezas (paginado + filtros)
 */
export async function fetchHistorialLimpiezas(params?: {
  page?: number;
  per_page?: number;
  q?: string;
  desde?: string;
  hasta?: string;
  signal?: AbortSignal;
}): Promise<HistorialPagination> {
  const query = toQuery({
    page: params?.page,
    per_page: params?.per_page,
    q: params?.q,
    desde: params?.desde,
    hasta: params?.hasta,
  });

  const data = await request(`${API_URL}/historial-limpiezas${query}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal: params?.signal,
  });

  return data as HistorialPagination;
}

/**
 * GET /historial-limpiezas para una habitación específica (últimas N finalizadas)
 */
export async function fetchHistorialByHabitacion(
  id_habitacion: number,
  limit: number = 3
): Promise<{ data: any[] }> {
  const query = toQuery({
    id_habitacion,
    per_page: limit,
  });

  const data = await request(`${API_URL}/historial-limpiezas${query}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  return data as { data: any[] };
}
