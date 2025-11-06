/**
 * Admin Authentication Context & Hook
 */

import { createContext, useReducer, useEffect, useMemo, useCallback } from 'react';
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

export { AdminAuthContext };

// =================== PROVIDER ===================

interface AdminAuthProviderProps {
  readonly children: ReactNode;
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [state, dispatch] = useReducer(adminAuthReducer, initialState);

  // =================== SESSION SYNC ===================

  // Listener para cambios en localStorage desde otras pestañas
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'adminAuthToken' || event.key === 'adminAuthUser') {
        // La sesión cambió en otra pestaña, verificar estado actual
        const checkSession = async () => {
          try {
            const user = await AdminAuthService.getCurrentUser();
            if (user) {
              dispatch({ type: 'AUTH_SUCCESS', payload: user });
            } else {
              dispatch({ type: 'AUTH_LOGOUT' });
            }
          } catch (error) {
            console.error('[AdminAuth] Error verificando sesión tras cambio:', error);
            dispatch({ type: 'AUTH_LOGOUT' });
          }
        };
        
        checkSession();
      }
    };

    globalThis.addEventListener('storage', handleStorageChange);
    
    return () => {
      globalThis.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Verificación de sesión cuando la pestaña se vuelve visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && state.isAuthenticated) {
        // La pestaña se volvió visible, verificar que la sesión siga válida
        const checkSession = async () => {
          try {
            const user = await AdminAuthService.getCurrentUser();
            if (!user) {
              dispatch({ type: 'AUTH_LOGOUT' });
            }
          } catch (error) {
            console.error('[AdminAuth] Error verificando sesión al volver visible:', error);
          }
        };
        
        checkSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [state.isAuthenticated]);

  // Verificación periódica de sesión
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const checkSessionPeriodically = async () => {
      try {
        const isValid = await AdminAuthService.isAuthenticated();
        if (!isValid) {
          console.log('[AdminAuth] Sesión expirada, cerrando sesión');
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      } catch (error) {
        console.error('[AdminAuth] Error en verificación periódica:', error);
      }
    };

    // Verificar cada 5 minutos
    const interval = setInterval(checkSessionPeriodically, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [state.isAuthenticated]);

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
    let isMounted = true;

    const validateStoredSession = async (): Promise<boolean> => {
      try {
        const isValid = await AdminAuthService.isAuthenticated();
        return isValid;
      } catch (error) {
        console.warn('[AdminAuth] Error validando token:', error);
        return true; // Asumir válido si hay error de red
      }
    };

    const initializeAuth = async () => {
      try {
        console.log('[AdminAuth] Iniciando verificación de sesión...');
        
        const user = await AdminAuthService.getCurrentUser();
        
        if (!isMounted) return;
        
        if (user) {
          console.log('[AdminAuth] Usuario encontrado en localStorage:', user.email);
          
          const isValid = await validateStoredSession();
          
          if (!isMounted) return;
          
          if (isValid) {
            dispatch({ type: 'AUTH_SUCCESS', payload: user });
            console.log('[AdminAuth] Sesión válida restaurada');
          } else {
            console.log('[AdminAuth] Token inválido, limpiando sesión');
            await AdminAuthService.logout();
            dispatch({ type: 'AUTH_SET_LOADING', payload: false });
          }
        } else {
          console.log('[AdminAuth] No se encontró usuario en localStorage');
          dispatch({ type: 'AUTH_SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('[AdminAuth] Error al inicializar autenticación:', error);
        if (isMounted) {
          dispatch({ type: 'AUTH_SET_LOADING', payload: false });
        }
      }
    };

    const timeoutId = setTimeout(initializeAuth, 100);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  // =================== CONTEXT VALUE ===================

  const contextValue: AdminAuthContextType = useMemo(() => ({
    ...state,
    login,
    logout,
    clearError,
    refreshUser,
  }), [state, login, logout, clearError, refreshUser]);

  return (
    <AdminAuthContext.Provider value={contextValue}>
      {children}
    </AdminAuthContext.Provider>
  );
}
