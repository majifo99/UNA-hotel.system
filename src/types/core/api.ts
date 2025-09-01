/**
 * API Response Types - UNA Hotel System
 * 
 * Standard API response formats and data transfer objects
 * used for communication with backend services.
 */

import type { Guest } from './entities';

// =================== STANDARD API RESPONSES ===================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// =================== GUEST API RESPONSES ===================

/**
 * Guest search filters
 */
export interface GuestSearchFilters {
  query?: string;
  nationality?: string;
  documentType?: 'passport' | 'license' | 'id_card';
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Guest list response
 */
export interface GuestListResponse extends PaginatedResponse<Guest> {
  guests: Guest[];  // Additional field for backward compatibility
  total: number;    // Additional field for backward compatibility
  page: number;     // Additional field for backward compatibility
  limit: number;    // Additional field for backward compatibility
}

// =================== RESERVATION API RESPONSES ===================

/**
 * Reservation search filters
 */
export interface ReservationFilters {
  status?: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show';
  guestId?: string;
  roomId?: string;
  checkInDate?: string;
  checkOutDate?: string;
}

// =================== ERROR RESPONSES ===================

/**
 * API Error details
 */
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}
