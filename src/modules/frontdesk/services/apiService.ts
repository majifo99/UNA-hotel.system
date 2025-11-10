/**
 * API Service for Front Desk Operations
 * 
 * This service handles all API calls for front desk operations including
 * reservation search, check-in processing, and guest management.
 * 
 * In a real application, this would replace the mock services and make
 * actual HTTP requests to your backend API.
 */

import { getApiBaseUrl } from '../../../config/api';

// Tipos básicos para el servicio (sin dependencias externas)
interface ReservationSearchResult {
  id: string;
  confirmationNumber: string;
  guestName: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  status: string;
}

// API Configuration
const API_BASE_URL = getApiBaseUrl();
const API_TIMEOUT = 10000; // 10 seconds

/**
 * Generic API request function with error handling
 */
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add admin authentication token if available (frontdesk is admin-only)
  const token = localStorage.getItem('adminAuthToken');
  
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch(url, {
      ...config,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || 
        `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please try again');
      }
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

/**
 * Search for a reservation by confirmation number
 * 
 * API Endpoint: GET /reservations/search?confirmationNumber={confirmationNumber}
 */
export async function searchReservationByConfirmation(
  confirmationNumber: string
): Promise<ReservationSearchResult | null> {
  try {
    const reservation = await apiRequest<ReservationSearchResult>(
      `/reservations/search?confirmationNumber=${encodeURIComponent(confirmationNumber)}`
    );
    return reservation;
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      return null; // Reservation not found
    }
    throw error; // Re-throw other errors (network, server, etc.)
  }
}

/**
 * Search for a reservation by guest information
 * 
 * API Endpoint: GET /reservations/search?lastName={lastName}&documentNumber={documentNumber}
 */
export async function searchReservationByGuest(
  lastName: string,
  documentNumber: string
): Promise<ReservationSearchResult | null> {
  try {
    const params = new URLSearchParams({
      lastName: lastName.trim(),
      documentNumber: documentNumber.trim(),
    });
    
    const reservation = await apiRequest<ReservationSearchResult>(
      `/reservations/search?${params.toString()}`
    );
    return reservation;
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      return null; // Reservation not found
    }
    throw error; // Re-throw other errors (network, server, etc.)
  }
}

/**
 * Process a check-in
 * 
 * API Endpoint: POST /check-ins
 */
export async function processCheckIn(checkInData: {
  reservationId: string;
  roomNumber: string;
  checkInDate: string;
  numberOfGuests: number;
  identificationNumber: string;
  paymentStatus: 'pending' | 'completed';
}): Promise<{ success: boolean; checkInId: string }> {
  return await apiRequest<{ success: boolean; checkInId: string }>(
    '/check-ins',
    {
      method: 'POST',
      body: JSON.stringify(checkInData),
    }
  );
}

/**
 * Get recent check-ins
 * 
 * API Endpoint: GET /check-ins/recent
 */
export async function getRecentCheckIns(): Promise<Array<{
  reservationId: string;
  guestName: string;
  roomNumber: string;
  paymentStatus: string;
  checkInTime: string;
}>> {
  return await apiRequest<Array<{
    reservationId: string;
    guestName: string;
    roomNumber: string;
    paymentStatus: string;
    checkInTime: string;
  }>>('/check-ins/recent');
}

/**
 * Health check for API connectivity
 * 
 * API Endpoint: GET /health
 */
export async function checkApiHealth(): Promise<{ status: string; timestamp: string }> {
  return await apiRequest<{ status: string; timestamp: string }>('/health');
}
