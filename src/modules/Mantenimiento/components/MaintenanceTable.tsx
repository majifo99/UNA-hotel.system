"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Eye, Pencil, UserRound, CheckCircle2, XCircle } from "lucide-react";
import type { MantenimientoItem, Prioridad } from "../types/mantenimiento";
import MantenimientoDetailModal from "../components/modals/MantenimientoDetailModal";
import AssignMaintenanceModal from "../components/modals/AssignMantenimiento";
import ReassignMaintenanceModal from "../components/modals/ReassignMantenimiento";
import mantenimientoService from "../services/maintenanceService";

/* ----------------------------- Tipado público ----------------------------- */

export type MaintenanceTableRef = {
  openAssign: () => void;
  clearSelection: () => void;
  getSelectedIds: () => number[];
};

export type MaintenanceTableProps = Readonly<{
  items: MantenimientoItem[];
  loading?: boolean;
  onSelectionChange?: (count: number) => void;
  onRequestRefresh?: () => void; // refetch del hook principal
  onSuccess?: (message?: string) => void;
  onUpdateOptimistic?: (id: number, updates: Partial<MantenimientoItem>) => void; // optimistic update
}>;

/* ---------------------------- Funciones auxiliares ---------------------------- */

function prioridadToLabel(
  p?: Prioridad | null
): "Baja" | "Media" | "Alta" | "Urgente" | undefined {
  if (!p) return undefined;
  const map: Record<Prioridad, "Baja" | "Media" | "Alta" | "Urgente"> = {
    baja: "Baja",
    media: "Media",
    alta: "Alta",
    urgente: "Urgente",
  };
  return map[p];
}

