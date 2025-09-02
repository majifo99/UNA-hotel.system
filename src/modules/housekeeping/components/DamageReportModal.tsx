import { useState } from "react";
import { useRoomById } from "../hooks/useRoomById";
import { updateRoom } from "../services/roomService";
import { STATUS_TO_KEY } from "../utils/statusToKey";

type DamageReportModalProps = Readonly<{
  isOpen: boolean;
  onClose: () => void;
  selectedRoomId: string | null;
  onSent: () => Promise<void> | void;
}>;

export default function DamageReportModal({
  isOpen,
  onClose,
  selectedRoomId,
  onSent,
}: DamageReportModalProps) {
  const { room, isLoading: loadingRoom, error: errorRoom } = useRoomById(selectedRoomId, isOpen);

  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!room || !selectedRoomId) return;
    if (!description.trim()) {
      setSubmitError("La descripción del daño es obligatoria.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      console.log("Reporte de daño:", {
        roomId: selectedRoomId,
        description,
        image: imageFile?.name ?? null,
        when: new Date().toISOString(),
      });

      await updateRoom(selectedRoomId, {
        status: "Mantenimiento",
        keyCode: STATUS_TO_KEY["Mantenimiento"] ?? "MANT",
      });

      await onSent();
      setDescription("");
      setImageFile(null);
      onClose();
    } catch {
      setSubmitError("No se pudo enviar el reporte. Intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-xl">
        <h2 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">
          Reportar Daño
        </h2>

        <div className="space-y-4">
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
                  <p className="text-xs text-slate-500">Clave (nomenclatura)</p>
                  <p className="font-medium text-slate-800">{room.keyCode ?? "—"}</p>
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="damage-description" className="block text-sm font-semibold text-slate-700 mb-2">
              Descripción del daño <span className="text-rose-600">*</span>
            </label>
            <textarea
              id="damage-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe el daño observado…"
              className="w-full rounded-xl border border-slate-300 bg-white/80 p-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label htmlFor="damage-image" className="block text-sm font-semibold text-slate-700 mb-2">
              Adjuntar imagen (opcional)
            </label>
            <input
              id="damage-image"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-slate-700 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border file:border-slate-300 file:bg-white file:text-slate-700 hover:file:bg-slate-50"
            />
            {imageFile && (
              <p className="mt-1 text-xs text-slate-500">
                Archivo seleccionado: <span className="font-medium">{imageFile.name}</span>
              </p>
            )}
          </div>

          {submitError && <p className="text-rose-600 text-sm">{submitError}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-6 py-2 bg-gray-200 text-slate-700 rounded-xl hover:bg-gray-300 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={submitting || !description.trim()}
            className="px-6 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl hover:from-teal-700 hover:to-teal-800 disabled:opacity-50"
          >
            {submitting ? "Enviando…" : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
}
