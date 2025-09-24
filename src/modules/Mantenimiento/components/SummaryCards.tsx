import type { MaintenanceStatus } from "../types/mantenimiento";

/** Estados permitidos para el filtro */
export type AllOrStatus = MaintenanceStatus | "Todos";

/** Contadores por estado */
export type StatusCounts = Readonly<{
  all: number;
  pending: number;
  inProgress: number;
  done: number;
}>;

/** Props del componente */
export type SummaryChipsProps = Readonly<{
  status: AllOrStatus;
  onStatus: (s: AllOrStatus) => void;
  counts: StatusCounts;
}>;

/** Chip reutilizable */
type ChipProps = Readonly<{
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
  activeClasses: string;
  idleClasses: string;
}>;

function Chip({
  active,
  label,
  count,
  onClick,
  activeClasses,
  idleClasses,
}: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition",
        active ? activeClasses : idleClasses,
      ].join(" ")}
    >
      <span>{label}</span>
      <span
        className={[
          "ml-1 inline-flex min-w-[1.5rem] justify-center rounded-s px-1.5 py-0.5 text-xs font-semibold",
          active ? "bg-white/80 text-slate-800" : "bg-white text-slate-700",
        ].join(" ")}
      >
        {count}
      </span>
    </button>
  );
}

/** Summary chips como botones de filtro */
export default function SummaryChips({
  status,
  onStatus,
  counts,
}: SummaryChipsProps) {
  return (
    <div
      aria-label="Filtros por estado (resumen)"
      className="flex flex-wrap items-center gap-2"
    >
      <Chip
        active={status === "Todos"}
        label="Todos"
        count={counts.all}
        onClick={() => onStatus("Todos")}
        activeClasses="ring-1 ring-slate-300 bg-white text-slate-800"
        idleClasses="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
      />
      <Chip
        active={status === "Pendiente"}
        label="Pendientes"
        count={counts.pending}
        onClick={() => onStatus("Pendiente")}
        activeClasses="bg-rose-100 text-rose-800 ring-1 ring-rose-200"
        idleClasses="bg-rose-50/70 hover:bg-rose-50 text-rose-700 border border-rose-100"
      />
      <Chip
        active={status === "En Proceso"}
        label="En proceso"
        count={counts.inProgress}
        onClick={() => onStatus("En Proceso")}
        activeClasses="bg-indigo-100 text-indigo-800 ring-1 ring-indigo-200"
        idleClasses="bg-indigo-50/70 hover:bg-indigo-50 text-indigo-700 border border-indigo-100"
      />
      <Chip
        active={status === "Completado"}
        label="Completados"
        count={counts.done}
        onClick={() => onStatus("Completado")}
        activeClasses="bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200"
        idleClasses="bg-emerald-50/70 hover:bg-emerald-50 text-emerald-700 border border-emerald-100"
      />
    </div>
  );
}
