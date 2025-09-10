import { FiSearch, FiSliders } from "react-icons/fi";
import type { MaintenanceStatus } from "../types/mantenimiento";
import { Users } from "lucide-react";

export function FilterBar({
  query,
  onQuery,
  total,
}: Readonly<{
  query: string;
  onQuery: (v: string) => void;
  status: MaintenanceStatus | "Todos";
  onStatus: (v: MaintenanceStatus | "Todos") => void;
  total: number;
}>) {

  const searchId = "search-input";

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-lg px-4 py-3 border border-slate-200/60">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Buscar */}
          <div className="relative">
            <label htmlFor="search-input" className="sr-only">Buscar habitación por número</label>
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
           
            <input
              id={searchId}
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Buscar por habitación, código, tipo..."
              className="w-72 md:w-96 h-10 rounded-lg border border-slate-300/60 bg-white/80 py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 outline-none focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
            />
          </div>

          {/* Búsqueda avanzada */}
          <button
            type="button"
             className="group inline-flex items-center gap-2 text-[15px] font-medium text-slate-600 hover:text-slate-800"
          >
            <FiSliders className="h-5 w-5 text-slate-500 group-hover:text-slate-700" />
            <span>Búsqueda avanzada</span>
          </button>

   
        
        </div>

        {/* Total */}
        <div className="text-sm text-gray-600">Total: {total} mantenimientos</div>
      </div>

      {/* Acciones */}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
        className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-sm"
        >
        <Users className="h-4 w-4" />
          Nueva solicitud
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium border border-slate-300 text-slate-700 bg-white/80 hover:bg-white shadow-sm"
        >
          Asignar mantenimiento
        </button>
        <button
          type="button"
           className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium border border-slate-300 text-slate-700 bg-white/80 hover:bg-white shadow-sm"
        >
          Generar reporte
        </button>
      </div>
    </div>
  );
}
