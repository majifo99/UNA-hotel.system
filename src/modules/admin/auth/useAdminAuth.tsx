/**
 * Admin Authentication Context & Hook
 */

import { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { 
  AdminAuthContextType, 
  AdminAuthState, 
  AdminLoginFormData,
  AdminUser 
} from './types';
import { AdminAuthService } from './adminAuthService';

// =================== AUTH REDUCER ===================

type AdminAuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: AdminUser }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_CLEAR_ERROR' }
  | { type: 'AUTH_SET_LOADING'; payload: boolean };

const adminAuthReducer = (state: AdminAuthState, action: AdminAuthAction): AdminAuthState => {
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

const initialState: AdminAuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// =================== CONTEXT ===================

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// =================== PROVIDER ===================

interface AdminAuthProviderProps {
  readonly children: ReactNode;
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [state, dispatch] = useReducer(adminAuthReducer, initialState);

  // =================== ACTIONS ===================

  const login = useCallback(async (credentials: AdminLoginFormData): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await AdminAuthService.login(credentials);
      
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al iniciar sesión';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      throw error;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_SET_LOADING', payload: true });
      
      await AdminAuthService.logout();
      
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error) {
      console.error('Error during admin logout:', error);
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  }, []);

  const clearError = useCallback((): void => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
  }, []);

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_SET_LOADING', payload: true });
      
      const user = await AdminAuthService.refreshUser();
      
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar usuario';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      throw error;
    }
  }, []);

  // =================== INITIALIZATION ===================

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const user = await AdminAuthService.getCurrentUser();
        
        if (user) {
          dispatch({ type: 'AUTH_SUCCESS', payload: user });
        } else {
          dispatch({ type: 'AUTH_SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Failed to initialize admin auth:', error);
        dispatch({ type: 'AUTH_SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  // =================== CONTEXT VALUE ===================

  const contextValue: AdminAuthContextType = useMemo(() => ({
    ...state,
    login,
    logout,
    clearError,
    refreshUser,
  }), [state]);

  return (
    <AdminAuthContext.Provider value={contextValue}>
      {children}
    </AdminAuthContext.Provider>
  );
}

// =================== HOOK ===================

export function useAdminAuth(): AdminAuthContextType {
  const context = useContext(AdminAuthContext);
  
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  
  return context;
}
