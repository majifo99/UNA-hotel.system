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
// eslint-disable-next-line no-console
console.debug('[API INIT] baseURL =', apiClient.defaults.baseURL);

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // eslint-disable-next-line no-console
    const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
    console.debug('[API REQUEST]', (config.method || 'GET').toUpperCase(), fullUrl);
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
      // Handle unauthorized
      localStorage.removeItem('authToken');
      // Solo redirigir a login en modo web (no en modo admin)
      const isAdminMode = import.meta.env.VITE_MODE === 'admin';
      if (!isAdminMode) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
