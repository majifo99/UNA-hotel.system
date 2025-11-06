"use client";

import React from "react";
import { Check, X } from "lucide-react";
import type { StoredNotification } from "../../types/notifications";

interface Props {
  notification: StoredNotification;
  onClick: () => void;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export const NotificationItem: React.FC<Props> = ({
  notification,
  onClick,
  onMarkAsRead,
  onDelete,
}) => {
  const getPriorityColor = (prioridad: string): string => {
    switch (prioridad) {
      case "urgente":
        return "bg-red-100 text-red-800 border-red-300";
      case "alta":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "media":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "baja":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return `Hace ${diffDays} días`;

    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
  };

  return (
    <button
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className={`w-full text-left px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
        notification.read ? "" : "bg-blue-50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold text-gray-900 truncate">
              {notification.title}
            </h4>
            {!notification.read && (
              <span className="flex-shrink-0 h-2 w-2 bg-blue-500 rounded-full" />
            )}
          </div>

          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-medium text-[var(--color-darkGreen2)]">
              Hab. {notification.habitacion}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">{notification.asignado_a}</span>
            {notification.prioridad && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(
                  notification.prioridad
                )}`}
              >
                {notification.prioridad.toUpperCase()}
              </span>
            )}
          </div>

          <p className="text-xs text-gray-400 mt-1">
            {formatTimestamp(notification.timestamp)}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          {!notification.read && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
              className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
              title="Marcar como leída"
            >
              <Check size={16} />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
            title="Eliminar"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </button>
  );
};
