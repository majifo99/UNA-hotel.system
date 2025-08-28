import { useState, useEffect } from "react";
import { fetchStaff } from "../services/staffService";
import { fetchRoomById, updateRoom } from "../services/roomService";
import { STATUS_TO_KEY } from "../utils/statustoKEY";
import type { Staff, Room } from "../types/typesRoom";

type AssignModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (staffName: string) => void; // se mantiene para no romper el padre
  selectedRoomId: string | null;
};

export default function AssignModal({
  isOpen,
  onClose,
  onAssign,
  selectedRoomId,
}: AssignModalProps) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);

  const [room, setRoom] = useState<Room | null>(null);
  const [loadingRoom, setLoadingRoom] = useState(false);
  const [errorRoom, setErrorRoom] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Cargar staff cuando se abre
  useEffect(() => {
    if (!isOpen) return;
    fetchStaff()
      .then((data) => setStaff(data))
      .catch((error) => console.error("Error fetching staff:", error));
  }, [isOpen]);

  // Cargar datos de la habitación seleccionada
  useEffect(() => {
    if (!isOpen || !selectedRoomId) return;
    setLoadingRoom(true);
    setErrorRoom(null);
    fetchRoomById(selectedRoomId)
      .then((data) => setRoom(data))
      .catch(() => setErrorRoom("No se pudo cargar la habitación"))
      .finally(() => setLoadingRoom(false));
  }, [isOpen, selectedRoomId]);

  // Mapea el estado “al asignar” → por defecto pasamos a “En limpieza”
  const getNextStatusAndKey = () => {
    const nextStatus = "En limpieza";
    const nextKeyCode = STATUS_TO_KEY[nextStatus] ?? "LIM";
    return { nextStatus, nextKeyCode };
  };

  const handleAssign = async () => {
    if (!selectedStaff || !selectedRoomId || !room) return;

    setSubmitting(true);
    setSubmitError(null);

    const { nextStatus, nextKeyCode } = getNextStatusAndKey();

    // Actualización optimista local
    setRoom((prev) =>
      prev
        ? {
            ...prev,
            assignedTo: selectedStaff,
            status: nextStatus,
            keyCode: nextKeyCode,
          }
        : prev
    );

    try {
      // Persistir en API (assignedTo + status + keyCode)
      await updateRoom(selectedRoomId, {
        assignedTo: selectedStaff,
        status: nextStatus,
        keyCode: nextKeyCode,
      });

      // Avisar al padre (si refresca lista, etc.)
      onAssign(selectedStaff);

      // Reset / cerrar
      setSelectedStaff(null);
      onClose();
    } catch (_) {
      setSubmitError("No se pudo asignar el personal. Intenta nuevamente.");
      // Si quieres revertir la optimista, aquí podrías recargar la habitación:
      // const fresh = await fetchRoomById(selectedRoomId); setRoom(fresh);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Badge de estado
  const StatusBadge = ({ status }: { status?: string }) => {
    const base = "px-2 py-1 rounded-full text-xs font-semibold";
    const map: Record<string, string> = {
      Disponible: "bg-green-100 text-green-700",
      "En limpieza": "bg-yellow-100 text-yellow-700",
      Pendiente: "bg-rose-100 text-rose-700",
      Inspección: "bg-blue-100 text-blue-700",
      "Fuera de servicio": "bg-gray-200 text-gray-700",
      Ocupada: "bg-purple-100 text-purple-700",
      "No molestar": "bg-orange-100 text-orange-700",
    };
    const cls = status && map[status] ? map[status] : "bg-slate-200 text-slate-700";
    return <span className={`${base} ${cls}`}>{status ?? "—"}</span>;
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="assign-modal-title"
    >
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-xl transform transition-all duration-300 ease-in-out">
        <h2
          id="assign-modal-title"
          className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2"
        >
          Asignar Personal
        </h2>

        {/* Detalles de la habitación */}
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
                <div className="flex items-start gap-2">
                  <div className="grow">
                    <p className="text-xs text-slate-500">Estado</p>
                    <div className="mt-1">
                      <StatusBadge status={room.status} />
                    </div>
                  </div>
                </div>

                {/* Nomenclatura hotelera */}
                {"keyCode" in (room as any) && (
                  <div>
                    <p className="text-xs text-slate-500">Nomenclatura</p>
                    <p className="font-medium text-slate-800">{(room as any).keyCode ?? "—"}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-slate-500">Asignada a</p>
                  <p className="font-medium text-slate-800">{room.assignedTo ?? "Sin asignar"}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Última limpieza</p>
                  <p className="font-medium text-slate-800">
                    {room.lastCleaned ? new Date(room.lastCleaned).toLocaleString() : "—"}
                  </p>
                </div>

                {"description" in (room as any) && (room as any).description && (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-slate-500">Descripción</p>
                    <p className="text-slate-700">{(room as any).description}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Selector de personal */}
        <div className="mb-6">
          <label htmlFor="staff-select" className="block text-sm font-semibold text-slate-700 mb-2">
            Selecciona el personal
          </label>
          <select
            id="staff-select"
            value={selectedStaff || ""}
            onChange={(e) => setSelectedStaff(e.target.value)}
            disabled={submitting}
            className="w-full p-3 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 hover:border-teal-300 disabled:opacity-50"
          >
            <option value="" className="text-slate-400">
              — Selecciona —
            </option>
            {staff
              .filter((person) => person.availability)
              .map((person) => (
                <option key={person.id} value={person.name} className="text-slate-700">
                  {person.name} ({person.role})
                </option>
              ))}
          </select>
        </div>

        {submitError && (
          <p className="text-rose-600 text-sm mb-3">{submitError}</p>
        )}

        {/* Acciones */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-6 py-2 bg-gray-200 text-slate-700 rounded-xl hover:bg-gray-300 transition-colors duration-200 shadow-sm disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedStaff || submitting}
            className="px-6 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all duration-200 shadow-md disabled:opacity-50"
          >
            {submitting ? "Asignando…" : "Asignar"}
          </button>
        </div>
      </div>
    </div>
  );
}
