import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, User, Bed } from 'lucide-react';
import { useRooms, useDashboardStats } from '../hooks';
import type { Room } from '../types';

// =================== TYPES ===================
interface CalendarDay {
  date: Date;
  dateString: string;
  isToday: boolean;
  isPast: boolean;
}

interface RoomReservation {
  id: string;
  guestName: string;
  startDate: Date;
  endDate: Date;
  status: Room['status'];
  position: number;
  width: number;
}

// =================== CONSTANTS ===================
const ROOM_STATUS_COLORS = {
  available: '#10b981', // Verde
  reserved: '#f59e0b', // Amarillo/Naranja
  'checked-in': '#ef4444', // Rojo
  'checked-out': '#6b7280', // Gris
  maintenance: '#f97316', // Naranja
  cleaning: '#3b82f6' // Azul
} as const;

const STATUS_LABELS = {
  available: 'Disponible',
  reserved: 'Reservada',
  'checked-in': 'Ocupada',
  'checked-out': 'Check-out',
  maintenance: 'Mantenimiento',
  cleaning: 'Limpieza'
} as const;

// =================== UTILITY FUNCTIONS ===================
const generateCalendarDays = (startDate: Date, numberOfDays: number = 14): CalendarDay[] => {
  const days: CalendarDay[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < numberOfDays; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    const isToday = date.getTime() === today.getTime();
    const isPast = date < today;
    
    days.push({
      date: new Date(date),
      dateString: date.toISOString().split('T')[0],
      isToday,
      isPast
    });
  }
  
  return days;
};

const calculateReservationPosition = (
  startDate: Date, 
  endDate: Date, 
  calendarStart: Date, 
  totalDays: number
): { position: number; width: number } => {
  const msPerDay = 24 * 60 * 60 * 1000;
  
  // Calcular días desde el inicio del calendario
  const startDayDiff = Math.floor((startDate.getTime() - calendarStart.getTime()) / msPerDay);
  const endDayDiff = Math.floor((endDate.getTime() - calendarStart.getTime()) / msPerDay);
  
  // Asegurarse de que las fechas estén dentro del rango visible
  const adjustedStartDay = Math.max(0, startDayDiff);
  const adjustedEndDay = Math.min(totalDays, endDayDiff);
  
  if (adjustedStartDay >= totalDays || adjustedEndDay <= 0) {
    return { position: 0, width: 0 };
  }
  
  const position = (adjustedStartDay / totalDays) * 100;
  const width = ((adjustedEndDay - adjustedStartDay) / totalDays) * 100;
  
  return { 
    position: Math.max(0, position), 
    width: Math.max(5, width) // Mínimo 5% de ancho para visibilidad
  };
};

// =================== COMPONENTS ===================
interface RoomRowProps {
  room: Room;
  calendarDays: CalendarDay[];
  onRoomClick: (room: Room) => void;
}

