import React from 'react';
import type { FrontdeskRoom, FrontdeskRoomStatus } from '../../types';

interface RoomDetailsModalProps {
  room: FrontdeskRoom | null;
  onClose: () => void;
}

// Room status colors mapping
const ROOM_STATUS_COLORS: Record<FrontdeskRoomStatus, string> = {
  available: '#10B981',
  occupied: '#EF4444',
  reserved: '#8B5CF6',
  'checked-in': '#EF4444', 
  'checked-out': '#F97316',
  maintenance: '#F59E0B',
  cleaning: '#A855F7'
};

// Status labels mapping
const STATUS_LABELS: Record<FrontdeskRoomStatus, string> = {
  available: 'Disponible',
  occupied: 'Ocupada',
  reserved: 'Reservada',
  'checked-in': 'Ocupada',
  'checked-out': 'Check-out',
  maintenance: 'Mantenimiento',
  cleaning: 'Limpieza'
};

const RoomDetailsModal: React.FC<RoomDetailsModalProps> = ({ room, onClose }) => {
  if (!room) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 m-4 max-w-md w-full shadow-2xl border border-white/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Habitación {room.roomNumber}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Tipo:</span>
            <span className="font-medium">{room.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Capacidad:</span>
            <span className="font-medium">{room.capacity} personas</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Estado:</span>
            <span 
              className="px-2 py-1 rounded text-xs font-medium text-white"
              style={{ backgroundColor: ROOM_STATUS_COLORS[room.status] }}
            >
              {STATUS_LABELS[room.status]}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Precio por noche:</span>
            <span className="font-medium">${room.pricePerNight}</span>
          </div>
          {room.guestName && (
            <div className="flex justify-between">
              <span className="text-gray-600">Huésped:</span>
              <span className="font-medium">{room.guestName}</span>
            </div>
          )}
          {room.description && (
            <div className="pt-2">
              <span className="text-gray-600">Descripción:</span>
              <p className="text-sm mt-1">{room.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomDetailsModal;
