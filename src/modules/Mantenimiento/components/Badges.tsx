import type { MaintenancePriority, MaintenanceStatus } from "../types/mantenimiento";

export function StatusBadge({ status }: Readonly<{ status: MaintenanceStatus }>) {
  const map: Record<MaintenanceStatus, string> = {
    Pendiente: "bg-rose-100 text-rose-700",
    "En Proceso": "bg-indigo-100 text-indigo-700",
    Completado: "bg-emerald-100 text-emerald-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${map[status]}`}>
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }: Readonly<{ priority: MaintenancePriority }>) {
  const map: Record<MaintenancePriority, string> = {
    Baja: "bg-emerald-100 text-emerald-800",
    Media: "bg-purple-100 text-purple-800",
    Alta: "bg-orange-100 text-orange-800",
    Urgente: "bg-rose-100 text-rose-800",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${map[priority]}`}>
      {priority}
    </span>
  );
}
