"use client";

import React from "react";
import {CheckCheck, Trash2, Bell } from "lucide-react";
import type { StoredNotification } from "../../types/notifications";
import { NotificationItem } from "../UI/NotificationItem";

interface Props {
  notifications: StoredNotification[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  navigate: (path: string) => void;
  onClose: () => void;
}

/**
 * Panel desplegable de notificaciones
 */
export const NotificationDropdown: React.FC<Props> = ({
  notifications,
  unreadCount,
  isConnected,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAll,
  navigate,
  onClose,
}) => {
  const handleNotificationClick = (notification: StoredNotification) => {
    markAsRead(notification.id);
    onClose();
    navigate("/mantenimiento");
  };

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-[100] max-h-[600px] flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
          <p className="text-xs text-gray-500">
            {unreadCount > 0 ? `${unreadCount} sin leer` : "Todo al día"}
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                title="Marcar todas como leídas"
              >
                <CheckCheck size={14} /> Marcar todas
              </button>
            )}
            <button
              onClick={clearAll}
              className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
              title="Limpiar todas"
            >
              <Trash2 size={14} /> Limpiar
            </button>
          </div>
        )}
      </div>

      {/* Lista */}
      <div className="overflow-y-auto flex-1">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Bell size={48} className="text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No hay notificaciones</p>
            <p className="text-xs text-gray-400 mt-1">
              Los nuevos mantenimientos aparecerán aquí
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {notifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onClick={() => handleNotificationClick(n)}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Estado del servidor:</span>
          <span
            className={`flex items-center gap-1 font-medium ${
              isConnected ? "text-green-600" : "text-gray-500"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isConnected ? "bg-green-500" : "bg-gray-400"
              }`}
            />
            {isConnected ? "Conectado" : "Desconectado"}
          </span>
        </div>
      </div>
    </div>
  );
};
