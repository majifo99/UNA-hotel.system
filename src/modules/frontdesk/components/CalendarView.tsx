import React, { useState } from 'react';
import { useRooms, useDashboardStats } from '../hooks';
import { useCalendarNavigation } from '../hooks/useCalendarNavigation';
import type { Room } from '../types';
import {
  CalendarHeader,
  CalendarDaysHeader,
  RoomRow,
  RoomDetailsModal,
  CalendarLegend,
  CalendarLoading
} from './calendar';

const CalendarView: React.FC = () => {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  
  const { data: rooms = [], isLoading } = useRooms();
  const { data: stats } = useDashboardStats();
  const { calendarDays, navigateWeek, goToToday } = useCalendarNavigation();

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
        {rooms.map((room) => (
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
