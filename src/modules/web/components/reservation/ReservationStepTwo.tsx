/**
 * Reservation Step Two - Room Selection
 * 
 * Second step: select rooms with capacity warnings and special requests hints
 */

import { useState } from 'react';
import type { Room } from '../../../../types/core';
import { RoomCard } from '../RoomCard';

interface ReservationStepTwoProps {
  readonly checkIn: string;
  readonly checkOut: string;
  readonly adults: number;
  readonly children: number;
  readonly availableRooms: Room[];
  readonly preSelectedRoomIds: string[];
  readonly onComplete: (data: { selectedRoomIds: string[] }) => void;
  readonly onBack: () => void;
  readonly capacityWarning: string;
  readonly showSpecialRequestsHint: boolean;
}

export function ReservationStepTwo({
  checkIn,
  checkOut,
  adults,
  children,
  availableRooms,
  preSelectedRoomIds,
  onComplete,
  onBack,
  capacityWarning,
  showSpecialRequestsHint
}: ReservationStepTwoProps) {
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>(preSelectedRoomIds);
  const [showAllRooms, setShowAllRooms] = useState(false);

  const totalGuests = adults + children;

  // Calculate nights for pricing
  const calculateNights = (): number => {
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
      return Math.ceil(timeDiff / (1000 * 3600 * 24));
    }
    return 1;
  };

  const nights = calculateNights();

  // Get room recommendations based on guest count
  const getRoomRecommendations = () => {
    const recommendations = [];
    
    if (totalGuests <= 2) {
      recommendations.push({
        title: "Recomendado para parejas",
        rooms: availableRooms.filter(room => room.type === 'double' && room.capacity >= totalGuests)
      });
    }
    
    if (totalGuests >= 3) {
      recommendations.push({
        title: "Habitaciones familiares",
        rooms: availableRooms.filter(room => room.type === 'family' && room.capacity >= totalGuests)
      });
      
      recommendations.push({
        title: "Suites espaciosas",
        rooms: availableRooms.filter(room => room.type === 'suite' && room.capacity >= totalGuests)
      });
    }

    // Add "All rooms" section
    recommendations.push({
      title: "Todas las habitaciones disponibles",
      rooms: availableRooms
    });

    return recommendations.filter(rec => rec.rooms.length > 0);
  };

  const recommendations = getRoomRecommendations();

  const handleRoomToggle = (roomId: string) => {
    setSelectedRoomIds(prev => {
      if (prev.includes(roomId)) {
        return prev.filter(id => id !== roomId);
      } else {
        return [...prev, roomId];
      }
    });
  };

  const getSelectedRooms = () => {
    return availableRooms.filter(room => selectedRoomIds.includes(room.id));
  };

  const calculateTotalPrice = () => {
    const selectedRooms = getSelectedRooms();
    return selectedRooms.reduce((total, room) => total + room.pricePerNight, 0) * nights;
  };

  const calculateTotalCapacity = () => {
    const selectedRooms = getSelectedRooms();
    return selectedRooms.reduce((total, room) => total + room.capacity, 0);
  };

  const canContinue = selectedRoomIds.length > 0;

  const handleContinue = () => {
    if (canContinue) {
      onComplete({ selectedRoomIds });
    }
  };

  // Format price in Costa Rican colones
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Selecciona tus habitaciones</h2>
        <p className="text-gray-600">
          {totalGuests} huésped{totalGuests !== 1 ? 'es' : ''} • {nights} noche{nights !== 1 ? 's' : ''} • {checkIn} - {checkOut}
        </p>
      </div>

      {/* Selection Summary */}
      {selectedRoomIds.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-green-800 mb-2">Habitaciones seleccionadas:</h3>
          <div className="space-y-2">
            {getSelectedRooms().map(room => (
              <div key={room.id} className="flex justify-between items-center text-sm">
                <span className="text-green-700">{room.name}</span>
                <span className="text-green-800 font-medium">{formatPrice(room.pricePerNight)}/noche</span>
              </div>
            ))}
          </div>
          <div className="border-t border-green-200 mt-3 pt-3 flex justify-between items-center">
            <span className="text-green-800 font-medium">
              Capacidad total: {calculateTotalCapacity()} persona{calculateTotalCapacity() !== 1 ? 's' : ''}
            </span>
            <span className="text-green-800 font-bold">
              Total: {formatPrice(calculateTotalPrice())}
            </span>
          </div>
        </div>
      )}

      {/* Capacity Warning with Special Requests Hint */}
      {capacityWarning && showSpecialRequestsHint && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-orange-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-orange-800 font-medium">💡 Puede continuar con su reserva</h3>
              <p className="text-orange-700 text-sm mt-1">
                En el siguiente paso podrá solicitar <strong>camas extra, cunas, sofás cama</strong> o cualquier acomodación especial 
                para los huéspedes adicionales. Nuestro equipo se encargará de preparar la habitación según sus necesidades.
              </p>
              <div className="mt-2 text-xs text-orange-600">
                <strong>Servicios disponibles:</strong> Camas plegables • Cunas para bebés • Sofás cama • Almohadas extra • Amenidades adicionales
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Room Recommendations */}
      <div className="space-y-8">
        {recommendations.map((recommendation, index) => (
          <div key={`recommendation-${recommendation.title.replace(/\s+/g, '-').toLowerCase()}-${index}`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              {recommendation.title}
              {index === 0 && totalGuests <= 2 && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Recomendado
                </span>
              )}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendation.rooms.slice(0, showAllRooms || index < recommendations.length - 1 ? undefined : 6).map(room => (
                <div key={room.id} className="relative">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={selectedRoomIds.includes(room.id)}
                    className={`border-2 rounded-lg transition-all cursor-pointer w-full text-left ${
                      selectedRoomIds.includes(room.id)
                        ? 'border-current shadow-lg'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    style={{ borderColor: selectedRoomIds.includes(room.id) ? 'var(--color-darkGreen1)' : undefined }}
                    onClick={() => handleRoomToggle(room.id)}
                  >
                    <RoomCard 
                      room={room} 
                      showReserveButton={false}
                      className="h-full"
                    />
                    
                    {/* Selection Indicator */}
                    {selectedRoomIds.includes(room.id) && (
                      <div 
                        className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'var(--color-darkGreen1)' }}
                      >
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}

                    {/* Capacity Indicator */}
                    <div className="absolute top-4 left-4">
                      <span 
                        className={`px-2 py-1 text-xs rounded-full ${
                          room.capacity >= totalGuests 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {room.capacity} persona{room.capacity !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </button>
                </div>
              ))}
            </div>

            {/* Show More Button for last section */}
            {index === recommendations.length - 1 && !showAllRooms && recommendation.rooms.length > 6 && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setShowAllRooms(true)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Ver todas las habitaciones ({recommendation.rooms.length})
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Multiple Selection Hint */}
      {totalGuests > 2 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm">
              <p className="text-blue-800 font-medium">💡 Consejo</p>
              <p className="text-blue-700">
                Puede seleccionar múltiples habitaciones para mayor comodidad y privacidad de su grupo.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← Volver a Fechas
        </button>
        
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className={`px-8 py-3 font-semibold rounded-lg transition-opacity ${
            canContinue
              ? 'text-white hover:opacity-90'
              : 'text-gray-400 bg-gray-200 cursor-not-allowed'
          }`}
          style={{ 
            backgroundColor: canContinue ? 'var(--color-darkGreen1)' : undefined 
          }}
        >
          Continuar a Información Personal →
        </button>
      </div>
    </div>
  );
}
