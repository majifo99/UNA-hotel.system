import { X, Save, RefreshCw, BadgeCheck, Calendar, Clock, AlertCircle } from "lucide-react";
import { PRIORIDADES, type Prioridad, type LimpiezaItem } from "../../types/limpieza";
import { useLimpiezaMutation } from "../../hooks/useLimpiezaMutation";
import { useMemo } from "react";
import { useUsers } from "../../hooks/useUsers";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  limpiezaItem: LimpiezaItem | null;
};

export default function ReassignModal({
  isOpen,
  onClose,
  onSuccess,
  limpiezaItem,
}: Readonly<Props>) {
  const habitacionId = limpiezaItem ? ((limpiezaItem as any)?.habitacion?.id ?? null) : null;
  const editingId = limpiezaItem ? ((limpiezaItem as any).id_limpieza ?? (limpiezaItem as any).id ?? null) : null;

  const { users, loading: loadingUsers } = useUsers();

  const {
    prioridad, setPrioridad,
    fecha, setFecha,
    hora, setHora,
    notas, setNotas,
    asignadoA, setAsignadoA,
    errors, canSave, loading, toast,
    handleSave,
  } = useLimpiezaMutation({
    id_habitacion: habitacionId,
    editingId,
    initialItem: limpiezaItem,
    onSuccess: () => onSuccess?.(),
    onClose,
    users,
  });

  const todayStr = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const canSaveLocal = canSave;

  const ids = {
    asignadoA: "reassign-asignadoA",
    prioridad: "reassign-prioridad",
    fecha: "reassign-fecha",
    hora: "reassign-hora",
    notas: "reassign-notas",
  } as const;

  if (!isOpen) return null;

  const habitacion = (limpiezaItem as any)?.habitacion;
  const habitacionDisplay = habitacion
    ? `${habitacion.numero} - ${habitacion.tipo?.nombre || "Sin tipo"}`
    : "Sin habitación";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-lg px-4">
      <div
        aria-modal="true"
        aria-labelledby="reassign-modal-title"
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="relative flex items-center justify-between px-6 py-4 text-white shrink-0 bg-[#304D3C]">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-6 w-6" />
            <h2 id="reassign-modal-title" className="text-xl font-semibold">
              Reasignar limpieza
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1 rounded-lg hover:bg-white/20 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Habitación (solo lectura) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Habitación
            </label>
            <div className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-slate-50 text-slate-700">
              {habitacionDisplay}
            </div>
          </div>

          {/* Usuario asignado */}
          <div>
            <label htmlFor={ids.asignadoA} className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <BadgeCheck className="h-4 w-4" />
              Asignado a
            </label>
            <select
              id={ids.asignadoA}
              value={asignadoA ?? ""}
              onChange={(e) => setAsignadoA(e.target.value ? Number(e.target.value) : null)}
              disabled={loadingUsers || loading}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#304D3C] disabled:bg-slate-100"
            >
              <option value="">Seleccionar usuario</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombreCompleto}
                </option>
              ))}
            </select>
            {errors.asignadoA && <p className="mt-1 text-sm text-red-600">{errors.asignadoA}</p>}
          </div>

          {/* Prioridad */}
          <div>
            <label htmlFor={ids.prioridad} className="block text-sm font-medium text-slate-700 mb-2">
              Prioridad
            </label>
            <select
              id={ids.prioridad}
              value={prioridad ?? ""}
              onChange={(e) => setPrioridad((e.target.value || null) as Prioridad | null)}
              disabled={loading}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#304D3C] disabled:bg-slate-100"
            >
              <option value="">Seleccionar prioridad</option>
              {PRIORIDADES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            {errors.prioridad && <p className="mt-1 text-sm text-red-600">{errors.prioridad}</p>}
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor={ids.fecha} className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Calendar className="h-4 w-4" />
                Fecha programada
              </label>
              <input
                id={ids.fecha}
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                min={todayStr}
                disabled={loading}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#304D3C] disabled:bg-slate-100"
              />
              {errors.fecha && <p className="mt-1 text-sm text-red-600">{errors.fecha}</p>}
            </div>
            <div>
              <label htmlFor={ids.hora} className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Clock className="h-4 w-4" />
                Hora programada
              </label>
              <input
                id={ids.hora}
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                disabled={loading}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#304D3C] disabled:bg-slate-100"
              />
              {errors.hora && <p className="mt-1 text-sm text-red-600">{errors.hora}</p>}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label htmlFor={ids.notas} className="block text-sm font-medium text-slate-700 mb-2">
              Notas
            </label>
            <textarea
              id={ids.notas}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
              maxLength={500}
              disabled={loading}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#304D3C] disabled:bg-slate-100 resize-none"
              placeholder="Notas adicionales (opcional)"
            />
            {errors.notas && <p className="mt-1 text-sm text-red-600">{errors.notas}</p>}
          </div>

          {/* Toast de error/éxito */}
          {toast && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                toast.type === "error"
                  ? "bg-red-50 text-red-800 border border-red-200"
                  : "bg-emerald-50 text-emerald-800 border border-emerald-200"
              }`}
            >
              {toast.type === "error" && <AlertCircle className="h-4 w-4" />}
              {toast.msg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-white disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSaveLocal || loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#304D3C] text-white text-sm font-semibold hover:bg-[#243a2e] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
