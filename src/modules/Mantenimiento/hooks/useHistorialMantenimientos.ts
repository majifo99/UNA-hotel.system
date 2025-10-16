"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { HistorialMantenimiento, HistorialMantPagination } from "../types/historialMantenimiento";
import { fetchHistorialMantenimientos } from "../services/historialMantenimiento";

type Params = { page?: number; per_page?: number; q?: string; desde?: string; hasta?: string; };
type Options = { keepPreviousData?: boolean };

const _cache = new Map<string, HistorialMantPagination>();

export function useHistorialMantenimientos(initial: Params = {}, opts?: Options) {
  const [page, setPage] = useState<number>(initial.page ?? 1);
  const [perPage, setPerPage] = useState<number>(initial.per_page ?? 20);
  const [q, setQ] = useState<string>(initial.q ?? "");
  const [desde, setDesde] = useState<string | undefined>(initial.desde);
  const [hasta, setHasta] = useState<string | undefined>(initial.hasta);

  const [data, setData] = useState<HistorialMantenimiento[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const prevDataRef = useRef<HistorialMantenimiento[]>([]);
  const prevTotalRef = useRef<number>(0);

  const keepPreviousData = opts?.keepPreviousData ?? true;

  const params = useMemo(
    () => ({ page, per_page: perPage, q: q.trim() || undefined, desde, hasta }),
    [page, perPage, q, desde, hasta]
  );

  useEffect(() => {
    const key = JSON.stringify(params);
    let alive = true;

    prevDataRef.current = data;
    prevTotalRef.current = total;
    setError(null);

    const cached = _cache.get(key);
    if (cached) {
      if (!alive) return;
      setData(cached.data || []);
      setTotal(cached.total ?? (cached.data?.length ?? 0));
      setLoading(false);
      return;
    }

    setLoading(!keepPreviousData || prevDataRef.current.length === 0);

    fetchHistorialMantenimientos(params)
      .then((res) => {
        if (!alive) return;
        _cache.set(key, res);
        setData(res.data || []);
        setTotal(res.total ?? (res.data?.length ?? 0));
      })
      .catch((e) => {
        if (!alive) return;
        setError(e instanceof Error ? e : new Error(String(e)));
      })
      .finally(() => { if (alive) setLoading(false); });

    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.per_page, params.q, params.desde, params.hasta, keepPreviousData]);

  const uiData = loading && keepPreviousData && prevDataRef.current.length > 0 ? prevDataRef.current : data;
  const uiTotal = loading && keepPreviousData && prevTotalRef.current > 0 ? prevTotalRef.current : total;

  return {
    data: uiData,
    total: uiTotal,
    page, perPage, q, desde, hasta,
    setPage, setPerPage, setQ, setDesde, setHasta,
    loading, rawLoading: loading, error,
  };
}
