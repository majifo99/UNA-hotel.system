export {
  // Query Keys
  frontdeskKeys,
  
  // Room Queries
  useRooms,
  useRoom,
  
  // Dashboard & Calendar
  useDashboardStats,
  useRoomCalendar,
  
  // Mutations
  useUpdateRoomStatus,
  useUpdateRoom,
  useCreateQuickReservation,
  useCheckInMutation,
  useCheckOutMutation,
  
  // Utilities
  useInvalidateFrontdesk,
} from './useFrontdesk';

// Calendar navigation
export { useCalendarNavigation } from './useCalendarNavigation';
