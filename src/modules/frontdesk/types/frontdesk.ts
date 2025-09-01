/**
 * @deprecated Types have been consolidated into src/types/core/
 * 
 * Use: import type { Room, Guest } from '@/types/core'
 * 
 * This file provides backward compatibility but will be removed in future versions.
 */

// Re-export from core types for backward compatibility
export type {
  Room,
  Guest
} from '../../../types/core';
