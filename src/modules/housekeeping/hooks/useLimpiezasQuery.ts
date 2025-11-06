import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { limpiezaService } from "../services/limpiezaService";
import type { LimpiezaFilters, LimpiezaItem, LimpiezaPaginatedResponse } from "../types/limpieza";
import { ESTADO_HAB } from "../types/limpieza";
import type { SortKey } from "../types/table";

export type UseLimpiezasQueryProps = { initialFilters?: LimpiezaFilters };
type SortState = { key: SortKey; dir: "asc" | "desc" };
export type LimpiezasTableController = ReturnType<typeof useLimpiezasQuery>;

const getId = (it: any): number => (it?.id_limpieza ?? it?.id) as number;

// Query Keys
export const limpiezasKeys = {
  all: ["limpiezas"] as const,
  lists: () => [...limpiezasKeys.all, "list"] as const,
  list: (filters: LimpiezaFilters) => [...limpiezasKeys.lists(), filters] as const,
  detail: (id: number) => [...limpiezasKeys.all, "detail", id] as const,
};

export function useLimpiezasQuery({ initialFilters }: Readonly<UseLimpiezasQueryProps> = {}) {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<LimpiezaFilters>({ per_page: 10, ...initialFilters });
  const [sort, setSort] = useState<SortState>({ key: "habitacion", dir: "asc" });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // ✅ Query principal con TanStack Query
  const {
    data: pageData,
    isLoading,
    error,
    refetch,
    isFetching,
    isPending,
  } = useQuery({
    queryKey: limpiezasKeys.list(filters),
    queryFn: ({ signal }) => limpiezaService.getLimpiezas(filters, { signal }),
    staleTime: 1000 * 60 * 10, // 10 minutos - cache agresivo
    gcTime: 1000 * 60 * 30, // 30 minutos en cache
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const items = useMemo(() => pageData?.data ?? [], [pageData]);

  // Sorting
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

  // ✅ Mutation para actualizar limpieza con optimistic updates
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<LimpiezaItem> }) => {
      return await limpiezaService.updateLimpieza(id, data, "PATCH");
    },
    onMutate: async ({ id, data }) => {
      // Cancelar queries en curso
      await queryClient.cancelQueries({ queryKey: limpiezasKeys.lists() });

      // Snapshot del estado anterior
      const previousData = queryClient.getQueryData<LimpiezaPaginatedResponse>(
        limpiezasKeys.list(filters)
      );

      // Optimistic update
      queryClient.setQueryData<LimpiezaPaginatedResponse>(
        limpiezasKeys.list(filters),
        (old) => {
          if (!old) return old;

          return {
            ...old,
            data: old.data.map((item) => {
              if (getId(item) !== id) return item;

              const newEstadoId = data.id_estado_hab ??
                (data.fecha_final ? ESTADO_HAB.LIMPIA : item.estado?.id ?? ESTADO_HAB.SUCIA);
              const newEstadoNombre = newEstadoId === ESTADO_HAB.LIMPIA ? "Limpia" : "Sucia";

              return {
                ...item,
                ...data,
                estado: {
                  ...(item.estado || {}),
                  id: newEstadoId,
                  nombre: newEstadoNombre,
                },
              };
            }),
          };
        }
      );

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      // Rollback en caso de error
      if (context?.previousData) {
        queryClient.setQueryData(limpiezasKeys.list(filters), context.previousData);
      }
    },
    onSuccess: () => {
      // Invalidar queries relacionadas para refrescar desde el servidor
      queryClient.invalidateQueries({
        queryKey: limpiezasKeys.lists(),
        refetchType: 'none' // Refetch para sincronizar datos completos
      });
    },
  });

  // ✅ Mutation para finalizar limpieza
  const finalizarMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { fecha_final: string; notas: string | null } }) => {
      return await limpiezaService.finalizarLimpieza(id, data);
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: limpiezasKeys.lists() });

      const previousData = queryClient.getQueryData<LimpiezaPaginatedResponse>(
        limpiezasKeys.list(filters)
      );

      queryClient.setQueryData<LimpiezaPaginatedResponse>(
        limpiezasKeys.list(filters),
        (old) => {
          if (!old) return old;

          return {
            ...old,
            data: old.data.map((item) => {
              if (getId(item) !== id) return item;

              return {
                ...item,
                fecha_final: data.fecha_final,
                notas: data.notas,
                id_estado_hab: ESTADO_HAB.LIMPIA,
                estado: {
                  ...(item.estado || {}),
                  id: ESTADO_HAB.LIMPIA,
                  nombre: "Limpia",
                },
                usuario_asignado: undefined, // ✅ Limpiar usuario asignado al finalizar
              };
            }),
          };
        }
      );

      return { previousData };
    },
    onError: (err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(limpiezasKeys.list(filters), context.previousData);
      }
      throw err;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: limpiezasKeys.lists(),
        refetchType: 'none'
      });
    },
  });

  // ✅ Mutation para reabrir limpieza
  const reabrirMutation = useMutation({
    mutationFn: async (id: number) => {
      return await limpiezaService.updateLimpieza(id, {
        id_estado_hab: ESTADO_HAB.SUCIA,
        fecha_final: null
      });
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: limpiezasKeys.lists() });

      const previousData = queryClient.getQueryData<LimpiezaPaginatedResponse>(
        limpiezasKeys.list(filters)
      );

      queryClient.setQueryData<LimpiezaPaginatedResponse>(
        limpiezasKeys.list(filters),
        (old) => {
          if (!old) return old;

          return {
            ...old,
            data: old.data.map((item) => {
              if (getId(item) !== id) return item;

              return {
                ...item,
                fecha_final: null,
                id_estado_hab: ESTADO_HAB.SUCIA,
                estado: {
                  ...(item.estado || {}),
                  id: ESTADO_HAB.SUCIA,
                  nombre: "Sucia",
                },
              };
            }),
          };
        }
      );

      return { previousData };
    },
    onError: (err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(limpiezasKeys.list(filters), context.previousData);
      }
      throw err;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: limpiezasKeys.lists(),
        refetchType: 'none'
      });
    },
  });

  // Funciones de selección
  const toggleOne = (id: number) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleAllPage = () => {
    const ids = items.map((x) => getId(x));
    const all = ids.every((id) => selectedIds.includes(id));
    setSelectedIds((prev) =>
      all ? prev.filter((id) => !ids.includes(id)) : Array.from(new Set([...prev, ...ids])),
    );
  };

  // Navegación
  const gotoPage = (page: number) => {
    if (!pageData) return;
    if (page >= 1 && page <= pageData.last_page) {
      setFilters((f) => ({ ...f, page }));
      globalThis.scrollTo?.({ top: 0, behavior: "smooth" });
    }
  };

  const setPerPage = (per_page: number) => setFilters((f) => ({ ...f, per_page, page: 1 }));

  const applyFilters = (patch: Partial<LimpiezaFilters>) => {
    setFilters((f) => ({ ...f, ...patch, page: 1 }));
  };

  const handleSort = (_key: SortKey) => setSort({ key: "habitacion", dir: "asc" });

  return {
    loading: isLoading,
    isFetching,
    error: error ? String(error) : null,
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
    finalizarLimpieza: async (id: number, data: { fecha_final: string; notas: string | null }): Promise<void> => {
      await finalizarMutation.mutateAsync({ id, data });
    },
    reabrirLimpieza: async (id: number): Promise<void> => {
      await reabrirMutation.mutateAsync(id);
    },
    updateLimpieza: async (id: number, data: Partial<LimpiezaItem>): Promise<void> => {
      await updateMutation.mutateAsync({ id, data });
    },
    refetch: async (): Promise<void> => {
      await refetch();
    },
    setFilters,
    filters,
    isFirstLoad: isPending, // ✅ isPending es true solo en la primera carga, no con caché
    isRevalidating: !isLoading && isFetching,
    hasPageData: Boolean(pageData),
  };
}
