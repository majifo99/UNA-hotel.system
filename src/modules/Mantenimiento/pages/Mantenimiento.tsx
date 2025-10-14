// src/modules/Mantenimiento/pages/MantenimientoPage.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FilterBar } from "../components/FilterBar";
import MaintenanceTable, { type MaintenanceTableRef } from "../components/MaintenanceTable";
import { useMaintenance } from "../hooks/useMaintenance";
import type { MantenimientoItem } from "../types/mantenimiento";
import NotificationBell, { type NotificationItem } from "../components/NotificationBell";
import { NOTIFICATIONS_MOCK } from "../data/notifications.mock";
import SolLogo from "../../../assets/Lanaku.png"; // ✅ logo igual que en Limpieza
import { FiLogOut } from "react-icons/fi";

export default function MantenimientoPage() {
  const { filtered, query, setQuery, status, setStatus, loading } = useMaintenance();
  const navigate = useNavigate();

  // 🔗 Ref a la tabla para poder abrir el modal de asignación desde el botón
  const tableRef = useRef<MaintenanceTableRef>(null);

  // 🔢 Cantidad seleccionada (para habilitar botón y mostrar contador)
  const [selectedCount, setSelectedCount] = useState(0);

  // 🔔 Notificaciones
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [localPendings, setLocalPendings] = useState<MantenimientoItem[]>([]);

  useEffect(() => {
    setNotifications(NOTIFICATIONS_MOCK);
  }, []);

  const coercePriority = (p?: string | null) => {
    const v = (p ?? "").trim().toLowerCase();
    if (v === "baja" || v === "media" || v === "alta" || v === "urgente") {
      return v;
    }
    return "media";
  };

  const mapNotifToRow = (n: NotificationItem): MantenimientoItem => ({
    id: Number(n.id),
    notas: n.description,
    prioridad: coercePriority(n.priority),
    fecha_inicio: new Date().toISOString(),
    habitacion: {
      id: 0,
      numero: n.room ?? "—",
      piso: "",
    },
    usuario_asignado: undefined,
    usuario_reporta: undefined,
    estado: { id: 1, nombre: "Pendiente" },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const handleAccept = (n: NotificationItem) => {
    setLocalPendings((prev) => [mapNotifToRow(n), ...prev]);
    setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
  };

  const handleReject = (n: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((x) => (x.id === n.id ? { ...x, read: true, dismissed: true } : x))
    );
  };

  const allRows = useMemo(() => [...localPendings, ...filtered], [localPendings, filtered]);

  const handleNotificationClick = (n: NotificationItem) => {
    setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    navigate(`/mantenimientos/detalle/${n.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-[#0f172a] font-sans">
      {/* =======================
          HEADER
      ======================== */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          {/* IZQUIERDA: logo + título */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ring-1 ring-slate-200 bg-slate-50">
              <img src={SolLogo} alt="Lanaku Sol" className="w-12 h-12 object-contain drop-shadow" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Sistema de Mantenimiento</h1>
              <p className="text-sm text-slate-600">Gestión integral de tareas · Dashboard</p>
            </div>
          </div>

          {/* DERECHA: notificaciones + logout */}
          <div className="flex items-center gap-3 flex-wrap">
            <NotificationBell
              notifications={notifications}
              onItemClick={handleNotificationClick}
              onOpenAll={() => navigate("/notificaciones")}
              markAllAsRead={() => setNotifications((prev) => prev.map((x) => ({ ...x, read: true })))}
              onAccept={handleAccept}
              onReject={handleReject}
            />

            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 bg-white/80 hover:bg-white shadow-sm">
              <FiLogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* =======================
          FILTROS
      ======================== */}
      <div className="px-6 sm:px-6 py-4">
        <FilterBar
          query={query}
          onQuery={setQuery}
          status={status}
          onStatus={setStatus}
          total={allRows.length}
          selectedCount={selectedCount}
          onOpenDate={() => {
            /* lógica fecha */
          }}
          onNew={() => tableRef.current?.openAssign()} // ✅ abre modal usando la selección de la tabla
        />
      </div>

      {/* =======================
          TABLA
      ======================== */}
      <section className="mt-6">
        {loading ? (
          <div className="mx-4 sm:mx-6 grid place-items-center rounded-2xl bg-white p-16 text-gray-500 border border-slate-200">
            Cargando mantenimiento...
          </div>
        ) : (
          <div className="mx-2 sm:mx-4 lg:mx-6">
            <MaintenanceTable
              ref={tableRef}
              items={allRows}
              onSelectionChange={setSelectedCount} // ✅ reporta cantidad seleccionada
            />
          </div>
        )}
      </section>
    </div>
  );
}
