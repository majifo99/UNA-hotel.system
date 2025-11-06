import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { mantenimientoWebSocketService } from "../services/websocketService";
import { toast } from "sonner";
import type {
  NotificationContextType,
  StoredNotification,
  MantenimientoNotification,
} from "../types/notifications";

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

/**
 * Provider para gestionar notificaciones de mantenimiento en tiempo real
 */
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  /* ------------------ Cargar desde localStorage al montar ------------------ */
  useEffect(() => {
    const stored = localStorage.getItem("mantenimiento_notifications");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setNotifications(parsed);
      } catch (error) {
        console.error("Error al cargar notificaciones:", error);
        localStorage.removeItem("mantenimiento_notifications");
      }
    }
  }, []);

  /* ---------------- Guardar en localStorage cuando cambien ----------------- */
  useEffect(() => {
    localStorage.setItem(
      "mantenimiento_notifications",
      JSON.stringify(notifications)
    );
  }, [notifications]);

  /* ---------------- Conexión WebSocket y suscripciones ---------------- */
  useEffect(() => {
    try {
      const echo = mantenimientoWebSocketService.getEcho();
      const channel = echo.channel("mantenimientos");

      const handleNotification = (event: MantenimientoNotification) => {
        console.log("🔔 Nueva notificación de mantenimiento recibida:", event);
        addNotification(event);
        toast.success(event.title, {
          description: `Habitación ${event.data.habitacion} - ${event.data.asignado_a}`,
          duration: 5000,
        });
      };

      console.log(
        '👂 Escuchando en canal "mantenimientos" el evento ".NuevoMantenimientoAsignado"'
      );
      channel.listen(".NuevoMantenimientoAsignado", handleNotification);

      // Debug de whispers
      channel.listenForWhisper("*", (e: any) => {
        console.log("🔊 Whisper recibido:", e);
      });

      // Listener de prueba
      const handleTestNotification = (e: any) => {
        console.log("🧪 Evento de prueba recibido");
        handleNotification(e.detail);
      };
      globalThis.addEventListener(
        "test-mantenimiento-notification",
        handleTestNotification
      );

      // Escuchar conexión/desconexión
      if (echo.connector?.pusher) {
        const pusher = echo.connector.pusher;

        const handleConnected = () => {
          console.log("✅ WebSocket conectado - actualizando UI");
          setIsConnected(true);
        };

        const handleDisconnected = () => {
          console.log("❌ WebSocket desconectado - actualizando UI");
          setIsConnected(false);
        };

        pusher.connection.bind("connected", handleConnected);
        pusher.connection.bind("disconnected", handleDisconnected);

        const currentState = pusher.connection.state;
        setIsConnected(currentState === "connected");

        // Cleanup
        return () => {
          pusher.connection.unbind("connected", handleConnected);
          pusher.connection.unbind("disconnected", handleDisconnected);
          echo.leaveChannel("mantenimientos");
          globalThis.removeEventListener(
            "test-mantenimiento-notification",
            handleTestNotification
          );
        };
      }

      return () => {
        echo.leaveChannel("mantenimientos");
        globalThis.removeEventListener(
          "test-mantenimiento-notification",
          handleTestNotification
        );
      };
    } catch (error) {
      console.error("❌ Error al conectar WebSocket:", error);
      console.log("⚠️ La aplicación continuará sin notificaciones en tiempo real");
    }
  }, []);

  /* -------------------- Funciones CRUD de notificaciones -------------------- */

  const addNotification = useCallback((notification: MantenimientoNotification) => {
    const newNotification: StoredNotification = {
      id: crypto.randomUUID(), // ✅ reemplazo seguro de Math.random()
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

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  }, []);

  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.filter((notif) => notif.id !== notificationId)
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem("mantenimiento_notifications");
  }, []);

  // Calcular no leídas
  const unreadCount = notifications.filter((n) => !n.read).length;

  /* -------------------------- Memo del value -------------------------- */
  const value = useMemo<NotificationContextType>(
    () => ({
      notifications,
      unreadCount,
      isConnected,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAll,
    }),
    [
      notifications,
      unreadCount,
      isConnected,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAll,
    ]
  );

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
    throw new Error("useNotifications debe usarse dentro de NotificationProvider");
  }
  return context;
};
