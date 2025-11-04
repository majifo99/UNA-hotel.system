// src/modules/housekeeping/utils/formatters.ts
/**
 * Utilidades compartidas de formateo y procesamiento de datos
 * Usadas por housekeeping y Mantenimiento para evitar duplicidad
 */

const HOUR12 = false;

/**
 * Formatea una fecha ISO a formato legible en español (Costa Rica)
 */
export function formatDatetime(value?: string | null): string {
  if (!value || value === "—" || value === "-") return "—";
  const clean = typeof value === "string"
    ? value.replaceAll(/(\.\d{3})\d+(Z)?$/g, "$1$2")
    : value;
  const d = new Date(String(clean));
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat("es-CR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: HOUR12,
  }).format(d);
}

/**
 * Parsea JSON de forma segura, retornando null si falla
 */
export function parseJsonSafe<T = Record<string, unknown>>(
  value?: string | T | null
): T | null {
  if (!value) return null;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value as string);
  } catch {
    return { raw: value } as T;
  }
}

/**
 * Convierte un valor a string primitivo si es posible
 */
export function asPrimitiveString(v: unknown): string | undefined {
  if (v === null || v === undefined) return undefined;
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return undefined;
}

/**
 * Convierte cualquier valor a string para mostrar en UI
 */
export function toDisplayString(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  try {
    const j = JSON.stringify(v);
    return j === "{}" || j === "[]" ? "—" : j;
  } catch {
    return "—";
  }
}

/**
 * Serializa un parámetro para query string
 */
export function serializeParam(v: unknown): string {
  if (v === undefined || v === null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "bigint") return String(v);
  if (typeof v === "boolean") return v ? "1" : "0";
  if (v instanceof Date) return v.toISOString();
  try { return JSON.stringify(v); } catch { return ""; }
}

/**
 * Convierte objeto a query string
 */
export function toQueryString(params: Record<string, unknown>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    q.append(k, serializeParam(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}
