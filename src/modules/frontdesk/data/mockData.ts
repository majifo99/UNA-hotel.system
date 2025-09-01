import type { Room } from '../../../types/core/domain';
import type { DashboardStats, CalendarView } from '../types';

/**
 * Datos simulados para desarrollo y testing del módulo Frontdesk
 */

// Habitaciones simuladas
export const mockRooms: Room[] = [
  {
    id: '1',
    number: '101',
    type: 'single',
    name: 'Habitación Standard 101',
    floor: 1,
    capacity: 2,
    pricePerNight: 120.00,
    basePrice: 120.00,
    status: 'available',
    amenities: ['Wi-Fi', 'TV', 'Air Conditioning'],
    isAvailable: true,
    description: 'Habitación estándar con todas las comodidades',
  },
  {
    id: '2',
    number: '102',
    type: 'double',
    name: 'Habitación Standard 102',
    floor: 1,
    capacity: 2,
    pricePerNight: 120.00,
    basePrice: 120.00,
    status: 'occupied',
    amenities: ['Wi-Fi', 'TV', 'Air Conditioning'],
    isAvailable: false,
    description: 'Habitación estándar con todas las comodidades',
  },
  {
    id: '3',
    number: '201',
    type: 'deluxe',
    name: 'Habitación Deluxe 201',
    floor: 2,
    capacity: 3,
    pricePerNight: 180.00,
    basePrice: 180.00,
    status: 'available',
    amenities: ['Wi-Fi', 'TV', 'Air Conditioning', 'Mini Bar', 'Balcony'],
    isAvailable: true,
    description: 'Habitación deluxe con balcón y mini bar',
  },
  {
    id: '4',
    number: '301',
    type: 'suite',
    name: 'Suite Presidential 301',
    floor: 3,
    capacity: 4,
    pricePerNight: 350.00,
    basePrice: 350.00,
    status: 'available',
    amenities: ['Wi-Fi', 'TV', 'Air Conditioning', 'Mini Bar', 'Balcony', 'Jacuzzi', 'Room Service'],
    isAvailable: true,
    description: 'Suite de lujo con todas las comodidades',
  },
  {
    id: '5',
    number: '103',
    type: 'single',
    name: 'Habitación Standard 103',
    floor: 1,
    capacity: 2,
    pricePerNight: 120.00,
    basePrice: 120.00,
    status: 'cleaning',
    amenities: ['Wi-Fi', 'TV', 'Air Conditioning'],
    isAvailable: false,
    description: 'Habitación estándar con todas las comodidades',
  },
  {
    id: '6',
    number: '202',
    type: 'deluxe',
    name: 'Habitación Deluxe 202',
    floor: 2,
    capacity: 3,
    pricePerNight: 180.00,
    basePrice: 180.00,
    status: 'occupied',
    amenities: ['Wi-Fi', 'TV', 'Air Conditioning', 'Mini Bar', 'Balcony'],
    isAvailable: false,
    description: 'Habitación deluxe con balcón y mini bar',
  },
  {
    id: '7',
    number: '104',
    type: 'family',
    name: 'Habitación Familiar 104',
    floor: 1,
    capacity: 4,
    pricePerNight: 200.00,
    basePrice: 200.00,
    status: 'available',
    amenities: ['Wi-Fi', 'TV', 'Air Conditioning', 'Extra Bed'],
    isAvailable: true,
    description: 'Habitación familiar con cama extra',
  },
  {
    id: '8',
    number: '302',
    type: 'suite',
    name: 'Suite Executive 302',
    floor: 3,
    capacity: 4,
    pricePerNight: 320.00,
    basePrice: 320.00,
    status: 'occupied',
    amenities: ['Wi-Fi', 'TV', 'Air Conditioning', 'Mini Bar', 'Balcony', 'Room Service'],
    isAvailable: false,
    description: 'Suite ejecutiva con vista panorámica',
  }
];

// Estadísticas simuladas del dashboard
export const mockStats: DashboardStats = {
  totalRooms: 8,
  availableRooms: 4,
  occupiedRooms: 3,
  maintenanceRooms: 0,
  reservedRooms: 0,
  checkInsToday: 2,
  checkOutsToday: 1,
  occupancyRate: 62.5
};

// Alias para compatibilidad con código legacy
export const mockDashboardStats = mockStats;

// Vista de calendario simulada
export const mockCalendarViews: CalendarView[] = mockRooms.map(room => ({
  roomNumber: room.number || room.id,
  events: room.status === 'occupied' ? [
    {
      id: `event_${room.id}`,
      title: 'Reserva',
      startDate: '2024-01-15T14:00:00Z',
      endDate: '2024-01-17T11:00:00Z',
      guestName: 'Huésped',
      status: 'checked-in' as const,
    }
  ] : []
}));

// Funciones auxiliares para simulación
export const simulateNetworkDelay = () => new Promise(resolve => setTimeout(resolve, 500));
export const simulateRandomError = () => Math.random() > 0.9;