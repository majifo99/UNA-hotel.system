
import axios from 'axios';

/**
 * Cliente API configurado para UNA Hotel System
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000, // Default timeout: 10s
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable credentials for Sanctum
  withXSRFToken: true, // Enable CSRF token handling
});

/**
 * Extended API client for heavy operations (reports, exports)
 * Uses longer timeout to prevent failures on large date ranges
 */
export const apiClientExtended = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 60000, // Extended timeout: 60s for reports
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  withXSRFToken: true,
});

// Interceptor para requests - Default client
apiClient.interceptors.request.use(
  (config) => {
    // Agregar token de autenticación si existe
    // Prioridad: adminAuthToken > authToken (web)
    const adminToken = localStorage.getItem('adminAuthToken');
    const webToken = localStorage.getItem('authToken');
    const token = adminToken || webToken;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Get CSRF token from meta tag or cookie for Sanctum
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') 
      || document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1];
    
    if (csrfToken) {
      config.headers['X-XSRF-TOKEN'] = decodeURIComponent(csrfToken);
    }
    
    // Log only for non-reports endpoints to reduce noise
    const isReportsEndpoint = config.url?.includes('/reportes/');
    if (!isReportsEndpoint) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    } else {
      // For reports, log only once with [Auth] status
      const authStatus = token ? 'attached' : 'missing';
      console.log(`[Auth] Token ${authStatus} for reports request`);
    }
    
    return config;
  },
  (error) => {
    console.error('[API] Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para requests - Extended client (reports)
apiClientExtended.interceptors.request.use(
  (config) => {
    // Same auth logic as default client
    const adminToken = localStorage.getItem('adminAuthToken');
    const webToken = localStorage.getItem('authToken');
    const token = adminToken || webToken;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Get CSRF token
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') 
      || document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1];
    
    if (csrfToken) {
      config.headers['X-XSRF-TOKEN'] = decodeURIComponent(csrfToken);
    }
    
    // Log auth status for reports
    const authStatus = token ? 'attached' : 'missing';
    console.log(`[Auth] Token ${authStatus} for extended request (60s timeout)`);
    
    return config;
  },
  (error) => {
    console.error('[API Extended] Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses - Default client
apiClient.interceptors.response.use(
  (response) => {
    // Log only for non-reports endpoints to reduce noise
    const isReportsEndpoint = response.config.url?.includes('/reportes/');
    if (isReportsEndpoint) {
      // Silent for reports
    } else {
      console.log(`[API] Response ${response.status}: ${response.config.url}`);
    }
    
    return response;
  },
  (error) => {
    // Don't log canceled requests (they're normal when user changes filters quickly)
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }
    
    if (error.response) {
      // El servidor respondió con un código de estado que no está en el rango 2xx
      console.error(`[API] Error ${error.response.status}: ${error.response.data?.message || error.message}`);
      
      // Manejar errores de autenticación
      if (error.response.status === 401) {
        // Limpiar tokens según el tipo de sesión
        const hasAdminToken = localStorage.getItem('adminAuthToken');
        const hasWebToken = localStorage.getItem('authToken');
        
        if (hasAdminToken) {
          // Sesión de admin
          localStorage.removeItem('adminAuthToken');
          localStorage.removeItem('adminAuthUser');
          globalThis.location.href = '/admin/login';
        } else if (hasWebToken) {
          // Sesión de web
          localStorage.removeItem('authToken');
          globalThis.location.href = '/login';
        }
      }
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      console.error('[API] Network Error:', error.message);
    } else {
      // Algo pasó al configurar la petición
      console.error('[API] Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Interceptor para responses - Extended client
apiClientExtended.interceptors.response.use(
  (response) => {
    // Minimal logging for extended requests
    console.log(`[API Extended] ✅ Response ${response.status} (${response.config.url?.substring(0, 50)}...)`);
    return response;
  },
  (error) => {
    // Don't log canceled requests
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }
    
    if (error.response) {
      console.error(`[API Extended] ❌ Error ${error.response.status}: ${error.response.data?.message || error.message}`);
      
      // Same auth handling as default client
      if (error.response.status === 401) {
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
    } else if (error.request) {
      console.error('[API Extended] Timeout or no response:', error.message);
    } else {
      console.error('[API Extended] Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
