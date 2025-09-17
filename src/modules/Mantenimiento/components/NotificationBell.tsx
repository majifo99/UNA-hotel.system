import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  X,
  AlertTriangle,
  Clock,
  Home,
  User2,
  ChevronRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";

/* ==== Tipos ==== */
export type Priority = "Urgente" | "Alta" | "Media";
export type NotificationItem = {
  id: string | number;
  title: string;            // p.ej. "Reporte de daño - Hab. 205"
  description: string;      // breve resumen
  room: string;             // "Hab. 205"
  reporter: string;         // "Ana López"
  priority: Priority;
  createdAt: Date;          // para mostrar "243d" etc.
  read?: boolean;           // no leída = false/undefined
  dismissed?: boolean;      // descartada
};

/* ==== Utilidades ==== */
const prioStyles: Record<
  Priority,
  { badge: string; dot: string; text: string }
> = {
  Urgente: {
    badge: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
    dot: "text-rose-600",
    text: "text-rose-700",
  },
  Alta: {
    badge: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
    dot: "text-amber-600",
    text: "text-amber-700",
  },
  Media: {
    badge: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
    dot: "text-slate-500",
    text: "text-slate-700",
  },
};

function timeAgo(from: Date): string {
  const s = Math.floor((Date.now() - from.getTime()) / 1000);
  const d = Math.floor(s / 86400);
  if (d >= 1) return `${d}d`;
  const h = Math.floor(s / 3600);
  if (h >= 1) return `${h}h`;
  const m = Math.max(1, Math.floor(s / 60));
  return `${m}m`;
}

/* ==== Hook: click afuera ==== */
function useClickOutside<T extends HTMLElement>(onOutside: () => void) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOutside();
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onOutside]);
  return ref;
}

/* ==== Componente principal ==== */
type Props = Readonly<{
  notifications: NotificationItem[];
  onOpenAll?: () => void;                 // “Ver todas…”
  onItemClick?: (n: NotificationItem) => void;
  markAllAsRead?: () => void;
  onAccept?: (n: NotificationItem) => void;  // ✔ aceptar → va a la tabla
  onReject?: (n: NotificationItem) => void;  // ✖ descartar
}>;

export default function NotificationBell({
  notifications,
  onOpenAll,
  onItemClick,
  markAllAsRead,
  onAccept,
  onReject,
}: Props) {
  const [open, setOpen] = useState(false);
  const unread = useMemo(
    () => notifications.filter((n) => !n.read && !n.dismissed).length,
    [notifications]
  );

  // cerrar con ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const panelRef = useClickOutside<HTMLDivElement>(() => setOpen(false));

  const visible = notifications.filter((n) => !n.dismissed);

  return (
    <div className="relative">
      {/* Botón campana */}
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium text-slate-700 bg-white/80 hover:bg-white border border-slate-300 shadow-sm"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 rounded-full bg-rose-600 text-white text-[10px] font-semibold px-1.5 py-0.5">
            {unread}
          </span>
        )}
      </button>

      {/* Panel flotante */}
      {open && (
        <div
          ref={panelRef}
         
          aria-label="Notificaciones"
          className="absolute right-0 mt-2 w-[380px] max-h-[70vh] rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Notificaciones
              </h3>
              <p className="text-xs text-slate-500">{unread} sin leer</p>
            </div>
            <div className="flex items-center gap-1">
              {markAllAsRead && unread > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-teal-700 hover:underline"
                >
                  Marcar como leídas
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-md hover:bg-slate-100"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Lista */}
          <div className="max-h-[54vh] overflow-y-auto divide-y divide-slate-100">
            {visible.length === 0 && (
              <div className="p-6 text-center text-sm text-slate-500">
                No hay notificaciones
              </div>
            )}

            {visible.map((n) => {
              const pr = prioStyles[n.priority];
              return (
                <div
                  key={n.id}
                  className={[
                    "w-full text-left px-4 py-3 group",
                    !n.read ? "bg-indigo-50/40" : "bg-white",
                    "hover:bg-slate-50",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-3">
                    {/* acciones ✔ ✖ */}
                    <div className="mt-0.5 flex flex-col items-center gap-1">
                      <button
                        type="button"
                        aria-label="Aceptar notificación"
                        className="p-1 rounded hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                        onClick={() => onAccept?.(n)}
                      >
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      </button>
                      <button
                        type="button"
                        aria-label="Descartar notificación"
                        className="p-1 rounded hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-300"
                        onClick={() => onReject?.(n)}
                      >
                        <XCircle className="h-5 w-5 text-rose-600" />
                      </button>
                    </div>

                    <div className="mt-0.5">
                      <AlertTriangle className={`h-4 w-4 ${pr.dot}`} />
                    </div>

                    {/* detalle clickeable */}
                    <button
                      type="button"
                      className="flex-1 min-w-0 text-left rounded focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                      onClick={() => onItemClick?.(n)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[13px] font-semibold text-slate-900 truncate">
                          {n.title}
                        </p>
                        <span className="text-[11px] text-slate-400 whitespace-nowrap">
                          {timeAgo(n.createdAt)}
                        </span>
                      </div>

                      <p className="mt-0.5 text-xs text-slate-600 line-clamp-2">
                        {n.description}
                      </p>

                      <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Home className="h-3 w-3" />
                          {n.room}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <User2 className="h-3 w-3" />
                          {n.reporter}
                        </span>
                        <span
                          className={[
                            "ml-auto inline-flex items-center gap-1 rounded-md px-1.5 py-0.5",
                            "text-[11px] font-medium ring-1",
                            pr.badge,
                          ].join(" ")}
                        >
                          <Clock className="h-3 w-3 opacity-70" />
                          {n.priority}
                        </span>
                      </div>
                    </button>

                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100">
            <button
              onClick={() => onOpenAll?.()}
              className="text-sm text-teal-700 hover:underline"
            >
              Ver todas las notificaciones
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
