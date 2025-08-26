import { z } from 'zod';

export const checkInSchema = z.object({
  reservationId: z.string().min(1, 'Reservation ID is required'),
  guestName: z.string().min(2, 'Guest name must be at least 2 characters'),
  roomNumber: z.string().min(1, 'Room number is required'),
  checkInDate: z.string().min(1, 'Check-in date is required'),
  numberOfGuests: z.number().min(1, 'At least one guest is required'),
  identificationNumber: z.string().min(1, 'Identification number is required'),
  paymentStatus: z.enum(['pending', 'completed'])
});
