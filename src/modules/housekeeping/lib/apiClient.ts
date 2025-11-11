import axios from 'axios';

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: (() => {
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    if (import.meta.env.DEV) {
      // In development, fallback to '/api' for Vite proxy
      return '/api';
    }
    // In production, fail fast if VITE_API_URL is not set
    throw new Error('VITE_API_URL environment variable must be set in production.');
  })(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Explicitly disable credentials to prevent CORS issues
  withCredentials: false,
});

// Debug baseURL once at startup
console.debug('[Housekeeping API INIT] baseURL =', apiClient.defaults.baseURL);

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
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
      console.debug(`[Housekeeping API REQUEST] ${tokenSource} token attached:`, token.substring(0, 20) + '...');
    } else {
      console.debug('[Housekeeping API REQUEST] No auth token found (neither admin nor web)');
    }

    console.debug('[Housekeeping API REQUEST]', (config.method || 'GET').toUpperCase(), `${config.baseURL || ''}${config.url || ''}`);

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
        console.debug('[Housekeeping API] 401 Unauthorized - redirecting to /admin/login');
        globalThis.location.href = '/admin/login';
      } else {
        // Clear web auth
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        console.debug('[Housekeeping API] 401 Unauthorized - redirecting to /login');
        globalThis.location.href = '/login';
      }
    }
    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
);

export default apiClient;
