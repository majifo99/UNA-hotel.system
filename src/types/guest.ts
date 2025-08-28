/**
 * @deprecated This file has been consolidated into src/types/core.ts
 * 
 * Use: import type { Guest, CreateGuestData, UpdateGuestData } from '@/types/core'
 * 
 * This file provides backward compatibility but will be removed in future versions.
 */

// Re-export from core types for backward compatibility
export type {
  Guest,
  CreateGuestData,
  UpdateGuestData,
  GuestSearchFilters,
  GuestListResponse,
  GuestValidationErrors
} from './core';
