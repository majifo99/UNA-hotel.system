/**
 * HTTP Client - Cliente único y tipado para toda la aplicación
 * 
 * Singleton de Axios con:
 * - Autenticación automática (Bearer token)
 * - Manejo CSRF para Laravel Sanctum
 * - Interceptores de errores normalizados
 * - Soporte para timeouts extendidos (reportes)
 * - Helpers tipados para GET/POST/PUT/DELETE
 */

import axios, { type AxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';
import { getApiBaseUrl } from '../../config/api';

/**
 * HTTP Error Response Structure
 */
export interface HttpError {
  code: string;
  status: number;
  message: string;
  originalError?: AxiosError;
}

/**
 * Client Configuration
 */
interface ClientConfig {
  timeout?: number;
  timeoutErrorMessage?: string;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: ClientConfig = {
  timeout: 30000, // 30 seconds - increased for heavy operations like reservations
  timeoutErrorMessage: 'La solicitud tardó demasiado tiempo. Por favor, intente nuevamente.',
};

/**
 * Create axios instance with base configuration
 */
function createAxiosInstance(config: ClientConfig = DEFAULT_CONFIG) {
  return axios.create({
    baseURL: getApiBaseUrl(),
    timeout: config.timeout,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    // ✅ HABILITAR PARA CORS CON CREDENCIALES
    withCredentials: true, // ← AGREGAR ESTA LÍNEA
    
    // Note: withXSRFToken disabled - Laravel handles CSRF via Sanctum tokens
    // Enable only when using session-based authentication
  });
}

/**
 * Main HTTP client (standard timeout)
 */
const httpClient = createAxiosInstance();

/**
 * Extended HTTP client (long timeout for reports/exports)
 */
const httpClientExtended = createAxiosInstance({
  timeout: 600000, // 10 minutes for heavy operations
  timeoutErrorMessage: 'El reporte tardó demasiado. Intente con un rango de fechas más pequeño.',
});

/**
 * Get authentication token from localStorage
 * Priority: adminAuthToken > authToken (web)
 */
function getAuthToken(): string | null {
  return localStorage.getItem('adminAuthToken') || localStorage.getItem('authToken');
}

/**
 * Handle 401 Unauthorized - Clear tokens and redirect
 */
function handleUnauthorized(): void {
  const hasAdminToken = localStorage.getItem('adminAuthToken');
  const hasWebToken = localStorage.getItem('authToken');
  
  if (hasAdminToken) {
    localStorage.removeItem('adminAuthToken');
    localStorage.removeItem('adminAuthUser');
    globalThis.location.href = '/admin/login';
  } else if (hasWebToken) {
    localStorage.removeItem('authToken');
    globalThis.location.href = '/login';
  }
}

/**
 * Normalize error to HttpError structure
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeError(error: any): HttpError {
  // Handle cancelled requests - early return to avoid type narrowing
  if (axios.isCancel(error)) {
    return {
      code: 'CANCELLED',
      status: 0,
      message: 'Request was cancelled',
      originalError: error as AxiosError,
    };
  }
  
  // Create a copy to avoid type narrowing issues
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const err = error as Record<string, any>;
  
  // Handle non-Axios errors
  if (!err.isAxiosError && !err.response && !err.request) {
    return {
      code: 'UNKNOWN_ERROR',
      status: 0,
      message: err instanceof Error ? err.message : 'Error desconocido',
    };
  }
  
  // Server responded with error status
  if (err.response) {
    const status = err.response.status;
    const message = err.response.data?.message || err.message || 'Error del servidor';
    
    return {
      code: `HTTP_${status}`,
      status,
      message,
      originalError: error as AxiosError,
    };
  }
  
  // No response received (network error, timeout)
  if (err.request) {
    return {
      code: err.code || 'NETWORK_ERROR',
      status: 0,
      message: err.message || 'Error de red. Verifique su conexión.',
      originalError: error as AxiosError,
    };
  }
  
  // Error setting up request
  return {
    code: 'REQUEST_ERROR',
    status: 0,
    message: err.message || 'Error al configurar la solicitud',
    originalError: error as AxiosError,
  };
}

/**
 * Setup interceptors for an axios instance
 */
function setupInterceptors(
  instance: ReturnType<typeof createAxiosInstance>,
  logPrefix: string
) {
  // Request interceptor - Add auth token (CSRF disabled to match legacy config)
  instance.interceptors.request.use(
    (config) => {
      // Add Bearer token
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Note: CSRF token handling disabled to match legacy config
      // Enable when backend is properly configured for CSRF with credentials
      
      // Log only non-report requests to reduce noise
      const isReport = config.url?.includes('/reportes/');
      if (!isReport) {
        console.log(`[${logPrefix}] ${config.method?.toUpperCase()} ${config.url}`);
        console.log(`[${logPrefix}] Full URL: ${config.baseURL}${config.url}`);
        console.log(`[${logPrefix}] Headers:`, config.headers);
        console.log(`[${logPrefix}] withCredentials:`, config.withCredentials);
      }
      
      return config;
    },
    (error) => {
      console.error(`[${logPrefix}] Request Error:`, error);
      return Promise.reject(error);
    }
  );
  
  // Response interceptor - Handle errors
  instance.interceptors.response.use(
    (response) => {
      // Silent success for reports
      const isReport = response.config.url?.includes('/reportes/');
      if (!isReport) {
        console.log(`[${logPrefix}] ✅ ${response.status}: ${response.config.url}`);
      }
      return response;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (error: any) => {
      // Don't log cancelled requests
      if (axios.isCancel(error)) {
        return Promise.reject(error);
      }
      
      const httpError = normalizeError(error);
      
      // Log error
      console.error(`[${logPrefix}] ❌ ${httpError.code}:`, httpError.message);
      
      // Handle auth errors
      if (httpError.status === 401) {
        handleUnauthorized();
      }
      
      return Promise.reject(httpError);
    }
  );
}

// Setup interceptors
setupInterceptors(httpClient, 'HTTP');
setupInterceptors(httpClientExtended, 'HTTP Extended');

/**
 * Typed HTTP helpers
 */
export const http = {
  /**
   * GET request
   */
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return httpClient.get<T>(url, config);
  },
  
  /**
   * POST request
   */
  post<T = unknown, B = unknown>(
    url: string, 
    body?: B, 
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return httpClient.post<T>(url, body, config);
  },
  
  /**
   * PUT request
   */
  put<T = unknown, B = unknown>(
    url: string, 
    body?: B, 
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return httpClient.put<T>(url, body, config);
  },
  
  /**
   * DELETE request
   */
  del<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return httpClient.delete<T>(url, config);
  },
  
  /**
   * PATCH request
   */
  patch<T = unknown, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return httpClient.patch<T>(url, body, config);
  },
};

/**
 * Extended HTTP helpers (for long-running operations)
 */
export const httpExtended = {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return httpClientExtended.get<T>(url, config);
  },
  
  post<T = unknown, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return httpClientExtended.post<T>(url, body, config);
  },
};

/**
 * Export raw clients for advanced usage
 */
export { httpClient, httpClientExtended };

/**
 * Default export (standard client)
 */
export default httpClient;
