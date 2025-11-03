import type { Prioridad } from './limpieza';

/**
 * Tipos para el sistema de notificaciones de limpieza
 */

/**
 * Notificación recibida desde el WebSocket
 */
export type LimpiezaNotification = {
  title: string;
  message: string;
  data: LimpiezaNotificationData;
  timestamp?: string;
};

/**
 * Datos específicos de la notificación de limpieza
 */
export type LimpiezaNotificationData = {
  id: number;
  habitacion: string;
  asignado_a: string;
  estado: string;
  fecha: string;
  prioridad: Prioridad;
};

/**
 * Notificación almacenada en el estado local
 */
export type StoredNotification = {
  id: string;
  title: string;
  message: string;
  habitacion: string;
  asignado_a: string;
  estado: string;
  fecha: string;
  prioridad: Prioridad;
  limpieza_id: number;
  timestamp: string;
  read: boolean;
};

/**
 * Estado del contexto de notificaciones
 */
export type NotificationContextState = {
  notifications: StoredNotification[];
  unreadCount: number;
  isConnected: boolean;
};

/**
 * Acciones del contexto de notificaciones
 */
export type NotificationContextActions = {
  addNotification: (notification: LimpiezaNotification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAll: () => void;
};

/**
 * Tipo completo del contexto
 */
export type NotificationContextType = NotificationContextState & NotificationContextActions;