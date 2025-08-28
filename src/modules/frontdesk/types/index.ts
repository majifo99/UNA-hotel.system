import { z } from 'zod';

/**
 * Esquemas de validación para Frontdesk usando Zod
 */

// Estados de habitación
export const RoomStatusSchema = z.enum([
  'available',
  'reserved', 
  'checked-in',
  'checked-out',
  'maintenance',
  'cleaning'
]);

// Tipos de habitación
export const RoomTypeSchema = z.enum([
  'Standard',
  'Deluxe', 
  'Suite',
  'Presidential'
]);

// Esquema de habitación
export const RoomSchema = z.object({
  id: z.string(),
  roomNumber: z.string().min(1, 'Número de habitación requerido'),
  type: RoomTypeSchema,
  floor: z.number().min(1).max(10),
  capacity: z.number().min(1).max(6),
  price: z.number().positive('El precio debe ser positivo'),
  status: RoomStatusSchema,
  guestName: z.string().nullable(),
  checkIn: z.string().nullable(), // ISO date string
  checkOut: z.string().nullable(), // ISO date string
  reservationId: z.string().nullable(),
  notes: z.string().optional(),
  lastCleaned: z.string().nullable(),
  amenities: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string()
});

// Esquema de reservación
export const ReservationSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  guestName: z.string().min(2, 'Nombre del huésped requerido'),
  guestEmail: z.string().email('Email válido requerido'),
  guestPhone: z.string().min(8, 'Teléfono válido requerido'),
  checkIn: z.string(), // ISO date string
  checkOut: z.string(), // ISO date string
  adults: z.number().min(1).max(6),
  children: z.number().min(0).max(4),
  totalAmount: z.number().positive(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
  specialRequests: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

// Esquema para crear/actualizar habitación
export const CreateRoomSchema = RoomSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const UpdateRoomSchema = RoomSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Esquema para crear reservación rápida
export const QuickReservationSchema = z.object({
  roomId: z.string(),
  guestName: z.string().min(2, 'Nombre requerido'),
  guestEmail: z.string().email('Email válido'),
  guestPhone: z.string().min(8, 'Teléfono válido'),
  checkIn: z.string(),
  checkOut: z.string(),
  adults: z.number().min(1).max(6).default(1),
  children: z.number().min(0).max(4).default(0),
  specialRequests: z.string().optional()
});

// Esquema para check-in
export const CheckInSchema = z.object({
  roomId: z.string(),
  guestName: z.string().min(2, 'Nombre requerido'),
  identificationNumber: z.string().min(5, 'Identificación requerida'),
  checkInTime: z.string().optional(), // Si no se proporciona, usar tiempo actual
  specialRequests: z.string().optional(),
  additionalGuests: z.number().min(0).max(5).default(0)
});

// Esquema para check-out
export const CheckOutSchema = z.object({
  roomId: z.string(),
  checkOutTime: z.string().optional(), // Si no se proporciona, usar tiempo actual
  condition: z.enum(['excellent', 'good', 'fair', 'poor']).default('good'),
  damages: z.string().optional(),
  additionalCharges: z.number().min(0).default(0),
  notes: z.string().optional()
});

// Filtros para búsqueda
export const RoomFiltersSchema = z.object({
  status: RoomStatusSchema.optional(),
  type: RoomTypeSchema.optional(),
  floor: z.number().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  guestName: z.string().optional(),
  roomNumber: z.string().optional()
});

// Tipos TypeScript derivados
export type RoomStatus = z.infer<typeof RoomStatusSchema>;
export type RoomType = z.infer<typeof RoomTypeSchema>;
export type Room = z.infer<typeof RoomSchema>;
export type Reservation = z.infer<typeof ReservationSchema>;
export type CreateRoom = z.infer<typeof CreateRoomSchema>;
export type UpdateRoom = z.infer<typeof UpdateRoomSchema>;
export type QuickReservation = z.infer<typeof QuickReservationSchema>;
export type CheckIn = z.infer<typeof CheckInSchema>;
export type CheckOut = z.infer<typeof CheckOutSchema>;
export type RoomFilters = z.infer<typeof RoomFiltersSchema>;

// Constantes para UI
export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  available: 'Disponible',
  reserved: 'Reservada',
  'checked-in': 'Ocupada',
  'checked-out': 'Check-out',
  maintenance: 'Mantenimiento',
  cleaning: 'Limpieza'
};

export const ROOM_STATUS_COLORS: Record<RoomStatus, string> = {
  available: 'bg-green-100 text-green-800 border-green-200',
  reserved: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'checked-in': 'bg-blue-100 text-blue-800 border-blue-200',
  'checked-out': 'bg-gray-100 text-gray-800 border-gray-200',
  maintenance: 'bg-red-100 text-red-800 border-red-200',
  cleaning: 'bg-purple-100 text-purple-800 border-purple-200'
};

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  Standard: 'Estándar',
  Deluxe: 'Deluxe',
  Suite: 'Suite',
  Presidential: 'Presidencial'
};

// Re-exportación de tipos
export type { Guest } from '../../../types/guest';
export type { CheckInData, CheckInResponse } from './checkin';
export type { CheckInForm } from './frontdesk';

// =================== TIPOS ADICIONALES ===================

// Estadísticas del dashboard
export interface DashboardStats {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  reservedRooms: number;
  maintenanceRooms: number;
  cleaningRooms: number;
  checkedOutRooms: number;
  occupancyRate: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  revenue: {
    today: number;
    month: number;
    year: number;
  };
  averageStay: number;
  guestsCount: number;
}

// Vista de calendario
export interface CalendarEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  guestName: string;
  status: RoomStatus;
  color: string;
}

export interface CalendarRoom {
  roomId: string;
  roomNumber: string;
  roomType: RoomType;
  events: CalendarEvent[];
}

export interface CalendarView {
  startDate: string;
  endDate: string;
  rooms: CalendarRoom[];
}
