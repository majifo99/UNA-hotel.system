/**
 * Frontdesk Module Types - Central Export
 * 
 * All types specific to the frontdesk module.
 * For shared domain entities (Guest, Room), import from @/types/core
 */

// Core domain entities (shared)
export type { Guest, Room } from '../../../types/core';

// Check-in and Check-out types
export * from './checkin';
export * from './checkout';

// 🏨 Folio Management Types (Refactored)
export * from './folioTypes';

// Frontdesk-specific domain types
export type { 
  CheckInForm,
  CheckInData,
  FrontdeskRoom,
  FrontdeskRoomStatus,
  FrontdeskRoomType,
  FrontdeskPaymentMethod,
  RoomFilters,
  DashboardStats,
  CalendarView,
  CalendarEvent,
  QuickReservation,
  CheckOut,
  CreateRoom,
  UpdateRoom,
  FrontdeskReservation
} from './domain';

// For backward compatibility with existing Zod schemas
// Re-export core Room as the base for schemas
export type { Room as FrontdeskRoomBase } from '../../../types/core';
