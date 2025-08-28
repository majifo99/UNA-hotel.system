export type RoomStatus = 'available' | 'reserved' | 'checked-in' | 'checked-out' | 'maintenance';
export type RoomType = 'Deluxe' | 'Standard' | 'Suite';
export type PaymentMethod = 'cash' | 'card' | 'transfer';

export interface Room {
  id: string;
  roomNumber: string;
  type: RoomType;
  status: RoomStatus;
}

export interface Reservation {
  id: string;
  code: string;
  guestName: string;
  roomNumber: string;
  type: RoomType;
  checkIn: string;
  checkOut: string;
  status: 'reserved' | 'cancelled';
}

import type { Guest } from '../../../types/guest';

export interface CheckInForm {
  reservationId: string | null;
  guest: Omit<Guest, 'id'>;
  roomNumber: string;
  type: RoomType;
  adults: number;
  children: number;
  checkIn: string;
  checkInTime: string;
  checkOut: string;
  payment: PaymentMethod;
  cardLast4?: string;
  extras: {
    breakfast: boolean;
    parking: boolean;
    lateCheckout: boolean;
  };
  notes: string;
}
