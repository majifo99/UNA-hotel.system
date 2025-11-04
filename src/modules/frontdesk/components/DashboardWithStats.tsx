import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  Calendar,
  LogIn,
  LogOut,
  ArrowRightLeft,
  CalendarClock,
  MinusCircle,
} from 'lucide-react';
import { FrontDeskStats } from './FrontDeskStats';
import { mapFlexibleLocalRoomsToFrontdeskRooms } from '../../../components/localRoomMapping';
import { ROUTES } from '../../../router/routes';

type RoomStatus = 'available' | 'reserved' | 'checked-in' | 'checked-out' | 'maintenance';

type Room = {
  id: string;
  roomNumber: string;
  type: string;
  guestName: string | null;
  checkIn: string | null;
  checkOut: string | null;
  status: RoomStatus;
};

// Datos de ejemplo - reemplazar con datos reales del backend
const seedRooms: Room[] = [
  { id: 'r301', roomNumber: '301', type: 'Deluxe', guestName: 'Ana Rodriguez', checkIn: '2025-11-01', checkOut: '2025-11-05', status: 'reserved' },
  { id: 'r302', roomNumber: '302', type: 'Standard', guestName: null, checkIn: null, checkOut: null, status: 'available' },
  { id: 'r303', roomNumber: '303', type: 'Suite', guestName: 'Luis Fernández', checkIn: '2025-11-02', checkOut: '2025-11-04', status: 'checked-in' },
  { id: 'r304', roomNumber: '304', type: 'Standard', guestName: null, checkIn: null, checkOut: null, status: 'maintenance' },
  { id: 'r305', roomNumber: '305', type: 'Deluxe', guestName: 'María López', checkIn: '2025-11-01', checkOut: '2025-11-03', status: 'checked-in' },
  { id: 'r306', roomNumber: '306', type: 'Suite', guestName: null, checkIn: null, checkOut: null, status: 'available' },
  { id: 'r307', roomNumber: '307', type: 'Standard', guestName: 'Carlos Méndez', checkIn: '2025-11-03', checkOut: '2025-11-06', status: 'reserved' },
  { id: 'r308', roomNumber: '308', type: 'Deluxe', guestName: null, checkIn: null, checkOut: null, status: 'available' },
  { id: 'r309', roomNumber: '309', type: 'Suite', guestName: 'Patricia Ruiz', checkIn: '2025-10-30', checkOut: '2025-11-03', status: 'checked-in' },
  { id: 'r310', roomNumber: '310', type: 'Standard', guestName: null, checkIn: null, checkOut: null, status: 'available' },
];

export const DashboardWithStats = () => {
  const navigate = useNavigate();
  const [rooms] = useState<Room[]>(seedRooms);

  // Aquí puedes agregar lógica para cargar habitaciones reales desde el backend
  useEffect(() => {
    // TODO: Cargar habitaciones desde el backend
    // const loadRooms = async () => {
    //   try {
    //     const response = await FrontdeskService.getRooms();
    //     setRooms(response.data);
    //   } catch (error) {
    //     console.error('Error loading rooms:', error);
    //   }
    // };
    // loadRooms();
  }, []);

  const quickActions = [
    {
      id: 'check-in',
      label: 'Check-In',
      icon: LogIn,
      color: 'bg-green-600 hover:bg-green-700',
      route: ROUTES.FRONTDESK.CHECKIN,
    },
    {
      id: 'check-out',
      label: 'Check-Out',
      icon: LogOut,
      color: 'bg-red-600 hover:bg-red-700',
      route: ROUTES.FRONTDESK.CHECKOUT,
    },
    {
      id: 'calendar',
      label: 'Calendario',
      icon: Calendar,
      color: 'bg-blue-600 hover:bg-blue-700',
      route: ROUTES.FRONTDESK.DASHBOARD,
    },
    {
      id: 'room-change',
      label: 'Cambio de Habitación',
      icon: ArrowRightLeft,
      color: 'bg-purple-600 hover:bg-purple-700',
      route: ROUTES.FRONTDESK.ROOM_CHANGE,
    },
    {
      id: 'date-modification',
      label: 'Modificar Fechas',
      icon: CalendarClock,
      color: 'bg-orange-600 hover:bg-orange-700',
      route: ROUTES.FRONTDESK.DATE_MODIFICATION,
    },
    {
      id: 'reduce-stay',
      label: 'Reducir Estancia',
      icon: MinusCircle,
      color: 'bg-yellow-600 hover:bg-yellow-700',
      route: ROUTES.FRONTDESK.REDUCE_STAY,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Home className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Front Desk</h1>
              <p className="text-sm text-gray-600">Gestión en tiempo real de habitaciones</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">
              {new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="text-xs text-gray-500">
              {new Date().toLocaleTimeString('es-ES')}
            </p>
          </div>
        </div>

        {/* Estadísticas */}
        <FrontDeskStats rooms={mapFlexibleLocalRoomsToFrontdeskRooms(rooms)} />

        {/* Acciones Rápidas */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600" />
            Acciones Rápidas
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => navigate(action.route)}
                  className={`${action.color} text-white rounded-lg p-6 flex flex-col items-center justify-center gap-3 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg`}
                >
                  <Icon className="w-8 h-8" />
                  <span className="font-semibold text-lg">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Vista Rápida de Habitaciones */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Home className="w-6 h-6 text-indigo-600" />
            Vista Rápida de Habitaciones
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {rooms.map((room) => {
              const statusColors = {
                available: 'bg-green-100 border-green-500 text-green-900',
                reserved: 'bg-yellow-100 border-yellow-500 text-yellow-900',
                'checked-in': 'bg-blue-100 border-blue-500 text-blue-900',
                'checked-out': 'bg-gray-100 border-gray-500 text-gray-900',
                maintenance: 'bg-red-100 border-red-500 text-red-900',
              };

              const statusLabels = {
                available: 'Disponible',
                reserved: 'Reservada',
                'checked-in': 'Ocupada',
                'checked-out': 'Check-out',
                maintenance: 'Mantenimiento',
              };

              return (
                <div
                  key={room.id}
                  className={`rounded-lg border-2 p-4 ${statusColors[room.status]} cursor-pointer hover:shadow-lg transition-shadow duration-200`}
                >
                  <div className="text-center">
                    <p className="text-2xl font-bold mb-1">{room.roomNumber}</p>
                    <p className="text-xs font-medium mb-2">{room.type}</p>
                    <div className="border-t border-current opacity-30 my-2" />
                    <p className="text-xs font-medium mb-1">{statusLabels[room.status]}</p>
                    {room.guestName && (
                      <p className="text-xs truncate" title={room.guestName}>
                        {room.guestName}
                      </p>
                    )}
                    {room.checkOut && (
                      <p className="text-xs mt-1">
                        Salida: {new Date(room.checkOut).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardWithStats;
