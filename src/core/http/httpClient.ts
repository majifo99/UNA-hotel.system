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
  timeout: 60000, // 60 seconds
  timeoutErrorMessage: 'La solicitud tardó demasiado tiempo. Por favor, intente nuevamente.',
};

/**
 * Create axios instance with base configuration
 */
function createAxiosInstance(config: ClientConfig = DEFAULT_CONFIG) {
  return axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: config.timeout,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
    withXSRFToken: true,
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
 * Get CSRF token from meta tag or cookie
 */
function getCsrfToken(): string | null {
  const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (metaToken) return metaToken;
  
  const cookieToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];
  
  return cookieToken ? decodeURIComponent(cookieToken) : null;
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
  // Handle cancelled requests
  if (axios.isCancel(error)) {
    return {
      code: 'CANCELLED',
      status: 0,
      message: 'Request was cancelled',
      originalError: error,
    };
  }
  
  // Handle non-Axios errors
  if (!error.isAxiosError && !error.response && !error.request) {
    return {
      code: 'UNKNOWN_ERROR',
      status: 0,
      message: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
  
  // Server responded with error status
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || error.message || 'Error del servidor';
    
    return {
      code: `HTTP_${status}`,
      status,
      message,
      originalError: error,
    };
  }
  
  // No response received (network error, timeout)
  if (error.request) {
    return {
      code: error.code || 'NETWORK_ERROR',
      status: 0,
      message: error.message || 'Error de red. Verifique su conexión.',
      originalError: error,
    };
  }
  
  // Error setting up request
  return {
    code: 'REQUEST_ERROR',
    status: 0,
    message: error.message || 'Error al configurar la solicitud',
    originalError: error,
  };
}

/**
 * Setup interceptors for an axios instance
 */
function setupInterceptors(
  instance: ReturnType<typeof createAxiosInstance>,
  logPrefix: string
) {
  // Request interceptor - Add auth and CSRF tokens
  instance.interceptors.request.use(
    (config) => {
      // Add Bearer token
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Add CSRF token
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        config.headers['X-XSRF-TOKEN'] = csrfToken;
      }
      
      // Log only non-report requests to reduce noise
      const isReport = config.url?.includes('/reportes/');
      if (!isReport) {
        console.log(`[${logPrefix}] ${config.method?.toUpperCase()} ${config.url}`);
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
