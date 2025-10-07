// src/components/Modals/AssignModal.tsx
"use client";

import {
  X,
  Save,
  BadgeCheck,
  Calendar,
  Clock,
  AlertCircle,
} from "lucide-react";
import { PRIORIDADES, type Prioridad, type LimpiezaItem } from "../../types/limpieza";
import { useAssignForm } from "../../hooks/useLimpieza";
import type { SelectedRoom } from "../RoomsTable";
import { useEffect, useMemo } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  selectedRoom: SelectedRoom | null;
  selectedRoomId?: string | null;
  onSuccess?: () => void;
  editingId?: number | null;
  initialItem?: Partial<LimpiezaItem> | null;
};

export default function AssignModal({ // NOSONAR
  isOpen,
  onClose,
  selectedRoom,
  selectedRoomId,
  onSuccess,
  editingId,
  initialItem,
}: Readonly<Props>) {
  // No early return antes de los hooks
  const habitacionId =
    selectedRoom?.id ?? (selectedRoomId ? Number(selectedRoomId) : null);

  const {
    // form
    id_habitacion,
    setIdHabitacion,
    prioridad,
    setPrioridad,
    nombre,
    setNombre,
    descripcion,
    setDescripcion,
    fecha,
    setFecha,
    hora,
    setHora,
    notas,
    setNotas,
    // ui
    errors,
    canSave,
    loading,
    toast,
    // actions
    handleSave,
    reset,
  } = useAssignForm({
    id_habitacion: habitacionId,
    editingId,
    initialItem,
    onSuccess: () => {
      console.log("[AssignModal] Habitación asignada exitosamente.");
      onSuccess?.();
    },
    onClose,
  });

  useEffect(() => {
    if (toast?.type === "success") {
      console.log("[AssignModal] Asignación exitosa (toast).");
    }
  }, [toast?.type]);

  // ======== Validación de fecha mínima (hoy en horario local) ========
  const todayStr = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const isPastDate = useMemo(() => {
    if (!fecha) return false;
    return fecha < todayStr; // YYYY-MM-DD comparado lexicográficamente
  }, [fecha, todayStr]);

  const canSaveLocal = canSave && !isPastDate;

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

  // ✅ Ahora sí: si no está abierto, retorna null PERO después de ejecutar hooks
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-lg px-4">
      <div
        aria-modal="true"
        aria-labelledby="assign-modal-title"
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-white/20" />
            <div>
              <h2 id="assign-modal-title" className="text-lg font-semibold leading-tight">
                {editingId ? "Editar limpieza" : "Asignar limpieza"}
              </h2>
              <p className="text-xs/5 opacity-90">
                {editingId ? "Actualiza la tarea existente (PATCH)" : "Crear/actualizar tarea de limpieza"}
              </p>
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

        {/* Toast SOLO para error */}
        {toast?.type === "error" && (
          <div
            // 🔁 status ➜ alert para accesibilidad (y evitar S6819)
            role="alert"
            className="mx-6 mt-4 rounded-xl px-4 py-3 text-sm font-medium flex items-start gap-2 bg-rose-50 text-rose-800 border border-rose-200"
            aria-live="assertive"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{toast.msg}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {/* Banda habitación */}
          {habitacionId !== null && (
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-emerald-50/60 px-4 py-3">
              <div>
                <p className="text-xs font-semibold text-emerald-900">
                  HABITACIÓN SELECCIONADA
                </p>
                <p className="text-sm font-bold text-emerald-800">
                  {selectedRoom?.numero ? `Hab. ${selectedRoom.numero}` : ""}
                </p>
                <p className="text-xs text-emerald-900/90">
                  {selectedRoom?.tipoNombre ? `Tipo: ${selectedRoom.tipoNombre}` : "Tipo: —"} ·{" "}
                  {typeof selectedRoom?.piso !== "undefined" ? `Piso: ${selectedRoom?.piso}` : "Piso: —"}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                <BadgeCheck className="h-4 w-4" /> {editingId ? "Edición" : "Asignación"}
              </span>
            </div>
          )}

          {/* ID manual si no vino selección */}
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
                className={`mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 ${
                  errors.id_habitacion ? "border-rose-300 focus:ring-rose-500" : "border-slate-200 focus:ring-emerald-500"
                }`}
                aria-invalid={!!errors.id_habitacion}
                aria-describedby={errors.id_habitacion ? "err-habitacion" : undefined}
              />
              {errors.id_habitacion && (
                <p id="err-habitacion" className="mt-1 text-xs text-rose-600">
                  {errors.id_habitacion}
                </p>
              )}
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
                className={`mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 ${
                  errors.prioridad ? "border-rose-300 focus:ring-rose-500" : "border-slate-200 focus:ring-emerald-500"
                }`}
                aria-invalid={!!errors.prioridad}
                aria-describedby={errors.prioridad ? "err-prioridad" : undefined}
              >
                <option value="">— Selecciona —</option>
                {PRIORIDADES.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
              {errors.prioridad && (
                <p id="err-prioridad" className="mt-1 text-xs text-rose-600">
                  {errors.prioridad}
                </p>
              )}
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
              className={`mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 ${
                errors.nombre ? "border-rose-300 focus:ring-rose-500" : "border-slate-200 focus:ring-emerald-500"
              }`}
              aria-invalid={!!errors.nombre}
              aria-describedby={errors.nombre ? "err-nombre" : undefined}
            />
            {errors.nombre && (
              <p id="err-nombre" className="mt-1 text-xs text-rose-600">
                {errors.nombre}
              </p>
            )}
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
              className={`mt-1 min-h-[96px] w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 ${
                errors.descripcion ? "border-rose-300 focus:ring-rose-500" : "border-slate-200 focus:ring-emerald-500"
              }`}
              aria-invalid={!!errors.descripcion}
              aria-describedby={errors.descripcion ? "err-descripcion" : undefined}
            />
            <div className="mt-1 flex items-center justify-between">
              <p className="text-xs text-slate-500">{(descripcion ?? "").length}/500</p>
              {errors.descripcion && (
                <p id="err-descripcion" className="text-xs text-rose-600">
                  {errors.descripcion}
                </p>
              )}
            </div>
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
                  min={todayStr}
                  className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 ${
                    (errors.fecha || isPastDate)
                      ? "border-rose-300 focus:ring-rose-500"
                      : "border-slate-200 focus:ring-emerald-500"
                  }`}
                  aria-required="true"
                  aria-invalid={!!errors.fecha || isPastDate}
                  aria-describedby={errors.fecha || isPastDate ? "err-fecha" : undefined}
                />
                <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                {(errors.fecha || isPastDate) && (
                  <p id="err-fecha" className="mt-1 text-xs text-rose-600">
                    {isPastDate ? `No puedes seleccionar una fecha anterior a hoy (${todayStr}).` : errors.fecha}
                  </p>
                )}
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
                  className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 ${
                    errors.hora ? "border-rose-300 focus:ring-rose-500" : "border-slate-200 focus:ring-emerald-500"
                  }`}
                  aria-required="true"
                  aria-invalid={!!errors.hora}
                  aria-describedby={errors.hora ? "err-hora" : undefined}
                />
                <Clock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                {errors.hora && (
                  <p id="err-hora" className="mt-1 text-xs text-rose-600">
                    {errors.hora}
                  </p>
                )}
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
              className={`mt-1 min-h-[72px] w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 ${
                errors.notas ? "border-rose-300 focus:ring-rose-500" : "border-slate-200 focus:ring-emerald-500"
              }`}
              aria-invalid={!!errors.notas}
              aria-describedby={errors.notas ? "err-notas" : undefined}
            />
            {errors.notas && (
              <p id="err-notas" className="mt-1 text-xs text-rose-600">
                {errors.notas}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white px-6 py-4 flex items-center justify-end gap-2 border-t">
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
            disabled={!canSaveLocal || loading}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white ${
              canSaveLocal && !loading ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-300"
            }`}
            aria-busy={loading}
          >
            <Save className="h-4 w-4" />
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
