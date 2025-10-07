export {
  // Query Keys
  frontdeskKeys,
  
  // Room Queries
  useRooms,
  useRoom,
  
  // Dashboard & Calendar
  useDashboardStats,
  
  // Mutations
  useUpdateRoomStatus,
  
  // Utilities
  useInvalidateFrontdesk,
} from './useFrontdesk';

// Calendar navigation
export { useCalendarNavigation } from './useCalendarNavigation';

// Check-in and Check-out
export { useCheckIn } from './useCheckIn';
export { useCheckout } from './useCheckout';
export { useCheckoutRefactored } from './useCheckoutRefactored';

// 🏨 Folio Management Hooks
export { useDeposito } from './useDeposito';
export { useDivisionCargos } from './useDivisionCargos';
export { useFacturacion } from './useFacturacion';
export { useFolioDistribucion } from './useFolioDistribucion';
