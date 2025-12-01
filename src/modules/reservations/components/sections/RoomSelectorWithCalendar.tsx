/**
 * Room Selector with Calendar - Admin Dashboard Version
 * 
 * Reutiliza los componentes web (RoomCard, RoomAvailabilityCalendar)
 * pero adaptados para el flujo del dashboard
 */

import React, { useState, useEffect } from 'react';
import { Calendar, X } from 'lucide-react';
import type { Room } from '../../../../types/core';
import { roomService } from '../../services/roomService';
import { RoomAvailabilityCalendar } from '../../../web/components/RoomAvailabilityCalendar';
import { formatCurrency } from '../../../web/utils/currency';

interface RoomSelectorWithCalendarProps {
  onRoomAndDatesSelected: (roomId: string, checkIn: string, checkOut: string) => void;
  className?: string;
}

export const RoomSelectorWithCalendar: React.FC<RoomSelectorWithCalendarProps> = ({
  onRoomAndDatesSelected,
  className = '',
}) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  // Load all rooms
  useEffect(() => {
    const loadRooms = async () => {
      try {
        const allRooms = await roomService.getAllRooms();
        setRooms(allRooms);
      } catch (error) {
        console.error('Error loading rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, []);

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    setShowCalendar(true);
  };

  const handleDatesSelected = (checkIn: string, checkOut: string) => {
    if (selectedRoom) {
      onRoomAndDatesSelected(selectedRoom.id, checkIn, checkOut);
      setShowCalendar(false);
    }
  };

  const handleCloseCalendar = () => {
    setShowCalendar(false);
    setSelectedRoom(null);
  };

  // Get unique room types
  const roomTypes = Array.from(new Set(rooms.map(r => r.type)));

  // Filter rooms by type
  const filteredRooms = filterType === 'all' 
    ? rooms 
    : rooms.filter(r => r.type === filterType);

  // Get room type label
  const getRoomTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      single: 'Individual',
      double: 'Doble',
      triple: 'Triple',
      suite: 'Suite',
      family: 'Familiar',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Filter Bar */}
      <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
            filterType === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todas ({rooms.length})
        </button>
        {roomTypes.map(type => {
          const count = rooms.filter(r => r.type === type).length;
          return (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                filterType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {getRoomTypeLabel(type)} ({count})
            </button>
          );
        })}
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRooms.map(room => (
          <button
            key={room.id}
            onClick={() => handleRoomClick(room)}
            className="text-left bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all group"
          >
            {/* Room Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {room.name}
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  {getRoomTypeLabel(room.type)}
                </p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                <Calendar size={18} className="text-blue-600" />
              </div>
            </div>

            {/* Room Details */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Capacidad:</span>
                <span className="font-medium text-gray-900">{room.capacity} personas</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Precio:</span>
                <span className="font-semibold text-blue-600">
                  {formatCurrency(room.pricePerNight)}/noche
                </span>
              </div>
            </div>

            {/* Amenities Preview */}
            {room.amenities && room.amenities.length > 0 && (
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Servicios:</p>
                <div className="flex flex-wrap gap-1">
                  {room.amenities.slice(0, 3).map((amenity) => (
                    <span
                      key={amenity}
                      className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded"
                    >
                      {amenity}
                    </span>
                  ))}
                  {room.amenities.length > 3 && (
                    <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                      +{room.amenities.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Action Hint */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar size={12} />
                Click para ver disponibilidad
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredRooms.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No hay habitaciones de este tipo</p>
        </div>
      )}

      {/* Calendar Modal - Fixed overlay with better visibility */}
      {showCalendar && selectedRoom && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
          onClick={handleCloseCalendar}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Sticky */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white rounded-t-xl">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedRoom.name}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Seleccione las fechas de check-in y check-out
                </p>
              </div>
              <button
                onClick={handleCloseCalendar}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Cerrar"
              >
                <X size={24} />
              </button>
            </div>

            {/* Calendar Component - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <RoomAvailabilityCalendar
                room={selectedRoom}
                onClose={handleCloseCalendar}
                onSelectDates={handleDatesSelected}
                embedded={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomSelectorWithCalendar;
