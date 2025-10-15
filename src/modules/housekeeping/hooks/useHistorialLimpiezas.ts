"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { HistorialLimpieza, HistorialPagination } from "../types/historial";
import { fetchHistorialLimpiezas } from "../services/historialLimpieza";

type Params = {
  page?: number;
  per_page?: number;
  q?: string;
  desde?: string;
  hasta?: string;
};

type Options = {
  keepPreviousData?: boolean; // evita parpadeos al recargar
};

// cache en memoria por sesión (clave = JSON.stringify(params))
const _cache = new Map<string, HistorialPagination>();

export function useHistorialLimpiezas(initial: Params = {}, opts: Options = { keepPreviousData: true }) {
  const [page, setPage] = useState<number>(initial.page ?? 1);
  const [perPage, setPerPage] = useState<number>(initial.per_page ?? 20);
  const [q, setQ] = useState<string>(initial.q ?? "");
  const [desde, setDesde] = useState<string | undefined>(initial.desde);
  const [hasta, setHasta] = useState<string | undefined>(initial.hasta);

  const [data, setData] = useState<HistorialLimpieza[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const prevDataRef = useRef<HistorialLimpieza[]>([]);
  const prevTotalRef = useRef<number>(0);

  const params = useMemo(
    () => ({ page, per_page: perPage, q: q.trim() || undefined, desde, hasta }),
    [page, perPage, q, desde, hasta]
  );

  useEffect(() => {
    const key = JSON.stringify(params);
    let alive = true;

    // guarda snapshot para keepPreviousData
    prevDataRef.current = data;
    prevTotalRef.current = total;

    setError(null);

    // Si hay en cache, úsalo inmediato (sin “Cargando…”)
    const cached = _cache.get(key);
    if (cached) {
      if (!alive) return;
      setData(cached.data || []);
      setTotal(cached.total ?? (cached.data?.length ?? 0));
      setLoading(false);
      return;
    }

    // Si no hay cache: carga, pero mantén data previa si se pidió
    setLoading(!opts.keepPreviousData || prevDataRef.current.length === 0);

    fetchHistorialLimpiezas(params)
      .then((res: HistorialPagination) => {
        if (!alive) return;
        _cache.set(key, res);
        setData(res.data || []);
        setTotal(res.total ?? (res.data?.length ?? 0));
      })
      .catch((e) => {
        if (!alive) return;
        if (e instanceof Error) setError(e);
        else setError(new Error(String(e)));
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.per_page, params.q, params.desde, params.hasta]);

  // dataset para UI: si está cargando y había previos, muestra los previos
  const uiData = loading && opts.keepPreviousData && prevDataRef.current.length > 0
    ? prevDataRef.current
    : data;
  const uiTotal = loading && opts.keepPreviousData && prevTotalRef.current > 0
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
    rawLoading: loading, // por si necesitas saberlo explícitamente
    error,
  };
}
