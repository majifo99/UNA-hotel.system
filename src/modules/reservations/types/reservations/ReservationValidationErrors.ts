export interface ReservationValidationErrors {
  guestId?: string;
  guest?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    documentNumber?: string;
  };
  checkInDate?: string;
  checkOutDate?: string;
  numberOfGuests?: string;
  roomType?: string;
  general?: string;
}
