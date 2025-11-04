/**
 * My Reservations Feature - Public API
 * 
 * Exporta todos los elementos públicos de la feature "Mis Reservas" para clientes web.
 * Facilita la importación desde otros módulos.
 * 
 * @module features/my-reservations
 */

// Pages
export { MyReservationsPage } from './pages/MyReservationsPage';

// Components
export { ReservationCard } from './components/ReservationCard';
export { ReservationList } from './components/ReservationList';
export { EmptyState } from './components/EmptyState';
export { LoadingState } from './components/LoadingState';

// Hooks
export {
  useMyReservations,
  useMyReservation,
  useCreateReservation,
  useUpdateReservation,
  useCancelReservation
} from './hooks/useMyReservations';

// Types (re-export from reservations module)
export type {
  CreateReservaWebDto,
  UpdateReservaWebDto,
  CancelReservaWebDto,
  ReservaWebFilters,
  ReservaWebResponse
} from '../../../reservations/types/web';
