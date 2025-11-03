import React, { useMemo } from 'react';
import { User, Bed } from 'lucide-react';
import type { FrontdeskRoom, FrontdeskRoomStatus } from '../../types';
import type { CalendarReservation } from '../../services/frontdeskReservationService';

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
  status: 'pending' | 'confirmed' | 'cancelled';
  position: number;
  width: number;
}

interface RoomRowProps {
  room: FrontdeskRoom;
  calendarDays: CalendarDay[];
  reservations: CalendarReservation[];
  onRoomClick: (room: FrontdeskRoom) => void;
  onReservationClick: (reservation: CalendarReservation) => void;
}

// Room status colors
const RESERVATION_STATUS_COLORS: Record<'pending' | 'confirmed' | 'cancelled', string> = {
  pending: '#F59E0B',     // Amarillo para pendiente
  confirmed: '#10B981',   // Verde para confirmada
  cancelled: '#EF4444'    // Rojo para cancelada
};

// Room status translations for accessibility
const ROOM_STATUS_LABELS: Record<FrontdeskRoomStatus, string> = {
  available: 'disponible',
  occupied: 'ocupada',
  reserved: 'reservada',
  'checked-in': 'ocupada',
  'checked-out': 'liberada',
  maintenance: 'en mantenimiento',
  cleaning: 'en limpieza'
};

const RoomRow: React.FC<RoomRowProps> = ({ room, calendarDays, reservations, onRoomClick, onReservationClick }) => {
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

  // Helper para obtener el texto del estado de reserva
  const getReservationStatusText = (status: 'pending' | 'confirmed' | 'cancelled'): string => {
    if (status === 'confirmed') return 'Confirmada';
    if (status === 'pending') return 'Pendiente';
    return 'Cancelada';
  };

  // Helper para obtener el icono del estado
  const getReservationStatusIcon = (status: 'pending' | 'confirmed' | 'cancelled'): string => {
    if (status === 'confirmed') return '✓';
    if (status === 'pending') return '⏳';
    return '✗';
  };

  const roomReservations = useMemo(() => {
    const result: RoomReservation[] = [];
    
    // Filtrar reservas para esta habitación específica
    const roomRes = reservations.filter(res => res.roomId === Number(room.id));
    
    roomRes.forEach(reservation => {
      // Encontrar la posición inicial en el calendario
      const startDay = calendarDays.findIndex(day => {
        const dayStr = day.date.toISOString().split('T')[0];
        const resStr = reservation.startDate.toISOString().split('T')[0];
        return dayStr === resStr;
      });
      
      if (startDay >= 0) {
        // Encontrar la posición final
        const endDay = calendarDays.findIndex(day => {
          const dayStr = day.date.toISOString().split('T')[0];
          const resStr = reservation.endDate.toISOString().split('T')[0];
          return dayStr === resStr;
        });
        
        // Calcular el ancho (número de días)
        const width = endDay >= 0 
          ? endDay - startDay + 1 
          : Math.min(3, calendarDays.length - startDay);
        
        result.push({
          id: reservation.id,
          guestName: reservation.guestName,
          startDate: reservation.startDate,
          endDate: reservation.endDate,
          status: reservation.status,
          position: startDay,
          width: width
        });
      }
    });
    
    return result;
  }, [room.id, reservations, calendarDays]);

  return (
    <div className="flex border-b border-gray-200 hover:bg-gray-50/80 transition-colors group">
      {/* Room Info Column - Fixed width matching header */}
      <button
        className="flex items-center p-4 bg-white border-r border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset transition-colors flex-shrink-0"
        style={{ minWidth: '220px', width: '220px' }}
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
        <div className={`p-2 rounded-lg mr-3 flex-shrink-0 ${getRoomStatusStyling(room.status)}`}>
          <Bed className="w-4 h-4" />
        </div>
        <div className="text-left min-w-0 flex-1">
          <div className="font-semibold text-gray-900 text-base">
            {room.roomNumber || room.number}
          </div>
          <div className="text-xs text-gray-500 truncate">{room.type}</div>
          {roomReservations.length > 0 && (
            <div className="text-xs text-blue-600 mt-1 truncate">
              <User className="w-3 h-3 inline mr-1" />
              {roomReservations.length} reserva{roomReservations.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </button>

      {/* Calendar Days - Scrollable container */}
      <div className="flex-1 relative overflow-x-auto">
        <div className="flex" style={{ minWidth: `${calendarDays.length * 120}px` }}>
          {calendarDays.map((day, index) => (
            <div
              key={`${day.date.toISOString()}-${index}`}
              className={`border-r border-gray-100 flex-shrink-0 relative ${
                day.isToday ? 'bg-blue-50/70' : 'bg-white'
              } ${day.isWeekend ? 'bg-gray-50/50' : ''}`}
              style={{ width: '120px', height: '70px' }}
            >
            </div>
          ))}
        </div>

        {/* Reservations */}
        {roomReservations.map((reservation) => {
          // Encontrar la reserva completa del calendario
          const fullReservation = reservations.find(r => r.id === reservation.id);
          
          return (
            <div
              key={reservation.id}
              className="absolute top-3 rounded-lg px-3 py-2 text-xs text-white font-medium shadow-md border border-white/20 backdrop-blur-sm hover:shadow-xl transition-all cursor-pointer hover:scale-105"
              style={{
                left: `${reservation.position * 120 + 6}px`,
                width: `${reservation.width * 120 - 12}px`,
                backgroundColor: RESERVATION_STATUS_COLORS[reservation.status],
                minWidth: '100px',
                maxHeight: '64px',
                overflow: 'hidden'
              }}
              title={`${reservation.guestName} - ${reservation.startDate.toLocaleDateString('es-ES')} al ${reservation.endDate.toLocaleDateString('es-ES')} - ${getReservationStatusText(reservation.status)}`}
              onClick={() => fullReservation && onReservationClick(fullReservation)}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && fullReservation) {
                  e.preventDefault();
                  onReservationClick(fullReservation);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center min-w-0 flex-1">
                  <User className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="truncate font-medium">{reservation.guestName}</span>
                </div>
                <span className="ml-2 text-xs opacity-90 flex-shrink-0">
                  {getReservationStatusIcon(reservation.status)}
                </span>
              </div>
              <div className="text-xs opacity-80 mt-1 truncate">
                {reservation.startDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} - 
                {reservation.endDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoomRow;
