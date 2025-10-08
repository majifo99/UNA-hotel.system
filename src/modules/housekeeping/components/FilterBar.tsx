import React, { useState, useCallback, useId } from "react";
import {
  FiSearch,
  FiChevronDown,
  FiChevronUp,
  FiSliders,
  FiCheckCircle,
  FiXCircle,
  FiLayers,
  FiX,
} from "react-icons/fi";

const BRAND_GREEN = "#304D3C";         // mismo verde del header de la tabla
const BRAND_GREEN_HOVER = "#263A2E";   // un poco más oscuro para hover

export type RoomFilters = {
  search: string;
  status: "" | "limpia" | "sucia";
  priority: "" | "baja" | "media" | "alta" | "urgente";
  assigned: string;
};

type FilterBarProps = {
  /** Estado actual de filtros (no mutar directamente) */
  filters: Readonly<RoomFilters>;
  /** Setter provisto por el padre */
  setFilters: React.Dispatch<React.SetStateAction<RoomFilters>>;
  totalRooms: number;
  shownRooms?: number;
  disabled?: boolean;
  assignedOptions?: ReadonlyArray<string>;
};

/** Item de segmentado (chip) */
function SegItem(props: Readonly<{
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}>) {
  const { active, onClick, children, disabled } = props;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex shrink-0 items-center gap-2 px-3 h-9 rounded-md text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[${BRAND_GREEN}] ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      style={{
        backgroundColor: active ? BRAND_GREEN : undefined,
        color: active ? "#FFFFFF" : undefined,
      }}
      onMouseEnter={(e) => {
        if (!disabled && active) (e.currentTarget.style.backgroundColor = BRAND_GREEN_HOVER);
      }}
      onMouseLeave={(e) => {
        if (active) (e.currentTarget.style.backgroundColor = BRAND_GREEN);
      }}
    >
      {!active && <span className="text-slate-600 group-hover:text-slate-700" />}
      {children}
    </button>
  );
}

export default function FilterBar({
  filters,
  setFilters,
  totalRooms,
  shownRooms,
  disabled = false,
  assignedOptions = [],
}: Readonly<FilterBarProps>) {
  const [isOpen, setIsOpen] = useState(false);

  // IDs accesibles
  const searchId = useId();
  const priorityId = useId();
  const assignedId = useId();

  const handleChange =
    (key: keyof RoomFilters) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFilters((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const handleClear = useCallback(() => {
    setFilters({ search: "", status: "", priority: "", assigned: "" });
  }, [setFilters]);

  const setStatus = (status: "" | "limpia" | "sucia") =>
    setFilters((prev) => ({ ...prev, status }));

  const totalFmt = Number.isFinite(totalRooms) && totalRooms > 0 ? totalRooms : 0;
  const headerText =
    shownRooms != null ? `${shownRooms} de ${totalFmt} habitaciones` : `${totalFmt} habitaciones`;

  return (
    <section className="rounded-xl border border-slate-200 bg-white/70 backdrop-blur-sm">
      {/* Fila 1 - buscador */}
      <div className="px-4 pt-3">
        <div className="relative">
          <label htmlFor={searchId} className="sr-only">
            Buscar habitación
          </label>
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id={searchId}
            type="text"
            value={filters.search}
            onChange={handleChange("search")}
            placeholder="Buscar habitación por número…"
            disabled={disabled}
            className="w-full h-10 pl-9 pr-3 rounded-md border border-slate-300 text-sm text-slate-700 focus:ring-2 focus:ring-[--ring] focus:border-[--ring] outline-none bg-white"
            style={{ ["--ring" as any]: BRAND_GREEN }}
          />
        </div>
      </div>

      {/* Fila 2 - filtros y acciones */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-4 pb-3 pt-3">
        {/* Segmentado (scroll-x en móvil) */}
        <div className="-mx-2 md:mx-0">
          <div className="flex items-center gap-2 overflow-x-auto px-2 no-scrollbar">
            <SegItem
              active={filters.status === ""}
              onClick={() => setStatus("")}
              disabled={disabled}
            >
              <FiLayers className="h-4 w-4" />
              Todas
            </SegItem>
            <SegItem
              active={filters.status === "limpia"}
              onClick={() => setStatus("limpia")}
              disabled={disabled}
            >
              <FiCheckCircle className="h-4 w-4" />
              Limpias
            </SegItem>
            <SegItem
              active={filters.status === "sucia"}
              onClick={() => setStatus("sucia")}
              disabled={disabled}
            >
              <FiXCircle className="h-4 w-4" />
              Sucias
            </SegItem>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 px-2">{headerText}</span>

          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            disabled={disabled}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ ["--tw-ring-color" as any]: BRAND_GREEN }}
            aria-expanded={isOpen}
            aria-controls="advanced-filters"
          >
            <FiSliders className="h-4 w-4" />
            Avanzada
            {isOpen ? <FiChevronUp /> : <FiChevronDown />}
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-md text-sm text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ ["--tw-ring-color" as any]: BRAND_GREEN }}
          >
            <FiX className="h-4 w-4" />
            Limpiar
          </button>
        </div>
      </div>

      {/* Panel avanzada */}
      <div
        id="advanced-filters"
        className={`transition-[max-height,opacity] duration-300 ${
          isOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden border-t border-slate-100`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 px-4 py-3 bg-slate-50/40">
          <div className="flex items-center gap-2">
            <label htmlFor={priorityId} className="text-sm text-slate-700">
              Prioridad
            </label>
            <select
              id={priorityId}
              value={filters.priority}
              onChange={handleChange("priority")}
              disabled={disabled}
              className="flex-1 h-9 rounded-md border border-slate-300 text-sm text-slate-700 bg-white focus:ring-2 focus:ring-[--ring] focus:border-[--ring] outline-none"
              style={{ ["--ring" as any]: BRAND_GREEN }}
            >
              <option value="">Todas</option>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor={assignedId} className="text-sm text-slate-700">
              Asignado
            </label>
            <select
              id={assignedId}
              value={filters.assigned}
              onChange={handleChange("assigned")}
              disabled={disabled || assignedOptions.length === 0}
              className="flex-1 h-9 rounded-md border border-slate-300 text-sm text-slate-700 bg-white focus:ring-2 focus:ring-[--ring] focus:border-[--ring] outline-none"
              style={{ ["--ring" as any]: BRAND_GREEN }}
            >
              <option value="">Todos</option>
              {assignedOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Columna libre para crecer futuro (ej: piso, tipo, etc.) */}
          <div className="hidden lg:flex items-center justify-end pr-1">
            {/* espacio reservado para futuros filtros */}
          </div>
        </div>
      </div>
    </section>
  );
}
