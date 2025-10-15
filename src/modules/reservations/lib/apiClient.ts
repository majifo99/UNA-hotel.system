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
    console.debug('[API REQUEST]', (config.method || 'GET').toUpperCase(), `${config.baseURL || ''}${config.url || ''}`);
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
      // Handle unauthorized - clear auth and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      
      // Redirigir a login en modo admin
      const isAdminMode = import.meta.env.VITE_MODE === 'admin';
      if (isAdminMode) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
