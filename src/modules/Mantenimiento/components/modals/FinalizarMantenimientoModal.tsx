// ========================================
// Modal para Finalizar Mantenimiento
// ========================================

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle2 } from "lucide-react";
import type { MantenimientoItem } from "../../types/mantenimiento";
import mantenimientoService from "../../services/maintenanceService";

type Props = Readonly<{
  isOpen: boolean;
  onClose: () => void;
  item: MantenimientoItem | null;
  onFinalized?: (updated?: MantenimientoItem) => void;
}>;

export default function FinalizarMantenimientoModal({
  isOpen,
  onClose,
  item,
  onFinalized,
}: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
    }
  }, [isOpen]);

  // Close with ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const habNumero = item?.habitacion?.numero ?? "—";
  const habPiso = item?.habitacion?.piso ?? "—";

  /**
   * Handle save - uses current date/time automatically
   */
  const handleSave = async () => {
    if (!item?.id) return;

    setSaving(true);
    setError(null);

    try {
      // Use current date/time automatically
      const now = new Date();
      const fechaFinalISO = now.toISOString();

      const body: any = {
        fecha_final: fechaFinalISO,
        id_usuario_asigna: null, // ✅ Limpiar usuario asignado al finalizar
        prioridad: null, // ✅ Limpiar prioridad al finalizar
        notas: null, // 🧹 Limpiar notas al finalizar
      };

      const resp = await mantenimientoService.updateMantenimiento(item.id, body);
      const updated = resp?.data;

      onFinalized?.(updated);
      onClose();
    } catch (err: unknown) {
      console.error("[FinalizarMantenimiento] finalizarMantenimiento failed:", err);
      const errorMessage = err instanceof Error ? err.message : "No se pudo finalizar el mantenimiento";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Cerrar modal"
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
      />
      <dialog
        open
        aria-modal="true"
        aria-labelledby="finalizar-modal-title"
        className="fixed z-[51] inset-0 m-0 grid place-items-center w-full h-full bg-transparent"
      >
        <div className="w-full max-w-lg max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ backgroundColor: "#304D3C" }}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-white/20 grid place-items-center">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2
                  id="finalizar-modal-title"
                  className="text-lg font-semibold leading-tight text-white"
                >
                  Finalizar Mantenimiento
                </h2>
                <p className="text-xs/5 text-white/80">
                  Marca el mantenimiento como completado
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="rounded-lg p-2 text-white/90 hover:bg-white/10 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 bg-white">
            {/* Info de la habitación */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Habitación / Piso
                  </p>
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    Habitación {habNumero}{" "}
                    <span className="text-slate-500 font-normal">· Piso {habPiso}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Info message */}
            <div className="rounded-xl px-4 py-3 text-sm bg-emerald-50 text-emerald-800 border border-emerald-200">
              <p className="font-medium mb-1">Finalización automática</p>
              <p className="text-xs text-emerald-700">
                Al finalizar se limpiará la asignación, prioridad y notas, y se registrará la fecha y hora actual del sistema.
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div
                role="alert"
                className="rounded-xl px-4 py-3 text-sm font-medium bg-rose-50 text-rose-800 border border-rose-200"
              >
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white px-6 py-4 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70"
              title="Finalizar mantenimiento"
            >
              <CheckCircle2 className="h-4 w-4" />
              {saving ? "Finalizando…" : "Finalizar Mantenimiento"}
            </button>
          </div>
        </div>
      </dialog>
    </>,
    document.body
  );
}
