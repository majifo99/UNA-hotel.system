"use client";

import { useMemo, useEffect, useState, useCallback } from "react";
import { UserCheck, MoreHorizontal, Eye, RefreshCw, AlertTriangle, Pencil } from "lucide-react";
import type { Prioridad, LimpiezaItem } from "../types/limpieza";
import { useLimpiezasTable } from "../hooks/useLimpiezasTable";
import type { ColumnKey, SortKey } from "../types/table";

import LimpiezaDetailModal from "./Modals/LimpiezaDetailModal";
import CleanToggle, { type FinalizePayload } from "./CleanToggle";

const cn = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(" ");

function Pill({
  children,
  tone = "slate",
}: Readonly<{ children: React.ReactNode; tone?: "slate" | "blue" | "orange" | "rose" | "teal" }>) {
  const map = {
    slate: "bg-slate-50 border-slate-200 text-slate-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
    rose: "bg-rose-50 border-rose-200 text-rose-700",
    teal: "bg-teal-50 border-teal-200 text-teal-700",
  } as const;
  return <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium border", map[tone])}>{children}</span>;
}

function PrioridadBadge({ prioridad }: Readonly<{ prioridad?: Prioridad | null }>) {
  if (!prioridad) return <Pill>—</Pill>;
  const tone: Record<Prioridad, "slate" | "blue" | "orange" | "rose"> = {
    baja: "slate",
    media: "blue",
    alta: "orange",
    urgente: "rose",
  };
  return <Pill tone={tone[prioridad]}>{prioridad.toUpperCase()}</Pill>;
}

function EstadoBadge({ clean }: Readonly<{ clean: boolean }>) {
  return <Pill tone={clean ? "teal" : "rose"}>{clean ? "Limpia" : "Sucia"}</Pill>;
}

export type SelectedRoom = {
  id: number;
  numero?: string;
  piso?: string | number;
  tipoNombre?: string;
};

type Props = {
  onEdit?: (item: LimpiezaItem) => void;
  onSelectionChange?: (room: SelectedRoom | null) => void;
};

const SORT_MAP: Record<ColumnKey | "descripcion" | "notas" | "habitacion", SortKey | null> = {
  numero: "habitacion",
  tipo: "tipo",
  piso: "piso",
  estado: "estado",
  prioridad: "prioridad",
  asignador: null,
  fecha_inicio: null,
  fecha_final: null,
  descripcion: null,
  notas: null,
  habitacion: "habitacion",
};

function getRowId(item: any): number {
  return item.id_limpieza ?? item.id;
}
function getEstado(item: any): { nombre?: string } | undefined {
  return item.estadoHabitacion ?? item.estado;
}

