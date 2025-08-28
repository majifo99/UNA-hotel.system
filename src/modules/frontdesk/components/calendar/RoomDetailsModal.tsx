import React from 'react';
import type { RoomDetailsModalProps } from '../../types/calendar';
import { ROOM_STATUS_COLORS, STATUS_LABELS } from '../../constants/calendar';

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
          {room.guestName && (
            <div className="flex justify-between">
              <span className="text-gray-600">Huésped:</span>
              <span className="font-medium">{room.guestName}</span>
            </div>
          )}
          {room.checkIn && room.checkOut && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600">Check-in:</span>
                <span className="font-medium">
                  {new Date(room.checkIn).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Check-out:</span>
                <span className="font-medium">
                  {new Date(room.checkOut).toLocaleDateString()}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomDetailsModal;
