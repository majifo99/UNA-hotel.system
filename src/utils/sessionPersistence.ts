/**
 * Session Persistence Utilities
 * 
 * Utilidades para mantener las sesiones persistentes y manejar
 * la sincronización entre pestañas del navegador.
 */

// =================== CONSTANTS ===================

const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutos
const ADMIN_TOKEN_KEY = 'adminAuthToken';
const ADMIN_USER_KEY = 'adminAuthUser';

// =================== SESSION MANAGER ===================

class SessionManager {
  private checkInterval: number | null = null;
  private listeners: (() => void)[] = [];

  /**
   * Inicializa el manager de sesión
   */
  init(): void {
    this.startPeriodicCheck();
    this.addStorageListener();
    this.addVisibilityListener();
  }

  /**
   * Limpia el manager de sesión
   */
  cleanup(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    window.removeEventListener('storage', this.handleStorageChange);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }

  /**
   * Agrega un listener para cambios de sesión
   */
  addSessionListener(callback: () => void): () => void {
    this.listeners.push(callback);
    
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notifica a los listeners sobre cambios de sesión
   */
  private notifyListeners(): void {
    this.listeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('[SessionManager] Error en listener:', error);
      }
    });
  }

  /**
   * Inicia verificación periódica de la sesión
   */
  private startPeriodicCheck(): void {
    this.checkInterval = setInterval(() => {
      this.checkSessionValidity();
    }, SESSION_CHECK_INTERVAL);
  }

  /**
   * Verifica la validez de la sesión actual
   */
  private async checkSessionValidity(): Promise<void> {
    try {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY);
      
      if (!token) {
        return;
      }

      // Verificar token con el servidor
      const response = await fetch('/api/auth/check', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.log('[SessionManager] Token inválido, limpiando sesión');
        this.clearSession();
        this.notifyListeners();
      }
    } catch (error) {
      // En caso de error de red, no hacer nada
      console.warn('[SessionManager] Error verificando sesión:', error);
    }
  }

  /**
   * Limpia la sesión local
   */
  private clearSession(): void {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
  }

  /**
   * Maneja cambios en localStorage desde otras pestañas
   */
  private handleStorageChange = (event: StorageEvent): void => {
    if (event.key === ADMIN_TOKEN_KEY || event.key === ADMIN_USER_KEY) {
      console.log('[SessionManager] Cambio de sesión detectado en otra pestaña');
      this.notifyListeners();
    }
  };

  /**
   * Maneja cambios de visibilidad de la pestaña
   */
  private handleVisibilityChange = (): void => {
    if (!document.hidden) {
      // La pestaña se volvió visible, verificar sesión
      console.log('[SessionManager] Pestaña visible, verificando sesión');
      this.checkSessionValidity();
    }
  };

  /**
   * Agrega listener para cambios en localStorage
   */
  private addStorageListener(): void {
    window.addEventListener('storage', this.handleStorageChange);
  }

  /**
   * Agrega listener para cambios de visibilidad
   */
  private addVisibilityListener(): void {
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }
}

// =================== EXPORT ===================

export const sessionManager = new SessionManager();

/**
 * Hook para inicializar la gestión de sesión
 */
export const useSessionPersistence = (onSessionChange?: () => void) => {
  const cleanup = sessionManager.addSessionListener(() => {
    onSessionChange?.();
  });

  return cleanup;
};

/**
 * Inicializa la gestión de sesión global
 */
export const initializeSessionPersistence = (): void => {
  sessionManager.init();
};

/**
 * Limpia la gestión de sesión global
 */
export const cleanupSessionPersistence = (): void => {
  sessionManager.cleanup();
};