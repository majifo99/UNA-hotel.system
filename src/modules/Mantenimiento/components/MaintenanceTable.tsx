"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Eye, Calendar } from "lucide-react";
import type { MantenimientoItem, Prioridad } from "../types/mantenimiento";
import MantenimientoDetailModal from "../components/modals/MantenimientoDetailModal";
import AssignMaintenanceModal from "../components/modals/AssignMantenimiento";

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

function getInitials(name?: string) {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}

const fmtDate = (iso?: string | null) =>
  iso
    ? new Date(iso)
        .toLocaleDateString("es-CR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        .replace(".", "")
    : "—";

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
function Th({
  children = null,
  className = "",
}: Readonly<{ children?: React.ReactNode; className?: string }>) {
  return <th className={`${HEAD_BASE} ${className}`}>{children}</th>;
}
function Td({
  children = null,
  className = "",
}: Readonly<{ children?: React.ReactNode; className?: string }>) {
  return (
    <td
      className={`px-5 py-5 align-top text-[14px] text-slate-700 ${className}`}
    >
      {children}
    </td>
  );
}

/* ---------------------------- Componente principal ---------------------------- */

const MaintenanceTable = forwardRef<MaintenanceTableRef, MaintenanceTableProps>(
  function MaintenanceTable(
    { items, loading = false, onSelectionChange, onRequestRefresh, onSuccess },
    ref
  ) {
    const [selected, setSelected] = useState<Record<number, boolean>>({});
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailId, setDetailId] = useState<number | null>(null);

    const [assignOpen, setAssignOpen] = useState(false);
    const [assignItem, setAssignItem] = useState<MantenimientoItem | null>(null);

    /* --------------------------- Efectos de selección --------------------------- */

    // Depura selección cuando cambian los items
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

    // Notificar cantidad seleccionada
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
            <td colSpan={7} className="px-5 py-14 text-center text-slate-500">
              Cargando mantenimiento…
            </td>
          </tr>
        );
      }

      if (!items.length) {
        return (
          <tr>
            <td colSpan={7} className="px-5 py-14 text-center text-slate-500">
              No hay resultados para los filtros aplicados.
            </td>
          </tr>
        );
      }

      return items.map((i) => {
        const metaCode = `MNT-${String(i.id).padStart(3, "0")}`;
        const roomNumber = i.habitacion?.numero ?? "—";
        const prioridadLabel = prioridadToLabel(i.prioridad) ?? "Media";
        const responsable =
          i.usuario_asignado?.nombre ?? i.usuario_reporta?.nombre ?? null;

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

            <Td className="pl-2 pr-2">
              <div className="font-semibold text-slate-900 leading-5">
                Mantenimiento
              </div>
              <div className="mt-1 text-[12px]">
                <button
                  type="button"
                  onClick={() => openDetail(i.id)}
                  className="font-medium text-emerald-700 hover:underline"
                  title="Ver detalle"
                >
                  {metaCode}
                </button>
              </div>
            </Td>

            <Td>
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-slate-600 text-white grid place-items-center font-semibold">
                  {getInitials(responsable ?? undefined) || "P"}
                </div>
                <div className="text-slate-800 truncate">
                  {responsable ?? (
                    <span className="text-slate-400">Sin asignar</span>
                  )}
                </div>
              </div>
            </Td>

            <Td>
              <div className="flex items-start gap-2">
                <span className="mt-1 text-slate-500">
                  <Calendar className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="font-medium text-slate-800 whitespace-nowrap">
                    {fmtDate(i.fecha_inicio)}
                  </div>
                </div>
              </div>
            </Td>

            <Td className="align-middle">
              <PriorityPill label={prioridadLabel} />
            </Td>

            <Td className="align-middle">
              <div className="flex items-center justify-end gap-3 text-slate-500">
                <button
                  title="Ver"
                  className="hover:text-emerald-700 transition-colors"
                  onClick={() => openDetail(i.id)}
                >
                  <Eye className="h-4 w-4" />
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
                <col className="w-10" />
                <col className="w-[23%]" />
                <col className="w-[25%]" />
                <col className="w-[17%]" />
                <col className="w-[14%]" />
                <col className="w-[12%]" />
                <col className="w-[9%]" />
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
                  <Th className="text-white">Tarea</Th>
                  <Th className="text-white">Responsable</Th>
                  <Th className="text-white">Programado</Th>
                  <Th className="text-white">Prioridad</Th>
                  <Th className="text-right text-white">Acciones</Th>
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
          onClose={() => setDetailOpen(false)}
        />

        {/* Modal de asignación */}
        <AssignMaintenanceModal
          isOpen={assignOpen}
          item={assignItem}
          onClose={() => {
            setAssignOpen(false);
            setAssignItem(null);
          }}
          onSaved={(_updated) => {
            // mostramos éxito (opcional)
            onSuccess?.("La tarea fue asignada correctamente al responsable.");
            // limpiamos selección
            setSelected({});
            // cerramos modal
            setAssignOpen(false);
            setAssignItem(null);
            // 🔄 refrescamos datos del hook padre
            onRequestRefresh?.();
          }}
        />
      </>
    );
  }
);

export default MaintenanceTable;
