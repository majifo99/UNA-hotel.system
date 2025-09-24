// src/components/Modals/AssignMaintenanceModal.ui.tsx
import { createPortal } from "react-dom";
import { X, Calendar, Clock3, ShieldCheck } from "lucide-react";
import type { MaintenanceItem } from "../../types/mantenimiento";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  item?: MaintenanceItem | null;
};

export default function AssignMaintenanceModal({ isOpen, onClose, item }: Props) {
  if (!isOpen) return null;

  const code = item?.code ?? "—";
  const room = item?.roomNumber ?? "—";

  // ids accesibles
  const ids = {
    asignadoA: "mnt-asignadoA",
    prioridad: "mnt-prioridad",
    nombre: "mnt-nombre",
    descripcion: "mnt-descripcion",
    fecha: "mnt-fecha",
    hora: "mnt-hora",
  } as const;

  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-lg px-4">
      <div
      
        aria-modal="true"
        aria-labelledby="assign-modal-title"
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-white/20" />
            <div>
              <h2 id="assign-modal-title" className="text-lg font-semibold leading-tight">
                Asignar Mantenimiento
              </h2>
              <p className="text-xs/5 opacity-90">Crear o actualizar tarea de mantenimiento</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="rounded-lg p-2 hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {/* Resumen */}
          <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
            <div>
              <p className="text-xs font-semibold text-blue-900">MANTENIMIENTO SELECCIONADO</p>
              <p className="text-sm font-bold text-blue-800">{code}</p>
              <p className="text-xs text-blue-800/80">Habitación {room}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {item?.kind && <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">{item.kind}</span>}
              {item?.area && <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">{item.area}</span>}
              {item?.status && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                  <ShieldCheck className="h-4 w-4" /> {item.status}
                </span>
              )}
            </div>
          </div>

          {/* Fila 1: Asignado / Prioridad */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={ids.asignadoA} className="text-sm font-medium text-slate-800">Asignado a</label>
              <input
                id={ids.asignadoA}
                placeholder="Nombre del técnico"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label htmlFor={ids.prioridad} className="text-sm font-medium text-slate-800">Nivel de prioridad</label>
              <select
                id={ids.prioridad}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">— Selecciona —</option>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label htmlFor={ids.nombre} className="text-sm font-medium text-slate-800">Nombre de la tarea</label>
            <input
              id={ids.nombre}
              placeholder="Ej. Reparación de aire acondicionado"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              defaultValue={item?.name}
            />
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor={ids.descripcion} className="text-sm font-medium text-slate-800">Descripción detallada</label>
            <textarea
              id={ids.descripcion}
              placeholder="Describe el problema, tareas específicas, materiales, etc."
              className="mt-1 min-h-[96px] w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              defaultValue={item?.summary}
              maxLength={500}
            />
            <p className="mt-1 text-right text-xs text-slate-500">0/500</p>
          </div>

          {/* Programación */}
          <div>
            <p className="text-sm font-medium text-slate-800">Programación</p>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div className="relative">
                <label htmlFor={ids.fecha} className="sr-only">Fecha</label>
                <input
                  id={ids.fecha}
                  type="date"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  defaultValue={item?.scheduledAt?.slice(0, 10)}
                />
                <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
              <div className="relative">
                <label htmlFor={ids.hora} className="sr-only">Hora</label>
                <input
                  id={ids.hora}
                  type="time"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  defaultValue={(() => {
                    if (!item?.scheduledAt) return "";
                    const d = new Date(item.scheduledAt);
                    const pad = (n: number) => String(n).padStart(2, "0");
                    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
                  })()}
                />
                <Clock3 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white px-6 py-4 flex items-center justify-end gap-2">
          <button onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
            Cancelar
          </button>
          <button className="rounded-xl px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700">
            Guardar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
