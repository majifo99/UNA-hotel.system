/**
 * Quick Availability Widget
 * 
 * Widget compacto para verificar disponibilidad rápidamente desde cualquier página
 * Útil para el dashboard de FrontDesk y otras vistas
 */

import React, { useState } from 'react';
import { Calendar, Users, Search, X } from 'lucide-react';
import { useRoomAvailabilityCheck } from '../../hooks/useRoomAvailabilityCheck';

interface QuickAvailabilityWidgetProps {
  onViewRooms?: (checkIn: string, checkOut: string, guests: number) => void;
  className?: string;
  compact?: boolean;
}

export const QuickAvailabilityWidget: React.FC<QuickAvailabilityWidgetProps> = ({
  onViewRooms,
  className = '',
  compact = false,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [guests, setGuests] = useState(2);
  const [isExpanded, setIsExpanded] = useState(!compact);

  const availabilityCheck = useRoomAvailabilityCheck(
    checkIn,
    checkOut,
    guests
  );

  const handleSearch = () => {
    if (onViewRooms && availabilityCheck.isAvailable) {
      onViewRooms(checkIn, checkOut, guests);
    }
  };

  const getStatusDisplay = () => {
    if (availabilityCheck.isChecking) {
      return {
        text: 'Verificando...',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
      };
    }
    
    if (availabilityCheck.errorMessage) {
      return {
        text: availabilityCheck.errorMessage,
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
      };
    }
    
    if (availabilityCheck.isAvailable) {
      const count = availabilityCheck.availableRooms.length;
      return {
        text: `${count} habitación${count === 1 ? '' : 'es'} disponible${count === 1 ? '' : 's'}`,
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
      };
    }
    
    if (availabilityCheck.hasChecked && !availabilityCheck.isAvailable) {
      return {
        text: 'No hay habitaciones disponibles',
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
      };
    }
    
    return {
      text: 'Ingrese fechas para verificar',
      color: 'text-gray-600',
      bg: 'bg-gray-50',
      border: 'border-gray-200',
    };
  };

  const status = getStatusDisplay();

  if (compact && !isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${className}`}
      >
        <Search size={18} />
        <span className="font-medium">Verificar Disponibilidad</span>
      </button>
    );
  }

  return (
    <div className={`bg-white border border-gray-300 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search size={18} className="text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-800">Verificar Disponibilidad</h3>
        </div>
        {compact && (
          <button
            onClick={() => setIsExpanded(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Form */}
      <div className="p-4 space-y-3">
        {/* Fechas */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
              <Calendar size={14} />
              Check-in
            </label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              min={today}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
              <Calendar size={14} />
              Check-out
            </label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={checkIn || today}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Huéspedes */}
        <div>
          <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
            <Users size={14} />
            Número de huéspedes
          </label>
          <input
            type="number"
            value={guests}
            onChange={(e) => setGuests(Math.max(1, Number.parseInt(e.target.value, 10) || 1))}
            min="1"
            max="10"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Status Display */}
        <div className={`px-3 py-2 rounded-md border ${status.bg} ${status.border}`}>
          <p className={`text-xs font-medium ${status.color}`}>{status.text}</p>
          {availabilityCheck.isAvailable && availabilityCheck.availableRooms.length > 0 && (
            <div className="mt-2 space-y-1">
              {availabilityCheck.availableRooms.slice(0, 3).map((room) => (
                <div key={room.id} className="text-xs text-gray-600">
                  • {room.name} - Capacidad: {room.capacity} personas
                </div>
              ))}
              {availabilityCheck.availableRooms.length > 3 && (
                <p className="text-xs text-gray-500 italic">
                  +{availabilityCheck.availableRooms.length - 3} más...
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        {onViewRooms && availabilityCheck.isAvailable && (
          <button
            onClick={handleSearch}
            className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Search size={16} />
            Ver Habitaciones Disponibles
          </button>
        )}
      </div>
    </div>
  );
};

export default QuickAvailabilityWidget;
