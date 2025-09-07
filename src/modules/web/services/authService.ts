/**
 * Authentication Service - Web Public System
 * 
 * Handles authentication operations for the public website.
 * Currently implements mock functionality - will be replaced with real API calls.
 */

import type { 
  AuthResponse, 
  LoginFormData, 
  RegisterFormData, 
  AuthUser 
} from '../types/auth';

// =================== MOCK DATA ===================

/**
 * Mock users database (in-memory storage for demo)
 */
const mockUsers: (AuthUser & { password: string })[] = [
  {
    id: '1',
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'password123',
    isActive: true,
  },
  {
    id: '2',
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    password: 'password123',
    isActive: true,
  }
];

// =================== STORAGE UTILITIES ===================

const AUTH_STORAGE_KEY = 'una_hotel_auth';

/**
 * Save authentication data to localStorage
 */
const saveAuthData = (authResponse: AuthResponse): void => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authResponse));
  } catch (error) {
    console.error('Failed to save auth data:', error);
  }
};

/**
 * Get authentication data from localStorage
 */
const getStoredAuthData = (): AuthResponse | null => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to get auth data:', error);
    return null;
  }
};

/**
 * Remove authentication data from localStorage
 */
const clearStoredAuthData = (): void => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear auth data:', error);
  }
};

// =================== API SIMULATION UTILITIES ===================

/**
 * Simulate API delay
 */
const simulateApiDelay = (): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
};

/**
 * Generate mock JWT token
 */
const generateMockToken = (userId: string): string => {
  return `mock_token_${userId}_${Date.now()}`;
};

// =================== AUTH SERVICE ===================

export class AuthService {
  /**
   * Login user with email and password
   */
  static async login(credentials: LoginFormData): Promise<AuthResponse> {
    await simulateApiDelay();

    const { email, password } = credentials;
    
    // Find user by email
    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    
    if (user.password !== password) {
      throw new Error('Contraseña incorrecta');
    }
    
    if (!user.isActive) {
      throw new Error('Cuenta desactivada');
    }

    // Create auth response
    const authResponse: AuthResponse = {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
      },
      tokens: {
        accessToken: generateMockToken(user.id),
        refreshToken: generateMockToken(user.id + '_refresh'),
        expiresIn: 3600, // 1 hour
      }
    };

    // Save to localStorage
    saveAuthData(authResponse);
    
    return authResponse;
  }

  /**
   * Register new user
   */
  static async register(userData: RegisterFormData): Promise<AuthResponse> {
    await simulateApiDelay();

    const { email, password, firstName, lastName } = userData;
    
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      throw new Error('Ya existe una cuenta con este email');
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email: email.toLowerCase(),
      firstName,
      lastName,
      password,
      isActive: true,
    };

    // Add to mock database
    mockUsers.push(newUser);

    // Create auth response
    const authResponse: AuthResponse = {
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        isActive: newUser.isActive,
      },
      tokens: {
        accessToken: generateMockToken(newUser.id),
        refreshToken: generateMockToken(newUser.id + '_refresh'),
        expiresIn: 3600,
      }
    };

    // Save to localStorage
    saveAuthData(authResponse);
    
    return authResponse;
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    await simulateApiDelay();
    clearStoredAuthData();
  }

  /**
   * Get current user from stored token
   */
  static async getCurrentUser(): Promise<AuthUser | null> {
    const storedAuth = getStoredAuthData();
    
    if (!storedAuth) {
      return null;
    }

    // In a real app, you would validate the token with the server
    // For now, we'll just check if it exists and hasn't "expired"
    const tokenAge = Date.now() - parseInt(storedAuth.tokens.accessToken.split('_')[2]);
    const isExpired = tokenAge > storedAuth.tokens.expiresIn * 1000;

    if (isExpired) {
      clearStoredAuthData();
      return null;
    }

    return storedAuth.user;
  }

  /**
   * Refresh user data
   */
  static async refreshUser(): Promise<AuthUser> {
    await simulateApiDelay();
    
    const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      throw new Error('No hay sesión activa');
    }

    // In a real app, fetch fresh user data from server
    return currentUser;
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string): Promise<void> {
    await simulateApiDelay();
    
    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('No se encontró una cuenta con este email');
    }

    // In a real app, send reset email
    console.log(`Password reset email sent to ${email}`);
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }
}
