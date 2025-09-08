/**
 * RoomCard Component - Reusable Room Display Card for Web
 * 
 * Displays room information with consistent styling and actions
 */

import { Link } from 'react-router-dom';
import type { Room } from '../../../types/core';

interface RoomCardProps {
  readonly room: Room;
  readonly showReserveButton?: boolean;
  readonly className?: string;
}

export function RoomCard({ 
  room, 
  showReserveButton = true,
  className = ""
}: RoomCardProps) {
  // Función para obtener el color de fondo según el tipo de habitación
  const getRoomGradient = (roomType: string) => {
    switch (roomType) {
      case 'single':
        return 'from-una-bg-200 to-una-bg-300';
      case 'double':
        return 'from-una-accent-gold/20 to-una-accent-gold/40';
      case 'triple':
        return 'from-una-primary-600/20 to-una-primary-600/40';
      case 'suite':
        return 'from-una-primary-800/30 to-una-primary-900/50';
      case 'family':
        return 'from-una-bg-100 to-una-bg-300';
      default:
        return 'from-gray-200 to-gray-300';
    }
  };

  // Función para formatear el precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Función para obtener el ícono según el tipo de habitación
  const getRoomIcon = (roomType: string) => {
    switch (roomType) {
      case 'single':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'double':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'suite':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'family':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          </svg>
        );
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${className}`}>
      {/* Room Image/Gradient */}
      <div className={`h-48 bg-gradient-to-br ${getRoomGradient(room.type)} flex items-center justify-center`}>
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center text-white"
          style={{ backgroundColor: 'var(--color-darkGreen1)' }}
        >
          {getRoomIcon(room.type)}
        </div>
      </div>
      
      {/* Room Content */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-una-primary-900">{room.name}</h3>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {room.capacity} {room.capacity === 1 ? 'persona' : 'personas'}
          </span>
        </div>
        
        {/* Amenities */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Servicios incluidos:</h4>
          <div className="flex flex-wrap gap-1">
            {room.amenities.slice(0, 3).map((amenity: string, index: number) => (
              <span
                key={`${room.id}-amenity-${amenity}-${index}`}
                className="text-xs bg-una-bg-200 text-una-primary-900 px-2 py-1 rounded-full"
              >
                {amenity}
              </span>
            ))}
            {room.amenities.length > 3 && (
              <span className="text-xs text-gray-500 px-2 py-1">
                +{room.amenities.length - 3} más
              </span>
            )}
          </div>
        </div>

        {/* Price and Action */}
        <div className="flex justify-between items-center">
          <div>
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(room.pricePerNight)}
            </span>
            <span className="text-sm text-gray-500">/noche</span>
          </div>
          
          {showReserveButton && room.isAvailable && (
            <Link
              to={`/reservar?room=${room.id}`}
              className="px-4 py-2 text-white rounded-md hover:opacity-90 transition-opacity font-medium"
              style={{ backgroundColor: 'var(--color-darkGreen1)' }}
            >
              Reservar
            </Link>
          )}
          
          {!room.isAvailable && (
            <span className="px-4 py-2 bg-gray-300 text-gray-600 rounded-md font-medium cursor-not-allowed">
              No disponible
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
