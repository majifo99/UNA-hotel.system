import React, { useMemo } from 'react';
import { User, Bed } from 'lucide-react';
import type { RoomRowProps, RoomReservation } from '../../types/calendar';
import { ROOM_STATUS_COLORS, CALENDAR_CONFIG } from '../../constants/calendar';
import { calculateReservationPosition } from '../../utils/calendarHelpers';

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
              minWidth: CALENDAR_CONFIG.MIN_RESERVATION_PIXEL_WIDTH
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

export default RoomRow;
