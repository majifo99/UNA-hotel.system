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

// Helper functions to generate mock data for demo purposes
const generateMockGuestName = (room: Room): string | undefined => {
  const mockGuests = [
    'María González', 'Carlos Rodríguez', 'Ana Martínez', 'Luis Pérez',
    'Sofia López', 'Diego Hernández', 'Carmen Jiménez', 'Roberto Silva',
    'Elena Torres', 'Fernando Ruiz', 'Patricia Morales', 'Andrés Castro'
  ];
  
  // Generate predictable but varied guest names based on room
  const roomIndex = parseInt(room.id.slice(-1)) || 0;
  
  if (room.status === 'occupied') {
    return mockGuests[roomIndex % mockGuests.length];
  }
  
  // Some available rooms might have upcoming reservations
  if (room.status === 'available' && roomIndex % 3 === 0) {
    return `Reserva: ${mockGuests[(roomIndex + 3) % mockGuests.length]}`;
  }
  
  return undefined;
};

const generateMockCheckIn = (room: Room): string | undefined => {
  if (room.status === 'occupied') {
    const today = new Date();
    // Use room ID to generate predictable but varied check-in dates for demo
    const roomIndex = parseInt(room.id.slice(-1)) || 0;
    const daysAgo = roomIndex % 3; // 0-2 days ago, deterministic based on room
    const checkInDate = new Date(today);
    checkInDate.setDate(today.getDate() - daysAgo);
    return checkInDate.toISOString().split('T')[0];
  }
  
  // For available rooms with reservations
  const roomIndex = parseInt(room.id.slice(-1)) || 0;
  if (room.status === 'available' && roomIndex % 3 === 0) {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + (roomIndex % 7 + 1)); // 1-7 days from now
    return futureDate.toISOString().split('T')[0];
  }
  
  return undefined;
};

const generateMockCheckOut = (room: Room): string | undefined => {
  const checkIn = generateMockCheckIn(room);
  if (checkIn) {
    const checkInDate = new Date(checkIn);
    // Use room ID to generate predictable stay duration for demo
    const roomIndex = parseInt(room.id.slice(-1)) || 0;
    const stayDuration = (roomIndex % 5) + 1; // 1-5 days, deterministic
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkInDate.getDate() + stayDuration);
    return checkOutDate.toISOString().split('T')[0];
  }
  return undefined;
};

const generateMockCurrentGuest = (room: Room) => {
  const guestName = generateMockGuestName(room);
  const checkIn = generateMockCheckIn(room);
  const checkOut = generateMockCheckOut(room);
  
  if (guestName && checkIn && checkOut && room.status === 'occupied') {
    return {
      name: guestName,
      checkIn,
      checkOut
    };
  }
  
  return undefined;
};

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
    guestName: generateMockGuestName(room),
    checkIn: generateMockCheckIn(room),
    checkOut: generateMockCheckOut(room),
    currentGuest: generateMockCurrentGuest(room),
  };
};

const CalendarView: React.FC = () => {
  const [selectedRoom, setSelectedRoom] = useState<FrontdeskRoom | null>(null);
  
  const { data: rooms = [], isLoading } = useRooms();
  const { data: stats } = useDashboardStats();
  const { 
    calendarDays, 
    viewMode, 
    setViewMode,
    navigateWeek, 
    navigateMonth,
    goToToday,
    getCurrentMonthYear
  } = useCalendarNavigation();

  // Adaptar habitaciones a FrontdeskRoom
  const frontdeskRooms = rooms.map(adaptRoomToFrontdeskRoom);

  if (isLoading) {
    return <CalendarLoading />;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <CalendarHeader
        calendarDays={calendarDays}
        viewMode={viewMode}
        currentMonthYear={getCurrentMonthYear()}
        onNavigateWeek={navigateWeek}
        onNavigateMonth={navigateMonth}
        onGoToToday={goToToday}
        onViewModeChange={setViewMode}
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
