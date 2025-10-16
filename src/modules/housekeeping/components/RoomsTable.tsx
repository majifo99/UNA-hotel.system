import { useMemo, useEffect, useState, useCallback } from "react";
import { UserCheck, MoreHorizontal, Eye, RefreshCw } from "lucide-react";
import type { Prioridad } from "../types/limpieza";
import { useLimpiezasTable, type LimpiezasTableController } from "../hooks/useLimpiezasTable";
import type { ColumnKey } from "../types/table";
import LimpiezaDetailModal from "./Modals/LimpiezaDetailModal";
import CleanToggle, { type FinalizePayload } from "./CleanToggle";
import type { RoomFilters } from "./FilterBar";

// UI helpers
import { BarLoader, TableLoader } from "./UI/Loaders";
import HabitacionCell from "./UI/HabitacionCell";
import { EstadoBadge, PrioridadBadge } from "./UI/Badges";

// ✅ Modal de éxito
import SuccessModal from "./Modals/SuccessModal";

const cn = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(" ");
const PRIORIDAD_CLEAN_MODE: "dash" | "finishedAt" = "dash";

function formatFinishedAt(iso?: string | null) {
  if (!iso) return "Finalizada";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Finalizada";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `Finalizada ${dd}/${mm} ${hh}:${mi}`;
}

function getRowId(item: any): number {
  return item.id_limpieza ?? item.id;
}
function getEstado(item: any): { nombre?: string } | undefined {
  return item.estado ?? item.estadoHabitacion;
}

function renderPrioridadCell(clean: boolean, fechaFinal?: string | null, prioridad?: Prioridad | null) {
  if (clean) {
    if (PRIORIDAD_CLEAN_MODE === "dash") {
      return <span className="text-slate-400 text-sm" aria-label="Sin prioridad por estar limpia">—</span>;
    }
    return <span className="text-slate-600 text-sm">{formatFinishedAt(fechaFinal ?? undefined)}</span>;
  }
  return <PrioridadBadge prioridad={prioridad ?? null} />;
}

export type SelectedRoom = {
  id: number;
  numero?: string;
  piso?: string | number;
  tipoNombre?: string;
};

type Props = {
  controller?: LimpiezasTableController;
  onEdit?: (item: any) => void;
  onSelectionChange?: (room: SelectedRoom | null) => void;
  filters?: RoomFilters;
};

