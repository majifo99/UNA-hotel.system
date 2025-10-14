"use client";

import { FiSearch } from "react-icons/fi";
import { CalendarDays, UserPlus2 } from "lucide-react";
import type { StatusFilter } from "../types/mantenimiento";
import React, { useId } from "react";

const BRAND_GREEN = "#304D3C";
const BRAND_GREEN_HOVER = "#263A2E";

type Props = Readonly<{
  query: string;
  onQuery: (v: string) => void;

  status: StatusFilter;
  onStatus: (v: StatusFilter) => void;

  total: number;
  onNew?: () => void;
  onOpenDate?: () => void;

  /** nuevo: cantidad seleccionada en la tabla */
  selectedCount?: number;
}>;

function SegItem({
  active,
  onClick,
  children,
  disabled,
}: Readonly<{ active?: boolean; onClick?: () => void; children: React.ReactNode; disabled?: boolean }>) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex shrink-0 items-center gap-2 px-3 h-9 rounded-md text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      style={{
        backgroundColor: active ? BRAND_GREEN : undefined,
        color: active ? "#FFFFFF" : undefined,
        boxShadow: active ? "0 1px 0 rgba(0,0,0,.04)" : undefined,
      }}
      onMouseEnter={(e) => {
        if (!disabled && active) (e.currentTarget.style.backgroundColor = BRAND_GREEN_HOVER);
      }}
      onMouseLeave={(e) => {
        if (active) (e.currentTarget.style.backgroundColor = BRAND_GREEN);
      }}
    >
      {children}
    </button>
  );
}

export function FilterBar({ query, onQuery, status, onStatus, total, onNew, onOpenDate, selectedCount = 0 }: Props) {
  const searchId = useId();

  const setStatus = (next: StatusFilter) => {
    if (next !== status) onStatus(next);
  };

  const disabledAssign = selectedCount === 0;

  return (
    <section className="rounded-xl border border-slate-200 bg-white/70 backdrop-blur-sm">
      {/* Fila 1 - Buscador */}
      <div className="px-4 pt-3">
        <div className="relative">
          <label htmlFor={searchId} className="sr-only">
            Buscar mantenimiento
          </label>
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id={searchId}
            type="text"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Buscar por habitación, técnico, prioridad…"
            className="w-full h-10 pl-9 pr-3 rounded-md border border-slate-300 text-sm text-slate-700 focus:ring-2 focus:border-[--ring] outline-none bg-white"
            style={{ ["--ring" as any]: BRAND_GREEN }}
          />
        </div>
      </div>

      {/* Fila 2 - Segmentado + Acciones */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-4 pb-3 pt-3">
        <div className="-mx-2 md:mx-0">
          <div className="flex items-center gap-2 overflow-x-auto px-2 no-scrollbar">
            <SegItem active={status === "Todos"} onClick={() => setStatus("Todos")}>Todos</SegItem>
            <SegItem active={status === "Pendiente"} onClick={() => setStatus("Pendiente")}>Pendiente</SegItem>
            <SegItem active={status === "En Proceso"} onClick={() => setStatus("En Proceso")}>En Proceso</SegItem>
            <SegItem active={status === "Completado"} onClick={() => setStatus("Completado")}>Completado</SegItem>
          </div>
        </div>

        {/* Acciones + Total */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 px-2">
            Total: <strong className="text-slate-900">{total}</strong>
          </span>

          <button
            type="button"
            onClick={onOpenDate}
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-md border border-slate-300 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 shadow-sm"
          >
            <CalendarDays className="h-4 w-4" />
            Hoy
          </button>

          <button
            type="button"
            onClick={onNew}
            disabled={disabledAssign}
            className={`inline-flex items-center gap-2 h-9 px-4 rounded-md text-sm font-semibold text-white shadow-sm ${
              disabledAssign ? "opacity-60 cursor-not-allowed" : ""
            }`}
            style={{ backgroundColor: BRAND_GREEN }} 
            onMouseEnter={(e) => !disabledAssign && (e.currentTarget.style.backgroundColor = BRAND_GREEN_HOVER)}
            onMouseLeave={(e) => !disabledAssign && (e.currentTarget.style.backgroundColor = BRAND_GREEN)}
            aria-label="Asignar técnico"
            title={disabledAssign ? "Selecciona al menos 1 tarea" : "Asignar técnico"}
          >
            <UserPlus2 className="h-4 w-4" />
            Asignar técnico{selectedCount > 0 ? ` (${selectedCount})` : ""}
          </button>
        </div>
      </div>
    </section>
  );
}

export default FilterBar;
