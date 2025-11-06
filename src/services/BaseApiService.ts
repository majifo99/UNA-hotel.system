/**
 * Base API Service - UNA Hotel System
 * 
 * Standardized API service layer that provides:
 * - Consistent error handling
 * - Request/response interceptors
 * - Timeout management
 * - Authentication handling
 * - Mock/development mode support
 */

import type { ApiResponse, LoadingState } from '../types/core';

// =================== CONFIGURATION ===================

interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
  enableMocking: boolean;
  mockDelay: number;
}

const defaultConfig: ApiConfig = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  enableMocking: import.meta.env.DEV, // Enable mocking in development
  mockDelay: 800, // Realistic API delay for development
};

// =================== ERROR HANDLING ===================

export class ApiError extends Error {
  public status?: number;
  public code?: string;
  public details?: any;

  constructor(
    message: string,
    status?: number,
    code?: string,
    details?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static fromResponse(response: Response, data?: any): ApiError {
    const message = data?.message || `HTTP ${response.status}: ${response.statusText}`;
    return new ApiError(message, response.status, data?.code, data);
  }

  static networkError(): ApiError {
    return new ApiError(
      'Network error - please check your connection and try again',
      0,
      'NETWORK_ERROR'
    );
  }

  static timeout(): ApiError {
    return new ApiError(
      'Request timeout - please try again',
      408,
      'TIMEOUT'
    );
  }
}

// =================== BASE SERVICE CLASS ===================

export abstract class BaseApiService {
  protected config: ApiConfig;

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Generic API request method with standardized error handling
   */
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseURL}${endpoint}`;
    
    const requestConfig: RequestInit = {
      headers: {
        ...this.config.headers,
        ...options.headers,
      },
      ...options,
    };

    // Add authentication token if available
    const token = this.getAuthToken();
    if (token) {
      requestConfig.headers = {
        ...requestConfig.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        ...requestConfig,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response
      const data = await this.parseResponse<T>(response);
      
      if (!response.ok) {
        throw ApiError.fromResponse(response, data);
      }

      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw ApiError.timeout();
        }
        throw ApiError.networkError();
      }

      throw new ApiError('An unexpected error occurred');
    }
  }

  /**
   * GET request
   */
  protected async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    return this.request<T>(url, { method: 'GET' });
  }

  /**
   * POST request
   */
  protected async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  protected async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  protected async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  protected async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Parse response based on content type
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      return response.json();
    }
    
    if (contentType?.includes('text/')) {
      return response.text() as unknown as T;
    }
    
    return response.blob() as unknown as T;
  }

  /**
   * Get authentication token from storage
   */
  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  /**
   * Mock simulation for development
   */
  protected async mockRequest<T>(data: T, delay?: number): Promise<ApiResponse<T>> {
    if (!this.config.enableMocking) {
      throw new Error('Mocking is disabled');
    }

    // Simulate network delay
    await new Promise(resolve => 
      setTimeout(resolve, delay || this.config.mockDelay)
    );

    // Simulate occasional errors (5% chance)
    if (Math.random() < 0.05) {
      throw new ApiError('Simulated API error', 500, 'MOCK_ERROR');
    }

    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }
}

// =================== UTILITY FUNCTIONS ===================

/**
 * Create loading state for async operations
 */
export function createLoadingState(): LoadingState {
  return {
    isLoading: false,
    error: undefined,
  };
}

/**
 * Update loading state
 */
export function updateLoadingState(
  state: LoadingState,
  updates: Partial<LoadingState>
): LoadingState {
  return { ...state, ...updates };
}

/**
 * Handle async operation with loading state
 */
export async function withLoading<T>(
  operation: () => Promise<T>,
  setState: (state: LoadingState) => void
): Promise<T | null> {
  setState({ isLoading: true, error: undefined });
  
  try {
    const result = await operation();
    setState({ isLoading: false, error: undefined });
    return result;
  } catch (error) {
    const errorMessage = error instanceof ApiError 
      ? error.message 
      : 'An unexpected error occurred';
    
    setState({ isLoading: false, error: errorMessage });
    return null;
  }
}

// =================== EXPORTS ===================

export default BaseApiService;
