/**
 * Authentication Types - Web Public System
 * 
 * Types specific to the authentication system for the public website.
 * Integrates with the existing Guest entity from the admin system.
 */

import type { Guest } from '../../../types/core/domain';

// =================== AUTH ENTITIES ===================

/**
 * User authentication state
 */
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  
  // Reference to full guest profile (populated when needed)
  guestProfile?: Guest;
}

/**
 * Authentication token response
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

/**
 * Complete authentication response
 */
export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

// =================== FORM DATA TYPES ===================

/**
 * Login form data
 */
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Registration form data
 */
export interface RegisterFormData {
  // Basic required fields
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  
  // Optional contact info
  phone?: string;
  nationality?: string;
  
  // Terms and preferences
  acceptTerms: boolean;
  subscribeNewsletter?: boolean;
}

/**
 * Password reset form data
 */
export interface PasswordResetFormData {
  email: string;
}

/**
 * Password change form data
 */
export interface PasswordChangeFormData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// =================== AUTH CONTEXT TYPES ===================

/**
 * Authentication state
 */
export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Authentication context actions
 */
export interface AuthActions {
  login: (credentials: LoginFormData) => Promise<void>;
  register: (userData: RegisterFormData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

/**
 * Complete authentication context
 */
export interface AuthContextType extends AuthState, AuthActions {}

// =================== API TYPES ===================

/**
 * API error response
 */
export interface AuthApiError {
  message: string;
  field?: string;
  code?: string;
}

/**
 * API validation error response
 */
export interface AuthValidationError {
  errors: {
    [field: string]: string[];
  };
  message: string;
}
