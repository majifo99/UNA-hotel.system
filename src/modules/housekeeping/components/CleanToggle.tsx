// src/components/CleanToggle.tsx

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

const cn = (...xs: Array<string | false | null | undefined>) =>
  xs.filter(Boolean).join(" ");

export type FinalizePayload = { fecha_final: string; notas?: string | null };

export type CleanToggleProps = {
  id: number;
  clean: boolean;
  notas?: string | null;
  onFinalize: (id: number, payload: FinalizePayload) => Promise<any>;
  onReopen?: (id: number) => Promise<any>;
  onOptimisticAdd?: (id: number) => void;
  onOptimisticRemove?: (id: number) => void;
  disabled?: boolean;
};

export default function CleanToggle({
  id,
  clean,
  notas,
  onFinalize,
  onReopen,
  onOptimisticAdd,
  onOptimisticRemove,
  disabled = false,
}: Readonly<CleanToggleProps>) {
  const [busy, setBusy] = useState(false);

  const handleMarkClean = async () => {
    if (clean || busy || disabled) return;
    const nowISO = new Date().toISOString();
    try {
      onOptimisticAdd?.(id);
      console.log(
        `[CleanToggle] (optimistic) Marcando como limpia id=${id} a las ${nowISO}`
      );
      setBusy(true);

      const payload: FinalizePayload = { fecha_final: nowISO, notas: notas ?? null };
      await onFinalize(id, payload);

      console.log(
        `[CleanToggle] ✓ Limpieza finalizada (OK) id=${id} payload=`,
        payload
      );
    } catch (e: any) {
      onOptimisticRemove?.(id);
      console.log(
        `[CleanToggle] (optimistic rollback) Revirtiendo a sucia id=${id}`
      );
      alert(
        String(
          (e?.message as string) ??
            "No se pudo marcar como limpia. Intenta de nuevo."
        )
      );
      console.error("[CleanToggle] onFinalize error:", e);
    } finally {
      setBusy(false);
    }
  };

  const handleReopen = async () => {
    if (!clean || busy || disabled || !onReopen) return;
    try {
      setBusy(true);
      await onReopen(id);
      console.log(`[CleanToggle] ↺ Limpieza reabierta (marcada como sucia) id=${id}`);
    } catch (e: any) {
      alert(
        String(
          (e?.message as string) ??
            "No se pudo reabrir la limpieza. Intenta de nuevo."
        )
      );
      console.error("[CleanToggle] onReopen error:", e);
    } finally {
      setBusy(false);
    }
  };

  const clickable =
    (!clean && !busy && !disabled) ||
    (clean && !!onReopen && !busy && !disabled);

  let title: string;
  if (clean) {
    title = onReopen ? "Marcar sucia" : "Limpia";
  } else {
    title = "Marcar limpia";
  }

  return (
    <button
      type="button"
      onClick={clean ? handleReopen : handleMarkClean}
      title={title}
      aria-label={title}
      disabled={!clickable}
      className={cn(
        "inline-flex items-center justify-center w-8 h-8 rounded-full border transition hover:scale-105",
        clean
          ? "border-green-300 hover:bg-green-50"
          : "border-rose-300 hover:bg-rose-50",
        (busy || disabled) && "opacity-50 cursor-not-allowed hover:scale-100"
      )}
    >
      {clean ? (
        <CheckCircle2 className="w-5 h-5 text-green-600" />
      ) : (
        <XCircle className="w-5 h-5 text-rose-600" />
      )}
    </button>
  );
}
