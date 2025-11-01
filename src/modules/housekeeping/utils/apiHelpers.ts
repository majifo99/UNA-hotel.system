// src/modules/housekeeping/utils/apiHelpers.ts
/**
 * Utilidades compartidas para peticiones HTTP con autenticación
 * Usadas por services de housekeeping y Mantenimiento
 */

/**
 * Obtiene el token de autenticación desde localStorage
 */
export function getAuthToken(): string | null {
  const raw =
    localStorage.getItem("adminAuthToken") ||
    localStorage.getItem("authToken") ||
    null;

  if (!raw) return null;
  return raw.replace(/^"(.*)"$/, "$1").trim(); // limpia comillas
}

/**
 * Realiza una petición HTTP con autenticación Bearer
 * Sin cookies (credentials: omit) para evitar problemas CORS
 */
export async function authenticatedRequest<T = any>(
  url: string,
  init: RequestInit = {}
): Promise<T> {
  const headers = new Headers(init.headers || {});
  headers.set("Accept", "application/json");

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAuthToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: "omit", // sin cookies para evitar CORS
    mode: "cors",
  });

  const ct = res.headers.get("content-type") || "";
  const parsed = ct.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    const msg =
      typeof parsed === "object" && parsed && ("message" in parsed || "error" in parsed)
        ? (parsed as any).message ?? (parsed as any).error
        : `Error ${res.status}`;
    throw new Error(String(msg));
  }

  return parsed as T;
}
