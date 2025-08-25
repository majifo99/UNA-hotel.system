import React from 'react';
import type { Room } from '../../types';

interface RoomSelectionProps {
  availableRooms: Room[];
  selectedRoomType?: string;
  onRoomSelect: (roomType: string) => void;
  error?: string;
}

export const RoomSelection: React.FC<RoomSelectionProps> = ({
  availableRooms,
  selectedRoomType,
  onRoomSelect,
  error
}) => {
  if (availableRooms.length === 0) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableRooms.map((room) => (
          <div
            key={room.id}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedRoomType === room.type
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onRoomSelect(room.type)}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-medium text-gray-900">{room.name}</h3>
              <input
                type="radio"
                name="roomType"
                checked={selectedRoomType === room.type}
                onChange={() => onRoomSelect(room.type)}
                className="text-blue-600 focus:ring-blue-500"
              />
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Capacidad: {room.capacity} persona{room.capacity !== 1 ? 's' : ''}
            </p>
            <p className="text-lg font-semibold text-green-600 mb-2">
              ₡{room.pricePerNight.toLocaleString()} / noche
            </p>
            <div className="border-t pt-2">
              <p className="text-xs text-gray-500 mb-1">Servicios incluidos:</p>
              <p className="text-xs text-gray-600">{room.amenities.join(', ')}</p>
            </div>
          </div>
        ))}
      </div>
      
      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}
    </>
  );
};
