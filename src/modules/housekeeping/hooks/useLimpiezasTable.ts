import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { limpiezaService } from "../services/limpiezaService";
import type { LimpiezaFilters, LimpiezaPaginatedResponse } from "../types/limpieza";
import type { SortKey } from "../types/table";
import { ESTADO_HAB } from "../types/limpieza";

export type UseLimpiezasTableProps = { initialFilters?: LimpiezaFilters };
type SortState = { key: SortKey; dir: "asc" | "desc" };
export type LimpiezasTableController = ReturnType<typeof useLimpiezasTable>;

const getId = (it: any): number => (it?.id_limpieza ?? it?.id) as number;
const keyOf = (f: LimpiezaFilters) => JSON.stringify({ ...f });
const CACHE_KEY = "hk_limpiezas_cache_v1";

const MIN_FIRST_SKELETON_MS = 600;

export function useLimpiezasTable({ initialFilters }: Readonly<UseLimpiezasTableProps> = {}) {
  const [filters, setFilters] = useState<LimpiezaFilters>({ per_page: 10, ...initialFilters });
  const [sort, setSort] = useState<SortState>({ key: "habitacion", dir: "asc" });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageData, setPageData] = useState<LimpiezaPaginatedResponse | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const cacheRef = useRef<Map<string, LimpiezaPaginatedResponse>>(new Map());
  const abortRef = useRef<AbortController | null>(null);

  const firstLoadRef = useRef(true);
  const startedAtRef = useRef<number>(Date.now());
  const [forceSkeleton, setForceSkeleton] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setForceSkeleton(false), MIN_FIRST_SKELETON_MS);
    return () => clearTimeout(t);
  }, []);

  // Hidratar cache de sessionStorage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        const obj = JSON.parse(raw) as Record<string, LimpiezaPaginatedResponse>;
        cacheRef.current = new Map<string, LimpiezaPaginatedResponse>(Object.entries(obj));
        const k = keyOf(filters);
        const cached = cacheRef.current.get(k);
        if (cached) setPageData(cached);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistCache = useCallback(() => {
    try {
      const obj = Object.fromEntries(cacheRef.current.entries());
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(obj));
    } catch {}
  }, []);

  const fetchData = useCallback(async () => {
    const k = keyOf(filters);

    const cached = cacheRef.current.get(k);
    if (cached) setPageData(cached);

    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setError(null);

    try {
      const data = await limpiezaService.getLimpiezas(filters, { signal: ac.signal });
      cacheRef.current.set(k, data);
      persistCache();
      setPageData(data);
      setSelectedIds([]);

      // prefetch next page
      const next = (data.current_page ?? 1) + 1;
      if (next <= (data.last_page ?? 1)) {
        const nk = keyOf({ ...filters, page: next });
        if (!cacheRef.current.get(nk)) {
          limpiezaService.getLimpiezas({ ...filters, page: next }, {})
            .then((d) => {
              cacheRef.current.set(nk, d);
              persistCache();
            })
            .catch(() => {});
        }
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") setError(e?.message ?? "Error cargando limpiezas");
    } finally {
      firstLoadRef.current = false;
      if (abortRef.current === ac) abortRef.current = null;
      setLoading(false);
      setForceSkeleton(false);
    }
  }, [filters, persistCache]);

  useEffect(() => {
    fetchData();
    return () => abortRef.current?.abort();
  }, [fetchData]);

  const items = useMemo(() => pageData?.data ?? [], [pageData]);

  const getSortableValue = useCallback((item: any, key: SortKey) => {
    if (key === "habitacion") return item?.habitacion?.numero ?? "";
    if (key === "estado") return item?.estado?.nombre ?? "";
    if (key === "tipo") return item?.habitacion?.tipo?.nombre ?? "";
    if (key === "piso") return item?.habitacion?.piso ?? "";
    return item?.[key];
  }, []);

  const sortedItems = useMemo(() => {
    const copy = [...items];
    const dir = sort.dir === "asc" ? 1 : -1;
    copy.sort((a, b) => {
      const valA: any = getSortableValue(a, sort.key);
      const valB: any = getSortableValue(b, sort.key);
      if (valA == null && valB == null) return 0;
      if (valA == null) return -1 * dir;
      if (valB == null) return 1 * dir;
      const numA = Number(valA);
      const numB = Number(valB);
      if (!Number.isNaN(numA) && !Number.isNaN(numB)) return (numA - numB) * dir;
      return String(valA).localeCompare(String(valB), undefined, { numeric: true }) * dir;
    });
    return copy;
  }, [items, sort, getSortableValue]);

  const toggleOne = (id: number) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleAllPage = () => {
    const ids = items.map((x) => getId(x));
    const all = ids.every((id) => selectedIds.includes(id));
    setSelectedIds((prev) => (all ? prev.filter((id) => !ids.includes(id)) : Array.from(new Set([...prev, ...ids]))));
  };

  const gotoPage = (page: number) => {
    if (!pageData) return;
    if (page >= 1 && page <= pageData.last_page) {
      setFilters((f) => ({ ...f, page }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const debounceRef = useRef<number | null>(null);
  const setPerPage = (per_page: number) => setFilters((f) => ({ ...f, per_page, page: 1 }));
  const applyFilters = (patch: Partial<LimpiezaFilters>, debounceMs = 250) => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      setFilters((f) => ({ ...f, ...patch, page: 1 }));
    }, debounceMs);
  };

  const handleSort = (_key: SortKey) => setSort({ key: "habitacion", dir: "asc" });

  const patchItemOptimistic = useCallback((idAny: number, patch: Partial<any>) => {
    setPageData((prev) => {
      if (!prev) return prev;
      const data = prev.data.map((it) => {
        const itId = getId(it);
        if (itId !== idAny) return it;
        const newEstadoId = patch.id_estado_hab ?? (patch.fecha_final ? ESTADO_HAB.LIMPIA : ESTADO_HAB.SUCIA);
        const newEstadoNombre = newEstadoId === ESTADO_HAB.LIMPIA ? "Limpia" : "Sucia";
        return {
          ...it,
          ...patch,
          estado: { ...(it.estado ?? {}), id: newEstadoId, nombre: newEstadoNombre },
        };
      });
      return { ...prev, data };
    });
  }, []);

  const finalizarLimpieza = async (idAny: number, payload: { fecha_final: string; notas: string | null }) => {
    const snapshot = pageData;
    patchItemOptimistic(idAny, { id_estado_hab: ESTADO_HAB.LIMPIA, fecha_final: payload.fecha_final, notas: payload.notas ?? null });
    try {
      await limpiezaService.finalizarLimpieza(idAny, { fecha_final: payload.fecha_final, notas: payload.notas ?? null });
    } catch (e: any) {
      setPageData(snapshot ?? null);
      setError(e?.message ?? "No se pudo marcar como LIMPIA");
      throw e;
    }
  };

  const reabrirLimpieza = async (idAny: number) => {
    const snapshot = pageData;
    patchItemOptimistic(idAny, { id_estado_hab: ESTADO_HAB.SUCIA, fecha_final: null });
    try {
      await limpiezaService.updateLimpieza(idAny, { id_estado_hab: ESTADO_HAB.SUCIA, fecha_final: null });
    } catch (e: any) {
      setPageData(snapshot ?? null);
      setError(e?.message ?? "No se pudo marcar como SUCIA");
      throw e;
    }
  };

  const isFirstLoad = firstLoadRef.current && loading;
  const isRevalidating = !firstLoadRef.current && loading;
  const showInitialSkeleton =
    (loading && !pageData) ||
    (isFirstLoad && loading) ||
    (!pageData && forceSkeleton && Date.now() - startedAtRef.current < MIN_FIRST_SKELETON_MS);

  return {
    loading,
    error,
    items: sortedItems,
    rawItems: items,
    pagination: {
      current_page: pageData?.current_page ?? 1,
      last_page: pageData?.last_page ?? 1,
      per_page: pageData?.per_page ?? filters.per_page ?? 10,
      total: pageData?.total ?? 0,
      from: pageData?.from ?? 0,
      to: pageData?.to ?? 0,
    },
    selectedIds,
    toggleOne,
    toggleAllPage,
    gotoPage,
    setPerPage,
    applyFilters,
    sort,
    handleSort,
    finalizarLimpieza,
    reabrirLimpieza,
    refetch: fetchData,
    setFilters,
    filters,
    isFirstLoad,
    isRevalidating,
    showInitialSkeleton,
    hasPageData: Boolean(pageData), // 👈 importante para distinguir boot vs revalidación
  };
}
