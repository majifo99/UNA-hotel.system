import axios from 'axios';
import { getApiBaseUrl } from '../../../config/api';

// ========================================
// 🧪 TEST MODE: Desactivar autenticación
// ========================================
// IMPORTANTE: Cambiar a `true` para probar sin token
// RECORDAR: Volver a `false` después de las pruebas
const DISABLE_AUTH_FOR_TESTING = false;
// ========================================

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Explicitly disable credentials to prevent CORS issues
  withCredentials: false,
});

// Debug baseURL once at startup
console.debug('[API INIT] baseURL =', apiClient.defaults.baseURL);

if (DISABLE_AUTH_FOR_TESTING) {
  console.warn('⚠️ [API INIT] AUTH DISABLED FOR TESTING - No se enviará Bearer token');
}

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // 🧪 TEST MODE: Skip authentication if disabled
    if (DISABLE_AUTH_FOR_TESTING) {
      console.warn('⚠️ [API REQUEST] Auth disabled for testing - No Bearer token sent');
      console.debug('[API REQUEST]', (config.method || 'GET').toUpperCase(), `${config.baseURL || ''}${config.url || ''}`);
      return config;
    }

    // Try to get admin token first (for admin module)
    let token = localStorage.getItem('adminAuthToken');
    let tokenSource = 'admin';
    
    // If no admin token, try web auth token (for public web reservations)
    if (!token) {
      token = localStorage.getItem('authToken');
      tokenSource = 'web';
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.debug(`[API REQUEST] ${tokenSource} token attached:`, token.substring(0, 20) + '...');
    } else {
      console.debug('[API REQUEST] No auth token found (neither admin nor web)');
    }
    
    console.debug('[API REQUEST]', (config.method || 'GET').toUpperCase(), `${config.baseURL || ''}${config.url || ''}`);
    
    // Debug: Log request details for POST requests
    if (config.method?.toUpperCase() === 'POST' && config.data) {
      console.debug('[AXIOS INTERCEPTOR] POST request data:', {
        url: `${config.baseURL || ''}${config.url || ''}`,
        headers: config.headers,
        dataType: typeof config.data,
        dataContent: config.data,
        dataStringified: JSON.stringify(config.data)
      });
      
      // Check if data has id_cliente
      if (config.data && typeof config.data === 'object' && 'id_cliente' in config.data) {
        console.debug('[AXIOS INTERCEPTOR] id_cliente detected:', {
          value: config.data.id_cliente,
          type: typeof config.data.id_cliente,
          isNull: config.data.id_cliente === null,
          isUndefined: config.data.id_cliente === undefined,
          isNaN: Number.isNaN(config.data.id_cliente)
        });
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Determine context based on current path or available tokens
      const isAdminContext = globalThis.location.pathname.startsWith('/admin') || localStorage.getItem('adminAuthToken');
      
      if (isAdminContext) {
        // Clear admin auth
        localStorage.removeItem('adminAuthToken');
        localStorage.removeItem('adminAuthUser');
        console.debug('[API] 401 Unauthorized - redirecting to /admin/login');
        globalThis.location.href = '/admin/login';
      } else {
        // Clear web auth
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        console.debug('[API] 401 Unauthorized - redirecting to /login');
        globalThis.location.href = '/login';
      }
    }
    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
);

export default apiClient;
