/**
 * Admin Authentication Service
 * 
 * Handles authentication operations for the admin system.
 */

import apiClient from '../../../services/apiClient';
import type { 
  AdminAuthResponse, 
  AdminLoginFormData,
  AdminRegisterFormData,
  AdminUser 
} from './types';

// =================== STORAGE UTILITIES ===================

const ADMIN_TOKEN_KEY = 'adminAuthToken';
const ADMIN_USER_KEY = 'adminAuthUser';

const saveAdminToken = (token: string): void => {
  try {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to save admin token:', error);
  }
};

const getStoredAdminToken = (): string | null => {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to get admin token:', error);
    return null;
  }
};

const saveAdminUser = (user: AdminUser): void => {
  try {
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to save admin user:', error);
  }
};

const getStoredAdminUser = (): AdminUser | null => {
  try {
    const stored = localStorage.getItem(ADMIN_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to get admin user:', error);
    return null;
  }
};

const clearAdminAuthData = (): void => {
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
  } catch (error) {
    console.error('Failed to clear admin auth data:', error);
  }
};

// =================== API RESPONSE TYPES ===================

interface LaravelAdminLoginResponse {
  token: string;
  user: {
    id_usuario: number;
    nombre: string;
    apellido1: string;
    apellido2: string;
    email: string;
    rol: string;
    [key: string]: unknown;
  };
}

// =================== AUTH SERVICE ===================

export class AdminAuthService {
  /**
   * Login admin user with email and password
   * Endpoint: POST /api/auth/login
   */
  static async login(credentials: AdminLoginFormData): Promise<AdminAuthResponse> {
    try {
      const response = await apiClient.post<LaravelAdminLoginResponse>('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });

      const { token, user } = response.data;

      const adminUser: AdminUser = {
        id: user.id_usuario.toString(),
        email: user.email,
        firstName: user.nombre,
        lastName: `${user.apellido1} ${user.apellido2 || ''}`.trim(),
        role: user.rol as AdminUser['role'],
        permissions: [],
        isActive: true,
      };

      saveAdminToken(token);
      saveAdminUser(adminUser);

      return {
        user: adminUser,
        tokens: {
          accessToken: token,
          expiresIn: 3600,
        }
      };
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al iniciar sesión';
      throw new Error(message);
    }
  }

  /**
   * Register new admin user
   * Endpoint: POST /api/auth/register
   */
  static async register(data: AdminRegisterFormData): Promise<AdminAuthResponse> {
    try {
      const response = await apiClient.post<LaravelAdminLoginResponse>('/auth/register', {
        nombre: data.nombre,
        apellido1: data.apellido1,
        apellido2: data.apellido2 || '',
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
        telefono: data.telefono || '',
        id_rol: data.id_rol,
      });

      const { token, user } = response.data;

      const adminUser: AdminUser = {
        id: user.id_usuario.toString(),
        email: user.email,
        firstName: user.nombre,
        lastName: `${user.apellido1} ${user.apellido2 || ''}`.trim(),
        role: user.rol as AdminUser['role'],
        permissions: [],
        isActive: true,
      };

      saveAdminToken(token);
      saveAdminUser(adminUser);

      return {
        user: adminUser,
        tokens: {
          accessToken: token,
          expiresIn: 3600,
        }
      };
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al registrar usuario';
      throw new Error(message);
    }
  }

  /**
   * Logout admin user
   */
  static async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
      clearAdminAuthData();
    } catch (error) {
      console.error('Admin logout error:', error);
      clearAdminAuthData();
    }
  }

  /**
   * Get current admin user from stored data
   */
  static async getCurrentUser(): Promise<AdminUser | null> {
    const token = getStoredAdminToken();
    const user = getStoredAdminUser();
    
    if (!token || !user) {
      return null;
    }

    return user;
  }

  /**
   * Refresh admin user data from server
   */
  static async refreshUser(): Promise<AdminUser> {
    try {
      const response = await apiClient.get<LaravelAdminLoginResponse>('/auth/user');
      const { user } = response.data;

      const adminUser: AdminUser = {
        id: user.id_usuario.toString(),
        email: user.email,
        firstName: user.nombre,
        lastName: `${user.apellido1} ${user.apellido2 || ''}`.trim(),
        role: user.rol as AdminUser['role'],
        permissions: [],
        isActive: true,
      };

      saveAdminUser(adminUser);
      return adminUser;
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al actualizar usuario';
      throw new Error(message);
    }
  }

  /**
   * Check if admin user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const token = getStoredAdminToken();
    const user = getStoredAdminUser();
    
    if (!token || !user) {
      return false;
    }

    // Si hay token y usuario en storage, se asume autenticado
    // El backend validará el token en cada petición
    return true;
  }
}
