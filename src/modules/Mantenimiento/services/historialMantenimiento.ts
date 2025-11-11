import type { HistorialMantPagination } from "../types/historialMantenimiento";
import { toQueryString } from "../../housekeeping/utils/formatters";
import apiClient from "../lib/apiClient";

/** GET /historial-mantenimientos (paginado + filtros) */
export async function fetchHistorialMantenimientos(params?: {
  page?: number; per_page?: number; q?: string; desde?: string; hasta?: string; signal?: AbortSignal;
}): Promise<HistorialMantPagination> {
  const query = toQueryString({
    page: params?.page,
    per_page: params?.per_page,
    q: params?.q,
    desde: params?.desde,
    hasta: params?.hasta,
  });

  const response = await apiClient.get<HistorialMantPagination>(`/historial-mantenimientos${query}`, {
    signal: params?.signal,
  });

  return response.data;
}

/** GET /mantenimientos/:id/historial (sin paginar en tu backend actual) */
export async function fetchHistorialPorMantenimiento(idMantenimiento: number, params?: {
  signal?: AbortSignal;
}): Promise<HistorialMantPagination> {
  const response = await apiClient.get<any>(`/mantenimientos/${idMantenimiento}/historial`, {
    signal: params?.signal,
  });

  const data = response.data;
  // si tu backend NO pagina aquí, adaptamos para que el hook sea consistente
  const arr = data?.data ?? data;
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
  const query = toQueryString({
    id_habitacion,
    per_page: limit,
  });

  const response = await apiClient.get<{ data: any[] }>(`/historial-mantenimientos${query}`);

  return response.data;
}
