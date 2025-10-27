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
    // Priorizar token de admin (para rutas administrativas) sobre token público
    const adminToken = localStorage.getItem('adminAuthToken');
    const publicToken = localStorage.getItem('authToken');
    
    const token = adminToken || publicToken;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // eslint-disable-next-line no-console
    const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
    console.debug('[API REQUEST]', (config.method || 'GET').toUpperCase(), fullUrl, token ? '(con token)' : '(sin token)');
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
      // Limpiar ambos tokens en caso de error de autenticación
      const hasAdminToken = localStorage.getItem('adminAuthToken');
      const hasPublicToken = localStorage.getItem('authToken');
      
      if (hasAdminToken) {
        localStorage.removeItem('adminAuthToken');
        localStorage.removeItem('adminAuthUser');
        // Redirigir a login de admin
        window.location.href = '/admin/login';
      } else if (hasPublicToken) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        // Redirigir a login público
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