export default function LimpiezasTable({ onEdit, onSelectionChange }: Readonly<Props>) {
  const {
    loading,
    error,
    items,
    pagination,
    selectedIds,
    toggleOne,
    toggleAllPage,
    gotoPage,
    handleSort,
    finalizarLimpieza,
  } = useLimpiezasTable({ initialFilters: { per_page: 10, pendientes: false } });

  const totalPages = pagination.last_page;

  const columns = useMemo<
    ReadonlyArray<{ key: ColumnKey | "descripcion" | "notas" | "habitacion"; label: string }>
  >(
    () => [
      { key: "habitacion", label: "Habitación" },
      { key: "estado", label: "Estado" },
      { key: "prioridad", label: "Prioridad" },
      { key: "asignador", label: "Asignador" },
      { key: "notas", label: "Notas" },
      { key: "descripcion", label: "Descripción" },
    ],
    []
  );

  // UI optimista para LIMPIA/SUCIA
  const [optimisticCleanIds, setOptimisticCleanIds] = useState<Set<number>>(new Set());
  const addOptimistic = (id: number) => setOptimisticCleanIds((prev) => new Set(prev).add(id));
  const removeOptimistic = (id: number) =>
    setOptimisticCleanIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

  // wrapper para compatibilizar firma con CleanToggle (notas opcional)
  const handleFinalizeForToggle = useCallback(
    async (id: number, payload: FinalizePayload) => {
      await finalizarLimpieza(id, {
        fecha_final: payload.fecha_final,
        notas: payload.notas ?? null,
      });
    },
    [finalizarLimpieza]
  );

  // menú por fila
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  useEffect(() => {
    const close = () => setOpenMenuId(null);
    if (openMenuId !== null) document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openMenuId]);

  // estado para el modal de detalles
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
    const firstWithRoom = selectedRows.find(
      (r) => typeof r?.habitacion?.id === "number" || typeof r?.habitacion?.id === "string"
    );
    if (!firstWithRoom) return onSelectionChange(null);

    const rawId = firstWithRoom.habitacion!.id;
    const numericId = typeof rawId === "number" ? rawId : Number(rawId);

    const room: SelectedRoom = {
      id: numericId,
      numero: firstWithRoom.habitacion?.numero,
      piso: firstWithRoom.habitacion?.piso,
      tipoNombre: firstWithRoom.habitacion?.tipo?.nombre,
    };
    onSelectionChange(room);
  }, [selectedIds, items, onSelectionChange]);

  if (loading && items.length === 0) return <div className="text-center text-slate-500 py-10 text-sm">Cargando…</div>;
  if (error) return <div className="text-center text-rose-600 py-10 text-sm">Error: {error}</div>;
  if (items.length === 0) return <div className="text-center text-slate-500 py-10 text-sm">No hay limpiezas para mostrar.</div>;

  const HEAD_BASE = "p-4 font-medium text-gray-700 capitalize text-left";

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <colgroup>
            <col className="w-12" />
            <col className="w-[16%]" />
            <col className="w-[9%]" />
            <col className="w-[12%]" />
            <col className="w-[16%]" />
            <col className="w-[16%]" />
            <col className="w-[16%]" />
            <col className="w-[110px]" />
          </colgroup>

          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={items.length > 0 && items.every((r) => selectedIds.includes(getRowId(r)))}
                  onChange={toggleAllPage}
                  className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
              </th>

              {columns.map((c) => {
                const sortKey = SORT_MAP[c.key];
                const isSortable = Boolean(sortKey);
                return (
                  <th key={c.key} className={HEAD_BASE}>
                    {isSortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(sortKey as SortKey)}
                        className="flex items-center gap-1 hover:text-slate-900 transition-colors"
                      >
                        {c.label}
                      </button>
                    ) : (
                      <span>{c.label}</span>
                    )}
                  </th>
                );
              })}

              <th className={HEAD_BASE + " text-right"}>Acciones</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-slate-100">
            {items.map((raw) => {
              const item: any = raw;
              const id = getRowId(item);
              const isSelected = selectedIds.includes(id);

              const numero = item.habitacion?.numero ?? "—";
              const tipo = item.habitacion?.tipo?.nombre ?? "—";
              const pisoVal = item.habitacion?.piso ?? "—";
              const pisoFmt = pisoVal === "—" ? "—" : `Piso ${String(pisoVal)}`;

              const estado = getEstado(item);
              const estadoNombre = estado?.nombre;

              const clean =
                optimisticCleanIds.has(id) ||
                Boolean(item.fecha_final) ||
                (estadoNombre ?? "").toLowerCase() === "limpia";

              return (
                <tr key={id} className={cn("hover:bg-slate-50/50 transition-colors", isSelected && "bg-teal-50/30")}>
                  {/* checkbox */}
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOne(id)}
                      className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                  </td>

                  {/* Habitación */}
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{numero}</span>
                      <span className="text-sm text-gray-600">
                        {tipo} • {pisoFmt}
                      </span>
                    </div>
                  </td>

                  {/* Estado */}
                  <td className="p-4">
                    <EstadoBadge clean={clean} />
                  </td>

                  {/* Prioridad */}
                  <td className="p-4">
                    <PrioridadBadge prioridad={item.prioridad ?? null} />
                  </td>

                  {/* Asignador */}
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {item.asignador ? (
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-teal-600" />
                        <span className="text-sm font-medium text-slate-700">{item.asignador.name}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-sm">—</span>
                    )}
                  </td>

                  {/* Notas */}
                  <td className="px-4 py-3 text-sm text-slate-700 truncate" title={item.notas ?? ""}>
                    {item.notas ?? <span className="text-slate-400">—</span>}
                  </td>

                  {/* Descripción */}
                  <td className="px-4 py-3 text-sm text-slate-700 truncate" title={item.descripcion ?? ""}>
                    {item.descripcion ?? <span className="text-slate-400">—</span>}
                  </td>

                  {/* Acciones: toggle + menú */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <CleanToggle
                        id={id}
                        clean={clean}
                        notas={item.notas ?? null}
                        onFinalize={handleFinalizeForToggle}
                        onOptimisticAdd={addOptimistic}
                        onOptimisticRemove={removeOptimistic}
                      />

                      {/* Menú tres puntos */}
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
                                onEdit?.(item);
                              }}
                            >
                              <Pencil className="w-4 h-4 text-slate-600" />
                              Editar
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
                            <button
                              role="menuitem"
                              className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                              onClick={() => {
                                setOpenMenuId(null);
                                alert(`Reportar problema en la habitación ${numero}`);
                              }}
                            >
                              <AlertTriangle className="w-4 h-4 text-rose-600" />
                              Reportar problema
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
          className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-teal-600 disabled:opacity-30"
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
              pagination.current_page === p ? "text-teal-700 font-semibold bg-slate-100" : "text-slate-500 hover:text-teal-600"
            )}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => gotoPage(pagination.current_page + 1)}
          disabled={pagination.current_page >= totalPages}
          className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-teal-600 disabled:opacity-30"
          aria-label="Página siguiente"
        >
          →
        </button>
      </div>

      {/* Modal de detalles */}
      <LimpiezaDetailModal
        open={detailOpen}
        limpiezaId={detailId}
        onClose={() => setDetailOpen(false)}
        onEdit={(itm) => {
          setDetailOpen(false);
          onEdit?.(itm);
        }}
        onMarkCompleted={async (id) => {
          await finalizarLimpieza(id, { fecha_final: new Date().toISOString(), notas: null });
        }}
      />
    </div>
  );
}
