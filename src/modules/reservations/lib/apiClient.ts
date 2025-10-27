import axios from 'axios';

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Debug baseURL once at startup
console.debug('[API INIT] baseURL =', apiClient.defaults.baseURL);

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add admin auth token if available (reservations module is admin-only)
    const token = localStorage.getItem('adminAuthToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.debug('[API REQUEST] Admin token attached:', token.substring(0, 20) + '...');
    } else {
      console.debug('[API REQUEST] No admin token found');
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
    return Promise.reject(error);
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
      // Handle unauthorized - clear admin auth and redirect to admin login
      localStorage.removeItem('adminAuthToken');
      localStorage.removeItem('adminAuthUser');
      
      console.debug('[API] 401 Unauthorized - redirecting to /admin/login');
      
      // Redirect to admin login
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
