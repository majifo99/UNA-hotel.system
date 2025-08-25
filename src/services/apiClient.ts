
import axios from 'axios';

/**
 * Cliente API configurado para UNA Hotel System
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requests
apiClient.interceptors.request.use(
  (config) => {
    // Agregar token de autenticación si existe
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API] Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API] Response ${response.status}: ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      // El servidor respondió con un código de estado que no está en el rango 2xx
      console.error(`[API] Error ${error.response.status}: ${error.response.data?.message || error.message}`);
      
      // Manejar errores de autenticación
      if (error.response.status === 401) {
        localStorage.removeItem('authToken');
        // Redirigir a login si es necesario
        window.location.href = '/login';
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

export default apiClient;
