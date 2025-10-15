import React, { useState } from 'react';
import { Users, Bed, Filter, RefreshCw, Calendar, Grid, LogIn, LogOut, ArrowLeftRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../router/routes';
import { 
  useRooms, 
  useDashboardStats, 
  useUpdateRoomStatus 
} from '../hooks';
import type { Room } from '../../../types/core/domain';
import type { FrontdeskRoom, RoomFilters, FrontdeskRoomStatus, FrontdeskRoomType } from '../types';
import CalendarView from './CalendarView';
import {
  generateMockGuestName,
  generateMockCheckIn,
  generateMockCheckOut,
  generateMockCurrentGuest
} from '../utils/mockDataGenerators';

// Convert core Room to FrontdeskRoom
const adaptRoomToFrontdesk = (room: Room): FrontdeskRoom => ({
  ...room,
  roomNumber: room.number || room.id,
  guestName: generateMockGuestName(room), // Add mock guest data
  status: mapRoomStatusToFrontdesk(room.status),
  type: mapRoomTypeToFrontdesk(room.type),
  checkIn: generateMockCheckIn(room),
  checkOut: generateMockCheckOut(room),
  currentGuest: generateMockCurrentGuest(room),
});

const mapRoomStatusToFrontdesk = (status: Room['status']): FrontdeskRoomStatus => {
  const statusMap: Record<NonNullable<Room['status']>, FrontdeskRoomStatus> = {
    'available': 'available',
    'occupied': 'checked-in',
    'maintenance': 'maintenance',
    'cleaning': 'checked-out',
  };
  return status ? statusMap[status] : 'available';
};

const mapRoomTypeToFrontdesk = (type: Room['type']): FrontdeskRoomType => {
  const typeMap: Record<Room['type'], FrontdeskRoomType> = {
    'single': 'Standard',
    'double': 'Standard',
    'triple': 'Standard',
    'suite': 'Suite',
    'family': 'Deluxe',
    'deluxe': 'Deluxe',
  };
  return typeMap[type];
};

const mapFrontdeskStatusToRoom = (status: FrontdeskRoomStatus): Room['status'] => {
  const statusMap: Record<FrontdeskRoomStatus, Room['status']> = {
    'available': 'available',
    'occupied': 'occupied',
    'reserved': 'available', // Reserved rooms are technically available in core
    'checked-in': 'occupied',
    'checked-out': 'cleaning',
    'maintenance': 'maintenance',
    'cleaning': 'cleaning',
  };
  return statusMap[status];
};

// =================== CONSTANTS ===================
const ROOM_STATUS_COLORS = {
  available: 'bg-green-100 text-green-800 border-green-200',
  occupied: 'bg-red-100 text-red-800 border-red-200',
  reserved: 'bg-purple-100 text-purple-800 border-purple-200',
  'checked-in': 'bg-red-100 text-red-800 border-red-200',
  'checked-out': 'bg-orange-100 text-orange-800 border-orange-200',
  maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  cleaning: 'bg-purple-100 text-purple-800 border-purple-200'
} as const;

const ROOM_STATUS_LABELS = {
  available: 'Disponible',
  occupied: 'Ocupada',
  reserved: 'Reservada',
  'checked-in': 'Ocupada',
  'checked-out': 'Check-out',
  maintenance: 'Mantenimiento',
  cleaning: 'Limpieza'
} as const;

// =================== INTERFACES ===================
interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

interface RoomCardProps {
  room: FrontdeskRoom;
  onStatusChange: (roomId: string, status: FrontdeskRoom['status']) => void;
}

// =================== COMPONENTS ===================

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, subtitle }) => (
  <div className="relative overflow-hidden p-6 rounded-xl bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 group">
    {/* Enhanced background decoration */}
    <div className="absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 rounded-full bg-gradient-to-br from-gray-50 to-gray-100/50 opacity-60 group-hover:opacity-80 transition-opacity"></div>
    <div className="absolute bottom-0 left-0 w-16 h-16 -ml-8 -mb-8 rounded-full bg-gradient-to-tr from-gray-100/30 to-transparent opacity-40 group-hover:opacity-60 transition-opacity"></div>
    
    <div className="relative flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-700 mb-2 tracking-wide uppercase">{title}</p>
        <p className={`text-4xl font-bold ${color} mb-2 tracking-tight`}>{value}</p>
        {subtitle && (
          <div className="flex items-center">
            <span className="text-xs text-gray-600 font-medium bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
              {subtitle}
            </span>
          </div>
        )}
      </div>
      <div className={`relative p-5 rounded-2xl ${color} bg-opacity-15 group-hover:scale-110 group-hover:bg-opacity-20 transition-all duration-300 shadow-lg border border-gray-100`}>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-50/30 to-transparent opacity-60"></div>
        <div className="absolute inset-0 rounded-2xl border border-gray-200/30"></div>
        <div className="relative">
          {icon}
        </div>
      </div>
    </div>
    
    {/* Enhanced hover effect line */}
    <div className={`absolute bottom-0 left-0 h-1.5 w-0 ${color.replace('text-', 'bg-')} group-hover:w-full transition-all duration-700 ease-out shadow-sm rounded-full`}></div>
    
    {/* Border glow effect */}
    <div className={`absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-opacity-50 ${color.replace('text-', 'border-')} transition-all duration-300`}></div>
  </div>
);

