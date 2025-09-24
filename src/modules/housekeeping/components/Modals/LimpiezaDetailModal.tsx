import { useEffect, useMemo, useState } from "react";
import { X, BadgeCheck, Clock, UserCheck, DoorOpen } from "lucide-react";
import type { LimpiezaItem } from "../../types/limpieza";
import { limpiezaService } from "../../services/limpiezaService";

const cn = (...xs: Array<string | false | null | undefined>) =>
  xs.filter(Boolean).join(" ");

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

function PrioridadBadge({
  prioridad,
}: Readonly<{ prioridad?: "baja" | "media" | "alta" | "urgente" | null }>) {
  if (!prioridad) return <Pill>—</Pill>;
  const tones = {
    baja: "slate",
    media: "blue",
    alta: "orange",
    urgente: "rose",
  } as const;
  return <Pill tone={tones[prioridad]}>{prioridad.toUpperCase()}</Pill>;
}

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

  // Datos quemados (placeholder)
  const specialRequests =
    "Cliente alérgico al polen – usar productos hipoalergénicos";
  const roomFeatures = ["Balcón", "Jacuzzi", "Minibar", "Caja fuerte"];
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
      {/* Overlay como <button> accesible */}
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <DoorOpen className="w-5 h-5 text-teal-600" />
            <h2
              id="limpieza-dialog-title"
              className="text-lg font-semibold text-slate-900"
            >
              {titulo}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
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
                  <div className="text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-600" />
                      <span>
                        Inicio:{" "}
                        <strong>
                          {item.fecha_inicio
                            ? new Date(
                                item.fecha_inicio
                              ).toLocaleString()
                            : "—"}
                        </strong>
                      </span>
                    </div>
                    <div className="mt-1">
                      <span className="text-slate-500">Duración: </span>
                      <strong>
                        {item.fecha_inicio && item.fecha_final
                          ? Math.max(
                              1,
                              Math.round(
                                (new Date(
                                  item.fecha_final
                                ).getTime() -
                                  new Date(
                                    item.fecha_inicio
                                  ).getTime()) /
                                  60000
                              )
                            ) + " minutos"
                          : "45 minutos"}
                      </strong>
                    </div>
                    <div className="mt-1">
                      <span className="text-slate-500">Prioridad: </span>
                      <PrioridadBadge
                        prioridad={(item.prioridad as any) ?? null}
                      />
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
                      <span className="text-slate-500">
                        Última limpieza:{" "}
                      </span>
                      <strong>
                        {item.fecha_final
                          ? new Date(item.fecha_final).toLocaleString()
                          : "—"}
                      </strong>
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

              {/* Solicitudes especiales */}
              <div className="rounded-xl border border-slate-200 p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="text-slate-700 font-medium">
                    Solicitudes especiales
                  </span>
                </div>
                <div className="text-sm text-slate-700">
                  {specialRequests}
                </div>
              </div>

              {/* Características */}
              <div className="mb-6">
                <div className="text-slate-700 font-medium mb-2">
                  Características de la habitación
                </div>
                <div className="flex flex-wrap gap-2">
                  {roomFeatures.map((f) => (
                    <Pill key={f}>{f}</Pill>
                  ))}
                </div>
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

function AlertTriangle(
  props: Readonly<React.SVGProps<SVGSVGElement>>
) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 9v4m0 4h.01"
      />
    </svg>
  );
}
