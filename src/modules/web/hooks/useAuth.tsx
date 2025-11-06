/**
 * Authentication Context - Web Public System
 * 
 * Provides global authentication state and actions for the public website.
 * Manages user sessions, login/logout, and authentication status.
 */

import { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { 
  AuthContextType, 
  AuthState, 
  LoginFormData, 
  RegisterFormData,
  AuthUser 
} from '../types/auth';
import { AuthService } from '../services/authService';

// =================== AUTH REDUCER ===================

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: AuthUser }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_CLEAR_ERROR' }
  | { type: 'AUTH_SET_LOADING'; payload: boolean };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    
    case 'AUTH_CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    
    case 'AUTH_SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    
    default:
      return state;
  }
};

// =================== INITIAL STATE ===================

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true to check existing session
  error: null,
};

// =================== CONTEXT ===================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =================== PROVIDER ===================

interface AuthProviderProps {
  readonly children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // =================== ACTIONS ===================

  const login = useCallback(async (credentials: LoginFormData): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await AuthService.login(credentials);
      
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al iniciar sesión';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      throw error;
    }
  }, []);

  const register = useCallback(async (userData: RegisterFormData): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await AuthService.register(userData);
      
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al registrarse';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      throw error;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_SET_LOADING', payload: true });
      
      await AuthService.logout();
      
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if logout fails, clear local state
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  }, []);

  const clearError = useCallback((): void => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
  }, []);

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_SET_LOADING', payload: true });
      
      const user = await AuthService.refreshUser();
      
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar usuario';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<void> => {
    try {
      await AuthService.resetPassword(email);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al resetear contraseña';
      throw new Error(message);
    }
  }, []);

  // =================== INITIALIZATION ===================

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const user = await AuthService.getCurrentUser();
        
        if (user) {
          dispatch({ type: 'AUTH_SUCCESS', payload: user });
        } else {
          dispatch({ type: 'AUTH_SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        dispatch({ type: 'AUTH_SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  // =================== CONTEXT VALUE ===================

  const contextValue: AuthContextType = useMemo(() => ({
    // State
    ...state,
    
    // Actions
    login,
    register,
    logout,
    clearError,
    refreshUser,
    resetPassword,
  }), [state]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// =================== HOOK ===================

/**
 * Hook to use authentication context
 * Must be used within AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
