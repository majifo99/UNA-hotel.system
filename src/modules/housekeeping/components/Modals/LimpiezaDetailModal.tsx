import { useEffect, useMemo, useState } from "react";
import {
  X,
  BadgeCheck,
  UserCheck,
  DoorOpen,
  CalendarDays,
  Clock,
} from "lucide-react";
import type { LimpiezaItem } from "../../types/limpieza";
import { limpiezaService } from "../../services/limpiezaService";
import { formatDatetimeUTC } from "../../utils/formatters";

const BRAND_GREEN = "#304D3C";
const cn = (...xs: Array<string | false | null | undefined>) =>
  xs.filter(Boolean).join(" ");

// ---------------- Helper para descripción de la habitación ----------------
const getRoomDescription = (item: any): string => {
  if (!item?.habitacion) return "—";
  const direct =
    item.habitacion.descripcion ??
    item.habitacion.descripcion_habitacion ??
    item.habitacion.desc ??
    item.habitacion.detalle ??
    item.habitacion.detalles ??
    item.habitacion.caracteristicas;
  if (direct && typeof direct === "string" && direct.trim()) return direct;
  const fromTipo = item.habitacion.tipo?.descripcion;
  if (fromTipo && typeof fromTipo === "string" && fromTipo.trim()) return fromTipo;
  const weird =
    item.habitacion.Descripcion ??
    item.habitacion.DescripcionHabitacion ??
    item.habitacion.DESCRIPCION;
  if (weird && typeof weird === "string" && weird.trim()) return weird;
  return "—";
};

type Props = Readonly<{
  open: boolean;
  limpiezaId: number | null;
  onClose: () => void;
}>;

function Pill({
  children,
  tone = "slate",
}: Readonly<{ children: React.ReactNode; tone?: "slate" | "green" | "rose" }>) {
  const map = {
    slate: "bg-slate-50 border-slate-200 text-slate-700",
    green:
      "bg-[rgba(48,77,60,0.08)] border-[rgba(48,77,60,0.25)] text-[var(--brand-green)]",
    rose: "bg-rose-50 border-rose-200 text-rose-700",
  } as const;
  return (
    <span
      style={{ ["--brand-green" as any]: BRAND_GREEN }}
      className={cn(
        "px-2 py-0.5 rounded-full text-xs font-medium border",
        map[tone]
      )}
    >
      {children}
    </span>
  );
}

const card = "rounded-xl border border-slate-200 bg-white p-4";

export default function LimpiezaDetailModal({ open, limpiezaId, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState<LimpiezaItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !limpiezaId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await limpiezaService.getLimpiezaById(limpiezaId);
        if (!cancelled) {
          setItem(res.data);
        }
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

  // Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const titulo = useMemo(() => `Habitación ${item?.habitacion?.numero ?? "—"}`, [item]);
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
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div
          className="px-6 py-5"
          style={{
            background: `linear-gradient(90deg, ${BRAND_GREEN} 0%, ${BRAND_GREEN}E6 100%)`,
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center ring-1 ring-white/20">
                <DoorOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2
                  id="limpieza-dialog-title"
                  className="text-white text-lg font-semibold leading-tight"
                >
                  {titulo}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {item?.fecha_final && (
                <span className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/10 px-2 py-0.5 text-xs font-medium text-white/90">
                  <BadgeCheck className="w-3 h-3 text-white/80" />
                  <span>Finalizada: {formatDatetimeUTC(item.fecha_final)}</span>
                </span>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg text-white/90 hover:bg-white/10 focus:outline-none"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[75vh] overflow-y-auto">
          <div className="px-6 py-5">
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
              <div className="space-y-6">
                {/* Resumen superior */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Estado */}
                  <div className="relative border-l-4 border-l-emerald-700">
                    <div className={card}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-700"></div>
                        <h3
                          className="text-[11px] font-bold tracking-wider uppercase"
                          style={{ color: BRAND_GREEN }}
                        >
                          Estado
                        </h3>
                      </div>
                      <div className="mt-2 mb-4">
                        <Pill
                          tone={
                            estadoNombre?.toLowerCase() === "limpia"
                              ? "green"
                              : "rose"
                          }
                        >
                          {estadoNombre}
                        </Pill>
                      </div>
                      <div className="space-y-2.5 text-sm">
                        <div className="flex items-baseline justify-between border-b border-dotted border-slate-200 pb-2">
                          <span className="text-slate-500">Tipo:</span>
                          <strong className="text-slate-800">
                            {item.habitacion?.tipo?.nombre ?? "—"}
                          </strong>
                        </div>
                        <div className="flex items-baseline justify-between border-b border-dotted border-slate-200 pb-2">
                          <span className="text-slate-500">Piso:</span>
                          <strong className="text-slate-800">
                            {item.habitacion?.piso ?? "—"}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Programación */}
                  <div className="relative border-l-4 border-l-purple-600">
                    <div className={card}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-600"></div>
                        <h3
                          className="text-[11px] font-bold tracking-wider uppercase"
                          style={{ color: BRAND_GREEN }}
                        >
                          Programación
                        </h3>
                      </div>
                      <div className="space-y-3 mt-2">
                        <div className="flex items-start gap-2">
                          <CalendarDays
                            className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-600"
                          />
                          <div className="flex-1">
                            <div className="text-xs text-slate-500 mb-0.5">
                              Inicio
                            </div>
                            <div className="text-sm font-medium text-slate-800">
                              {formatDatetimeUTC(item.fecha_inicio)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 pt-2 border-t border-dotted border-slate-200">
                          <Clock
                            className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-600"
                          />
                          <div className="flex-1">
                            <div className="text-xs text-slate-500 mb-0.5">
                              Fin
                            </div>
                            <div className="text-sm font-medium text-slate-800">
                              {formatDatetimeUTC(item.fecha_final)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Asignación */}
                  <div className="relative border-l-4 border-l-blue-600">
                    <div className={card}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                        <h3
                          className="text-[11px] font-bold tracking-wider uppercase"
                          style={{ color: BRAND_GREEN }}
                        >
                          Asignación
                        </h3>
                      </div>
                      <div className="space-y-3 mt-2">
                        <div className="flex items-start gap-2">
                          <UserCheck
                            className="w-5 h-5 mt-0.5 flex-shrink-0"
                            style={{ color: BRAND_GREEN }}
                          />
                          <div className="flex-1">
                            <div className="text-xs text-slate-500 mb-0.5">
                              Asignado a
                            </div>
                            <div className="text-sm font-semibold text-slate-800">
                              {item.usuario_asignado?.nombre ||
                                (item as any)?.asignador?.name ||
                                "—"}
                            </div>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-dotted border-slate-200">
                          <div className="text-xs text-slate-500 mb-0.5">
                            Última limpieza
                          </div>
                          <div className="text-sm font-medium text-slate-800">
                            {formatDatetimeUTC(item.fecha_final)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notas y descripción */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Notas */}
                  <div className="border-l-4 border-l-amber-500">
                    <div className={card}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">
                          Notas especiales
                        </h3>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed min-h-[60px] whitespace-pre-wrap">
                        {item.notas || (
                          <span className="text-slate-400 italic">Sin notas</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Descripción */}
                  <div className="border-l-4 border-l-slate-300">
                    <div className={card}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-400"></div>
                        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">
                          Descripción de la habitación
                        </h3>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed min-h-[60px] whitespace-pre-wrap">
                        {getRoomDescription(item)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg border-2 border-slate-300 text-slate-700 font-medium hover:bg-slate-100 hover:border-slate-400 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Cerrar
          </button>
        </div>
      </dialog>
    </div>
  );
}
