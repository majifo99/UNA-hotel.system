// src/modules/housekeeping/hooks/useHistorialLimpiezas.ts
"use client";

import { useHistorialBase } from "./useHistorialBase";
import { fetchHistorialLimpiezas } from "../services/historialLimpieza";
import type { HistorialLimpieza } from "../types/historial";

type Params = {
  page?: number;
  per_page?: number;
  q?: string;
  desde?: string;
  hasta?: string;
};

type Options = {
  keepPreviousData?: boolean;
};

/**
 * Hook especializado para historiales de limpieza
 * Usa el hook base genérico para evitar duplicidad
 */
export function useHistorialLimpiezas(initial: Params = {}, opts?: Options) {
  return useHistorialBase<HistorialLimpieza>(
    fetchHistorialLimpiezas,
    initial,
    opts
  );
}
