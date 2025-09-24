"use client";

import { X, Save, BadgeCheck, Calendar, Clock } from "lucide-react";
import { PRIORIDADES, type Prioridad } from "../../types/limpieza";
import { useAssignForm } from "../../hooks/useLimpieza";
import type { SelectedRoom } from "../RoomsTable";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  /** Objeto con id, numero, piso y tipo de la habitación seleccionada */
  selectedRoom: SelectedRoom | null;
  /** Mantengo este prop por compatibilidad si tu hook lo usa; puedes eliminarlo si no es necesario */
  selectedRoomId?: string | null;
  onSuccess?: () => void;
};

export default function AssignModal({
  isOpen,
  onClose,
  selectedRoom,
  selectedRoomId,
  onSuccess,
}: Readonly<Props>) {
  const habitacionId = selectedRoom?.id ?? (selectedRoomId ? Number(selectedRoomId) : null);

  const {
    id_habitacion,
    setIdHabitacion,
    nombre,
    setNombre,
    descripcion = "",
    setDescripcion,
    prioridad,
    setPrioridad,
    fecha,
    setFecha,
    hora,
    setHora,
    notas = "",
    setNotas,
    canSave,
    loading,
    handleSave,
    reset,
  } = useAssignForm({
    id_habitacion: habitacionId,
    onSuccess,
    onClose,
  });

  if (!isOpen) return null;

  const ids = {
    asignadoA: "assign-asignadoA",
    prioridad: "assign-prioridad",
    nombre: "assign-nombre",
    descripcion: "assign-descripcion",
    fecha: "assign-fecha",
    hora: "assign-hora",
    notas: "assign-notas",
    habitacion: "assign-habitacion",
  } as const;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-lg px-4">
      <div
        aria-modal="true"
        aria-labelledby="assign-modal-title"
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col"
      >
        <div className="flex items-center justify-between bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-white/20" />
            <div>
              <h2 id="assign-modal-title" className="text-lg font-semibold leading-tight">
                Asignar Limpieza
              </h2>
              <p className="text-xs/5 opacity-90">Crear nueva tarea de limpieza</p>
            </div>
          </div>
          <button
            onClick={() => {
              reset();
              onClose();
            }}
            className="rounded-lg p-2 hover:bg-white/10"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {/* Banda de habitación seleccionada con NÚMERO, TIPO y PISO */}
          {habitacionId !== null && (
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-emerald-50/60 px-4 py-3">
              <div>
                <p className="text-xs font-semibold text-emerald-900">HABITACIÓN SELECCIONADA</p>
                <p className="text-sm font-bold text-emerald-800">
                  
                  {selectedRoom?.numero ? `Hab. ${selectedRoom.numero}` : ""}
                </p>
                <p className="text-xs text-emerald-900/90">
                  {selectedRoom?.tipoNombre ? `Tipo: ${selectedRoom.tipoNombre}` : "Tipo: —"} ·{" "}
                  {typeof selectedRoom?.piso !== "undefined" ? `Piso: ${selectedRoom?.piso}` : "Piso: —"}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                <BadgeCheck className="h-4 w-4" /> Asignación
              </span>
            </div>
          )}

          {/* Si no viene selección, permitir ingresar un ID manualmente */}
          {habitacionId === null && (
            <div>
              <label htmlFor={ids.habitacion} className="text-sm font-medium text-slate-800">
                ID de habitación
              </label>
              <input
                id={ids.habitacion}
                type="number"
                value={id_habitacion ?? ""}
                onChange={(e) => setIdHabitacion(e.target.value ? Number(e.target.value) : null)}
                placeholder="Ej. 101"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={ids.asignadoA} className="text-sm font-medium text-slate-800">
                Asignado a
              </label>
              <input
                id={ids.asignadoA}
                type="text"
                disabled
                value="(se envía sin asignado o por id_usuario_asigna)"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-slate-50"
              />
            </div>

            <div>
              <label htmlFor={ids.prioridad} className="text-sm font-medium text-slate-800">
                Nivel de prioridad
              </label>
              <select
                id={ids.prioridad}
                value={prioridad ?? ""}
                onChange={(e) => setPrioridad((e.target.value ? e.target.value : null) as Prioridad | null)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">— Selecciona —</option>
                {PRIORIDADES.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor={ids.nombre} className="text-sm font-medium text-slate-800">
              Nombre de la tarea <span className="text-rose-600">*</span>
            </label>
            <input
              id={ids.nombre}
              type="text"
              placeholder="Ej. Limpieza profunda post check-out"
              maxLength={100}
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label htmlFor={ids.descripcion} className="text-sm font-medium text-slate-800">
              Descripción detallada
            </label>
            <textarea
              id={ids.descripcion}
              placeholder="Describe tareas específicas, áreas a atender, productos a utilizar…"
              maxLength={500}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="mt-1 min-h-[96px] w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="mt text-right text-xs text-slate-500">{(descripcion ?? "").length}/500</p>
          </div>

          <fieldset className="mt-2">
            <legend className="text-sm font-medium text-slate-800">
              Programación <span className="text-rose-600">*</span>
            </legend>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div className="relative">
                <label htmlFor={ids.fecha} className="sr-only">
                  Fecha
                </label>
                <input
                  id={ids.fecha}
                  type="date"
                  required
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  aria-required="true"
                />
                <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
              <div className="relative">
                <label htmlFor={ids.hora} className="sr-only">
                  Hora
                </label>
                <input
                  id={ids.hora}
                  type="time"
                  required
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  aria-required="true"
                />
                <Clock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </fieldset>

          <div>
            <label htmlFor={ids.notas} className="text-sm font-medium text-slate-800">
              Notas (opcional)
            </label>
            <textarea
              id={ids.notas}
              placeholder="Observaciones adicionales…"
              maxLength={500}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="mt-1 min-h-[72px] w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white px-6 py-4 flex items-center justify-end gap-2">
          <button
            onClick={() => {
              reset();
              onClose();
            }}
            className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || loading}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white ${
              canSave && !loading ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-300"
            }`}
          >
            <Save className="h-4 w-4" />
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