const RoomCard: React.FC<RoomCardProps> = ({ room, onStatusChange }) => {
  const statusColor = ROOM_STATUS_COLORS[room.status];
  const statusLabel = ROOM_STATUS_LABELS[room.status];

  return (
    <div className="border-2 border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:border-gray-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-xl text-gray-900">
            Habitación {room.roomNumber}
          </h3>
          <p className="text-sm font-medium text-gray-600">{room.type}</p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 ${statusColor} shadow-sm`}>
          {statusLabel}
        </span>
      </div>

      <div className="space-y-3 mb-5">
        <div className="flex items-center text-sm text-gray-700">
          <Users className="w-4 h-4 mr-3 text-gray-500" />
          <span className="font-medium">Capacidad:</span>
          <span className="ml-1 font-semibold">{room.capacity} personas</span>
        </div>
        <div className="flex items-center text-sm text-gray-700">
          <Bed className="w-4 h-4 mr-3 text-gray-500" />
          <span className="font-medium">Tipo:</span>
          <span className="ml-1 font-semibold">{room.type}</span>
        </div>
        {room.currentGuest && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
            <div className="flex items-center text-sm text-blue-800">
              <Users className="w-4 h-4 mr-2 text-blue-600" />
              <span className="font-medium">Huésped:</span>
              <span className="ml-1 font-semibold">{room.currentGuest.name}</span>
            </div>
            <div className="text-xs text-blue-600 mt-1 flex items-center justify-between">
              <span>Check-in: {new Date(room.currentGuest.checkIn).toLocaleDateString('es-ES')}</span>
              <span>Check-out: {new Date(room.currentGuest.checkOut).toLocaleDateString('es-ES')}</span>
            </div>
          </div>
        )}
        {room.guestName?.startsWith('Reserva:') && room.checkIn && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-3">
            <div className="flex items-center text-sm text-purple-800">
              <Users className="w-4 h-4 mr-2 text-purple-600" />
              <span className="font-medium">Próxima reserva:</span>
              <span className="ml-1 font-semibold">{room.guestName.replace('Reserva: ', '')}</span>
            </div>
            <div className="text-xs text-purple-600 mt-1">
              Llegada: {new Date(room.checkIn).toLocaleDateString('es-ES')}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <select 
          value={room.status}
          onChange={(e) => onStatusChange(room.id, e.target.value as FrontdeskRoomStatus)}
          className="text-sm px-3 py-2 border-2 border-gray-300 rounded-lg flex-1 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors font-medium"
        >
          <option value="available">Disponible</option>
          <option value="reserved">Reservada</option>
          <option value="checked-in">Ocupada</option>
          <option value="checked-out">Check-out</option>
          <option value="maintenance">Mantenimiento</option>
          <option value="cleaning">Limpieza</option>
        </select>
      </div>
    </div>
  );
};

// =================== MAIN COMPONENT ===================

const FrontDesk: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<RoomFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [activeView, setActiveView] = useState<'grid' | 'calendar'>('calendar');

  // Hooks
  const { data: rooms = [], isLoading: roomsLoading, refetch: refetchRooms } = useRooms(filters);
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const updateRoomStatusMutation = useUpdateRoomStatus();

  // Handlers
  const handleStatusChange = (roomId: string, status: FrontdeskRoomStatus) => {
    const coreStatus = mapFrontdeskStatusToRoom(status);
    updateRoomStatusMutation.mutate({ id: roomId, status: coreStatus });
  };

  const handleRefresh = () => {
    refetchRooms();
  };

  const filteredRooms = rooms.filter(room => {
    const frontdeskRoom = adaptRoomToFrontdesk(room);
    if (filters.status && frontdeskRoom.status !== filters.status) return false;
    if (filters.type && frontdeskRoom.type !== filters.type) return false;
    if (filters.floor && room.floor !== filters.floor) return false;
    if (filters.roomNumber && !frontdeskRoom.roomNumber?.includes(filters.roomNumber)) return false;
    if (filters.guestName && !frontdeskRoom.guestName?.toLowerCase().includes(filters.guestName.toLowerCase())) return false;
    return true;
  });

  // Get unique values for filters - map to frontdesk types
  const roomTypes: FrontdeskRoomType[] = [...new Set(rooms.map(r => mapRoomTypeToFrontdesk(r.type)))];
  const floors = [...new Set(rooms.map(r => r.floor))];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Front Desk
                </h1>
                <p className="text-lg text-gray-600">Gestión en tiempo real de habitaciones</p>
              </div>
              <div className="flex gap-3">
                {/* View Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveView('calendar')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                      activeView === 'calendar'
                        ? 'bg-white shadow-sm text-gray-800 font-medium'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    Calendario
                  </button>
                  <button
                    onClick={() => setActiveView('grid')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                      activeView === 'grid'
                        ? 'bg-white shadow-sm text-gray-800 font-medium'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                    Grilla
                  </button>
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Filter className="w-4 h-4" />
                  Filtros
                </button>
                <button
                  onClick={handleRefresh}
                  disabled={roomsLoading}
                  className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-lg disabled:opacity-50 transition-all hover:bg-green-700"
                >
                  <RefreshCw className={`w-4 h-4 ${roomsLoading ? 'animate-spin' : ''}`} />
                  Actualizar
                </button>
                <button
                  onClick={() => navigate(ROUTES.FRONTDESK.CHECKIN)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  <LogIn className="w-4 h-4" />
                  Check-in
                </button>
                <button
                  onClick={() => navigate(ROUTES.FRONTDESK.CHECKOUT)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  Check-out
                </button>
                <button
                  onClick={() => navigate(ROUTES.FRONTDESK.ROOM_CHANGE)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  Cambio de Habitación
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            {!statsLoading && stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                  title="Habitaciones Ocupadas"
                  value={stats.occupiedRooms}
                  icon={<Bed className="w-6 h-6" />}
                  color="text-red-600"
                  subtitle={`${stats.occupancyRate}% ocupación`}
                />
                <StatsCard
                  title="Disponibles"
                  value={stats.availableRooms}
                  icon={<Bed className="w-6 h-6" />}
                  color="text-green-600"
                />
                <StatsCard
                  title="Check-ins Hoy"
                  value={stats.checkInsToday}
                  icon={<LogIn className="w-6 h-6" />}
                  color="text-blue-600"
                />
                <StatsCard
                  title="Check-outs Hoy"
                  value={stats.checkOutsToday}
                  icon={<LogOut className="w-6 h-6" />}
                  color="text-purple-600"
                />
              </div>
            )}

            {/* Content Based on Active View */}
            {activeView === 'calendar' ? (
              <CalendarView />
            ) : (
              <>
                {/* Filters Panel */}
                {showFilters && (
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
                    <h3 className="font-semibold text-gray-800">Filtrar Habitaciones</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700 mb-1">
                          Estado
                        </label>
                        <select
                          id="filter-status"
                          value={filters.status || ''}
                          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as FrontdeskRoomStatus || undefined }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Todos los estados</option>
                          <option value="available">Disponible</option>
                          <option value="reserved">Reservada</option>
                          <option value="checked-in">Ocupada</option>
                          <option value="checked-out">Check-out</option>
                          <option value="maintenance">Mantenimiento</option>
                          <option value="cleaning">Limpieza</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="filter-type" className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo
                        </label>
                        <select
                          id="filter-type"
                          value={filters.type || ''}
                          onChange={(e) => setFilters(prev => ({ 
                            ...prev, 
                            type: e.target.value as FrontdeskRoomType || undefined 
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Todos los tipos</option>
                          {roomTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="filter-floor" className="block text-sm font-medium text-gray-700 mb-1">
                          Piso
                        </label>
                        <select
                          id="filter-floor"
                          value={filters.floor || ''}
                          onChange={(e) => setFilters(prev => ({ ...prev, floor: e.target.value ? Number(e.target.value) : undefined }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Todos los pisos</option>
                          {floors.map(floor => (
                            <option key={floor} value={floor}>Piso {floor}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-end">
                        <button
                          onClick={() => setFilters({})}
                          className="w-full px-3 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Limpiar Filtros
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rooms Grid */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Habitaciones ({filteredRooms.length})
                    </h2>
                    <div className="text-sm text-gray-600">
                      {roomsLoading ? 'Cargando...' : `${filteredRooms.length} de ${rooms.length} habitaciones`}
                    </div>
                  </div>

                  {roomsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredRooms.map((room) => (
                        <RoomCard
                          key={room.id}
                          room={adaptRoomToFrontdesk(room)}
                          onStatusChange={handleStatusChange}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Empty State */}
                {!roomsLoading && filteredRooms.length === 0 && (
                  <div className="text-center py-12">
                    <Bed className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No se encontraron habitaciones
                    </h3>
                    <p className="text-gray-600">
                      Ajusta los filtros para ver más resultados
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrontDesk;
