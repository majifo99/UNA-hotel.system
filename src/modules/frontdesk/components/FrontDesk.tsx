import React, { useState } from 'react';
import { Users, Bed, Filter, Calendar, Grid, LogIn, LogOut, ArrowLeftRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../router/routes';
import { 
  useRooms, 
  useDashboardStats
} from '../hooks';
import type { Room } from '../../../types/core/domain';
import type { FrontdeskRoom, RoomFilters, FrontdeskRoomStatus, FrontdeskRoomType } from '../types';
import CalendarView from './CalendarView';
import { FrontDeskStats } from './FrontDeskStats';
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
    'occupied': 'occupied',
    'maintenance': 'maintenance',
    'cleaning': 'cleaning',
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

// =================== CONSTANTS ===================
const ROOM_STATUS_COLORS = {
  available: 'bg-green-500 text-white border-green-600 shadow-green-200',
  occupied: 'bg-red-500 text-white border-red-600 shadow-red-200',
  reserved: 'bg-purple-500 text-white border-purple-600 shadow-purple-200',
  'checked-in': 'bg-red-500 text-white border-red-600 shadow-red-200',
  'checked-out': 'bg-orange-500 text-white border-orange-600 shadow-orange-200',
  maintenance: 'bg-yellow-500 text-white border-yellow-600 shadow-yellow-200',
  cleaning: 'bg-blue-400 text-white border-blue-500 shadow-blue-200'
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

const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  const statusColor = ROOM_STATUS_COLORS[room.status];
  const statusLabel = ROOM_STATUS_LABELS[room.status];

  return (
    <div className={`border-2 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 ${statusColor}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-2xl">
            Habitación {room.roomNumber}
          </h3>
          <p className="text-sm font-medium opacity-90">{room.type}</p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 bg-white/20 backdrop-blur-sm`}>
          {statusLabel}
        </span>
      </div>

      <div className="space-y-3 mb-5 bg-white/10 backdrop-blur-sm rounded-lg p-3">
        <div className="flex items-center text-sm">
          <Users className="w-4 h-4 mr-3" />
          <span className="font-medium">Capacidad:</span>
          <span className="ml-1 font-semibold">{room.capacity} personas</span>
        </div>
        <div className="flex items-center text-sm">
          <Bed className="w-4 h-4 mr-3" />
          <span className="font-medium">Tipo:</span>
          <span className="ml-1 font-semibold">{room.type}</span>
        </div>
        {room.currentGuest && (
          <div className="bg-white/20 border border-white/30 rounded-lg p-3 mt-3">
            <div className="flex items-center text-sm">
              <Users className="w-4 h-4 mr-2" />
              <span className="font-medium">Huésped:</span>
              <span className="ml-1 font-semibold">{room.currentGuest.name}</span>
            </div>
            <div className="text-xs mt-1 flex items-center justify-between">
              <span>Check-in: {new Date(room.currentGuest.checkIn).toLocaleDateString('es-ES')}</span>
              <span>Check-out: {new Date(room.currentGuest.checkOut).toLocaleDateString('es-ES')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// =================== MAIN COMPONENT ===================

const FrontDesk: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<RoomFilters>({});
  const [activeView, setActiveView] = useState<'grid' | 'calendar'>('calendar');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });

  // Hooks
  const { data: rooms = [], isLoading: roomsLoading } = useRooms(filters);
  const { data: stats, isLoading: statsLoading } = useDashboardStats();

  // Handlers
  const handleDateFilterChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateFilter(prev => ({ ...prev, [field]: value }));
  };

  const clearDateFilter = () => {
    setDateFilter({ startDate: '', endDate: '' });
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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-darkGreen1)' }}>
      <div className="p-6">
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
              <div className="flex gap-3 items-center">
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

                <div className="h-8 w-px bg-gray-300"></div>

                {/* Botones principales */}
                <button
                  onClick={() => navigate(ROUTES.FRONTDESK.CHECKIN)}
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow-md hover:shadow-lg transition-all font-medium"
                >
                  <LogIn className="w-5 h-5" />
                  Check-in
                </button>
                <button
                  onClick={() => navigate(ROUTES.FRONTDESK.CHECKOUT)}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-md hover:shadow-lg transition-all font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  Check-out
                </button>
                <button
                  onClick={() => navigate(ROUTES.FRONTDESK.ROOM_CHANGE)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-md hover:shadow-lg transition-all font-medium"
                >
                  <ArrowLeftRight className="w-5 h-5" />
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

            {/* Estadísticas Detalladas del Front Desk */}
            <FrontDeskStats rooms={filteredRooms.map(adaptRoomToFrontdesk)} />

            {/* Content Based on Active View */}
            {activeView === 'calendar' ? (
              <div className="overflow-x-auto">
                <CalendarView />
              </div>
            ) : (
              <>
                {/* Filters Panel - Siempre visible en vista grilla */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border-2 border-gray-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <Filter className="w-5 h-5" />
                      Filtros de Búsqueda
                    </h3>
                    <button
                      onClick={() => {
                        setFilters({});
                        clearDateFilter();
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
                    >
                      Limpiar Todo
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Filtro de Estado */}
                    <div>
                      <label htmlFor="filter-status" className="block text-sm font-semibold text-gray-700 mb-2">
                        Estado
                      </label>
                      <select
                        id="filter-status"
                        value={filters.status || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as FrontdeskRoomStatus || undefined }))}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium transition-all"
                      >
                        <option value="">Todos</option>
                        <option value="available">✅ Disponible</option>
                        <option value="reserved">🟣 Reservada</option>
                        <option value="checked-in">🔴 Ocupada</option>
                        <option value="checked-out">🟠 Check-out</option>
                        <option value="maintenance">🟡 Mantenimiento</option>
                        <option value="cleaning">🔵 Limpieza</option>
                      </select>
                    </div>

                    {/* Filtro de Tipo */}
                    <div>
                      <label htmlFor="filter-type" className="block text-sm font-semibold text-gray-700 mb-2">
                        Tipo de Habitación
                      </label>
                      <select
                        id="filter-type"
                        value={filters.type || ''}
                        onChange={(e) => setFilters(prev => ({ 
                          ...prev, 
                          type: e.target.value as FrontdeskRoomType || undefined 
                        }))}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium transition-all"
                      >
                        <option value="">Todos los tipos</option>
                        {roomTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    {/* Filtro de Piso */}
                    <div>
                      <label htmlFor="filter-floor" className="block text-sm font-semibold text-gray-700 mb-2">
                        Piso
                      </label>
                      <select
                        id="filter-floor"
                        value={filters.floor || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, floor: e.target.value ? Number(e.target.value) : undefined }))}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium transition-all"
                      >
                        <option value="">Todos los pisos</option>
                        {floors.map(floor => (
                          <option key={floor} value={floor}>Piso {floor}</option>
                        ))}
                      </select>
                    </div>

                    {/* Filtro de Fecha Inicio */}
                    <div>
                      <label htmlFor="filter-start-date" className="block text-sm font-semibold text-gray-700 mb-2">
                        📅 Fecha Inicio
                      </label>
                      <input
                        id="filter-start-date"
                        type="date"
                        value={dateFilter.startDate}
                        onChange={(e) => handleDateFilterChange('startDate', e.target.value)}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium transition-all"
                      />
                    </div>

                    {/* Filtro de Fecha Fin */}
                    <div>
                      <label htmlFor="filter-end-date" className="block text-sm font-semibold text-gray-700 mb-2">
                        📅 Fecha Fin
                      </label>
                      <input
                        id="filter-end-date"
                        type="date"
                        value={dateFilter.endDate}
                        onChange={(e) => handleDateFilterChange('endDate', e.target.value)}
                        min={dateFilter.startDate}
                        className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium transition-all"
                      />
                    </div>
                  </div>

                  {/* Indicador de filtros activos */}
                  {(filters.status || filters.type || filters.floor || dateFilter.startDate || dateFilter.endDate) && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                      <span className="font-semibold">Filtros activos:</span>
                      {filters.status && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Estado: {ROOM_STATUS_LABELS[filters.status]}</span>}
                      {filters.type && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Tipo: {filters.type}</span>}
                      {filters.floor && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Piso: {filters.floor}</span>}
                      {dateFilter.startDate && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Desde: {new Date(dateFilter.startDate).toLocaleDateString('es-ES')}</span>}
                      {dateFilter.endDate && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Hasta: {new Date(dateFilter.endDate).toLocaleDateString('es-ES')}</span>}
                    </div>
                  )}
                </div>

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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredRooms.map((room) => (
                        <RoomCard
                          key={room.id}
                          room={adaptRoomToFrontdesk(room)}
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

                {/* Leyenda de Colores */}
                {!roomsLoading && filteredRooms.length > 0 && (
                  <div className="mt-8 bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border-2 border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Leyenda de Estados</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-500 shadow-md"></div>
                        <span className="text-sm font-medium text-gray-700">Disponible</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-red-500 shadow-md"></div>
                        <span className="text-sm font-medium text-gray-700">Ocupada</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-purple-500 shadow-md"></div>
                        <span className="text-sm font-medium text-gray-700">Reservada</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-orange-500 shadow-md"></div>
                        <span className="text-sm font-medium text-gray-700">Check-out</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-yellow-500 shadow-md"></div>
                        <span className="text-sm font-medium text-gray-700">Mantenimiento</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-400 shadow-md"></div>
                        <span className="text-sm font-medium text-gray-700">Limpieza</span>
                      </div>
                    </div>
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
