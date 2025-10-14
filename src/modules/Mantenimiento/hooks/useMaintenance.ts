// src/modules/Mantenimiento/hooks/useMaintenance.ts
import { useEffect, useMemo, useState, useCallback } from "react";
import { fetchMaintenance } from "../services/maintenanceService";
import type {
  MantenimientoItem,
  MaintenanceStatus,
  StatusFilter,
} from "../types/mantenimiento";

/** Normaliza string/number a lower-case sin espacios */
const norm = (v?: string | number | null) => (v ?? "").toString().trim().toLowerCase();

/** Mapea variantes del backend al union de la UI */
const sanitizeStatus = (raw?: string | null): MaintenanceStatus | "" => {
  const s = (raw ?? "").trim().toLowerCase();
  if (s === "pendiente") return "Pendiente";
  if (s === "en proceso" || s === "en_proceso" || s === "en-proceso") return "En Proceso";
  if (s === "completado" || s === "completo") return "Completado";
  return "";
};

/** Extrae filas de cualquier shape común usando optional chaining (S6582) */
function extractRows(resp: unknown): MantenimientoItem[] {
  // 1) Array directo
  if (Array.isArray(resp)) return resp as MantenimientoItem[];

  // 2) AxiosResponse | objeto con data: []
  const lvl1 = (resp as any)?.data;
  if (Array.isArray(lvl1)) return lvl1 as MantenimientoItem[];

  // 3) AxiosResponse con data: { data: [] }
  const lvl2 = (resp as any)?.data?.data;
  if (Array.isArray(lvl2)) return lvl2 as MantenimientoItem[];

  return [];
}

/** Hook de mantenimiento: datos, filtros, métricas y refetch */
export function useMaintenance() {
  const [items, setItems] = useState<MantenimientoItem[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("Todos");
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await fetchMaintenance();
      setItems(extractRows(resp));
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await fetchMaintenance();
        if (!mounted) return;
        setItems(extractRows(resp));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  /** Filtrado por texto (query) + estado */
  const filtered = useMemo(() => {
    const q = norm(query);

    return items.filter((i) => {
      const matchesQ =
        !q ||
        norm(i.notas).includes(q) ||
        norm(i.prioridad).includes(q) ||
        norm(i.habitacion?.numero).includes(q) ||
        norm(i.habitacion?.piso).includes(q) ||
        norm(i.usuario_asignado?.nombre).includes(q) ||
        norm(i.usuario_reporta?.nombre).includes(q) ||
        norm(i.estado?.nombre).includes(q);

      const est = sanitizeStatus(i.estado?.nombre);
      const matchesStatus = status === "Todos" ? true : est === status;

      return matchesQ && matchesStatus;
    });
  }, [items, query, status]);

  /** Métricas por estado */
  const metrics = useMemo(() => {
    const by = (name: MaintenanceStatus) =>
      items.filter((i) => sanitizeStatus(i.estado?.nombre) === name).length;

    const pending = by("Pendiente");
    const inProgress = by("En Proceso");
    const done = by("Completado");

    return { pending, inProgress, done, total: items.length };
  }, [items]);

  const counts = useMemo(
    () => ({
      all: metrics.total,
      pending: metrics.pending,
      inProgress: metrics.inProgress,
      done: metrics.done,
    }),
    [metrics]
  );

  return {
    items,
    filtered,
    loading,

    query, setQuery,
    status, setStatus,

    metrics,
    counts,

    refetch,
  };
}
