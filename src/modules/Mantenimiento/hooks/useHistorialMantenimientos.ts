// src/modules/Mantenimiento/hooks/useHistorialMantenimientos.ts
"use client";

import { useHistorialBase } from "../../housekeeping/hooks/useHistorialBase";
import { fetchHistorialMantenimientos } from "../services/historialMantenimiento";
import type { HistorialMantenimiento } from "../types/historialMantenimiento";

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
 * Hook especializado para historiales de mantenimiento
 * Usa el hook base genérico de housekeeping para evitar duplicidad
 */
export function useHistorialMantenimientos(initial: Params = {}, opts?: Options) {
  return useHistorialBase<HistorialMantenimiento>(
    fetchHistorialMantenimientos,
    initial,
    opts
  );
}
