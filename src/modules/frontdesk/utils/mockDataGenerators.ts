import type { Room } from '../../../types/core';

// Helper functions to generate mock data for demo purposes
export const generateMockGuestName = (room: Room): string | undefined => {
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

export const generateMockCheckIn = (room: Room): string | undefined => {
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

export const generateMockCheckOut = (room: Room): string | undefined => {
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

export const generateMockCurrentGuest = (room: Room) => {
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
