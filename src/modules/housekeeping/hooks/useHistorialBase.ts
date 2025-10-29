// src/modules/housekeeping/hooks/useHistorialBase.ts
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Hook base genérico para manejar historiales con paginación, búsqueda y caché
 * Reutilizado por useHistorialLimpiezas y useHistorialMantenimientos
 */

export type HistorialParams = {
  page?: number;
  per_page?: number;
  q?: string;
  desde?: string;
  hasta?: string;
};

export type HistorialOptions = {
  keepPreviousData?: boolean;
};

export type HistorialPagination<T> = {
  data: T[];
  total: number;
};

export type FetchFunction<T> = (
  params: HistorialParams
) => Promise<HistorialPagination<T>>;

/**
 * Hook genérico para manejar historiales
 * @param fetchFn - Función que realiza el fetch de datos
 * @param initial - Parámetros iniciales
 * @param opts - Opciones (keepPreviousData, etc.)
 */
export function useHistorialBase<T>(
  fetchFn: FetchFunction<T>,
  initial: HistorialParams = {},
  opts?: HistorialOptions
) {
  const [page, setPage] = useState<number>(initial.page ?? 1);
  const [perPage, setPerPage] = useState<number>(initial.per_page ?? 20);
  const [q, setQ] = useState<string>(initial.q ?? "");
  const [desde, setDesde] = useState<string | undefined>(initial.desde);
  const [hasta, setHasta] = useState<string | undefined>(initial.hasta);

  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const prevDataRef = useRef<T[]>([]);
  const prevTotalRef = useRef<number>(0);

  const keepPreviousData = opts?.keepPreviousData ?? true;

  // Cache en memoria (clave = JSON.stringify(params))
  const cacheRef = useRef(new Map<string, HistorialPagination<T>>());

  const params = useMemo(
    () => ({
      page,
      per_page: perPage,
      q: q.trim() || undefined,
      desde,
      hasta,
    }),
    [page, perPage, q, desde, hasta]
  );

  useEffect(() => {
    const key = JSON.stringify(params);
    let alive = true;

    // Guarda snapshot para keepPreviousData
    prevDataRef.current = data;
    prevTotalRef.current = total;
    setError(null);

    // Si hay en cache, úsalo inmediato
    const cached = cacheRef.current.get(key);
    if (cached) {
      if (!alive) return;
      setData(cached.data || []);
      setTotal(cached.total ?? cached.data?.length ?? 0);
      setLoading(false);
      return;
    }

    // Si no hay cache: carga, pero mantén data previa si se pidió
    setLoading(!keepPreviousData || prevDataRef.current.length === 0);

    fetchFn(params)
      .then((res) => {
        if (!alive) return;
        cacheRef.current.set(key, res);
        setData(res.data || []);
        setTotal(res.total ?? res.data?.length ?? 0);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e instanceof Error ? e : new Error(String(e)));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.per_page, params.q, params.desde, params.hasta, keepPreviousData]);

  // Dataset para UI: si está cargando y había previos, muestra los previos
  const uiData =
    loading && keepPreviousData && prevDataRef.current.length > 0
      ? prevDataRef.current
      : data;

  const uiTotal =
    loading && keepPreviousData && prevTotalRef.current > 0
      ? prevTotalRef.current
      : total;

  return {
    data: uiData,
    total: uiTotal,
    page,
    perPage,
    q,
    desde,
    hasta,
    setPage,
    setPerPage,
    setQ,
    setDesde,
    setHasta,
    loading,
    rawLoading: loading,
    error,
  };
}
