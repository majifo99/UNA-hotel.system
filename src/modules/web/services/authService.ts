import apiClient from '../../../services/apiClient';
import type { 
  AuthResponse, 
  LoginFormData, 
  RegisterFormData, 
  AuthUser 
} from '../types/auth';

// =================== STORAGE UTILITIES ===================

const AUTH_TOKEN_KEY = 'authToken';
const AUTH_USER_KEY = 'authUser';



const saveAuthToken = (token: string): void => {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to save auth token:', error);
  }
};

/**
 * Get authentication token from localStorage
 */
const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
};

/**
 * Save user data to localStorage
 */
const saveUserData = (user: AuthUser): void => {
  try {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to save user data:', error);
  }
};

/**
 * Get user data from localStorage
 */
const getStoredUser = (): AuthUser | null => {
  try {
    const stored = localStorage.getItem(AUTH_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to get user data:', error);
    return null;
  }
};

/**
 * Remove authentication data from localStorage
 */
const clearStoredAuthData = (): void => {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  } catch (error) {
    console.error('Failed to clear auth data:', error);
  }
};

// =================== API RESPONSE TYPES ===================

interface LaravelLoginResponse {
  message: string;
  token: string;
  cliente: {
    id_cliente: number;
    nombre: string;
    apellido1: string;
    apellido2?: string | null;
    email: string;
    telefono?: string | null;
    [key: string]: any;
  };
}

interface LaravelRegisterResponse {
  message: string;
  token: string;
  cliente: {
    id_cliente: number;
    nombre: string;
    apellido1: string;
    apellido2?: string | null;
    email: string;
    telefono?: string | null;
    [key: string]: any;
  };
}

// =================== AUTH SERVICE ===================

export class AuthService {
  /**
   * Login user with email and password
   * Endpoint: POST /api/clientes/auth/login
   */
  static async login(credentials: LoginFormData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<LaravelLoginResponse>('/clientes/auth/login', {
        email: credentials.email.toLowerCase(),
        password: credentials.password,
      });

      const { token, cliente } = response.data;

      // Map Laravel response to our AuthUser format
      const user: AuthUser = {
        id: cliente.id_cliente.toString(),
        email: cliente.email,
        firstName: cliente.nombre,
        lastName: cliente.apellido1,
        phone: cliente.telefono || undefined,
        isActive: true,
      };

      // Save to localStorage
      saveAuthToken(token);
      saveUserData(user);

      return {
        user,
        tokens: {
          accessToken: token,
          expiresIn: 3600, // Default 1 hour
        }
      };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al iniciar sesión';
      throw new Error(message);
    }
  }

  /**
   * Register new user
   * Endpoint: POST /api/clientes/auth/register
   */
  static async register(userData: RegisterFormData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<LaravelRegisterResponse>('/clientes/auth/register', {
        nombre: userData.firstName,
        apellido1: userData.lastName,
        email: userData.email.toLowerCase(),
        password: userData.password,
        password_confirmation: userData.confirmPassword,
        telefono: userData.phone || null,
      });

      const { token, cliente } = response.data;

      // Map Laravel response to our AuthUser format
      const user: AuthUser = {
        id: cliente.id_cliente.toString(),
        email: cliente.email,
        firstName: cliente.nombre,
        lastName: cliente.apellido1,
        phone: cliente.telefono || undefined,
        isActive: true,
      };

      // Save to localStorage
      saveAuthToken(token);
      saveUserData(user);

      return {
        user,
        tokens: {
          accessToken: token,
          expiresIn: 3600,
        }
      };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al registrarse';
      throw new Error(message);
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      // Optionally call backend logout endpoint if exists
      // await apiClient.post('/clientes/auth/logout');
      clearStoredAuthData();
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local data even if API call fails
      clearStoredAuthData();
    }
  }

  /**
   * Get current user from stored data
   */
  static async getCurrentUser(): Promise<AuthUser | null> {
    const token = getStoredToken();
    const user = getStoredUser();
    
    if (!token || !user) {
      return null;
    }

    return user;
  }

  /**
   * Refresh user data from server
   */
  static async refreshUser(): Promise<AuthUser> {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('No hay sesión activa');
      }

      // TODO: Implement refresh endpoint if available
      // const response = await apiClient.get('/clientes/me');
      // Update user data with fresh data from server
      
      return currentUser;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al actualizar usuario';
      throw new Error(message);
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string): Promise<void> {
    try {
      // TODO: Implement password reset endpoint
      await apiClient.post('/clientes/auth/reset-password', {
        email: email.toLowerCase(),
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al resetear contraseña';
      throw new Error(message);
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }
}
