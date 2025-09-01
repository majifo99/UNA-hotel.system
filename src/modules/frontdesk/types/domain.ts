/**
 * Frontdesk Domain Types - Specific to Frontdesk Module
 * 
 * These types represent the frontdesk workflow and business logic
 * that are specific to the frontdesk module (check-in, check-out, room management).
 */

import type { Guest, Room } from '../../../types/core/domain';

// =================== FRONTDESK-SPECIFIC ENUMS ===================

/**
 * Room status for frontdesk operations
 */
export type FrontdeskRoomStatus = 
  | 'available' 
  | 'reserved' 
  | 'checked-in' 
  | 'checked-out' 
  | 'maintenance';

/**
 * Room types as used in frontdesk operations
 */
export type FrontdeskRoomType = 'Deluxe' | 'Standard' | 'Suite';

/**
 * Payment methods for frontdesk transactions
 */
export type FrontdeskPaymentMethod = 'cash' | 'card' | 'transfer';

// =================== FRONTDESK ENTITIES ===================

/**
 * Check-in form data - specific to frontdesk check-in process
 */
export interface CheckInForm {
  reservationId: string | null;
  guest: Omit<Guest, 'id'>;
  roomNumber: string;
  type: FrontdeskRoomType;
  adults: number;
  children: number;
  checkIn: string;
  checkInTime: string;
  checkOut: string;
  payment: FrontdeskPaymentMethod;
  cardLast4?: string;
  extras: {
    breakfast: boolean;
    parking: boolean;
    lateCheckout: boolean;
  };
  notes: string;
}

/**
 * Check-in data for processing
 */
export interface CheckInData {
  reservationId?: string;
  guestId?: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  paymentMethod: FrontdeskPaymentMethod;
  specialRequests?: string;
  notes?: string;
}

/**
 * Frontdesk room information
 */
export interface FrontdeskRoom extends Omit<Room, 'status' | 'type'> {
  // Override status with frontdesk-specific values
  status: FrontdeskRoomStatus;
  
  // Override type with frontdesk-specific values
  type: FrontdeskRoomType;
  
  // Frontdesk-specific fields
  roomNumber?: string;
  guestName?: string;
  checkIn?: string;
  checkOut?: string;
  reservationId?: string;
  
  // Additional frontdesk info
  currentGuest?: {
    name: string;
    checkIn: string;
    checkOut: string;
  };
  lastCleaned?: string;
  maintenanceNotes?: string;
}

// =================== FRONTDESK WORKFLOW TYPES ===================

/**
 * Room filters for frontdesk search
 */
export interface RoomFilters {
  status?: FrontdeskRoomStatus;
  type?: FrontdeskRoomType;
  floor?: number;
  guestName?: string;
  roomNumber?: string;
}

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  maintenanceRooms: number;
  reservedRooms: number;
  checkInsToday: number;
  checkOutsToday: number;
  occupancyRate: number;
}

/**
 * Calendar view configuration
 */
export interface CalendarView {
  roomNumber: string;
  events: CalendarEvent[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  guestName: string;
  status: FrontdeskRoomStatus;
}

/**
 * Quick reservation form
 */
export interface QuickReservation {
  roomId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  specialRequests?: string;
}

/**
 * Check-out data
 */
export interface CheckOut {
  reservationId: string;
  roomId: string;
  checkOutDate: string;
  finalCharges?: number;
  notes?: string;
  satisfactionRating?: number;
}

/**
 * Room creation/update types
 */
export interface CreateRoom {
  roomNumber: string;
  type: FrontdeskRoomType;
  capacity: number;
  pricePerNight: number;
  amenities: string[];
  floor?: number;
  description?: string;
}

export interface UpdateRoom extends Partial<CreateRoom> {
  id: string;
  status?: FrontdeskRoomStatus;
  maintenanceNotes?: string;
}

/**
 * Frontdesk-specific reservation type
 */
export interface FrontdeskReservation {
  id: string;
  roomId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentMethod?: FrontdeskPaymentMethod;
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
}