export default function LimpiezasTable({ controller, onSelectionChange, filters }: Readonly<Props>) {
  const internalCtrl = useLimpiezasTable({ initialFilters: { per_page: 10, pendientes: false } });
  const ctrl = controller ?? internalCtrl;

  const {
    loading,
    error,
    items,
    pagination,
    selectedIds,
    toggleOne,
    gotoPage,
    finalizarLimpieza,
    reabrirLimpieza,
    isFirstLoad,
    isRevalidating,
    showInitialSkeleton,
    hasPageData,
  } = ctrl;

  const totalPages = pagination.last_page;

  const columns = useMemo(
    () =>
      [
        { key: "habitacion", label: "Habitación" },
        { key: "estado", label: "Estado" },
        { key: "prioridad", label: "Prioridad" },
        { key: "asignador", label: "Asignado" },
        { key: "notas", label: "Notas" },
      ] as ReadonlyArray<{ key: ColumnKey | "notas" | "habitacion"; label: string }>,
    []
  );

  // ✅ Estado del modal de éxito
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("Operación realizada correctamente.");

  // Optimista local para el toggle
  const [optimisticCleanIds, setOptimisticCleanIds] = useState<Set<number>>(new Set());
  const addOptimistic = useCallback((id: number) => setOptimisticCleanIds((prev) => new Set(prev).add(id)), []);
  const removeOptimistic = useCallback((id: number) => {
    setOptimisticCleanIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const handleFinalizeForToggle = useCallback(
    async (id: number, payload: FinalizePayload) => {
      addOptimistic(id);
      try {
        await finalizarLimpieza(id, { fecha_final: payload.fecha_final, notas: null });
        // El mensaje se setea desde la fila (tenemos el número allí)
      } catch (e) {
        console.error("[RoomsTable] Error al finalizar limpieza", e);
        removeOptimistic(id);
        throw e;
      }
    },
    [finalizarLimpieza, addOptimistic, removeOptimistic]
  );

  const handleReopenForToggle = useCallback(
    async (id: number) => {
      removeOptimistic(id);
      try {
        await reabrirLimpieza(id);
        // El mensaje se setea desde la fila (tenemos el número allí)
      } catch (e) {
        console.error("[RoomsTable] Error al reabrir limpieza", e);
        throw e;
      }
    },
    [reabrirLimpieza, removeOptimistic]
  );

  // menú por fila
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  useEffect(() => {
    const close = () => setOpenMenuId(null);
    if (openMenuId !== null) document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openMenuId]);

  // modal detalle
  const [detailId, setDetailId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // emitir habitación seleccionada
  useEffect(() => {
    if (!onSelectionChange) return;
    if (!items || !Array.isArray(items) || !Array.isArray(selectedIds) || selectedIds.length === 0) {
      onSelectionChange(null);
      return;
    }
    const selectedRows = items.filter((r) => selectedIds.includes(getRowId(r)));
    const firstWithRoom = selectedRows.find((r) => r?.habitacion?.id != null);
    if (!firstWithRoom) return onSelectionChange(null);
    const rawId = firstWithRoom.habitacion!.id;
    const numericId = typeof rawId === "number" ? rawId : Number(rawId);
    const room = {
      id: numericId,
      numero: firstWithRoom.habitacion?.numero,
      piso: firstWithRoom.habitacion?.piso,
      tipoNombre: firstWithRoom.habitacion?.tipo?.nombre,
    };
    onSelectionChange(room);
  }, [selectedIds, items, onSelectionChange]);

  /* ---------- Filtros cliente ---------- */
  const hasClientFilters = useMemo(() => {
    if (!filters) return false;
    const s = filters.search?.trim();
    const st = filters.status?.trim().toLowerCase();
    const pr = filters.priority?.trim().toLowerCase();
    const as = filters.assigned?.trim();
    return Boolean(s || st || pr || as);
  }, [filters]);

  const viewItems = useMemo(() => {
    if (!filters) return items || [];
    const fSearch = (filters?.search || "").toLowerCase().trim();
    const fStatus = (filters?.status || "").toLowerCase().trim();
    const fPriority = (filters?.priority || "").toLowerCase().trim();
    const fAssigned = (filters?.assigned || "").trim();

    return (items || []).filter((it) => {
      const numero = String(it?.habitacion?.numero ?? "").toLowerCase();
      const estadoNombre = String((it?.estado ?? it?.estadoHabitacion)?.nombre ?? "").toLowerCase();
      const cleanByDate = Boolean(it?.fecha_final);
      const isLimpia = estadoNombre === "limpia" || cleanByDate;
      const prioridad = String(it?.prioridad ?? "").toLowerCase();
      const asignadoNombre = String(it?.usuario_asignado?.nombre ?? it?.asignador?.name ?? "").trim();

      if (fSearch && !numero.includes(fSearch)) return false;
      if (fStatus === "limpia" && !isLimpia) return false;
      if (fStatus === "sucia" && isLimpia) return false;
      if (fPriority && prioridad !== fPriority) return false;
      if (fAssigned && asignadoNombre !== fAssigned) return false;

      return true;
    });
  }, [items, filters]);

  /* ====== ESTADOS DE UI ====== */
  if ((showInitialSkeleton || isFirstLoad || loading) && !hasPageData) {
    return <TableLoader />;
  }

  if (error) {
    return (
      <div className="bg-white border border-rose-200 rounded-xl overflow-hidden">
        <div className="text-center text-rose-600 py-10 text-sm">Error: {error}</div>
      </div>
    );
  }

  const HEAD_BASE = "p-4 font-medium text-gray-700 capitalize text-left";

  if (!loading && hasPageData && viewItems.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {isRevalidating && <BarLoader />}
        <div className="text-center text-slate-500 py-10 text-sm">
          {hasClientFilters
            ? "No hay limpiezas para mostrar con los filtros aplicados."
            : "No hay limpiezas para mostrar."}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading && hasPageData && <BarLoader />}

        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-12" />
              <col className="w-[22%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[22%]" />
              <col className="w-[22%]" />
              <col className="w-[110px]" />
            </colgroup>

            <thead className="bg-[#304D3C] text-white border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={false}
                    disabled
                    className="h-4 w-4 rounded border-white/40 text-white bg-white/20 cursor-not-allowed"
                  />
                </th>
                {columns.map((c) => (
                  <th key={c.key} className={HEAD_BASE + " text-white"}>
                    <span>{c.label}</span>
                  </th>
                ))}
                <th className={HEAD_BASE + " text-right text-white"}>Acciones</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-slate-100">
              {viewItems.map((item: any) => {
                const id = getRowId(item);
                const isSelected = selectedIds.includes(id);
                const numero = item.habitacion?.numero ?? "—";
                const pisoVal = item.habitacion?.piso;
                const tipoNombre = item.habitacion?.tipo?.nombre ?? undefined;
                const estado = getEstado(item);
                const estadoNombre = estado?.nombre;
                const clean =
                  optimisticCleanIds.has(id) || Boolean(item.fecha_final) || (estadoNombre ?? "").toLowerCase() === "limpia";

                const asignadoNombre = item?.usuario_asignado?.nombre ?? item?.asignador?.name ?? null;

                return (
                  <tr key={id} className={cn("hover:bg-slate-50/50 transition-colors", isSelected && "bg-emerald-50/30")}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOne(id)}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="p-4">
                      <HabitacionCell numero={numero} tipoNombre={tipoNombre} piso={pisoVal} />
                    </td>
                    <td className="p-4">
                      <EstadoBadge clean={clean} />
                    </td>
                    <td className="p-4">{renderPrioridadCell(clean, item.fecha_final, item.prioridad ?? null)}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {asignadoNombre ? (
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm font-medium text-slate-700">{asignadoNombre}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">Sin asignar</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 truncate" title={item.notas ?? ""}>
                      {item.notas ?? <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        {/* ✅ Aquí seteamos el modal de éxito una vez termine OK */}
                        <CleanToggle
                          id={id}
                          clean={clean}
                          notas={item.notas ?? null}
                          onFinalize={async (xid, payload) => {
                            await handleFinalizeForToggle(xid, payload);
                            setSuccessMsg(`Habitación ${numero} marcada como LIMPIA.`);
                            setShowSuccess(true);
                          }}
                          onReopen={async (xid) => {
                            await handleReopenForToggle(xid);
                            setSuccessMsg(`Habitación ${numero} marcada como SUCIA.`);
                            setShowSuccess(true);
                          }}
                          onOptimisticAdd={(x) => setOptimisticCleanIds((s) => new Set(s).add(x))}
                          onOptimisticRemove={(x) =>
                            setOptimisticCleanIds((s) => {
                              const nx = new Set(s);
                              nx.delete(x);
                              return nx;
                            })
                          }
                        />
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId((prev) => (prev === id ? null : id));
                            }}
                            aria-haspopup="menu"
                            aria-expanded={openMenuId === id}
                            aria-label="Más acciones"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50 transition hover:scale-105"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          {openMenuId === id && (
                            <div
                              role="menu"
                              aria-label="Acciones de limpieza"
                              tabIndex={-1}
                              onKeyDown={(e) => {
                                if (e.key === "Escape") setOpenMenuId(null);
                              }}
                              className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-200 bg-white shadow-lg py-1 z-20"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                role="menuitem"
                                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setDetailId(id);
                                  setDetailOpen(true);
                                }}
                              >
                                <Eye className="w-4 h-4 text-slate-600" />
                                Ver detalles
                              </button>

                              <button
                                role="menuitem"
                                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  alert(`Reasignar tarea de la habitación ${numero}`);
                                }}
                              >
                                <RefreshCw className="w-4 h-4 text-slate-600" />
                                Reasignar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex justify-center items-center gap-1 py-5 bg-white border-t border-slate-100">
          <button
            onClick={() => gotoPage(pagination.current_page - 1)}
            disabled={pagination.current_page <= 1}
            className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-emerald-600 disabled:opacity-30"
            aria-label="Página anterior"
          >
            ←
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => gotoPage(p)}
              className={cn(
                "w-8 h-8 rounded-md text-sm transition-colors",
                pagination.current_page === p
                  ? "text-emerald-700 font-semibold bg-slate-100"
                  : "text-slate-500 hover:text-emerald-600"
              )}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => gotoPage(pagination.current_page + 1)}
            disabled={pagination.current_page >= totalPages}
            className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-emerald-600 disabled:opacity-30"
            aria-label="Página siguiente"
          >
            →
          </button>
        </div>

        {/* Modal de detalles */}
        <LimpiezaDetailModal open={detailOpen} limpiezaId={detailId} onClose={() => setDetailOpen(false)} />
      </div>

      {/* ✅ Modal de éxito global de la tabla */}
      <SuccessModal
        isOpen={showSuccess}
        title="¡Operación Exitosa!"
        message={successMsg}
        actionLabel="Continuar"
        autoCloseMs={1500}
        onAction={() => setShowSuccess(false)}
        onClose={() => setShowSuccess(false)}
      />
    </>
  );
}
