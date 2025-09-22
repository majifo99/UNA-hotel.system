// src/modules/housekeeping/hooks/useLimpiezasTable.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import { limpiezaService } from "../services/limpiezaService";
import type {
  LimpiezaFilters,
  LimpiezaPaginatedResponse,
} from "../types/limpieza";
import type { SortKey } from "../types/table"; // ← usa el mismo SortKey que el componente

export type UseLimpiezasTableProps = {
  initialFilters?: LimpiezaFilters;
};

type SortState = { key: SortKey; dir: "asc" | "desc" };

export function useLimpiezasTable({ initialFilters }: Readonly<UseLimpiezasTableProps> = {}) {
  const [filters, setFilters] = useState<LimpiezaFilters>({
    per_page: 10,
    ...initialFilters,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageData, setPageData] = useState<LimpiezaPaginatedResponse | null>(null);

  // selección local
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // ordenamiento client-side (sobre la página actual)
  const [sort, setSort] = useState<SortState>({ key: "fecha_inicio", dir: "desc" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await limpiezaService.getLimpiezas(filters);
      setPageData(data);
      setSelectedIds([]); // limpia selección al cambiar de página/filtros
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

  // Resuelve el valor a comparar según la clave de ordenamiento
  const getSortableValue = useCallback((item: any, key: SortKey) => {
    if (key === "habitacion") return item.habitacion?.numero_habitacion ?? "";
    if (key === "estado") return item.estadoHabitacion?.nombre ?? "";
    if (key === "tipo") return item.habitacion?.tipo ?? "";
    if (key === "piso") return item.habitacion?.piso ?? item.habitacion?.nivel ?? "";
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

      if (typeof valA === "number" && typeof valB === "number") {
        return (valA - valB) * dir;
      }
      return String(valA).localeCompare(String(valB)) * dir;
    });

    return copy;
  }, [items, sort, getSortableValue]);

  const toggleOne = (id: number) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleAllPage = () => {
    const ids = items.map((x) => x.id_limpieza);
    const all = ids.every((id) => selectedIds.includes(id));

    setSelectedIds((prev) => {
      if (all) {
        // des-selecciona los de la página actual
        return prev.filter((id) => !ids.includes(id));
      }
      // agrega los de la página actual
      return Array.from(new Set([...prev, ...ids]));
    });
  };

  const gotoPage = (page: number) => {
    if (!pageData) return;
    if (page >= 1 && page <= pageData.last_page) {
      setFilters((f) => ({ ...f, page }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const setPerPage = (per_page: number) => setFilters((f) => ({ ...f, per_page, page: 1 }));
  const applyFilters = (patch: Partial<LimpiezaFilters>) =>
    setFilters((f) => ({ ...f, ...patch, page: 1 }));

  // Ahora el handleSort usa el mismo SortKey importado
  const handleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

  // --- Stub: acción no disponible en modo solo lectura ---
  const finalizarLimpieza = async (
    _id_limpieza: number,
    _payload: { fecha_final: string; notas: string | null }
  ) => {
    setError("Acción no disponible: modo solo lectura (aún no implementamos finalizar).");
  };

  return {
    // datos
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

    // selección
    selectedIds,
    toggleOne,
    toggleAllPage,

    // paginación/orden/filtrado
    gotoPage,
    setPerPage,
    applyFilters,
    sort,
    handleSort, // ← exporta la versión tipada con SortKey compartido

    // acciones (stub)
    finalizarLimpieza,

    // util
    refetch: fetchData,
    setFilters,
    filters,
  };
}
