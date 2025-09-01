/**
 * Core Types - Shared Domain Entities Only
 * 
 * This index exports only the truly shared domain entities.
 * Module-specific types should be imported from their respective modules.
 * 
 * Example imports:
 *   - Core domain: import { Guest, Room } from '@/types/core'
 *   - Reservations: import { Reservation, ReservationFormData } from '@/modules/reservations/types/domain'
 *   - Frontdesk: import { CheckInForm } from '@/modules/frontdesk/types/domain'
 */

// =================== CORE DOMAIN ENTITIES ===================
// These are shared across all modules
export type { Guest, Room, AdditionalService } from './domain';

// =================== SHARED UTILITY TYPES ===================
// Component props and UI helpers
export type {
  ModalProps,
  TableColumn,
  PaginationProps,
  ChangeHandler,
  SubmitHandler,
  ClickHandler
} from '../shared/utility';

// =================== GUEST-SPECIFIC TYPES ===================
// Only guest-related forms and validations (truly shared)
export type {
  CreateGuestData,
  UpdateGuestData,
  GuestValidationErrors,
  LoadingState,
  FormState
} from './forms';

// =================== API RESPONSE TYPES ===================
// Generic API structures
export type {
  ApiResponse,
  ApiError as ApiErrorType,
  GuestSearchFilters,
  GuestListResponse
} from './api';
