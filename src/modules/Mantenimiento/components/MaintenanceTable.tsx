import { useMemo, useState } from "react";
import { Eye, Edit3, Link2, MoreVertical } from "lucide-react";
import { StatusBadge, PriorityBadge } from "./Badges";
import type { MaintenanceItem } from "../types/mantenimiento";

export function MaintenanceTable({ items }: Readonly<{ items: MaintenanceItem[] }>) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const allChecked = useMemo(() => items.length > 0 && items.every((i) => selected[i.id]), [items, selected]);
  const toggleAll = () => setSelected(allChecked ? {} : Object.fromEntries(items.map((i) => [i.id, true])));
  const toggleOne = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  return (
 <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
      <table className="w-full">
    <thead className="bg-slate-50/80 border-b border-slate-200">
          <tr className="bg-gray-50 text-left text-[13px] font-semibold text-gray-700">
            <Th className="w-10">
              <input type="checkbox" checked={allChecked} onChange={toggleAll} />
            </Th>
            <Th className="w-28">ID/CÓDIGO</Th>
            <Th className="w-24">HABITACIÓN</Th>
            <Th>TIPO</Th>
            <Th>ESTADO</Th>
            <Th>RESPONSABLE</Th>
            <Th className="w-40">FECHA PROGRAMADA</Th>
            <Th className="w-28">PRIORIDAD</Th>
            <Th className="w-28 text-right">ACCIONES</Th>
          </tr>
        </thead>
        <tbody>
          {items.map((i, idx) => (
            <tr key={i.id} className={idx % 2 ? "bg-white" : "bg-gray-50/40"}>
              <Td><input type="checkbox" checked={!!selected[i.id]} onChange={() => toggleOne(i.id)} /></Td>
              <Td className="font-medium text-gray-900">{i.code}</Td>
              <Td className="font-medium">{i.roomNumber}</Td>
              <Td>
                <div className="text-gray-900">{i.kind}</div>
                <div className="text-xs text-gray-500">{i.area}</div>
              </Td>
              <Td><StatusBadge status={i.status} /></Td>
              <Td className="text-gray-800">{i.assignee?.name ?? <span className="text-gray-400">Sin asignar</span>}</Td>
              <Td>{i.scheduledAt ?? "—"}</Td>
              <Td><PriorityBadge priority={i.priority} /></Td>
              <Td>
                <div className="flex items-center justify-end gap-3 text-gray-600">
                  <button title="Ver" className="hover:text-gray-900"><Eye className="h-4 w-4" /></button>
                  <button title="Editar" className="hover:text-gray-900"><Edit3 className="h-4 w-4" /></button>
                  <button title="Asignar" className="hover:text-gray-900"><Link2 className="h-4 w-4" /></button>
                  <button title="Más" className="hover:text-gray-900"><MoreVertical className="h-4 w-4" /></button>
                </div>
              </Td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={9} className="px-4 py-10 text-center text-gray-500">
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

function Th({ children, className = "" }: Readonly<{ children: React.ReactNode; className?: string }>) {
  return <th className={`px-4 py-3 ${className}`}>{children}</th>;
}
function Td({ children, className = "" }: Readonly<{ children: React.ReactNode; className?: string }>) {
  return <td className={`px-4 py-4 align-middle text-gray-700 ${className}`}>{children}</td>;
}
