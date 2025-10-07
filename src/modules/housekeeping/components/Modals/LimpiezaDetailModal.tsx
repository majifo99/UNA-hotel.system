import { useEffect, useMemo, useState } from "react";
import { X, BadgeCheck,  UserCheck, DoorOpen } from "lucide-react";
import type { LimpiezaItem } from "../../types/limpieza";
import { limpiezaService } from "../../services/limpiezaService";

const cn = (...xs: Array<string | false | null | undefined>) =>
  xs.filter(Boolean).join(" ");

// ---------------- Helper para descripción ----------------
const getRoomDescription = (item: any): string => {
  if (!item?.habitacion) return "—";

  // 1) Campo directo
  const direct =
    item.habitacion.descripcion ??
    item.habitacion.descripcion_habitacion ??
    item.habitacion.desc ??
    item.habitacion.detalle ??
    item.habitacion.detalles ??
    item.habitacion.caracteristicas;
  if (direct && typeof direct === "string" && direct.trim()) return direct;

  // 2) Desde tipo de habitación
  const fromTipo = item.habitacion.tipo?.descripcion;
  if (fromTipo && typeof fromTipo === "string" && fromTipo.trim()) return fromTipo;

  // 3) Variantes con mayúsculas
  const weird =
    item.habitacion.Descripcion ??
    item.habitacion.DescripcionHabitacion ??
    item.habitacion.DESCRIPCION;
  if (weird && typeof weird === "string" && weird.trim()) return weird;

  return "—";
};

interface Props {
  readonly open: boolean;
  readonly limpiezaId: number | null;
  readonly onClose: () => void;
  readonly onEdit?: (item: LimpiezaItem) => void;
  readonly onMarkCompleted?: (id: number) => Promise<void> | void;
}

function Pill({
  children,
  tone = "slate",
}: Readonly<{
  children: React.ReactNode;
  tone?: "slate" | "blue" | "orange" | "rose" | "teal";
}>) {
  const map = {
    slate: "bg-slate-50 border-slate-200 text-slate-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
    rose: "bg-rose-50 border-rose-200 text-rose-700",
    teal: "bg-teal-50 border-teal-200 text-teal-700",
  } as const;
  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded-full text-xs font-medium border",
        map[tone]
      )}
    >
      {children}
    </span>
  );
}


