"use client";

import { useMemo, useState } from "react";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { FiLogOut } from "react-icons/fi";
import { Users, ClipboardCheck, AlertTriangle } from "lucide-react";

import { useLimpiezasTable } from "../hooks/useLimpiezasTable";
import LimpiezasTable, { type SelectedRoom } from "../components/RoomsTable";
import AssignModal from "../components/Modals/AssignModal";
import DamageReportModal from "../components/Modals/DamageReportModal";
import FilterBar, { type RoomFilters } from "../components/FilterBar";

export default function HousekeepingDashboard() {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDamageModal, setShowDamageModal] = useState(false);

  // 👉 guardamos el OBJETO de la habitación seleccionada
  const [selectedRoom, setSelectedRoom] = useState<SelectedRoom | null>(null);

  const [filters, setFilters] = useState<RoomFilters>({
    search: "",
    status: "",
    type: "",
    floor: "",
  });

  const { loading, error, rawItems, pagination, refetch } = useLimpiezasTable();

  const counts = useMemo(() => {
    const sucias = rawItems.filter((x) => !x.fecha_final).length;
    const limpias = rawItems.filter((x) => !!x.fecha_final).length;
    return {
      Sucias: sucias,
      Limpias: limpias,
      total: pagination?.total ?? rawItems.length,
    };
  }, [rawItems, pagination?.total]);

  const openAssign = (room: SelectedRoom | null) => {
    setSelectedRoom(room);
    setShowAssignModal(true);
  };

  const openDamage = (room: SelectedRoom | null) => {
    setSelectedRoom(room);
    setShowDamageModal(true);
  };

  const selectedRoomIdStr = selectedRoom ? String(selectedRoom.id) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-[#0f172a] font-sans">
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl flex items-center justify-center shadow-lg">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-teal-600 rounded-full" />
              </div>
            </div>
            <div>
              {/* Título principal */}
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                Dashboard de limpieza
              </h1>
              {/* Subtítulo */}
              <p className="text-sm font-medium text-slate-600">
                Ama de llaves - María
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 bg-white/80 hover:bg-white shadow-sm">
              <HiOutlineDocumentReport className="h-4 w-4" />
              Reporte
            </button>
            <button
              onClick={refetch}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 bg-white/80 hover:bg-white shadow-sm"
            >
              ↻ Refrescar
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 bg-white/80 hover:bg-white shadow-sm">
              <FiLogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              {/* Contador sucias */}
              <div className="flex items-center gap-3 px-3 py-2 bg-red-50 rounded-lg border border-red-100">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-slate-700">Habitaciones sucias</span>
                <span className="text-2xl font-bold leading-none tracking-tight text-red-600">
                  {counts.Sucias}
                </span>
              </div>
              {/* Contador limpias */}
              <div className="flex items-center gap-3 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-sm font-medium text-slate-700">Habitaciones limpias</span>
                <span className="text-2xl font-bold leading-none tracking-tight text-blue-600">
                  {counts.Limpias}
                </span>
              </div>
            </div>
            <div className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              Total: {counts.total} tareas
            </div>
          </div>
        </div>
      </header>

      <main className="p-5 pb-0">
        <div className="max-w-7xl mx-auto space-y-5">
          {/* Filtro: mantiene su propio tipado, solo texto */}
          <FilterBar filters={filters} setFilters={setFilters} totalRooms={counts.total} />

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => openAssign(selectedRoom)}
              disabled={!selectedRoom}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm ${
                selectedRoom
                  ? "bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white"
                  : "bg-slate-200 text-slate-500 cursor-not-allowed"
              }`}
              title={selectedRoom ? "Asignar limpieza" : "Selecciona una habitación en la tabla"}
            >
              <Users className="h-4 w-4" />
              Asignar limpieza
            </button>

            <button className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold border border-slate-300 text-slate-700 bg-white/80 hover:bg-white shadow-sm">
              <ClipboardCheck className="h-4 w-4" />
              Inspección Check-out
            </button>

            <button
              onClick={() => openDamage(selectedRoom)}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold border border-slate-300 text-slate-700 bg-white/80 hover:bg-white shadow-sm"
              title={selectedRoom ? "Reportar daño" : "Selecciona una habitación en la tabla"}
              disabled={!selectedRoom}
            >
              <AlertTriangle className="h-4 w-4" />
              Reportar daño
            </button>
          </div>

          {(() => {
            if (loading) return <div className="text-center text-slate-600 py-10 text-sm">Cargando limpiezas...</div>;
            if (error) return <div className="text-center text-rose-600 py-10 text-sm">Error: {error}</div>;
            return (
              <LimpiezasTable
                onEdit={(item) => {
                  const hab = item?.habitacion;
                  const room = hab
                    ? { id: hab.id, numero: hab.numero, piso: hab.piso, tipoNombre: hab.tipo?.nombre }
                    : null;
                  setSelectedRoom(room);
                  setShowAssignModal(true);
                }}
                onSelectionChange={(room) => {
                  setSelectedRoom(room);
                }}
              />
            );
          })()}

          <div className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-3 rounded-full">
            Total: {counts.total} tareas
          </div>
        </div>
      </main>

      <AssignModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onSuccess={() => {
          setShowAssignModal(false);
          refetch();
        }}
        selectedRoom={selectedRoom} // ✅ ahora pasamos el objeto completo
        selectedRoomId={selectedRoomIdStr} // (si tu hook lo requiere por compatibilidad)
      />

      <DamageReportModal
        isOpen={showDamageModal}
        onClose={() => setShowDamageModal(false)}
        selectedRoomId={selectedRoomIdStr}
        onSent={refetch}
      />
    </div>
  );
}
