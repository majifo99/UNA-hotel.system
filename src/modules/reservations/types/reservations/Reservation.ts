import type { ReservationFormData } from './ReservationFormData';
import type { ReservationStatus } from './ReservationStatus';

export interface Reservation extends ReservationFormData {
  id: string;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
  confirmationNumber: string;
}
