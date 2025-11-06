import { X, Save, BadgeCheck, AlertCircle } from "lucide-react";
import { PRIORIDADES, type Prioridad, type LimpiezaItem } from "../../types/limpieza";
import { useLimpiezaMutation } from "../../hooks/useLimpiezaMutation";
import type { SelectedRoom } from "../RoomsTable";

import { useUsers } from "../../hooks/useUsers";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  selectedRoom: SelectedRoom | null;
  selectedRoomId?: string | null;
  onSuccess?: () => void;
  editingId?: number | null;
  initialItem?: Partial<LimpiezaItem> | null;
  onPatched?: (updated: any) => void;
};

export default function AssignModal({
  isOpen,
  onClose,
  selectedRoom,
  selectedRoomId,
  onSuccess,
  editingId,
  initialItem,
  onPatched,
}: Readonly<Props>) {
  const habitacionId =
    selectedRoom?.id ?? (selectedRoomId ? Number(selectedRoomId) : null);

  const { users, loading: loadingUsers } = useUsers();

  const {
    prioridad, setPrioridad,
    notas, setNotas,
    asignadoA, setAsignadoA,
    errors, canSave, loading, toast,
    handleSave, reset,
  } = useLimpiezaMutation({
    id_habitacion: habitacionId,
    editingId,
    initialItem,
    onSuccess: () => onSuccess?.(),
    onClose,
    onPatched,
    users,
  });

  const canSaveLocal = canSave;

  const ids = {
    asignadoA: "assign-asignadoA",
    prioridad: "assign-prioridad",
    notas: "assign-notas",
    habitacion: "assign-habitacion",
  } as const;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-lg px-4">
      <div
        aria-modal="true"
        aria-labelledby="assign-modal-title"
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="relative flex items-center justify-between px-6 py-4 text-white shrink-0 bg-[#304D3C]">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-white/15" />
            <div>
              <h2 id="assign-modal-title" className="text-lg font-semibold leading-tight">
                Editar limpieza
              </h2>
              <p className="text-xs/5 opacity-90">Se actualizarán solo los campos que completes.</p>
            </div>
          </div>
          <button
            onClick={() => { reset(); onClose(); }}
            className="relative rounded-lg p-2 hover:bg-white/10"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Toast de error general */}
        {toast?.type === "error" && (
          <div
            role="alert"
            className="mx-6 mt-4 rounded-xl px-4 py-3 text-sm font-medium flex items-start gap-2 bg-rose-50 text-rose-800 border border-rose-200"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{toast.msg}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {/* Banda habitación */}
          {habitacionId !== null && (
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-[#304D3C]/5 px-4 py-3">
              <div>
                <p className="text-xs font-semibold text-[#304D3C]">HABITACIÓN SELECCIONADA</p>
                <p className="text-sm font-bold text-[#304D3C]">
                  {selectedRoom?.numero ? `Hab. ${selectedRoom.numero}` : ""}
                </p>
                <p className="text-xs text-[#304D3C]/90">
                  {selectedRoom?.tipoNombre ? `Tipo: ${selectedRoom.tipoNombre}` : "Tipo: —"} ·{" "}
                  {selectedRoom?.piso == null
                    ? "Piso: —"
                    : `Piso: ${String(selectedRoom.piso)}`}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-[#304D3C] ring-1 ring-[#304D3C]/40">
                <BadgeCheck className="h-4 w-4" /> Asignación
              </span>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Selector de usuario */}
            <div>
              <label htmlFor={ids.asignadoA} className="text-sm font-medium text-slate-800">
                Asignado a
              </label>
              <select
                id={ids.asignadoA}
                value={asignadoA ?? ""}
                onChange={(e) => setAsignadoA(e.target.value ? Number(e.target.value) : null)}
                disabled={loadingUsers}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">
                  {loadingUsers ? "Cargando usuarios..." : "Seleccionar usuario..."}
                </option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombreCompleto}
                  </option>
                ))}
              </select>
            </div>

            {/* Prioridad */}
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
              >
                <option value="">(sin cambios)</option>
                {PRIORIDADES.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
              {errors.prioridad && (
                <p className="mt-1 text-xs text-rose-600">{errors.prioridad}</p>
              )}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label htmlFor={ids.notas} className="text-sm font-medium text-slate-800">
              Notas (opcional)
            </label>
            <textarea
              id={ids.notas}
              placeholder="(sin cambios si lo dejas vacío)"
              maxLength={500}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className={`mt-1 min-h[72px] w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 ${
                errors.notas ? "border-rose-300 focus:ring-rose-500" : "border-slate-200 focus:ring-emerald-500"
              }`}
              aria-invalid={!!errors.notas}
            />
            {errors.notas && <p className="mt-1 text-xs text-rose-600">{errors.notas}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white px-6 py-4 flex items-center justify-end gap-2 border-t">
          <button
            type="button"
            onClick={() => { reset(); onClose(); }}
            disabled={loading}
            className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSaveLocal || loading}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors ${
              canSaveLocal && !loading ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-300 cursor-not-allowed"
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
