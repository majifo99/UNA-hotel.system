import { useMemo, useState } from "react";
import {
  Eye,
  Edit3,
  MoreVertical,
  Link2,
  Calendar,
  MapPin,
  Clock3,
} from "lucide-react";
import { StatusBadge, PriorityBadge } from "./Badges";
import type { MaintenanceItem } from "../types/mantenimiento";

/** Diccionario para mostrar título y descripción sin tocar el tipo */
const TASK_TEXT: Record<string, { name: string; summary: string }> = {
  "MNT-001": {
    name: "Reparación de aire acondicionado",
    summary: "El aire acondicionado no enfría correctamente",
  },
  "MNT-002": {
    name: "Cambio de bombillas LED",
    summary: "Reemplazo programado de iluminación",
  },
  "MNT-003": {
    name: "Revisión de grifería",
    summary: "Mantenimiento preventivo completado",
  },
};

function getInitials(name?: string) {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}

function Th({
  children = null,
  className = "",
}: Readonly<{ children?: React.ReactNode; className?: string }>) {
  return (
    <th
      className={`px-5 py-3 text-[12px] font-semibold uppercase tracking-wide text-slate-600 ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children = null,
  className = "",
}: Readonly<{ children?: React.ReactNode; className?: string }>) {
  return (
    <td className={`px-5 py-5 align-top text-[14px] text-slate-700 ${className}`}>
      {children}
    </td>
  );
}

export function MaintenanceTable({
  items,
}: Readonly<{ items: MaintenanceItem[] }>) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const allChecked = useMemo(
    () => items.length > 0 && items.every((i) => selected[i.id]),
    [items, selected]
  );

  const toggleAll = () =>
    setSelected(allChecked ? {} : Object.fromEntries(items.map((i) => [i.id, true])));

  const toggleOne = (id: string) =>
    setSelected((s) => ({ ...s, [id]: !s[id] }));

  return (
    <div className="bg-white/90 backdrop-blur-sm border border-slate-200/70 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <colgroup>
            <col className="w-10" />
            <col className="w-14" />
            <col className="w-[30%]" />
            <col className="w-[17%]" />
            <col className="w-[12%]" />
            <col className="w-[16%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[10%]" />
          </colgroup>

          <thead className="bg-slate-50/70 border-b border-slate-200">
            <tr className="text-left">
              <Th>
                <input
                  aria-label="Seleccionar todos"
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  className="accent-slate-600"
                />
              </Th>
              <Th />
              <Th>Tarea</Th>
              <Th>Ubicación</Th>
              <Th>Estado</Th>
              <Th>Responsable</Th>
              <Th>Programado</Th>
              <Th>Prioridad</Th>
              <Th className="text-right">Acciones</Th>
            </tr>
          </thead>

          <tbody>
            {items.map((i, idx) => {
              const mapped = TASK_TEXT[i.code] ?? null;
              const title = mapped?.name ?? i.kind ?? "Mantenimiento";
              const summary = mapped?.summary ?? i.area ?? "—";
              const metaCode = i.code ?? "—";

              return (
                <tr key={i.id} className={idx % 2 ? "bg-white" : "bg-slate-50/40"}>
                  <Td className="align-middle">
                    <input
                      aria-label={`Seleccionar ${metaCode}`}
                      type="checkbox"
                      checked={!!selected[i.id]}
                      onChange={() => toggleOne(i.id)}
                      className="accent-slate-600"
                    />
                  </Td>

                  <Td className="align-middle">
                    <div className="h-9 w-9 rounded-lg grid place-items-center bg-slate-100 text-slate-600">
                      <Clock3 className="h-4 w-4" />
                    </div>
                  </Td>

                  <Td className="pr-4">
                    <div className="font-semibold text-slate-900 leading-5">
                      {title}
                    </div>
                    <div className="mt-1 text-[13px] text-slate-600">
                      {summary}
                    </div>
                    <div className="mt-1 text-[12px] text-slate-500">
                      <span className="font-medium">{metaCode}</span>
                      <span className="mx-2">•</span>
                      <span>{i.kind}</span>
                    </div>
                  </Td>

                  <Td className="pr-4">
                    <div className="flex items-start gap-2">
                      <span className="mt-1 text-slate-500">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="font-medium text-slate-800 whitespace-nowrap">
                          Habitación {i.roomNumber ?? "—"}
                        </div>
                        <div className="text-[12px] text-slate-500 truncate">
                          {i.area ?? "—"}
                        </div>
                      </div>
                    </div>
                  </Td>

                  <Td className="align-middle">
                    <StatusBadge status={i.status} />
                  </Td>

                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-200/80 text-slate-700 grid place-items-center font-semibold">
                        {getInitials(i.assignee?.name)}
                      </div>
                      <div className="text-slate-800 truncate">
                        {i.assignee?.name ?? (
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
                          {i.scheduledAt ?? "—"}
                        </div>
                      </div>
                    </div>
                  </Td>

                  <Td className="align-middle">
                    <PriorityBadge priority={i.priority} />
                  </Td>

                  <Td className="align-middle">
                    <div className="flex items-center justify-end gap-3 text-slate-500">
                      <button title="Ver" className="hover:text-slate-900">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button title="Editar" className="hover:text-slate-900">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button title="Asignar" className="hover:text-slate-900">
                        <Link2 className="h-4 w-4" />
                      </button>
                      <button title="Más" className="hover:text-slate-900">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </Td>
                </tr>
              );
            })}

            {items.length === 0 && (
              <tr>
                <td colSpan={9} className="px-5 py-14 text-center text-slate-500">
                  No hay resultados para los filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MaintenanceTable;
