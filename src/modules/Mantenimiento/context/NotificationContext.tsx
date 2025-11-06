import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mantenimientoWebSocketService } from '../services/websocketService';
import { toast } from 'sonner';
import type {
  NotificationContextType,
  StoredNotification,
  MantenimientoNotification,
} from '../types/notifications';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/**
 * Provider para gestionar notificaciones de mantenimiento en tiempo real
 *
 * Este provider:
 * - Conecta al WebSocket de Laravel Reverb
 * - Escucha eventos de nuevos mantenimientos asignados
 * - Gestiona el estado de notificaciones (leídas/no leídas)
 * - Muestra toasts cuando llegan notificaciones
 * - Persiste notificaciones en localStorage
 */
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Cargar notificaciones del localStorage al montar
  useEffect(() => {
    const stored = localStorage.getItem('mantenimiento_notifications');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setNotifications(parsed);
      } catch (error) {
        console.error('Error al cargar notificaciones:', error);
        localStorage.removeItem('mantenimiento_notifications');
      }
    }
  }, []);

  // Persistir notificaciones en localStorage cuando cambien
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('mantenimiento_notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  // Conectar al WebSocket y escuchar eventos
  useEffect(() => {
    try {
      const echo = mantenimientoWebSocketService.getEcho();

      // Suscribirse al canal de mantenimientos
      const channel = echo.channel('mantenimientos');

    const handleNotification = (event: MantenimientoNotification) => {
      console.log('🔔 Nueva notificación de mantenimiento recibida:', event);

      // Agregar notificación al estado
      addNotification(event);

      // Mostrar toast
      toast.success(event.title, {
        description: `Habitación ${event.data.habitacion} - ${event.data.asignado_a}`,
        duration: 5000,
      });
    };

    console.log('👂 Escuchando en canal "mantenimientos" el evento ".NuevoMantenimientoAsignado"');
    channel.listen('.NuevoMantenimientoAsignado', handleNotification);

    // Debug: escuchar TODOS los eventos del canal
    channel.listenForWhisper('*', (e: any) => {
      console.log('🔊 Whisper recibido:', e);
    });

    // 🧪 Listener para notificaciones de prueba (TEMPORAL)
    const handleTestNotification = (e: any) => {
      console.log('🧪 Evento de prueba recibido');
      handleNotification(e.detail);
    };
    window.addEventListener('test-mantenimiento-notification', handleTestNotification);

    // Escuchar eventos de conexión/desconexión
    if (echo.connector?.pusher) {
      const pusher = echo.connector.pusher;

      const handleConnected = () => {
        console.log('✅ WebSocket conectado - actualizando UI');
        setIsConnected(true);
      };

      const handleDisconnected = () => {
        console.log('❌ WebSocket desconectado - actualizando UI');
        setIsConnected(false);
      };

      pusher.connection.bind('connected', handleConnected);
      pusher.connection.bind('disconnected', handleDisconnected);

      // Establecer estado inicial
      const currentState = pusher.connection.state;
      setIsConnected(currentState === 'connected');

      // Cleanup al desmontar
      return () => {
        pusher.connection.unbind('connected', handleConnected);
        pusher.connection.unbind('disconnected', handleDisconnected);
        echo.leaveChannel('mantenimientos');
        window.removeEventListener('test-mantenimiento-notification', handleTestNotification);
        // NO desconectar aquí para evitar problemas con React Strict Mode
        // mantenimientoWebSocketService.disconnect();
      };
    }

    return () => {
      try {
        echo.leaveChannel('mantenimientos');
      } catch (error) {
        console.error('Error al salir del canal:', error);
      }
      window.removeEventListener('test-mantenimiento-notification', handleTestNotification);
    };
    } catch (error) {
      console.error('❌ Error al conectar WebSocket:', error);
      console.log('⚠️ La aplicación continuará sin notificaciones en tiempo real');
    }
  }, []);

  /**
   * Agregar una nueva notificación al estado
   */
  const addNotification = useCallback((notification: MantenimientoNotification) => {
    const newNotification: StoredNotification = {
      id: `notif-${Date.now()}-${Math.random()}`,
      title: notification.title,
      message: notification.message,
      habitacion: notification.data.habitacion,
      asignado_a: notification.data.asignado_a,
      estado: notification.data.estado,
      fecha: notification.data.fecha,
      prioridad: notification.data.prioridad,
      mantenimiento_id: notification.data.id,
      timestamp: notification.timestamp || new Date().toISOString(),
      read: false,
    };

    setNotifications((prev) => [newNotification, ...prev]);
  }, []);

  /**
   * Marcar una notificación como leída
   */
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  }, []);

  /**
   * Marcar todas las notificaciones como leídas
   */
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, read: true }))
    );
  }, []);

  /**
   * Eliminar una notificación
   */
  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
  }, []);

  /**
   * Limpiar todas las notificaciones
   */
  const clearAll = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem('mantenimiento_notifications');
  }, []);

  // Calcular notificaciones no leídas
  const unreadCount = notifications.filter((n) => !n.read).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isConnected,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Hook para usar el contexto de notificaciones
 */
export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications debe usarse dentro de NotificationProvider');
  }
  return context;
};
