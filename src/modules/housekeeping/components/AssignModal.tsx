import { useEffect, useMemo, useState } from "react";
import { useStaff } from "../hooks/useStaff";
import { useRoomById } from "../hooks/useRoomById";
import { updateRoom } from "../services/roomService";
import { STATUS_TO_KEY } from "../utils/statusToKey";
import type { Room } from "../types/typesRoom";

type AssignModalProps = Readonly<{
  isOpen: boolean;
  onClose: () => void;
  onAssign: (staffName: string) => void;
  selectedRoomId: string | null;
  mode: "assign" | "reassign" | "status";
}>;

const ALL_STATUSES = [
  "Disponible",
  "Ocupada",
  "Pendiente",
  "En limpieza",
  "Inspección",
  "Fuera de servicio",
  "No molestar",
  "Mantenimiento",
] as const;

/** Badge de estado (fuera del componente principal) */
function StatusBadge({ status }: Readonly<{ status?: string }>) {
  const base = "px-2 py-1 rounded-full text-xs font-semibold";
  const map: Record<string, string> = {
    Disponible: "bg-green-100 text-green-700",
    "En limpieza": "bg-yellow-100 text-yellow-700",
    Pendiente: "bg-rose-100 text-rose-700",
    Inspección: "bg-blue-100 text-blue-700",
    "Fuera de servicio": "bg-gray-200 text-gray-700",
    Ocupada: "bg-purple-100 text-purple-700",
    "No molestar": "bg-orange-100 text-orange-700",
    Mantenimiento: "bg-amber-100 text-amber-700",
  };
  const cls = status && map[status] ? map[status] : "bg-slate-200 text-slate-700";
  return <span className={`${base} ${cls}`}>{status ?? "—"}</span>;
}

export default function AssignModal({
  isOpen,
  onClose,
  onAssign,
  selectedRoomId,
  mode,
}: AssignModalProps) {
  const canEditStaff = mode === "assign" || mode === "reassign";
  const canEditStatus = mode === "status";

  const { staff } = useStaff();
  const { room, setRoom, isLoading: loadingRoom, error: errorRoom } = useRoomById(
    selectedRoomId,
    isOpen
  );

  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (room) {
      setSelectedStaff(room.assignedTo ?? "");
      setSelectedStatus(room.status ?? "");
    }
  }, [room]);

  const isChanged = useMemo(() => {
    if (!room) return false;
    const staffChanged = canEditStaff && (selectedStaff ?? "") !== (room.assignedTo ?? "");
    const statusChanged = canEditStatus && (selectedStatus ?? "") !== (room.status ?? "");
    return staffChanged || statusChanged;
  }, [room, selectedStaff, selectedStatus, canEditStaff, canEditStatus]);

  const title = useMemo(() => {
    switch (mode) {
      case "assign":
        return "Asignar responsable";
      case "reassign":
        return "Reasignar responsable";
      case "status":
      default:
        return "Cambiar estado";
    }
  }, [mode]);

  const handleSave = async () => {
    if (!room || !selectedRoomId) return;
    if (!isChanged) return onClose();

    setSubmitting(true);
    setSubmitError(null);

    const payload: Partial<Room> = {};
    const staffChanged = canEditStaff && (selectedStaff ?? "") !== (room.assignedTo ?? "");
    if (staffChanged) payload.assignedTo = selectedStaff || "";

    const statusChanged = canEditStatus && (selectedStatus ?? "") !== (room.status ?? "");
    if (statusChanged) {
      payload.status = selectedStatus || "";
      payload.keyCode = STATUS_TO_KEY[selectedStatus] ?? room.keyCode ?? "";
    }

    // Regla: si asigno una Pendiente -> En limpieza
    if (mode === "assign" && room.status === "Pendiente" && staffChanged && selectedStaff) {
      payload.status = "En limpieza";
      payload.keyCode = STATUS_TO_KEY["En limpieza"] ?? "LIM";
    }

    // Optimista local
    setRoom({
      ...room,
      ...(payload.assignedTo !== undefined ? { assignedTo: payload.assignedTo } : {}),
      ...(payload.status ? { status: payload.status } : {}),
      ...(payload.keyCode ? { keyCode: payload.keyCode } : {}),
    });

    try {
      await updateRoom(selectedRoomId, payload);
      onAssign(selectedStaff || room.assignedTo || "");
      onClose();
    } catch {
      setSubmitError("No se pudo guardar. Intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-xl">
        <h2 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">
          {title}
        </h2>

        {/* Detalles */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-600 mb-2">Habitación seleccionada</h3>
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
            {loadingRoom && <p className="text-slate-500 text-sm">Cargando habitación…</p>}
            {errorRoom && <p className="text-rose-600 text-sm">{errorRoom}</p>}
            {!loadingRoom && !errorRoom && room && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-500">Número</p>
                  <p className="font-medium text-slate-800">{room.number ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Tipo</p>
                  <p className="font-medium text-slate-800">{room.type ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Piso</p>
                  <p className="font-medium text-slate-800">{room.floor ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Estado actual</p>
                  <div className="mt-1">
                    <StatusBadge status={room.status} />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Nomenclatura</p>
                  <p className="font-medium text-slate-800">{room.keyCode ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Responsable</p>
                  <p className="font-medium text-slate-800">{room.assignedTo ?? "Sin asignar"}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Responsable (assign/reassign) */}
        {canEditStaff && (
          <div className="mb-4">
            <label htmlFor="staff-select" className="block text-sm font-semibold text-slate-700 mb-2">
              Responsable de limpieza
            </label>
            <select
              id="staff-select"
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              disabled={submitting}
              className="w-full p-3 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">— Sin responsable —</option>
              {staff.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name} ({p.role}){p.availability ? "" : " — NO disp."}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Estado (status) */}
        {canEditStatus && (
          <div className="mb-6">
            <label htmlFor="status-select" className="block text-sm font-semibold text-slate-700 mb-2">
              Estado de la habitación
            </label>
            <select
              id="status-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              disabled={submitting}
              className="w-full p-3 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">— Selecciona —</option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}

        {submitError && <p className="text-rose-600 text-sm mb-3">{submitError}</p>}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-6 py-2 bg-gray-200 text-slate-700 rounded-xl hover:bg-gray-300 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={submitting || !isChanged}
            className="px-6 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl hover:from-teal-700 hover:to-teal-800 disabled:opacity-50"
          >
            {submitting ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