const RoomRow: React.FC<RoomRowProps> = ({ room, calendarDays, onRoomClick }) => {
  const reservations = useMemo(() => {
    const result: RoomReservation[] = [];
    
    if (room.checkIn && room.checkOut && room.guestName) {
      const startDate = new Date(room.checkIn);
      const endDate = new Date(room.checkOut);
      const calendarStart = calendarDays[0].date;
      
      const { position, width } = calculateReservationPosition(
        startDate, 
        endDate, 
        calendarStart, 
        calendarDays.length
      );
      
      if (width > 0) {
        result.push({
          id: room.reservationId || room.id,
          guestName: room.guestName,
          startDate,
          endDate,
          status: room.status,
          position,
          width
        });
      }
    }
    
    return result;
  }, [room, calendarDays]);

  return (
    <div className="flex border-b border-gray-200 hover:bg-gray-50 transition-colors">
      {/* Room Info Column */}
      <div 
        className="w-64 p-4 border-r border-gray-200 bg-white cursor-pointer hover:bg-gray-50"
        onClick={() => onRoomClick(room)}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg text-gray-900">
            {room.roomNumber}
          </h3>
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <div className="flex items-center">
            <Bed className="w-4 h-4 mr-2" />
            {room.type}
          </div>
          <div className="flex items-center">
            <User className="w-4 h-4 mr-2" />
            {room.capacity} personas
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 relative bg-white min-h-[96px]">
        {/* Day Grid Background */}
        <div className="flex h-24">
          {calendarDays.map((day) => (
            <div
              key={day.dateString}
              className={`flex-1 border-r border-gray-100 ${
                day.isToday ? 'bg-blue-50' : day.isPast ? 'bg-gray-50' : 'bg-white'
              }`}
            />
          ))}
        </div>

        {/* Reservations */}
        {reservations.map((reservation) => (
          <div
            key={reservation.id}
            className="absolute top-2 h-20 rounded-md border border-gray-200 flex items-center justify-center text-white text-sm font-medium cursor-pointer hover:shadow-md transition-all z-10"
            style={{
              left: `${reservation.position}%`,
              width: `${reservation.width}%`,
              backgroundColor: ROOM_STATUS_COLORS[reservation.status],
              minWidth: '60px'
            }}
            title={`${reservation.guestName} - ${reservation.startDate.toLocaleDateString()} al ${reservation.endDate.toLocaleDateString()}`}
          >
            <div className="text-center px-2 w-full overflow-hidden">
              <div className="font-medium text-xs truncate">{reservation.guestName}</div>
              <div className="text-xs opacity-90 truncate">
                {reservation.startDate.getDate()}/{reservation.startDate.getMonth() + 1}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// =================== MAIN COMPONENT ===================
const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  
  const { data: rooms = [], isLoading } = useRooms();
  const { data: stats } = useDashboardStats();

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const startDate = new Date(currentDate);
    // Comenzar desde hoy para ver mejor las reservaciones actuales
    const today = new Date();
    startDate.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());
    return generateCalendarDays(startDate, 14); // 2 weeks
  }, [currentDate]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-darkGreen2)' }}></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 text-white" style={{ backgroundColor: 'var(--color-darkGreen2)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Calendario de Habitaciones</h1>
            <p className="text-white/80">Vista de ocupación y reservaciones</p>
          </div>
          
          {/* Stats Summary */}
          {stats && (
            <div className="flex gap-6 text-sm">
              <div className="text-center bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-2xl font-bold text-white">{stats.availableRooms}</div>
                <div className="text-white/90 font-medium">Disponibles</div>
              </div>
              <div className="text-center bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-2xl font-bold text-white">{stats.occupiedRooms}</div>
                <div className="text-white/90 font-medium">Ocupadas</div>
              </div>
              <div className="text-center bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-2xl font-bold text-white">{stats.occupancyRate}%</div>
                <div className="text-white/90 font-medium">Ocupación</div>
              </div>
            </div>
          )}
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="text-lg font-semibold">
              {calendarDays[0]?.date.toLocaleDateString('es-ES', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </div>
            
            <button
              onClick={() => navigateWeek('next')}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={goToToday}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-medium"
          >
            Hoy
          </button>
        </div>
      </div>

      {/* Calendar Header - Days */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        <div className="w-64 p-4 border-r border-gray-200 font-semibold text-gray-700">
          Habitación
        </div>
        <div className="flex-1 flex">
          {calendarDays.map((day) => (
            <div
              key={day.dateString}
              className={`flex-1 p-4 border-r border-gray-200 text-center ${
                day.isToday ? 'bg-blue-100 text-blue-800 font-bold' : 'text-gray-700'
              }`}
            >
              <div className="text-sm font-medium">
                {day.date.toLocaleDateString('es-ES', { weekday: 'short' })}
              </div>
              <div className={`text-lg ${day.isToday ? 'font-bold' : ''}`}>
                {day.date.getDate()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Body - Rooms */}
      <div className="max-h-96 overflow-y-auto">
        {rooms.map((room) => (
          <RoomRow
            key={room.id}
            room={room}
            calendarDays={calendarDays}
            onRoomClick={setSelectedRoom}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-center gap-6 text-sm">
          {Object.entries(ROOM_STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded" 
                style={{ backgroundColor: color }}
              ></div>
              <span className="text-gray-700">{STATUS_LABELS[status as keyof typeof STATUS_LABELS]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Room Details Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 m-4 max-w-md w-full shadow-2xl border border-white/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Habitación {selectedRoom.roomNumber}</h3>
              <button
                onClick={() => setSelectedRoom(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tipo:</span>
                <span className="font-medium">{selectedRoom.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Capacidad:</span>
                <span className="font-medium">{selectedRoom.capacity} personas</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <span 
                  className="px-2 py-1 rounded text-xs font-medium text-white"
                  style={{ backgroundColor: ROOM_STATUS_COLORS[selectedRoom.status] }}
                >
                  {STATUS_LABELS[selectedRoom.status]}
                </span>
              </div>
              {selectedRoom.guestName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Huésped:</span>
                  <span className="font-medium">{selectedRoom.guestName}</span>
                </div>
              )}
              {selectedRoom.checkIn && selectedRoom.checkOut && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in:</span>
                    <span className="font-medium">
                      {new Date(selectedRoom.checkIn).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-out:</span>
                    <span className="font-medium">
                      {new Date(selectedRoom.checkOut).toLocaleDateString()}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
