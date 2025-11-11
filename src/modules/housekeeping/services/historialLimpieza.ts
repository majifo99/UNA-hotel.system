// src/modules/housekeeping/services/historialLimpieza.ts
import type { HistorialPagination } from "../types/historial";
import { toQueryString } from "../utils/formatters";
import apiClient from "../lib/apiClient";

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
  const query = toQueryString({
    page: params?.page,
    per_page: params?.per_page,
    q: params?.q,
    desde: params?.desde,
    hasta: params?.hasta,
  });

  const response = await apiClient.get<HistorialPagination>(`/historial-limpiezas${query}`, {
    signal: params?.signal,
  });

  return response.data;
}

/**
 * GET /historial-limpiezas para una habitación específica (últimas N finalizadas)
 */
export async function fetchHistorialByHabitacion(
  id_habitacion: number,
  limit: number = 3
): Promise<{ data: any[] }> {
  const query = toQueryString({
    id_habitacion,
    per_page: limit,
  });

  const response = await apiClient.get<{ data: any[] }>(`/historial-limpiezas${query}`);

  return response.data;
}
