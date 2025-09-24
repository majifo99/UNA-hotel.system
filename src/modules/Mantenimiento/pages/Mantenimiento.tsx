import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { FilterBar } from "../components/FilterBar";
import { MaintenanceTable } from "../components/MaintenanceTable";
import SummaryChips from "../components/SummaryCards";
import { useMaintenance } from "../hooks/useMaintenance";
import type { MaintenanceItem } from "../types/mantenimiento";

// Icons
import { LogOut, Wrench } from "lucide-react";

// Campanita
import NotificationBell, {
  type NotificationItem,
} from "../components/NotificationBell";

// Mock
import { NOTIFICATIONS_MOCK } from "../data/notifications.mock";

import AssignMaintenanceModal from "../components/modals/AssignMantenimiento";

export default function MantenimientoPage() {
  const { filtered, metrics, query, setQuery, status, setStatus, loading } =
    useMaintenance();

  const navigate = useNavigate();
  const [assignOpen, setAssignOpen] = useState(false);
  // Notificaciones
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  useEffect(() => {
    setNotifications(NOTIFICATIONS_MOCK);
  }, []);

  // Pendientes locales creados al aceptar una notificación
  const [localPendings, setLocalPendings] = useState<MaintenanceItem[]>([]);

  // Mapear notificación -> fila de tabla
  const mapNotifToRow = (n: NotificationItem): MaintenanceItem => {
    const roomNumber = Number((n.room || "").replace(/\D+/g, "")) || undefined;
    return {
      // Campos mínimos para que la tabla pinte sin romper tipos
      id: `notif-${n.id}` as any, // si tu tipo espera string estricta, castea
      code: `MNT-NOTIF-${n.id}`,
      kind: "Correctivo",
      area: n.description.slice(0, 60),
      roomNumber: roomNumber || 0,
      status: "Pendiente" as any,
      assignee: undefined,
      scheduledAt: undefined,
      priority: n.priority as any,
    };
  };

  // Aceptar / Rechazar en la campanita
  const handleAccept = (n: NotificationItem) => {
    setLocalPendings((prev) => [mapNotifToRow(n), ...prev]);
    setNotifications((prev) =>
      prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
    );
  };
  const handleReject = (n: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((x) => (x.id === n.id ? { ...x, read: true, dismissed: true } : x))
    );
  };

  // Filas que verá la tabla: pendientes locales + datos del hook
  const allRows = useMemo(
    () => [...localPendings, ...filtered],
    [localPendings, filtered]
  );

  // Contadores ajustados (añade locales)
  const counts = useMemo(() => {
    const extraPending = localPendings.filter((r) => r.status === "Pendiente").length;
    return {
      all: metrics.total + localPendings.length,
      pending: metrics.pending + extraPending,
      inProgress: metrics.inProgress,
      done: metrics.done,
    };
  }, [metrics, localPendings]);

  // Navegación desde la notificación (opcional)
  const handleNotificationClick = (n: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
    );
    navigate(`/mantenimientos/detalle/${n.id}`);
  };

  // Modal Asignar técnico

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-[#0f172a]">
      <div className="mx-auto max-w-7xl py-6">
        {/* HEADER */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-3xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-teal-600 to-teal-700">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <Wrench className="w-4 h-4 text-teal-700" />
                </div>
              </div>
              <div>
                <h1 className="text-[22px] font-semibold leading-6">
                  Sistema de Mantenimiento
                </h1>
                <p className="text-sm text-slate-600">
                  Gestión integral de tareas · Dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <NotificationBell
                notifications={notifications}
                onItemClick={handleNotificationClick}
                onOpenAll={() => navigate("/notificaciones")}
                markAllAsRead={() =>
                  setNotifications((prev) => prev.map((x) => ({ ...x, read: true })))
                }
                onAccept={handleAccept}   // <- clave
                onReject={handleReject}
              />

              <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 bg-white/80 hover:bg-white shadow-sm">
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </header>

        {/* FILTROS + ACCIONES */}
        <div className="mt-4 rounded-3xl bg-white/80 backdrop-blur-sm">
          <div className="px-6 py-4">
            <FilterBar
              query={query}
              onQuery={setQuery}
              status={status}
              onStatus={setStatus}
              total={allRows.length}  
             onNew={() => setAssignOpen(true)}        // 👈 abre el modal
              onOpenDate={() => {}}
            />

            <div className="mt-3">
              <SummaryChips status={status} onStatus={setStatus} counts={counts} />
            </div>
          </div>
        </div>

        {/* TABLA */}
        <div className="px-0 sm:px-1 md:px-2 lg:px-0 mt-4">
          {loading ? (
            <div className="mx-6 grid place-items-center rounded-2xl bg-white p-16 text-gray-500">
              Cargando mantenimiento...
            </div>
          ) : (
            <div className="mx-6">
              <MaintenanceTable items={allRows} />
            </div>
          )}

{      /* MODAL: Asignar técnico */}
        <AssignMaintenanceModal
          isOpen={assignOpen}
          onClose={() => setAssignOpen(false)}
          item={null} // Nuevo mantenimiento, no uno existente
        />
    </div>
      </div>
    </div>
  );
}
