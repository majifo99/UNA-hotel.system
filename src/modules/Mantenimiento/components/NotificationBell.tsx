import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, Trash2 } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import type { StoredNotification } from '../types/notifications';

// 🧪 Función de prueba para simular notificación (TEMPORAL - solo para debug)
(globalThis as any).testMantenimientoNotification = () => {
  const event = new CustomEvent('test-mantenimiento-notification', {
    detail: {
      title: 'Nuevo mantenimiento asignado (PRUEBA)',
      message: 'Esta es una notificación de prueba',
      data: {
        id: 999,
        habitacion: '101',
        asignado_a: 'Usuario de Prueba',
        estado: 'En Mantenimiento',
        fecha: new Date().toISOString(),
        prioridad: 'alta',
      },
    },
  });
  globalThis.dispatchEvent(event);
  console.log('🧪 Notificación de prueba enviada');
};

/**
 * Componente de campana de notificaciones para mantenimientos
 *
 * Muestra:
 * - Campana con contador de notificaciones no leídas
 * - Panel dropdown con lista de notificaciones
 * - Acciones: marcar como leída, eliminar, ver detalles
 */
export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Cerrar con tecla ESC
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleNotificationClick = (notification: StoredNotification) => {
    markAsRead(notification.id);
    setIsOpen(false);
    navigate('/mantenimiento');
  };

  const handleMarkAsRead = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    markAsRead(notificationId);
  };

  const handleDelete = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    deleteNotification(notificationId);
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;

    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  };

  const getPriorityColor = (prioridad: string): string => {
    switch (prioridad) {
      case 'urgente':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'alta':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'media':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'baja':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Campana */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-darkGreen2)]"
        aria-label="Notificaciones"
        title={`${unreadCount} notificaciones no leídas`}
      >
        <Bell
          size={24}
          className={`${
            unreadCount > 0 ? 'text-[var(--color-darkGreen2)]' : 'text-gray-600'
          } transition-colors`}
        />

        {/* Badge de notificaciones no leídas */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}

        {/* Indicador de conexión */}
        <span
          className={`absolute bottom-1 right-1 h-2 w-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-gray-400'
          }`}
          title={isConnected ? 'Conectado' : 'Desconectado'}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-[100] max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
              <p className="text-xs text-gray-500">
                {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}
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
                    <CheckCheck size={14} />
                    Marcar todas
                  </button>
                )}
                <button
                  onClick={clearAll}
                  className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                  title="Limpiar todas"
                >
                  <Trash2 size={14} />
                  Limpiar
                </button>
              </div>
            )}
          </div>

          {/* Lista de notificaciones */}
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
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNotificationClick(notification)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                      notification.read ? '' : 'bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Título y badge */}
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <span className="flex-shrink-0 h-2 w-2 bg-blue-500 rounded-full" />
                          )}
                        </div>

                        {/* Mensaje */}
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>

                        {/* Detalles */}
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

                        {/* Timestamp */}
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>

                      {/* Acciones */}
                      <div className="flex flex-col gap-1">
                        {!notification.read && (
                          <button
                            onClick={(e) => handleMarkAsRead(e, notification.id)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            title="Marcar como leída"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDelete(e, notification.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                          title="Eliminar"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </button>
                ))}
              </ul>
            )}
          </div>

          {/* Footer con estado de conexión */}
          <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Estado del servidor:</span>
              <span
                className={`flex items-center gap-1 font-medium ${
                  isConnected ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isConnected ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                />
                {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
