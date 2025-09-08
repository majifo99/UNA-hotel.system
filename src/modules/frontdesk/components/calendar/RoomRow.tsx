import React, { useMemo } from 'react';
import { User, Bed } from 'lucide-react';
import type { FrontdeskRoom, FrontdeskRoomStatus } from '../../types';

interface CalendarDay {
  date: Date;
  isToday: boolean;
  isWeekend: boolean;
}

interface RoomReservation {
  id: string;
  guestName: string;
  startDate: Date;
  endDate: Date;
  status: FrontdeskRoomStatus;
  position: number;
  width: number;
}

interface RoomRowProps {
  room: FrontdeskRoom;
  calendarDays: CalendarDay[];
  onRoomClick: (room: FrontdeskRoom) => void;
}

// Room status colors
const ROOM_STATUS_COLORS: Record<FrontdeskRoomStatus, string> = {
  available: '#10B981',
  reserved: '#8B5CF6',
  'checked-in': '#EF4444', 
  'checked-out': '#F97316',
  maintenance: '#F59E0B'
};

// Room status translations for accessibility
const ROOM_STATUS_LABELS: Record<FrontdeskRoomStatus, string> = {
  available: 'disponible',
  reserved: 'reservada',
  'checked-in': 'ocupada',
  'checked-out': 'liberada',
  maintenance: 'en mantenimiento'
};

const RoomRow: React.FC<RoomRowProps> = ({ room, calendarDays, onRoomClick }) => {
  // Helper function to get room status styling
  const getRoomStatusStyling = (status: FrontdeskRoomStatus): string => {
    switch (status) {
      case 'checked-in':
        return 'bg-red-100 text-red-600';
      case 'available':
        return 'bg-green-100 text-green-600';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const reservations = useMemo(() => {
    const result: RoomReservation[] = [];
    
    // Use the mock data from the room
    if (room.currentGuest && room.checkIn && room.checkOut) {
      const startDate = new Date(room.checkIn);
      const endDate = new Date(room.checkOut);
      
      // Calculate position and width based on calendar days
      const startDay = calendarDays.findIndex(day => 
        day.date.toDateString() === startDate.toDateString()
      );
      
      if (startDay >= 0) {
        const endDay = calendarDays.findIndex(day => 
          day.date.toDateString() === endDate.toDateString()
        );
        
        const width = endDay >= 0 ? endDay - startDay + 1 : 
                     Math.min(3, calendarDays.length - startDay); // Default to 3 days or remaining days
        
        result.push({
          id: room.id,
          guestName: room.currentGuest.name,
          startDate: startDate,
          endDate: endDate,
          status: room.status,
          position: startDay,
          width: width
        });
      }
    }
    
    // Handle future reservations for available rooms
    if (room.status === 'available' && room.guestName?.startsWith('Reserva:') && room.checkIn && room.checkOut) {
      const startDate = new Date(room.checkIn);
      const endDate = new Date(room.checkOut);
      
      const startDay = calendarDays.findIndex(day => 
        day.date.toDateString() === startDate.toDateString()
      );
      
      if (startDay >= 0) {
        const endDay = calendarDays.findIndex(day => 
          day.date.toDateString() === endDate.toDateString()
        );
        
        const width = endDay >= 0 ? endDay - startDay + 1 : 
                     Math.min(2, calendarDays.length - startDay);
        
        result.push({
          id: `${room.id}-reservation`,
          guestName: room.guestName.replace('Reserva: ', ''),
          startDate: startDate,
          endDate: endDate,
          status: 'reserved',
          position: startDay,
          width: width
        });
      }
    }

    return result;
  }, [room, calendarDays]);

  return (
    <div className="flex border-b border-gray-200 hover:bg-gray-50/80 transition-colors">
      {/* Room Info Column */}
      <button
        className="flex items-center p-4 bg-white sticky left-0 z-10 border-r border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset transition-colors"
        style={{ minWidth: '220px' }}
        onClick={() => onRoomClick(room)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onRoomClick(room);
          }
        }}
        aria-label={`Seleccionar habitación ${room.roomNumber || room.number}, tipo ${room.type}, estado ${ROOM_STATUS_LABELS[room.status]}`}
        type="button"
      >
        <div className={`p-2 rounded-lg mr-3 ${getRoomStatusStyling(room.status)}`}>
          <Bed className="w-4 h-4" />
        </div>
        <div className="text-left">
          <div className="font-semibold text-gray-900 text-base">
            {room.roomNumber || room.number}
          </div>
          <div className="text-sm text-gray-500">{room.type}</div>
          {room.currentGuest && (
            <div className="text-xs text-gray-600 mt-1">
              {room.currentGuest.name}
            </div>
          )}
        </div>
      </button>

      {/* Calendar Days */}
      <div className="flex flex-1 relative">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`border-r border-gray-100 flex-shrink-0 relative ${
              day.isToday ? 'bg-blue-50/70' : 'bg-white'
            } ${day.isWeekend ? 'bg-gray-50/50' : ''}`}
            style={{ width: 120, height: 70 }}
          >
          </div>
        ))}

        {/* Reservations */}
        {reservations.map((reservation) => (
          <div
            key={reservation.id}
            className="absolute top-3 rounded-lg px-3 py-2 text-xs text-white font-medium shadow-md border border-white/20 backdrop-blur-sm"
            style={{
              left: reservation.position * 120 + 6,
              width: reservation.width * 120 - 12,
              backgroundColor: ROOM_STATUS_COLORS[reservation.status],
              minWidth: 100
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center min-w-0">
                <User className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate font-medium">{reservation.guestName}</span>
              </div>
              {reservation.status === 'reserved' && (
                <span className="ml-2 text-xs opacity-90">Reserva</span>
              )}
            </div>
            <div className="text-xs opacity-80 mt-1">
              {reservation.startDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} - 
              {reservation.endDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomRow;
