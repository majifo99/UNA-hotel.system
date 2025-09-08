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
  const reservations = useMemo(() => {
    const result: RoomReservation[] = [];
    
    // For now, simulate reservations for occupied rooms
    if (room.status === 'checked-in' && room.guestName) {
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 2); // 2 days stay
      
      result.push({
        id: room.id,
        guestName: room.guestName,
        startDate: today,
        endDate: endDate,
        status: room.status,
        position: 0,
        width: 2
      });
    }

    return result;
  }, [room]);

  return (
    <div className="flex border-b border-gray-200 hover:bg-gray-50">
      {/* Room Info Column */}
      <button
        className="flex items-center p-3 bg-white sticky left-0 z-10 border-r border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        style={{ minWidth: '200px' }}
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
        <Bed className="w-4 h-4 text-gray-500 mr-2" />
        <div>
          <div className="font-medium text-gray-900">
            {room.roomNumber || room.number}
          </div>
          <div className="text-sm text-gray-500">{room.type}</div>
        </div>
      </button>

      {/* Calendar Days */}
      <div className="flex flex-1 relative">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`border-r border-gray-100 flex-shrink-0 ${
              day.isToday ? 'bg-blue-50' : 'bg-white'
            }`}
            style={{ width: 120, height: 60 }}
          />
        ))}

        {/* Reservations */}
        {reservations.map((reservation) => (
          <div
            key={reservation.id}
            className="absolute top-2 rounded px-2 py-1 text-xs text-white font-medium shadow"
            style={{
              left: reservation.position * 120 + 4,
              width: reservation.width * 120 - 8,
              backgroundColor: ROOM_STATUS_COLORS[reservation.status],
              minWidth: 60
            }}
          >
            <div className="flex items-center">
              <User className="w-3 h-3 mr-1" />
              <span className="truncate">{reservation.guestName}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomRow;
