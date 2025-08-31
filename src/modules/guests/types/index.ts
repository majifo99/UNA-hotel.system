/**
 * @deprecated Types have been consolidated into src/types/core/
 * 
 * Use: import type { Guest, CreateGuestData, UpdateGuestData, GuestSearchFilters, GuestListResponse } from '@/types/core'
 * 
 * This file provides backward compatibility but will be removed in future versions.
 */

// Re-export from core types for backward compatibility
export type { 
  Guest, 
  CreateGuestData, 
  UpdateGuestData, 
  GuestSearchFilters, 
  GuestListResponse 
} from '../../../types/core';
