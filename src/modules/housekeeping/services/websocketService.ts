import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// -------------------------------------------------------------
// 🔧 Extensión global sin referencia circular
// -------------------------------------------------------------
declare global {
  // eslint-disable-next-line no-var
  var Pusher: ReturnType<typeof importPusher> | undefined;
}

function importPusher() {
  return Pusher;
}

globalThis.Pusher = Pusher as any;

/**
 * Servicio WebSocket para notificaciones de limpieza
 */
class LimpiezaWebSocketService {
  private echo: Echo<any> | null = null;
  private isConnected = false;

  initialize(): Echo<any> {
    if (this.echo) {
      console.log('🔌 Echo ya está inicializado');
      return this.echo;
    }

    const appKey = import.meta.env.VITE_REVERB_APP_KEY || 'local-app-key';
    const wsHost = import.meta.env.VITE_REVERB_HOST || 'backendhotelt.onrender.com';
    const wsPort = Number.parseInt(import.meta.env.VITE_REVERB_PORT || '443');
    const scheme = import.meta.env.VITE_REVERB_SCHEME || 'https';
    const forceTLS = scheme === 'https';

    // Silenciar logs si Reverb no está configurado
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log('🚀 Inicializando Laravel Echo para limpiezas...', {
        key: appKey,
        wsHost,
        wsPort,
        forceTLS,
      });
    }

    this.echo = new Echo<any>({
      broadcaster: 'reverb',
      key: appKey,
      wsHost,
      wsPort,
      wssPort: wsPort,
      forceTLS,
      enabledTransports: ['ws', 'wss'],
      disableStats: true,
      encrypted: forceTLS,
      auth: {
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
      },
    });

    const pusher = (this.echo.connector)?.pusher;
    if (pusher?.connection) {
      pusher.connection.bind('connected', () => {
        console.log('✅ WebSocket conectado');
        this.isConnected = true;
      });

      pusher.connection.bind('disconnected', () => {
        // Solo log en debug mode
        if (import.meta.env.VITE_DEBUG === 'true') {
          console.log('❌ WebSocket desconectado');
        }
        this.isConnected = false;
      });

      pusher.connection.bind('error', (error: any) => {
        // Silenciar errores de conexión esperados cuando Reverb no está disponible
        if (import.meta.env.VITE_DEBUG === 'true') {
          console.warn('⚠️ WebSocket error (Reverb no disponible)');
        }
        this.isConnected = false;
      });

      pusher.connection.bind('state_change', (states: any) => {
        // Solo log en debug mode y solo si cambia a connected o error
        if (import.meta.env.VITE_DEBUG === 'true' && (states.current === 'connected' || states.current === 'failed')) {
          console.log('🔄 Estado WebSocket:', states.current);
        }
      });
    }

    return this.echo;
  }

  private getAuthToken(): string {
    return (
      localStorage.getItem('adminAuthToken') ||
      localStorage.getItem('authToken') ||
      ''
    );
  }

  getEcho(): Echo<any> {
    if (!this.echo) this.initialize();
    return this.echo!;
  }

  isWebSocketConnected(): boolean {
    return this.isConnected;
  }

  disconnect(): void {
    if (this.echo) {
      console.log('🔌 Desconectando WebSocket...');
      this.echo.disconnect();
      this.echo = null;
      this.isConnected = false;
    }
  }

  reconnect(): void {
    console.log('🔄 Reconectando WebSocket...');
    this.disconnect();
    this.initialize();
  }
}

export const limpiezaWebSocketService = new LimpiezaWebSocketService();
