// src/modules/housekeeping/components/Modals/LimpiezaDetailModal.tsx
import { useEffect, useMemo, useState } from "react";
import { X, BadgeCheck, UserCheck, DoorOpen, CalendarDays, Clock } from "lucide-react";
import type { LimpiezaItem } from "../../types/limpieza";
import { limpiezaService } from "../../services/limpiezaService";

const BRAND_GREEN = "#304D3C"; // mismo verde del header de la tabla
const cn = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(" ");

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
    green: "bg-[rgba(48,77,60,0.08)] border-[rgba(48,77,60,0.25)] text-[var(--brand-green)]",
    rose: "bg-rose-50 border-rose-200 text-rose-700",
  } as const;
  return (
    <span
      style={{ ["--brand-green" as any]: BRAND_GREEN }}
      className={cn("px-2 py-0.5 rounded-full text-xs font-medium border", map[tone])}
    >
      {children}
    </span>
  );
}

// Helper fecha es-CR
const fmtDateTime = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString("es-CR", { dateStyle: "medium", timeStyle: "short" }) : "—";

// Reutilizable para tarjetas
const card = "rounded-xl border border-slate-200 bg-white p-4";

export default function LimpiezaDetailModal({
  open,
  limpiezaId,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState<LimpiezaItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  // (Demo) Historial
  const history = [
    { fecha: "22/9/2025", usuario: "Ana García", texto: "Todo en orden", estado: "Completado" },
    { fecha: "21/9/2025", usuario: "María López", texto: "Cambio de cortinas", estado: "Completado" },
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

  // Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const titulo = useMemo(() => `Habitación ${item?.habitacion?.numero ?? "—"}`, [item]);
  const estadoNombre =
    (item as any)?.estado?.nombre ?? (item as any)?.estadoHabitacion?.nombre ?? "—";

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
        {/* Header con banda verde (solo número) */}
        <div
          className="px-6 py-5"
          style={{ background: `linear-gradient(90deg, ${BRAND_GREEN} 0%, ${BRAND_GREEN}E6 100%)` }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center ring-1 ring-white/20">
                <DoorOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 id="limpieza-dialog-title" className="text-white text-lg font-semibold leading-tight">
                  {titulo}
                </h2>
                {/* quitamos tipo y piso del header */}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {item?.fecha_final && (
                <span className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/10 px-2 py-0.5 text-xs font-medium text-white/90">
                  <BadgeCheck className="w-3 h-3 text-white/80" />
                  <span>Finalizada: {fmtDateTime(item.fecha_final)}</span>
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

        {/* Body con grid de 12 col y footer sticky */}
        <div className="max-h-[75vh] overflow-y-auto">
          <div className="px-6 py-5">
            {loading && <div className="text-sm text-slate-500 py-10 text-center">Cargando detalles…</div>}
            {error && <div className="text-sm text-rose-600 py-10 text-center">Error: {error}</div>}

            {!loading && !error && item && (
              <>
                {/* Resumen superior */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
                  {/* ESTADO + (Tipo / Piso) — mantiene el mismo ancho/alto del card */}
                  <div className={cn(card, "md:col-span-3")}>
                    <div className="text-[11px] font-semibold tracking-wide" style={{ color: BRAND_GREEN }}>
                      ESTADO
                    </div>
                    <div className="mt-2">
                      <Pill tone={estadoNombre?.toLowerCase() === "limpia" ? "green" : "rose"}>
                        {estadoNombre}
                      </Pill>
                    </div>

                    {/* Nueva info básica dentro del mismo card */}
                    <div className="mt-3 grid grid-cols-2 gap-y-1 text-sm text-slate-700">
                      <div className="col-span-2">
                        <span className="text-slate-500">Tipo: </span>
                        <strong>{item.habitacion?.tipo?.nombre ?? "—"}</strong>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500">Piso: </span>
                        <strong>{item.habitacion?.piso ?? "—"}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Programación (5) */}
                  <div className={cn(card, "md:col-span-5")}>
                    <div className="text-[11px] font-semibold tracking-wide" style={{ color: BRAND_GREEN }}>
                      PROGRAMACIÓN
                    </div>
                    <div className="text-sm mt-2 space-y-2">
                      <div className="flex items-center gap-2 text-slate-700">
                        <CalendarDays className="w-4 h-4" />
                        <span>
                          Inicio: <strong>{fmtDateTime(item.fecha_inicio)}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Clock className="w-4 h-4" />
                        <span>
                          Fin: <strong>{fmtDateTime(item.fecha_final)}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Asignación (4) */}
                  <div className={cn(card, "md:col-span-4")}>
                    <div className="text-[11px] font-semibold tracking-wide" style={{ color: BRAND_GREEN }}>
                      ASIGNACIÓN
                    </div>
                    <div className="text-sm mt-2">
                      <div className="flex items-center gap-2 text-slate-700">
                        <UserCheck className="w-4 h-4" style={{ color: BRAND_GREEN }} />
                        <span>
                          Asignado a:{" "}
                          <strong>{item.usuario_asignado?.nombre ?? (item as any)?.asignador?.name ?? "—"}</strong>
                        </span>
                      </div>
                      <div className="mt-1 text-slate-700">
                        <span className="text-slate-500">Última limpieza: </span>
                        <strong>{fmtDateTime(item.fecha_final)}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notas y descripción (5 / 7) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
                  <div className={cn(card, "md:col-span-5")}>
                    <div className="text-slate-700 font-medium mb-2">Notas especiales</div>
                    <p className="text-sm text-slate-700 min-h-10">{item.notas ?? "—"}</p>
                  </div>

                  <div className={cn(card, "md:col-span-7")}>
                    <div className="text-slate-700 font-medium mb-2">Descripción de la habitación</div>
                    <p className="text-sm text-slate-700 min-h-10">{getRoomDescription(item)}</p>
                  </div>
                </div>

                {/* Historial */}
                <div className={cn(card, "mb-2")}>
                  <div className="text-slate-700 font-medium mb-3">Historial de limpieza</div>
                  <div className="space-y-3">
                    {history.map((h) => {
                      const key = `${h.fecha}-${h.usuario}-${h.estado}`;
                      return (
                        <div
                          key={key}
                          className="grid grid-cols-1 md:grid-cols-12 items-center gap-3 rounded-lg border border-slate-200/70 p-3"
                        >
                          <div className="md:col-span-3">
                            <div className="text-sm font-medium text-slate-900">{h.fecha}</div>
                            <div className="text-xs text-slate-600">{h.usuario}</div>
                          </div>
                          <div className="md:col-span-9 flex items-center justify-between gap-3">
                            <Pill tone="green">
                              <span className="inline-flex items-center gap-1">
                                <BadgeCheck className="w-3 h-3" /> {h.estado}
                              </span>
                            </Pill>
                            <div className="text-xs text-slate-600">{h.texto}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-200 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Cerrar
          </button>
        </div>
      </dialog>
    </div>
  );
}
