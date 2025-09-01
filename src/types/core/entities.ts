/**
 * @deprecated - This file is being refactored for better modular separation
 * 
 * Core domain entities have been moved to ./domain.ts
 * Module-specific entities should be moved to their respective modules
 * 
 * Use:
 * - import { Guest, Room, AdditionalService } from './domain'
 * - Move Reservation to modules/reservations/types/
 */

// Re-export domain entities for backward compatibility
export type { Guest, Room, AdditionalService } from './domain';