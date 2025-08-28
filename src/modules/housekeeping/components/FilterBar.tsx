import { useState } from "react";
import { FiSearch, FiChevronDown, FiChevronUp, FiSliders } from "react-icons/fi";

export type RoomFilters = {
  search: string;
  status: string;
  type: string;
  floor: string;
};

type FilterBarProps = {
  filters: RoomFilters;
  setFilters: (filters: RoomFilters) => void;
  totalRooms: number;
};

export default function FilterBar({ filters, setFilters, totalRooms }: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-lg px-4 py-3 border border-slate-200/60">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Buscar */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Buscar habitación por número..."
              className="w-64 h-9 rounded-lg border border-slate-300/60 bg-white/80 py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 outline-none focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
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
            <FiSliders className="h-5 w-5 text-slate-500 group-hover:text-slate-700" />
            <span>Búsqueda avanzada</span>
            {isOpen ? (
              <FiChevronUp className="h-4 w-4 text-slate-500 group-hover:text-slate-700" />
            ) : (
              <FiChevronDown className="h-4 w-4 text-slate-500 group-hover:text-slate-700" />
            )}
          </button>
        </div>

        {/* Contador visual dinámico */}
        <div className="text-xs text-slate-500">{totalRooms} habitaciones</div>
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
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="h-9 rounded-lg border border-slate-300 bg-white/80 px-3 text-sm text-slate-700 hover:bg-white focus:outline-none"
            >
              <option value="">Todos los estados</option>
              <option value="Disponible">Disponible</option>
              <option value="Ocupada">Ocupada</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En limpieza">En limpieza</option>
              <option value="Inspección">Inspección</option>
              <option value="Fuera de servicio">Fuera de servicio</option>
            </select>

            {/* Tipo */}
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="h-9 rounded-lg border border-slate-300 bg-white/80 px-3 text-sm text-slate-700 hover:bg-white focus:outline-none"
            >
              <option value="">Todos los tipos</option>
              <option value="Sencilla">Sencilla</option>
              <option value="Doble">Doble</option>
              <option value="Suite">Suite</option>
              <option value="King">King</option>
            </select>

            {/* Piso */}
            <select
              value={filters.floor}
              onChange={(e) => setFilters({ ...filters, floor: e.target.value })}
              className="h-9 rounded-lg border border-slate-300 bg-white/80 px-3 text-sm text-slate-700 hover:bg-white focus:outline-none"
            >
              <option value="">Todos los pisos</option>
              <option value="1">Piso 1</option>
              <option value="2">Piso 2</option>
              <option value="3">Piso 3</option>
              <option value="4">Piso 4</option>
            </select>

            {/* Limpiar */}
            <button
              onClick={() =>
                setFilters({ search: "", status: "", type: "", floor: "" })
              }
              className="h-9 inline-flex items-center rounded-lg border border-slate-300 bg-white/80 px-3 text-sm text-slate-700 hover:bg-white"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
