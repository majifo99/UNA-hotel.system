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
 * NOTE: In production, passwords should be hashed and stored securely
 * These are temporary demo credentials that will be replaced with real authentication
 */
const mockUsers: (AuthUser & { password: string })[] = [
  {
    id: '1',
    email: 'demo@unahotel.com',
    firstName: 'Usuario',
    lastName: 'Demo',
    password: hashPassword('DemoPass2024!'), // In production: use bcrypt or similar
    isActive: true,
  },
  {
    id: '2',
    email: 'admin@unahotel.com',
    firstName: 'Admin',
    lastName: 'Sistema',
    password: hashPassword('AdminDemo2024!'), // In production: use bcrypt or similar
    isActive: true,
  }
];

/**
 * Simple hash function for demo purposes
 * WARNING: This is NOT secure for production! Use bcrypt, argon2, or similar
 */
function hashPassword(password: string): string {
  // This is just for demo - in production use proper password hashing
  return btoa(password + 'una_hotel_salt_2024').replace(/[+/=]/g, '');
}

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
 * Generate mock JWT token with better randomness
 * WARNING: This is NOT secure for production! Use proper JWT libraries
 */
const generateMockToken = (userId: string): string => {
  // Generate more secure random component
  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);
  const randomHex = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
  
  const timestamp = Date.now();
  const payload = btoa(JSON.stringify({ userId, timestamp, random: randomHex }));
  
  return `mock_token_${payload}`;
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
    
    // Verify password using the same hash function
    const hashedInputPassword = hashPassword(password);
    if (user.password !== hashedInputPassword) {
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
      password: hashPassword(password), // Hash the password
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
