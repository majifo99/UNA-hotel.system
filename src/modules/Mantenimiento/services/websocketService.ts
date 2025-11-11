import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Configurar Pusher globalmente
declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

globalThis.Pusher = Pusher;

/**
 * Servicio WebSocket para notificaciones de mantenimiento
 *
 * Gestiona la conexión con Laravel Reverb para recibir notificaciones
 * en tiempo real cuando se asignan nuevos mantenimientos.
 */

class MantenimientoWebSocketService {
  private echo: Echo<any> | null = null;
  private isConnected: boolean = false;

  /**
   * Inicializa la conexión WebSocket con Laravel Echo
   */
  initialize(): Echo<any> {
    if (this.echo) {
      console.log('🔌 Echo de mantenimiento ya está inicializado');
      return this.echo;
    }

    const appKey = import.meta.env.VITE_REVERB_APP_KEY || 'local-app-key';
    const wsHost = import.meta.env.VITE_REVERB_HOST || 'backendhotelt.onrender.com';
    const wsPort = Number.parseInt(import.meta.env.VITE_REVERB_PORT || '443');
    const scheme = import.meta.env.VITE_REVERB_SCHEME || 'https';
    const forceTLS = scheme === 'https';

    // Silenciar logs si Reverb no está configurado
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log('🚀 Inicializando Laravel Echo para mantenimientos...', {
        key: appKey,
        wsHost,
        wsPort,
        forceTLS,
      });
    }

    this.echo = new Echo({
      broadcaster: 'reverb',
      key: appKey,
      wsHost: wsHost,
      wsPort: wsPort,
      wssPort: wsPort,
      forceTLS: forceTLS,
      enabledTransports: ['ws', 'wss'],
      disableStats: true,

      // Configuración de autenticación
      auth: {
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
      },

      encrypted: forceTLS,
    });

    // Event listeners para debugging
    if (this.echo.connector?.pusher) {
      const pusher = this.echo.connector.pusher;

      pusher.connection.bind('connected', () => {
        console.log('✅ WebSocket de mantenimientos conectado');
        this.isConnected = true;
      });

      pusher.connection.bind('disconnected', () => {
        // Solo log en debug mode
        if (import.meta.env.VITE_DEBUG === 'true') {
          console.log('❌ WebSocket de mantenimientos desconectado');
        }
        this.isConnected = false;
      });

      pusher.connection.bind('error', () => {
        // Silenciar errores de conexión esperados cuando Reverb no está disponible
        if (import.meta.env.VITE_DEBUG === 'true') {
          console.warn('⚠️ WebSocket error (Reverb no disponible)');
        }
        this.isConnected = false;
      });

      pusher.connection.bind('state_change', (states: any) => {
        // Solo log en debug mode y solo si cambia a connected o error
        if (import.meta.env.VITE_DEBUG === 'true' && (states.current === 'connected' || states.current === 'failed')) {
          console.log('🔄 Estado WebSocket mantenimientos:', states.current);
        }
      });
    }

    return this.echo;
  }

  /**
   * Obtiene el token de autenticación del localStorage
   */
  private getAuthToken(): string {
    return localStorage.getItem('adminAuthToken')
      || localStorage.getItem('authToken')
      || '';
  }

  /**
   * Obtiene la instancia de Echo (la crea si no existe)
   */
  getEcho(): Echo<any> {
    if (!this.echo) {
      this.initialize();
    }
    return this.echo!;
  }

  /**
   * Verifica si el WebSocket está conectado
   */
  isWebSocketConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Desconecta y limpia la conexión WebSocket
   */
  disconnect(): void {
    if (this.echo) {
      console.log('🔌 Desconectando WebSocket de mantenimientos...');
      this.echo.disconnect();
      this.echo = null;
      this.isConnected = false;
    }
  }

  /**
   * Reconecta el WebSocket (útil después de cambios de token)
   */
  reconnect(): void {
    console.log('🔄 Reconectando WebSocket de mantenimientos...');
    this.disconnect();
    this.initialize();
  }
}

// Exportar instancia singleton
export const mantenimientoWebSocketService = new MantenimientoWebSocketService();
