"use client";

import { useRef, useState } from "react";

import { FilterBar } from "../components/FilterBar";
import MaintenanceTable, { type MaintenanceTableRef } from "../components/MaintenanceTable";
import { useMaintenance } from "../hooks/useMaintenance";

import { NotificationBell } from "../components/NotificationBell";
import { NotificationProvider } from "../context/NotificationContext";
import SolLogo from "../../../assets/Lanaku.png";
import { FiLogOut } from "react-icons/fi";
import SuccessModal from "../components/modals/SuccessModalMantenimiento";

function MantenimientoPageContent() {
  const {
    filtered,
    query, setQuery,
    status, setStatus,
    loading,
    refetch, // 👈 IMPORTANTE: traemos refetch para refrescar tras guardar
    updateItemOptimistic, // 👈 Para actualizaciones optimistas
  } = useMaintenance();



  // Ref a la tabla para abrir modales internos
  const tableRef = useRef<MaintenanceTableRef>(null);

  // Cantidad seleccionada
  const [selectedCount, setSelectedCount] = useState(0);

  // Modal de éxito global
  const [successModal, setSuccessModal] = useState({
    open: false,
    title: "",
    message: "",
  });

  const openSuccessModal = (title: string, message: string) =>
    setSuccessModal({ open: true, title, message });

  const closeSuccessModal = () =>
    setSuccessModal((prev) => ({ ...prev, open: false }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-[#0f172a] font-sans relative">
      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          {/* IZQUIERDA: logo + título */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ring-1 ring-slate-200 bg-slate-50">
              <img
                src={SolLogo}
                alt="Lanaku Sol"
                className="w-12 h-12 object-contain drop-shadow"
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
                Sistema de Mantenimiento
              </h1>
              <p className="text-sm text-slate-600">
                Gestión integral de tareas · Dashboard
              </p>
            </div>
          </div>

          {/* DERECHA: notificaciones + logout */}
          <div className="flex items-center gap-3 flex-wrap">
            <NotificationBell />

            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 bg-white/80 hover:bg-white shadow-sm">
              <FiLogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* FILTROS */}
      <div className="px-6 sm:px-6 py-4">
        <FilterBar
          query={query}
          onQuery={setQuery}
          status={status}
          onStatus={setStatus}
          total={filtered.length}
          selectedCount={selectedCount}
          onOpenDate={() => {
            /* lógica fecha */
          }}
          onNew={() => tableRef.current?.openAssign()}
        />
      </div>

      {/* TABLA */}
      <section className="mt-6">
        {loading ? (
          <div className="mx-4 sm:mx-6 grid place-items-center rounded-2xl bg-white p-16 text-gray-500 border border-slate-200">
            Cargando mantenimiento...
          </div>
        ) : (
          <div className="mx-2 sm:mx-4 lg:mx-6">
            <MaintenanceTable
              ref={tableRef}
              items={filtered}
              onSelectionChange={setSelectedCount}
              onSuccess={(msg?: string) =>
                openSuccessModal(
                  "¡Operación Exitosa!",
                  msg ?? "Cambios guardados correctamente."
                )
              }
              onRequestRefresh={refetch} // ✅ ahora la tabla puede refrescar datos tras el modal
              onUpdateOptimistic={updateItemOptimistic} // ✅ actualización optimista
            />
          </div>
        )}
      </section>

      {/* MODAL DE ÉXITO GLOBAL */}
      <SuccessModal
        isOpen={successModal.open}
        onClose={closeSuccessModal}
        title={successModal.title}
        message={successModal.message}
        autoCloseMs={2200}
      />
    </div>
  );
}

export default function MantenimientoPage() {
  return (
    <NotificationProvider>
      <MantenimientoPageContent />
    </NotificationProvider>
  );
}