// Helper para formatear fechas en es-CR
const fmtDateTime = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleString("es-CR", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

export default function LimpiezaDetailModal({
  open,
  limpiezaId,
  onClose,
  onEdit,
  onMarkCompleted,
}: Readonly<Props>) {
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState<LimpiezaItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Datos de ejemplo
  const history = [
    {
      fecha: "22/9/2025",
      usuario: "Ana García",
      texto: "Todo en orden",
      estado: "Completado",
    },
    {
      fecha: "21/9/2025",
      usuario: "María López",
      texto: "Cambio de cortinas",
      estado: "Completado",
    },
  ];

  useEffect(() => {
    if (!open || !limpiezaId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await limpiezaService.getLimpiezaById(limpiezaId);
        if (!cancelled) setItem(res.data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Error cargando detalles");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, limpiezaId]);

  // Manejo global de Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const titulo = useMemo(() => {
    const num = item?.habitacion?.numero ?? "—";
    return `Detalles de Habitación ${num}`;
  }, [item]);

  const estadoNombre =
    (item as any)?.estado?.nombre ??
    (item as any)?.estadoHabitacion?.nombre ??
    "—";

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4">
      {/* Overlay */}
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        aria-label="Cerrar diálogo"
        onClick={onClose}
      />

      <dialog
        open
        aria-modal="true"
        aria-labelledby="limpieza-dialog-title"
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <DoorOpen className="w-5 h-5 text-teal-600" />
            <h2
              id="limpieza-dialog-title"
              className="text-lg font-semibold text-slate-900"
            >
              {titulo}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {item?.fecha_final && (
              <Pill tone="teal">
                <span className="inline-flex items-center gap-1">
                  <BadgeCheck className="w-3 h-3" />
                  <span className="font-medium">
                    Finalizada: {fmtDateTime(item.fecha_final)}
                  </span>
                </span>
              </Pill>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[75vh] overflow-y-auto px-6 py-5">
          {loading && (
            <div className="text-sm text-slate-500 py-10 text-center">
              Cargando detalles…
            </div>
          )}
          {error && (
            <div className="text-sm text-rose-600 py-10 text-center">
              Error: {error}
            </div>
          )}
          {!loading && !error && item && (
            <>
              {/* Top cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="text-sm text-slate-500 mb-1">
                    Información básica
                  </div>
                  <div className="text-sm">
                    <div>
                      <span className="text-slate-500">Tipo: </span>
                      <strong>{item.habitacion?.tipo?.nombre ?? "—"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Piso: </span>
                      <strong>{item.habitacion?.piso ?? "—"}</strong>
                    </div>
                    <div className="mt-1">
                      <span className="text-slate-500">Estado: </span>
                      <Pill
                        tone={
                          (estadoNombre?.toLowerCase() === "limpia"
                            ? "teal"
                            : "rose") as any
                        }
                      >
                        {estadoNombre}
                      </Pill>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="text-sm text-slate-500 mb-1">Programación</div>
                  <div className="text-sm space-y-1.5">
                    <div className="flex items-center gap-2">
                     
                      <span>
                        Inicio: <strong>{fmtDateTime(item.fecha_inicio)}</strong>
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Fin: </span>
                      <strong>{fmtDateTime(item.fecha_final)}</strong>
                    </div>
                    <div>
                     
                    </div>
                    
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="text-sm text-slate-500 mb-1">Asignación</div>
                  <div className="text-sm">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-teal-600" />
                      <span>
                        Asignado a: <strong>—</strong>
                      </span>
                    </div>
                    <div className="mt-1">
                      <span className="text-slate-500">Última limpieza: </span>
                      <strong>{fmtDateTime(item.fecha_final)}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Descripción / Notas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-slate-700 font-medium">
                      Descripción de la tarea
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">
                    {item.descripcion ?? "—"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-slate-700 font-medium">
                      Notas especiales
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">{item.notas ?? "—"}</p>
                </div>
              </div>

              {/* Descripción Habitación */}
              <div className="rounded-xl border border-slate-200 p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-slate-700 font-medium">
                    Descripción de la habitación
                  </span>
                </div>
                <p className="text-sm text-slate-700">
                  {getRoomDescription(item)}
                </p>
              </div>

              {/* Historial */}
              <div className="mb-2">
                <div className="text-slate-700 font-medium mb-2">
                  Historial de limpieza
                </div>
                <div className="space-y-3">
                  {history.map((h) => {
                    const key = `${h.fecha}-${h.usuario}-${h.estado}`;
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between rounded-xl border border-slate-200 p-3"
                      >
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {h.fecha}
                          </div>
                          <div className="text-xs text-slate-600">
                            {h.usuario}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Pill tone="teal">
                            <span className="inline-flex items-center gap-1">
                              <BadgeCheck className="w-3 h-3" /> {h.estado}
                            </span>
                          </Pill>
                          <div className="text-xs text-slate-600">
                            {h.texto}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 px-6 py-4 border-t border-slate-200 bg-white">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cerrar
            </button>
            {item && (
              <button
                type="button"
                onClick={() => onEdit?.(item)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Editar
              </button>
            )}
          </div>
          {limpiezaId && (
            <button
              type="button"
              onClick={async () => {
                await onMarkCompleted?.(limpiezaId);
                onClose();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700"
            >
              <BadgeCheck className="w-4 h-4" />
              Marcar como completado
            </button>
          )}
        </div>
      </dialog>
    </div>
  );
}
