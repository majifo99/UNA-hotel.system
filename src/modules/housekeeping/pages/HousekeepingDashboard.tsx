import { useMemo, useState } from "react";
import { AlertTriangle, ClipboardCheck, Users } from "lucide-react";
import { FiLogOut } from "react-icons/fi";
import { HiOutlineDocumentReport } from "react-icons/hi";
import RoomsTable from "../components/RoomsTable";
import FilterBar, { type RoomFilters } from "../components/FilterBar";
import { useRooms } from "../hooks/useRooms";
import AssignModal from "../components/AssignModal";
import { updateRoom } from "../services/roomService";

export default function HousekeepingDashboard() {
  const [filters, setFilters] = useState<RoomFilters>({
    search: "",
    status: "",
    type: "",
    floor: "",
  });
  const { rooms, isLoading, refetch } = useRooms(filters);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);

  const filteredRooms = useMemo(() => {
    return rooms
      .filter((room) =>
        room.number.toLowerCase().includes(filters.search.toLowerCase().trim())
      )
      .filter((room) => (filters.status ? room.status === filters.status : true))
      .filter((room) => (filters.type ? room.type === filters.type : true))
      .filter((room) => (filters.floor ? room.floor === parseInt(filters.floor) : true));
  }, [rooms, filters]);

  const counts = useMemo(() => {
    const countByStatus = (status: string) =>
      filteredRooms.filter((r) => r.status === status).length;

    return {
      Pendiente: countByStatus("Pendiente"),
      "En limpieza": countByStatus("En limpieza"),
      Inspección: countByStatus("Inspección"),
      Disponible: countByStatus("Disponible"),
      total: filteredRooms.length,
    };
  }, [filteredRooms]);

  const handleAssign = async (staffName: string) => {
    if (selectedRooms.length > 0) {
      try {
        await updateRoom(selectedRooms[0], { assignedTo: staffName, status: "En limpieza" });
        console.log(`Asignando habitación ${selectedRooms[0]} a ${staffName}`);
        await refetch();
        setShowModal(false);
        setSelectedRooms([]);
      } catch (error) {
        console.error("Error al asignar:", error);
      }
    }
  };

  const handleOpenModal = () => {
    console.log("Intentando abrir modal. selectedRooms:", selectedRooms);
    if (selectedRooms.length > 0) {
      setShowModal(true);
    } else {
      alert("Por favor, selecciona una habitación pendiente primero.");
    }
  };

  const handleToggleRoomSelection = (id: string) => {
    setSelectedRooms((prev) =>
      prev.includes(id) ? prev.filter((roomId) => roomId !== id) : [id] // Solo una selección a la vez
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-[#0f172a]">
      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl flex items-center justify-center shadow-lg">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-teal-600 rounded-full" />
              </div>
            </div>
            <div>
              <h1 className="text-[22px] font-semibold leading-6">Dashboard de limpieza</h1>
              <p className="text-sm text-slate-600">Ama de llaves - María</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 bg-white/80 hover:bg-white shadow-sm">
              <HiOutlineDocumentReport className="h-4 w-4" />
              Reporte
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 bg-white/80 hover:bg-white shadow-sm">
              <FiLogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* MÉTRICAS */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3 px-3 py-2 bg-red-50 rounded-lg border border-red-100">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-slate-700">Pendientes</span>
                <span className="text-xl font-bold text-red-600">{counts.Pendiente}</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-sm font-medium text-slate-700">En limpieza</span>
                <span className="text-xl font-bold text-blue-600">{counts["En limpieza"]}</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 bg-purple-50 rounded-lg border border-purple-100">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <span className="text-sm font-medium text-slate-700">Inspección</span>
                <span className="text-xl font-bold text-purple-600">{counts.Inspección}</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span className="text-sm font-medium text-slate-700">Disponibles</span>
                <span className="text-xl font-bold text-emerald-600">{counts.Disponible}</span>
              </div>
            </div>
            <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Total: {counts.total} habitaciones
            </div>
          </div>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="p-5 pb-0">
        <div className="max-w-7xl mx-auto space-y-5">
          <FilterBar filters={filters} setFilters={setFilters} totalRooms={filteredRooms.length} />

          {/* Acciones */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleOpenModal}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-sm"
              disabled={selectedRooms.length === 0}
            >
              <Users className="h-4 w-4" />
              Asignar limpieza
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium border border-slate-300 text-slate-700 bg-white/80 hover:bg-white shadow-sm">
              <ClipboardCheck className="h-4 w-4" />
              Inspección Check-out
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium border border-slate-300 text-slate-700 bg-white/80 hover:bg-white shadow-sm">
              <AlertTriangle className="h-4 w-4" />
              Reportar Daño
            </button>
          </div>

          {/* Tabla */}
          {isLoading ? (
            <div className="text-center text-slate-600 py-10">Cargando habitaciones...</div>
          ) : (
            <RoomsTable
              sortedAndFilteredRooms={filteredRooms}
              selectedRooms={selectedRooms}
              toggleRoomSelection={handleToggleRoomSelection}
            />
          )}

          <div className="text-sm text-slate-500 bg-slate-100 px-3 py-3 rounded-full">
            Total: {counts.total} habitaciones
          </div>

          <AssignModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onAssign={handleAssign}
            selectedRoomId={selectedRooms[0]}
          />
        </div>
      </main>
    </div>
  );
}