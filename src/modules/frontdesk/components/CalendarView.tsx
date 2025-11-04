import React, { useState } from 'react';
import { useRooms, useDashboardStats } from '../hooks';
import { useCalendarNavigation } from '../hooks/useCalendarNavigation';
import { useCalendarReservations } from '../hooks/useCalendarReservations';
import type { Room } from '../../../types/core';
import type { FrontdeskRoom, FrontdeskRoomStatus } from '../types';
import type { CalendarReservation } from '../services/frontdeskReservationService';
import {
  CalendarHeader,
  CalendarDaysHeader,
  RoomRow,
  RoomDetailsModal,
  CalendarLegend,
  CalendarLoading,
  ReservationDetailsModal
} from './calendar';

// Adaptador para convertir Room a FrontdeskRoom
const adaptRoomToFrontdeskRoom = (room: Room): FrontdeskRoom => {
  // Mapear status de Room a FrontdeskRoomStatus
  const statusMap: Record<NonNullable<Room['status']>, FrontdeskRoomStatus> = {
    'available': 'available',
    'occupied': 'checked-in',
    'maintenance': 'maintenance',
    'cleaning': 'checked-out'
  };

  return {
    ...room,
    status: room.status ? statusMap[room.status] : 'available',
    type: room.type === 'deluxe' ? 'Deluxe' : 'Standard',
    roomNumber: room.number,
  };
};

const CalendarView: React.FC = () => {
  const [selectedRoom, setSelectedRoom] = useState<FrontdeskRoom | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<CalendarReservation | null>(null);
  
  const { data: rooms = [], isLoading } = useRooms();
  const { data: stats } = useDashboardStats();
  const { 
    calendarDays, 
    viewMode, 
    setViewMode,
    navigateWeek, 
    navigateMonth,
    goToToday,
    goToSpecificMonth,
    getCurrentMonthYear,
    currentDate,
    dateRange
  } = useCalendarNavigation();

  // Obtener reservas para el rango de fechas del calendario
  const { data: reservations = [], isLoading: reservationsLoading } = useCalendarReservations({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    enabled: calendarDays.length > 0
  });

  // Adaptar habitaciones a FrontdeskRoom
  const frontdeskRooms = rooms.map(adaptRoomToFrontdeskRoom);

  console.debug('[CalendarView] Habitaciones:', frontdeskRooms.length);
  console.debug('[CalendarView] Reservas:', reservations.length);
  console.debug('[CalendarView] Rango de fechas:', dateRange);

  if (isLoading || reservationsLoading) {
    return <CalendarLoading />;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <CalendarHeader
        calendarDays={calendarDays}
        viewMode={viewMode}
        currentMonthYear={getCurrentMonthYear()}
        currentDate={currentDate}
        onNavigateWeek={navigateWeek}
        onNavigateMonth={navigateMonth}
        onGoToToday={goToToday}
        onGoToSpecificMonth={goToSpecificMonth}
        onViewModeChange={setViewMode}
        stats={stats}
      />

      <CalendarDaysHeader calendarDays={calendarDays} />

      {/* Calendar Body - Rooms */}
      <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 320px)' }}>
        {frontdeskRooms.length > 0 ? (
          frontdeskRooms.map((room) => (
            <RoomRow
              key={room.id}
              room={room}
              calendarDays={calendarDays}
              reservations={reservations}
              onRoomClick={setSelectedRoom}
              onReservationClick={setSelectedReservation}
            />
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            No hay habitaciones disponibles
          </div>
        )}
      </div>

      <CalendarLegend />

      <RoomDetailsModal
        room={selectedRoom}
        onClose={() => setSelectedRoom(null)}
      />

      <ReservationDetailsModal
        reservation={selectedReservation}
        onClose={() => setSelectedReservation(null)}
      />
    </div>
  );
};

export default CalendarView;
