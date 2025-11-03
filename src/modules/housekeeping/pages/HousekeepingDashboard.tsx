import { useMemo, useState, useCallback } from "react";
import { FiLogOut } from "react-icons/fi";
import { Users, ClipboardCheck, AlertTriangle } from "lucide-react";

import SolLogo from "../../../assets/Lanaku.png";
import { useLimpiezasQuery } from "../hooks/useLimpiezasQuery";
import LimpiezasTable, { type SelectedRoom } from "../components/RoomsTable";
import AssignModal from "../components/Modals/AssignModal";
import DamageReportModal from "../components/Modals/DamageReportModal";
import FilterBar, { type RoomFilters } from "../components/FilterBar";
import type { LimpiezaItem } from "../types/limpieza";
import { InitialDashSkeleton } from "../components/UI/Loaders";
import HKCounterCards from "../components//UI/HKMetricCard";
import SuccessModal from "../components/Modals/SuccessModal";
import { NotificationProvider } from "../context/NotificationContext";
import { NotificationBell } from "../components/NotificationBell";

function HousekeepingDashboardContent() {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDamageModal, setShowDamageModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<SelectedRoom | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<Partial<LimpiezaItem> | null>(null);

  // ✅ modal éxito
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("La limpieza fue actualizada correctamente.");

  const [filters, setFilters] = useState<RoomFilters>({
    search: "",
    status: "",
    priority: "",
    assigned: "",
  });

  const table = useLimpiezasQuery({ initialFilters: { per_page: 5, pendientes: false } });
  const { rawItems, pagination, refetch, isFirstLoad, loading, hasPageData } = table;

  const totalRooms = useMemo(() => {
    const t = pagination?.total ?? 0;
    return t > 0 ? t : (rawItems?.length ?? 0);
  }, [pagination?.total, rawItems]);

  const assignedOptions = useMemo(() => {
    const names = (rawItems || [])
      .map((it) => (it?.usuario_asignado?.nombre ?? it?.asignador?.name ?? "").trim())
      .filter(Boolean);
    const unique = Array.from(new Set(names));
    unique.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    return unique;
  }, [rawItems]);

  // Calcular métricas desde rawItems (la tabla hace su propio filtrado)
  const { limpiasVisibles, suciasVisibles } = useMemo(() => {
    const limpias = rawItems.filter((it) => {
      const nombre = String((it?.estado ?? it?.estadoHabitacion)?.nombre ?? "").toLowerCase();
      return Boolean(it?.fecha_final) || nombre === "limpia";
    }).length;
    return { limpiasVisibles: limpias, suciasVisibles: rawItems.length - limpias };
  }, [rawItems]);

  // Para mostrar en FilterBar y footer (sin aplicar filtros - la tabla los aplica)
  const shownRooms = rawItems.length;
  const totalTareasVisibles = rawItems.length;

  const selectedRoomIdStr = selectedRoom ? String(selectedRoom.id) : null;

  const openAssignForSelection = () => {
    setEditingId(null);
    setEditingItem(null);
    setShowAssignModal(true);
  };

  const openAssignForEdit = (item: LimpiezaItem) => {
    const hab = (item as any)?.habitacion;
    const room = hab ? { id: hab.id, numero: hab.numero, piso: hab.piso, tipoNombre: hab.tipo?.nombre } : null;
    setSelectedRoom(room);
    const realId = (item as any).id_limpieza ?? (item as any).id ?? (item as any).Id;
    setEditingId(realId);
    setEditingItem(item);
    setShowAssignModal(true);
  };

  const openDamage = (room: SelectedRoom | null) => {
    setSelectedRoom(room);
    setShowDamageModal(true);
  };

  // ✅ handler memorizado (evita bucles por cambio de identidad)
  const handleSelectionChange = useCallback((room: SelectedRoom | null) => {
    setSelectedRoom(room);
    setEditingId(null);
    setEditingItem(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-[#0f172a] font-sans">
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          {/* IZQUIERDA: Logo + títulos */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ring-1 ring-slate-200 bg-slate-50">
              <img src={SolLogo} alt="Lanaku Sol" className="w-12 h-12 object-contain drop-shadow" />
            </div>

            <div>
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                Dashboard de limpieza
              </h1>
              <p className="text-sm font-medium text-slate-600">Ama de llaves – María</p>
            </div>
          </div>

          {/* DERECHA: Acciones */}
          <div className="flex items-center gap-3">
            {/* Campana de notificaciones */}
            <NotificationBell />

            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 bg-white/80 hover:bg-white shadow-sm">
              <FiLogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {isFirstLoad || (loading && !hasPageData) ? (
        <main className="p-5 pb-0">
          <InitialDashSkeleton />
        </main>
      ) : (
        <main className="p-5 pb-0">
          <div className="max-w-7xl mx-auto space-y-5">
            <HKCounterCards sucias={suciasVisibles} limpias={limpiasVisibles} total={totalRooms} />

            <FilterBar
              disabled={loading}
              filters={filters}
              setFilters={setFilters}
              totalRooms={totalRooms}
              shownRooms={shownRooms}
              assignedOptions={assignedOptions}
            />

            <div className="flex flex-wrap gap-3">
              <button
                onClick={openAssignForSelection}
                disabled={loading || !selectedRoom}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm ${
                  selectedRoom && !loading
                    ? "bg-[#304D3C] hover:bg-[#243a2e] text-white"
                    : "bg-slate-200 text-slate-500 cursor-not-allowed"
                }`}
                title={selectedRoom ? "Asignar limpieza" : "Selecciona una habitación en la tabla"}
              >
                <Users className="h-4 w-4" />
                Asignar limpieza
              </button>

              <button
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold border border-slate-300 text-slate-700 bg-white/80 hover:bg-white shadow-sm disabled:opacity-60"
              >
                <ClipboardCheck className="h-4 w-4" />
                Inspección Check-out
              </button>

              <button
                onClick={() => openDamage(selectedRoom)}
                disabled={loading || !selectedRoom}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold border border-slate-300 text-slate-700 bg-white/80 hover:bg-white shadow-sm disabled:opacity-60"
                title={selectedRoom ? "Reportar daño" : "Selecciona una habitación en la tabla"}
              >
                <AlertTriangle className="h-4 w-4" />
                Reportar daño
              </button>
            </div>

            <LimpiezasTable
              controller={table}
              onEdit={(item) => openAssignForEdit(item)}
              onSelectionChange={handleSelectionChange}  // ✅ memorizado
              filters={filters}
            />

            <div className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-3 rounded-full">
              Total de tareas : {totalTareasVisibles}
              <span className="ml-2 text-xs text-slate-500"></span>
            </div>
          </div>
        </main>
      )}

      <AssignModal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setEditingId(null);
          setEditingItem(null);
        }}
        onSuccess={() => {
          // ✅ Ya no necesitamos refetch - optimistic updates lo manejan
          setShowAssignModal(false);
          setEditingId(null);
          setEditingItem(null);
          setSuccessMsg("La limpieza fue actualizada correctamente.");
          setShowSuccess(true);
        }}
        selectedRoom={selectedRoom}
        selectedRoomId={selectedRoomIdStr}
        editingId={editingId}
        initialItem={editingItem}
      />

      <DamageReportModal
        isOpen={showDamageModal}
        onClose={() => setShowDamageModal(false)}
        selectedRoomId={selectedRoomIdStr}
        onSent={refetch}
      />

      {/* ✅ Success global arriba del dashboard */}
      <SuccessModal
        isOpen={showSuccess}
        title="¡Operación Exitosa!"
        message={successMsg}
        actionLabel="Continuar"
        autoCloseMs={1500}
        onAction={() => setShowSuccess(false)}
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
}

// Wrapper con NotificationProvider
export default function HousekeepingDashboard() {
  return (
    <NotificationProvider>
      <HousekeepingDashboardContent />
    </NotificationProvider>
  );
}
