export interface CheckInData {
  reservationId: string;
  guestName?: string;
  roomNumber: string;
  checkInDate: string;
  numberOfGuests: number;
  identificationNumber: string;
  paymentStatus: 'pending' | 'completed';
  isWalkIn?: boolean;
  guestEmail?: string;
  guestPhone?: string;
  guestNationality?: string;
}

export interface CheckInResponse {
  success: boolean;
  data?: CheckInData;
  error?: string;
}