function PriorityPill({
  label = "Media" as "Baja" | "Media" | "Alta" | "Urgente",
}) {
  const map = {
    Baja: "bg-slate-100 text-slate-700",
    Media: "bg-amber-100 text-amber-700",
    Alta: "bg-rose-100 text-rose-700",
    Urgente: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
  } as const;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${map[label]}`}
    >
      {label}
    </span>
  );
}

const HEAD_BASE = "p-4 font-medium capitalize text-left";

/* ✅ Ajuste: se agrega prop `title` opcional */
function Th({
  children = null,
  className = "",
  title,
}: Readonly<{ children?: React.ReactNode; className?: string; title?: string }>) {
  return (
    <th className={`${HEAD_BASE} ${className}`} title={title}>
      {children}
    </th>
  );
}

/* ✅ Ajuste: se agrega prop `title` opcional */
function Td({
  children = null,
  className = "",
  title,
}: Readonly<{ children?: React.ReactNode; className?: string; title?: string }>) {
  return (
    <td
      className={`px-5 py-5 align-top text-[14px] text-slate-700 ${className}`}
      title={title}
    >
      {children}
    </td>
  );
}

/* ---------------------------- Componente principal ---------------------------- */

const MaintenanceTable = forwardRef<MaintenanceTableRef, MaintenanceTableProps>(
  function MaintenanceTable(
    { items, loading = false, onSelectionChange, onRequestRefresh, onSuccess, onUpdateOptimistic },
    ref
  ) {
    const [selected, setSelected] = useState<Record<number, boolean>>({});
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailId, setDetailId] = useState<number | null>(null);

    const [assignOpen, setAssignOpen] = useState(false);
    const [assignItem, setAssignItem] = useState<MantenimientoItem | null>(null);

    const [reassignOpen, setReassignOpen] = useState(false);
    const [reassignItem, setReassignItem] = useState<MantenimientoItem | null>(null);

    const [finalizingId, setFinalizingId] = useState<number | null>(null);

    /* --------------------------- Efectos de selección --------------------------- */

    useEffect(() => {
      if (!items?.length) {
        if (Object.keys(selected).length) setSelected({});
        return;
      }
      const ids = new Set(items.map((i) => i.id));
      setSelected((prev) => {
        const next: Record<number, boolean> = {};
        for (const [k, v] of Object.entries(prev)) {
          const id = Number(k);
          if (ids.has(id) && v) next[id] = true;
        }
        return next;
      });
    }, [items]);

    const allChecked = useMemo(() => {
      if (items.length === 0) return false;
      return items.every((i) => !!selected[i.id]);
    }, [items, selected]);

    useEffect(() => {
      const count = Object.values(selected).filter(Boolean).length;
      onSelectionChange?.(count);
    }, [selected, onSelectionChange]);

    const toggleAll = () => {
      const next = allChecked
        ? {}
        : Object.fromEntries(items.map((i) => [i.id, true]));
      setSelected(next);
    };

    const toggleOne = (id: number) => {
      setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const openDetail = (id: number) => {
      setDetailId(id);
      setDetailOpen(true);
    };

    const detailItem = useMemo(() => {
      if (!detailId) return null;
      return items.find((i) => i.id === detailId) ?? null;
    }, [detailId, items]);

    const handleFinalizar = async (id: number) => {
      const now = new Date();
      const fechaFinalISO = now.toISOString();

      onUpdateOptimistic?.(id, {
        fecha_final: fechaFinalISO,
        usuario_asignado: undefined,
        prioridad: null,
        notas: null,
      });

      setFinalizingId(id);
      try {
        const body: any = {
          fecha_final: fechaFinalISO,
          id_usuario_asigna: null,
          prioridad: null,
          notas: null,
        };

        await mantenimientoService.updateMantenimiento(id, body);
        onSuccess?.("Mantenimiento finalizado correctamente.");
      } catch (err: unknown) {
        console.error("[MaintenanceTable] handleFinalizar failed:", err);
        alert(err instanceof Error ? err.message : "No se pudo finalizar el mantenimiento");
        onRequestRefresh?.();
      } finally {
        setFinalizingId(null);
      }
    };

    const handleReabrir = async (id: number) => {
      onUpdateOptimistic?.(id, {
        fecha_final: null,
      });

      setFinalizingId(id);
      try {
        const body: any = {
          fecha_final: null,
        };

        await mantenimientoService.updateMantenimiento(id, body);
        onSuccess?.("Mantenimiento reabierto correctamente.");
      } catch (err: unknown) {
        console.error("[MaintenanceTable] handleReabrir failed:", err);
        alert(err instanceof Error ? err.message : "No se pudo reabrir el mantenimiento");
        onRequestRefresh?.();
      } finally {
        setFinalizingId(null);
      }
    };

    /* ----------------------------- Métodos del ref ----------------------------- */

    useImperativeHandle(ref, () => ({
      openAssign() {
        const selectedIds = Object.entries(selected)
          .filter(([, v]) => !!v)
          .map(([k]) => Number(k));

        if (selectedIds.length === 0) return;

        const first = items.find((x) => x.id === selectedIds[0]) ?? null;
        setAssignItem(first);
        setAssignOpen(true);
      },
      clearSelection() {
        setSelected({});
      },
      getSelectedIds() {
        return Object.entries(selected)
          .filter(([, v]) => !!v)
          .map(([k]) => Number(k));
      },
    }));

    /* ------------------------------ Render de filas ----------------------------- */

    const renderRows = () => {
      if (loading) {
        return (
          <tr>
            <td colSpan={6} className="px-5 py-14 text-center text-slate-500">
              Cargando mantenimiento…
            </td>
          </tr>
        );
      }

      if (!items.length) {
        return (
          <tr>
            <td colSpan={6} className="px-5 py-14 text-center text-slate-500">
              No hay resultados para los filtros aplicados.
            </td>
          </tr>
        );
      }

      return items.map((i) => {
        const metaCode = `MNT-${String(i.id).padStart(3, "0")}`;
        const roomNumber = i.habitacion?.numero ?? "—";
        const prioridadLabel = i.prioridad ? prioridadToLabel(i.prioridad) : null;
        const responsable = i.usuario_asignado?.nombre ?? null;
        const isFinalizado = i.fecha_final !== null && i.fecha_final !== undefined;
        const isBusy = finalizingId === i.id;

        return (
          <tr key={i.id} className="hover:bg-slate-50/50 transition-colors">
            <Td className="align-middle">
              <input
                aria-label={`Seleccionar ${metaCode}`}
                type="checkbox"
                checked={!!selected[i.id]}
                onChange={() => toggleOne(i.id)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
            </Td>

            <Td className="pr-3">
              <div className="min-w-0">
                <div className="font-medium text-slate-800 whitespace-nowrap">
                  Habitación {roomNumber}
                </div>
                <div className="text-[12px] text-slate-500 truncate">
                  Piso {i.habitacion?.piso ?? "—"}
                </div>
              </div>
            </Td>

            <Td className="align-middle">
              {prioridadLabel ? <PriorityPill label={prioridadLabel} /> : <span className="text-slate-400 text-sm">—</span>}
            </Td>

            <Td>
              {responsable ? (
                <div className="flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium text-slate-700">
                    {responsable}
                  </span>
                </div>
              ) : (
                <span className="text-slate-400 text-sm">Sin asignar</span>
              )}
            </Td>

            <Td className="px-4 py-3 text-sm text-slate-700 truncate" title={i.notas ?? ""}>
              {i.notas ?? <span className="text-slate-400">—</span>}
            </Td>

            <Td className="align-middle">
              <div className="flex items-center justify-end gap-2 text-slate-500">
                <button
                  title="Ver detalles"
                  className="hover:text-emerald-700 transition-colors"
                  onClick={() => openDetail(i.id)}
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  title="Editar / Reasignar"
                  className="hover:text-blue-600 transition-colors"
                  onClick={() => {
                    setReassignItem(i);
                    setReassignOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title={isFinalizado ? "Reabrir mantenimiento" : "Finalizar mantenimiento"}
                  disabled={isBusy}
                  onClick={() => isFinalizado ? handleReabrir(i.id) : handleFinalizar(i.id)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isFinalizado
                      ? "bg-rose-100 text-rose-600 hover:bg-rose-200"
                      : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                  } ${isBusy ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isFinalizado ? (
                    <XCircle className="h-4 w-4" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </Td>
          </tr>
        );
      });
    };

    /* ------------------------------- Render final ------------------------------ */

    return (
      <>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-12" />
                <col className="w-[22%]" />
                <col className="w-[12%]" />
                <col className="w-[22%]" />
                <col className="w-[22%]" />
                <col className="w-[110px]" />
              </colgroup>

              <thead className="bg-[#304D3C] text-white border-b border-slate-200">
                <tr className="text-left">
                  <Th className="text-white">
                    <input
                      aria-label="Seleccionar todos"
                      type="checkbox"
                      checked={allChecked}
                      onChange={toggleAll}
                      className="h-4 w-4 rounded border-white/40 text-white bg-white/20 focus:ring-white/50"
                    />
                  </Th>
                  <Th className="text-white">Habitación</Th>
                  <Th className="text-white">Prioridad</Th>
                  <Th className="text-white">Asignado</Th>
                  <Th className="text-white">Notas</Th>
                  <Th className="text-right text-white" title="Acciones">
                    Acciones
                  </Th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-slate-100">
                {renderRows()}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de detalle */}
        <MantenimientoDetailModal
          open={detailOpen}
          mantenimientoId={detailId}
          item={detailItem}
          onClose={() => setDetailOpen(false)}
          onFinalized={() => onRequestRefresh?.()}
        />

        {/* Modal de asignación */}
        <AssignMaintenanceModal
          isOpen={assignOpen}
          item={assignItem}
          onClose={() => {
            setAssignOpen(false);
            setAssignItem(null);
          }}
          onSaved={(updated) => {
            onSuccess?.("La tarea fue asignada correctamente al responsable.");
            if (updated) {
              onUpdateOptimistic?.(updated.id, updated);
            }
            setSelected({});
            setAssignOpen(false);
            setAssignItem(null);
          }}
        />

        {/* Modal de reasignación */}
        <ReassignMaintenanceModal
          isOpen={reassignOpen}
          item={reassignItem}
          onClose={() => {
            setReassignOpen(false);
            setReassignItem(null);
          }}
          onSaved={(updated) => {
            onSuccess?.("La tarea fue reasignada correctamente.");
            if (updated) {
              onUpdateOptimistic?.(updated.id, updated);
            }
            setReassignOpen(false);
            setReassignItem(null);
          }}
        />
      </>
    );
  }
);

export default MaintenanceTable;
