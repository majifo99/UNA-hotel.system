import type { Guest } from './guest';

export interface CheckInData {
  reservationId: string;
  guest: Guest;
  roomNumber: string;
  checkInDate: string;
  numberOfGuests: number;
  paymentStatus: 'pending' | 'completed';
}

export interface CheckInResponse {
  success: boolean;
  data?: CheckInData;
  error?: string;
}
