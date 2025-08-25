import type { Room, DashboardStats, CalendarView } from '../types';

/**
 * Datos simulados para desarrollo y testing del módulo Frontdesk
 */

// Habitaciones simuladas
export const mockRooms: Room[] = [
  {
    id: '1',
    roomNumber: '101',
    type: 'Standard',
    floor: 1,
    capacity: 2,
    price: 120.00,
    status: 'available',
    guestName: null,
    checkIn: null,
    checkOut: null,
    reservationId: null,
    lastCleaned: '2025-08-25T10:30:00Z',
    amenities: ['Wi-Fi', 'TV', 'Air Conditioning'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-08-25T10:30:00Z'
  },
  {
    id: '2',
    roomNumber: '102',
    type: 'Standard',
    floor: 1,
    capacity: 2,
    price: 120.00,
    status: 'checked-in',
    guestName: 'Juan Pérez',
    checkIn: '2025-08-25T14:00:00Z', // Hoy
    checkOut: '2025-08-28T11:00:00Z', // En 3 días
    reservationId: 'res_001',
    lastCleaned: '2025-08-24T09:00:00Z',
    amenities: ['Wi-Fi', 'TV', 'Air Conditioning'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-08-25T14:00:00Z'
  },
  {
    id: '3',
    roomNumber: '103',
    type: 'Deluxe',
    floor: 1,
    capacity: 3,
    price: 180.00,
    status: 'reserved',
    guestName: 'María González',
    checkIn: '2025-08-26T15:00:00Z',
    checkOut: '2025-08-30T11:00:00Z',
    reservationId: 'res_002',
    lastCleaned: '2025-08-24T16:00:00Z',
    amenities: ['Wi-Fi', 'TV', 'Air Conditioning', 'Mini Bar', 'Balcony'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-08-25T12:00:00Z'
  },
  {
    id: '4',
    roomNumber: '201',
    type: 'Suite',
    floor: 2,
    capacity: 4,
    price: 350.00,
    status: 'maintenance',
    guestName: null,
    checkIn: null,
    checkOut: null,
    reservationId: null,
    notes: 'Reparación de aire acondicionado',
    lastCleaned: '2025-08-23T08:00:00Z',
    amenities: ['Wi-Fi', 'TV', 'Air Conditioning', 'Mini Bar', 'Jacuzzi', 'Living Room'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-08-24T09:00:00Z'
  },
  {
    id: '5',
    roomNumber: '202',
    type: 'Suite',
    floor: 2,
    capacity: 4,
    price: 350.00,
    status: 'cleaning',
    guestName: null,
    checkIn: null,
    checkOut: null,
    reservationId: null,
    lastCleaned: '2025-08-25T11:00:00Z',
    amenities: ['Wi-Fi', 'TV', 'Air Conditioning', 'Mini Bar', 'Jacuzzi', 'Living Room'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-08-25T11:00:00Z'
  },
  {
    id: '6',
    roomNumber: '301',
    type: 'Presidential',
    floor: 3,
    capacity: 6,
    price: 800.00,
    status: 'available',
    guestName: null,
    checkIn: null,
    checkOut: null,
    reservationId: null,
    lastCleaned: '2025-08-25T07:00:00Z',
    amenities: ['Wi-Fi', 'TV', 'Air Conditioning', 'Mini Bar', 'Jacuzzi', 'Living Room', 'Kitchen', 'Terrace'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-08-25T07:00:00Z'
  },
  {
    id: '7',
    roomNumber: '104',
    type: 'Standard',
    floor: 1,
    capacity: 2,
    price: 120.00,
    status: 'checked-out',
    guestName: 'Carlos Ruiz',
    checkIn: '2025-08-22T14:00:00Z',
    checkOut: '2025-08-25T11:00:00Z',
    reservationId: 'res_003',
    lastCleaned: '2025-08-25T12:00:00Z',
    amenities: ['Wi-Fi', 'TV', 'Air Conditioning'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-08-25T11:00:00Z'
  },
  {
    id: '8',
    roomNumber: '105',
    type: 'Deluxe',
    floor: 1,
    capacity: 3,
    price: 180.00,
    status: 'checked-in',
    guestName: 'Ana López',
    checkIn: '2025-08-23T16:00:00Z',
    checkOut: '2025-08-27T11:00:00Z',
    reservationId: 'res_004',
    lastCleaned: '2025-08-23T10:00:00Z',
    amenities: ['Wi-Fi', 'TV', 'Air Conditioning', 'Mini Bar', 'Balcony'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-08-23T16:00:00Z'
  },
  {
    id: '9',
    roomNumber: '106',
    type: 'Standard',
    floor: 1,
    capacity: 2,
    price: 120.00,
    status: 'reserved',
    guestName: 'Pedro Silva',
    checkIn: '2025-08-27T14:00:00Z',
    checkOut: '2025-08-31T11:00:00Z',
    reservationId: 'res_005',
    lastCleaned: '2025-08-25T08:00:00Z',
    amenities: ['Wi-Fi', 'TV', 'Air Conditioning'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-08-25T09:00:00Z'
  },
  {
    id: '10',
    roomNumber: '203',
    type: 'Suite',
    floor: 2,
    capacity: 4,
    price: 350.00,
    status: 'checked-in',
    guestName: 'Sofia Ramírez',
    checkIn: '2025-08-25T15:00:00Z',
    checkOut: '2025-08-29T11:00:00Z',
    reservationId: 'res_006',
    lastCleaned: '2025-08-25T13:00:00Z',
    amenities: ['Wi-Fi', 'TV', 'Air Conditioning', 'Mini Bar', 'Jacuzzi', 'Living Room'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-08-25T15:00:00Z'
  }
];

// Estadísticas del dashboard
export const mockDashboardStats: DashboardStats = {
  totalRooms: 10,
  availableRooms: 2,
  occupiedRooms: 3,
  reservedRooms: 2,
  maintenanceRooms: 1,
  cleaningRooms: 1,
  checkedOutRooms: 1,
  occupancyRate: 70.0,
  todayCheckIns: 2,
  todayCheckOuts: 1,
  revenue: {
    today: 1850.00,
    month: 45600.00,
    year: 525000.00
  },
  averageStay: 3.2,
  guestsCount: 12
};

// Vista de calendario simulada
export const mockCalendarView: CalendarView = {
  startDate: '2024-01-15',
  endDate: '2024-01-22',
  rooms: mockRooms.map(room => ({
    roomId: room.id,
    roomNumber: room.roomNumber,
    roomType: room.type,
    events: room.status === 'checked-in' || room.status === 'reserved' ? [
      {
        id: room.reservationId || `event_${room.id}`,
        title: room.guestName || 'Reserva',
        startDate: room.checkIn || '2024-01-15T14:00:00Z',
        endDate: room.checkOut || '2024-01-17T11:00:00Z',
        guestName: room.guestName || 'Huésped',
        status: room.status,
        color: room.status === 'checked-in' ? '#dc2626' : '#7c3aed'
      }
    ] : []
  }))
};

// Función para simular delay de red
export const simulateNetworkDelay = (min = 500, max = 1500): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Función para simular errores ocasionales
export const simulateRandomError = (errorRate = 0.1): void => {
  if (Math.random() < errorRate) {
    throw new Error('Error simulado de red');
  }
};
