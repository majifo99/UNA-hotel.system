import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Configurar Pusher globalmente
declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

window.Pusher = Pusher;

/**
 * Servicio WebSocket para notificaciones de limpieza
 *
 * Gestiona la conexión con Laravel Reverb para recibir notificaciones
 * en tiempo real cuando se asignan nuevas limpiezas.
 */

class LimpiezaWebSocketService {
  private echo: Echo<any> | null = null;
  private isConnected: boolean = false;

  /**
   * Inicializa la conexión WebSocket con Laravel Echo
   */
  initialize(): Echo<any> {
    if (this.echo) {
      console.log('🔌 Echo ya está inicializado');
      return this.echo;
    }

    const appKey = import.meta.env.VITE_REVERB_APP_KEY || 'local-app-key';
    const wsHost = import.meta.env.VITE_REVERB_HOST || 'localhost';
    const wsPort = parseInt(import.meta.env.VITE_REVERB_PORT || '8080');
    const scheme = import.meta.env.VITE_REVERB_SCHEME || 'http';
    const forceTLS = scheme === 'https';

    console.log('🚀 Inicializando Laravel Echo para limpiezas...', {
      key: appKey,
      wsHost,
      wsPort,
      forceTLS,
    });

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
        console.log('✅ WebSocket de limpiezas conectado');
        this.isConnected = true;
      });

      pusher.connection.bind('disconnected', () => {
        console.log('❌ WebSocket de limpiezas desconectado');
        this.isConnected = false;
      });

      pusher.connection.bind('error', (error: any) => {
        console.error('❌ Error en WebSocket de limpiezas:', error);
        this.isConnected = false;
      });

      pusher.connection.bind('state_change', (states: any) => {
        console.log('🔄 Estado WebSocket limpiezas:', states.current);
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
      console.log('🔌 Desconectando WebSocket de limpiezas...');
      this.echo.disconnect();
      this.echo = null;
      this.isConnected = false;
    }
  }

  /**
   * Reconecta el WebSocket (útil después de cambios de token)
   */
  reconnect(): void {
    console.log('🔄 Reconectando WebSocket de limpiezas...');
    this.disconnect();
    this.initialize();
  }
}

// Exportar instancia singleton
export const limpiezaWebSocketService = new LimpiezaWebSocketService();