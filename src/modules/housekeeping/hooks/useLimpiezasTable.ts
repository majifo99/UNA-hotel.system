import { useCallback, useEffect, useMemo, useState } from "react";
import { limpiezaService } from "../services/limpiezaService";
import type { LimpiezaFilters, LimpiezaPaginatedResponse } from "../types/limpieza";
import type { SortKey } from "../types/table";
import { ESTADO_HAB } from "../types/limpieza";

export type UseLimpiezasTableProps = { initialFilters?: LimpiezaFilters };
type SortState = { key: SortKey; dir: "asc" | "desc" };
export type LimpiezasTableController = ReturnType<typeof useLimpiezasTable>;

export function useLimpiezasTable({ initialFilters }: Readonly<UseLimpiezasTableProps> = {}) {
  const [filters, setFilters] = useState<LimpiezaFilters>({ per_page: 10, ...initialFilters });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageData, setPageData] = useState<LimpiezaPaginatedResponse | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [sort, setSort] = useState<SortState>({ key: "fecha_inicio", dir: "desc" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await limpiezaService.getLimpiezas(filters);
      setPageData(data);
      setSelectedIds([]);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando limpiezas");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const items = useMemo(() => pageData?.data ?? [], [pageData]);

  const getSortableValue = useCallback((item: any, key: SortKey) => {
    if (key === "habitacion") return item.habitacion?.numero ?? "";
    if (key === "estado") return item.estadoHabitacion?.nombre ?? "";
    if (key === "tipo") return item.habitacion?.tipo?.nombre ?? "";
    if (key === "piso") return item.habitacion?.piso ?? "";
    return item[key];
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
      if (typeof valA === "number" && typeof valB === "number") return (valA - valB) * dir;
      return String(valA).localeCompare(String(valB)) * dir;
    });
    return copy;
  }, [items, sort, getSortableValue]);

  const toggleOne = (id: number) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleAllPage = () => {
    const ids = items.map((x) => x.id_limpieza);
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

  const setPerPage = (per_page: number) => setFilters((f) => ({ ...f, per_page, page: 1 }));
  const applyFilters = (patch: Partial<LimpiezaFilters>) => setFilters((f) => ({ ...f, ...patch, page: 1 }));
  const handleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

  const patchItemOptimistic = useCallback((id_limpieza: number, patch: Partial<any>) => {
    setPageData((prev) => {
      if (!prev) return prev;
      const data = prev.data.map((it) =>
        it.id_limpieza === id_limpieza
          ? {
              ...it,
              ...patch,
              estadoHabitacion: {
                ...(it.estadoHabitacion ?? {}),
                id_estado_hab: patch.id_estado_hab ?? it.estadoHabitacion?.id_estado_hab,
                nombre: patch.id_estado_hab === ESTADO_HAB.LIMPIA ? "Limpia" : "Sucia",
              },
            }
          : it
      );
      return { ...prev, data };
    });
  }, []);

  const finalizarLimpieza = async (id_limpieza: number, payload: { fecha_final: string; notas: string | null }) => {
    const snapshot = pageData;
    patchItemOptimistic(id_limpieza, {
      id_estado_hab: ESTADO_HAB.LIMPIA,
      fecha_final: payload.fecha_final,
      notas: payload.notas ?? null,
    });
    try {
      await limpiezaService.updateLimpieza(id_limpieza, {
        id_estado_hab: ESTADO_HAB.LIMPIA,
        fecha_final: payload.fecha_final,
        notas: payload.notas ?? null,
      });
    } catch (e: any) {
      setPageData(snapshot ?? null);
      setError(e?.message ?? "No se pudo marcar como LIMPIA");
      throw e;
    }
  };

  const reabrirLimpieza = async (id_limpieza: number) => {
    const snapshot = pageData;
    patchItemOptimistic(id_limpieza, {
      id_estado_hab: ESTADO_HAB.SUCIA,
      fecha_final: null,
    });
    try {
      await limpiezaService.updateLimpieza(id_limpieza, {
        id_estado_hab: ESTADO_HAB.SUCIA,
        fecha_final: null,
      });
    } catch (e: any) {
      setPageData(snapshot ?? null);
      setError(e?.message ?? "No se pudo marcar como SUCIA");
      throw e;
    }
  };

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
  };
}