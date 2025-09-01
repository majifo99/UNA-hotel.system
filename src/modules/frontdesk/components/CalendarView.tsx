import React, { useState } from 'react';
import { useRooms, useDashboardStats } from '../hooks';
import { useCalendarNavigation } from '../hooks/useCalendarNavigation';
import type { Room } from '../../../types/core';
import type { FrontdeskRoom, FrontdeskRoomStatus } from '../types';
import {
  CalendarHeader,
  CalendarDaysHeader,
  RoomRow,
  RoomDetailsModal,
  CalendarLegend,
  CalendarLoading
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
    guestName: undefined,
    checkIn: undefined,
    checkOut: undefined
  };
};

const CalendarView: React.FC = () => {
  const [selectedRoom, setSelectedRoom] = useState<FrontdeskRoom | null>(null);
  
  const { data: rooms = [], isLoading } = useRooms();
  const { data: stats } = useDashboardStats();
  const { calendarDays, navigateWeek, goToToday } = useCalendarNavigation();

  // Adaptar habitaciones a FrontdeskRoom
  const frontdeskRooms = rooms.map(adaptRoomToFrontdeskRoom);

  if (isLoading) {
    return <CalendarLoading />;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      <CalendarHeader
        calendarDays={calendarDays}
        onNavigateWeek={navigateWeek}
        onGoToToday={goToToday}
        stats={stats}
      />

      <CalendarDaysHeader calendarDays={calendarDays} />

      {/* Calendar Body - Rooms */}
      <div className="max-h-96 overflow-y-auto">
        {frontdeskRooms.map((room) => (
          <RoomRow
            key={room.id}
            room={room}
            calendarDays={calendarDays}
            onRoomClick={setSelectedRoom}
          />
        ))}
      </div>

      <CalendarLegend />

      <RoomDetailsModal
        room={selectedRoom}
        onClose={() => setSelectedRoom(null)}
      />
    </div>
  );
};

export default CalendarView;
