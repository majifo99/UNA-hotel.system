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
    const wsHost = import.meta.env.VITE_REVERB_HOST || 'localhost';
    const wsPort = Number.parseInt(import.meta.env.VITE_REVERB_PORT || '8080');
    const scheme = import.meta.env.VITE_REVERB_SCHEME || 'http';
    const forceTLS = scheme === 'https';

    console.log('🚀 Inicializando Laravel Echo para limpiezas...', {
      key: appKey,
      wsHost,
      wsPort,
      forceTLS,
    });

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
        console.log('❌ WebSocket desconectado');
        this.isConnected = false;
      });

      pusher.connection.bind('error', (error: any) => {
        console.error('❌ Error en WebSocket:', error);
        this.isConnected = false;
      });

      pusher.connection.bind('state_change', (states: any) => {
        console.log('🔄 Estado WebSocket:', states.current);
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
