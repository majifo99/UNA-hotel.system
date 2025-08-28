/**
 * @deprecated This file has been consolidated into src/types/core.ts
 * 
 * Use: import type { SimpleReservationFormData, Reservation } from '@/types/core'
 * 
 * This file provides backward compatibility but will be removed in future versions.
 */

// Re-export from core types for backward compatibility
export type {
  SimpleReservationFormData,
  ReservationValidationErrors,
  Reservation,
  ReservationStatus,
  PaymentMethod
} from '../../../types/core';
