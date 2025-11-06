// src/components/Modals/DamageReportModal.tsx
import { useEffect, useState } from "react";

type DamageReportModalProps = Readonly<{
  isOpen: boolean;
  onClose: () => void;
  selectedRoomId: string | null;     // viene del dashboard
  onSent: () => Promise<void> | void; // callback para refrescar
}>;

export default function DamageReportModal({
  isOpen,
  onClose,
  selectedRoomId,
  onSent,
}: DamageReportModalProps) {
  // mantenemos un id de habitación local para permitir editarlo cuando no venga preseleccionado
  const [habitacionId, setHabitacionId] = useState<number | null>(
    selectedRoomId ? Number(selectedRoomId) : null
  );

  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // si cambia la selección desde fuera, sincroniza el estado local
  useEffect(() => {
    setHabitacionId(selectedRoomId ? Number(selectedRoomId) : null);
  }, [selectedRoomId]);

  const handleSend = async () => {
    setSubmitError(null);

    if (!description.trim()) {
      setSubmitError("La descripción del daño es obligatoria.");
      return;
    }
    if (habitacionId === null || Number.isNaN(habitacionId)) {
      setSubmitError("Debes indicar el ID de la habitación.");
      return;
    }

    setSubmitting(true);
    try {
      // Aquí iría tu request real si tienes endpoint de reportes de daño.
      // Mientras, registramos y delegamos al callback onSent.
      console.log("Reporte de daño:", {
        habitacionId,
        description,
        image: imageFile?.name ?? null,
        when: new Date().toISOString(),
      });

      await onSent();
      // reset suave tras enviar
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
          {/* Habitación seleccionada o input para indicarla */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
            {habitacionId !== null ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-500">ID de habitación</p>
                  <p className="font-medium text-slate-800">{habitacionId}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Referencia</p>
                  <p className="font-medium text-slate-800">—</p>
                </div>
              </div>
            ) : (
              <div>
                <label
                  htmlFor="room-id"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  ID de habitación <span className="text-rose-600">*</span>
                </label>
                <input
                  type="number"
                  value={habitacionId ?? ""}
                  onChange={(e) =>
                    setHabitacionId(e.target.value ? Number(e.target.value) : null)
                  }
                  placeholder="Ej. 101"
                  className="w-full rounded-xl border border-slate-300 bg-white/80 p-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label
              htmlFor="damage-description"
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
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

          {/* Imagen opcional */}
          <div>
            <label
              htmlFor="damage-image"
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
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
                Archivo seleccionado:{" "}
                <span className="font-medium">{imageFile.name}</span>
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
            disabled={submitting || !description.trim() || habitacionId === null}
            className="px-6 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl hover:from-teal-700 hover:to-teal-800 disabled:opacity-50"
          >
            {submitting ? "Enviando…" : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
}
