export interface CheckInData {
  reservationId: string;
  guestName?: string;
  roomNumber: string;
  checkInDate: string;
  numberOfGuests: number;
  identificationNumber: string;
  paymentStatus: 'pending' | 'completed';
}

export interface CheckInResponse {
  success: boolean;
  data?: CheckInData;
  error?: string;
}
