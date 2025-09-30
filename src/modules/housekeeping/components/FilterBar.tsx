// src/modules/housekeeping/components/FilterBar.tsx


import { useState, useCallback } from "react";
import { FiSearch, FiChevronDown, FiChevronUp, FiSliders } from "react-icons/fi";

export type RoomFilters = {
  search: string; // número de habitación (texto libre)
  status: string; // "" | "Sucia" | "Limpia"
  type: string;   // "" | "Sencilla" | "Doble" | "Suite" | "King"
  floor: string;  // "" | "1" | "2" | ...
};

type FilterBarProps = Readonly<{
  filters: RoomFilters;
  setFilters: (filters: RoomFilters) => void;
  totalRooms: number; // pasa aquí el conteo (total o filtrado, como prefieras mostrar)
}>;

export default function FilterBar({ filters, setFilters, totalRooms }: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange =
    (key: keyof RoomFilters) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFilters({ ...filters, [key]: e.target.value });
    };

  const handleClear = useCallback(() => {
    setFilters({ search: "", status: "", type: "", floor: "" });
  }, [setFilters]);

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-lg px-4 py-3 border border-slate-200/60">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Buscar */}
          <div className="relative">
            <label htmlFor="search-input" className="sr-only">
              Buscar habitación por número
            </label>
            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="search-input"
              value={filters.search}
              onChange={handleChange("search")}
              placeholder="Buscar habitación por número..."
              className="w-64 h-9 rounded-lg border border-slate-300/60 bg-white/80 py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 outline-none focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
              inputMode="numeric"
              aria-label="Buscar habitación por número"
            />
          </div>

          {/* Toggle búsqueda avanzada */}
          <button
            type="button"
            onClick={() => setIsOpen((o) => !o)}
            aria-expanded={isOpen}
            aria-controls="advanced-filters"
            className="group inline-flex items-center gap-2 text-[15px] font-medium text-slate-600 hover:text-slate-800"
          >
            <FiSliders className="h-5 w-5 text-slate-500 group-hover:text-slate-700" aria-hidden="true" />
            <span>Búsqueda avanzada</span>
            {isOpen ? (
              <FiChevronUp className="h-4 w-4 text-slate-500 group-hover:text-slate-700" aria-hidden="true" />
            ) : (
              <FiChevronDown className="h-4 w-4 text-slate-500 group-hover:text-slate-700" aria-hidden="true" />
            )}
          </button>
        </div>

        <div className="text-xs text-slate-500" aria-live="polite">
          {totalRooms} habitaciones
        </div>
      </div>

      {/* Acordeón búsqueda avanzada */}
      <div
        id="advanced-filters"
        className={`grid transition-[grid-template-rows] duration-300 ease-out overflow-hidden ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0">
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-sm text-slate-600">Filtros:</span>

            {/* Estado */}
            <div className="flex items-center gap-2">
              <label htmlFor="status-select" className="text-sm text-slate-600">
                Estado
              </label>
              <select
                id="status-select"
                value={filters.status}
                onChange={handleChange("status")}
                className="h-9 rounded-lg border border-slate-300 bg-white/80 px-3 text-sm text-slate-700 hover:bg-white focus:outline-none"
              >
                <option value="">Todos los estados</option>
                <option value="Sucia">Sucia</option>
                <option value="Limpia">Limpia</option>
              </select>
            </div>

            {/* Tipo */}
            <div className="flex items-center gap-2">
              <label htmlFor="type-select" className="text-sm text-slate-600">
                Tipo
              </label>
              <select
                id="type-select"
                value={filters.type}
                onChange={handleChange("type")}
                className="h-9 rounded-lg border border-slate-300 bg-white/80 px-3 text-sm text-slate-700 hover:bg-white focus:outline-none"
              >
                <option value="">Todos los tipos</option>
                <option value="Sencilla">Sencilla</option>
                <option value="Doble">Doble</option>
                <option value="Suite">Suite</option>
                <option value="King">King</option>
              </select>
            </div>

            {/* Piso */}
            <div className="flex items-center gap-2">
              <label htmlFor="floor-select" className="text-sm text-slate-600">
                Piso
              </label>
              <select
                id="floor-select"
                value={filters.floor}
                onChange={handleChange("floor")}
                className="h-9 rounded-lg border border-slate-300 bg-white/80 px-3 text-sm text-slate-700 hover:bg-white focus:outline-none"
              >
                <option value="">Todos los pisos</option>
                <option value="1">Piso 1</option>
                <option value="2">Piso 2</option>
                {/* añade más pisos si aplica */}
              </select>
            </div>

            {/* Limpiar */}
            <button
              type="button"
              onClick={handleClear}
              className="h-9 inline-flex items-center rounded-lg border border-slate-300 bg-white/80 px-3 text-sm text-slate-700 hover:bg-white"
              aria-label="Limpiar filtros"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
