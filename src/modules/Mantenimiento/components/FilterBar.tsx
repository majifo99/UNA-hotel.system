import { FiSearch } from "react-icons/fi";
import { CalendarDays, UserPlus2 } from "lucide-react"; // UserPlus2 = “asignar técnico”
import type { MaintenanceStatus } from "../types/mantenimiento";

type Props = Readonly<{
  query: string;
  onQuery: (v: string) => void;
  status?: MaintenanceStatus | "Todos";
  onStatus?: (v: MaintenanceStatus | "Todos") => void;
  total: number;
  onNew?: () => void;         // <- se usa para abrir el modal de asignar
  onOpenDate?: () => void;
}>;

export function FilterBar({
  query,
  onQuery,
  onNew,
  onOpenDate,
}: Props) {
  const searchId = "search-input";

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-5 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Buscar */}
        <div className="relative">
          <label htmlFor={searchId} className="sr-only">Buscar mantenimiento</label>
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id={searchId}
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Buscar por habitación, código, tipo…"
            className="w-72 md:w-96 h-10 rounded-lg border border-slate-300/60 bg-white/90 py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 outline-none focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
          />
        </div>

        {/* Acciones derechas */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenDate}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white/90 hover:bg-white shadow-sm"
          >
            <CalendarDays className="h-4 w-4" />
            Hoy
          </button>

          <button
            type="button"
            onClick={onNew}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white bg-[#7C4DFF] hover:bg-[#6c3fff] shadow-sm"
            aria-label="Asignar técnico"
            title="Asignar técnico"
          >
            <UserPlus2 className="h-4 w-4" />
            Asignar técnico
          </button>
        </div>
      </div>
    </div>
  );
}

export default FilterBar;
