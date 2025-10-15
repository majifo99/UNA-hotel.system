/**
 * Admin Authentication Types
 * 
 * Types specific to the admin authentication system.
 */

// =================== AUTH ENTITIES ===================

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'receptionist' | 'staff';
  permissions: string[];
  isActive: boolean;
}

export interface AdminAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface AdminAuthResponse {
  user: AdminUser;
  tokens: AdminAuthTokens;
}

// =================== FORM DATA TYPES ===================

export interface AdminLoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// =================== AUTH CONTEXT TYPES ===================

export interface AdminAuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AdminAuthActions {
  login: (credentials: AdminLoginFormData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

export interface AdminAuthContextType extends AdminAuthState, AdminAuthActions {}
