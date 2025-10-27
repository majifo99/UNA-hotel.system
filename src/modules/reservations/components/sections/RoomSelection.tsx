import React from 'react';
import type { Room } from '../../types';

interface RoomSelectionProps {
  availableRooms: Room[];
  selectedRoomIds?: string[];
  onRoomSelect: (roomIds: string[]) => void;
  error?: string;
  numberOfGuests?: number;
  allowMultiple?: boolean;
  isGroupReservation?: boolean;
  onToggleGroupReservation?: () => void;
  enableDifferentDates?: boolean;
  onRoomDatesChange?: (roomId: string, dates: { checkIn: string; checkOut: string }) => void;
}

export const RoomSelection: React.FC<RoomSelectionProps> = ({
  availableRooms,
  selectedRoomIds = [],
  onRoomSelect,
  error,
  numberOfGuests = 1,
  allowMultiple = false,
  isGroupReservation = false,
  onToggleGroupReservation,
  enableDifferentDates = false,
  onRoomDatesChange
}) => {
  if (availableRooms.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <svg className="mx-auto h-12 w-12 text-yellow-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-medium text-yellow-800 mb-2">
            No hay habitaciones disponibles
          </h3>
          <p className="text-yellow-700">
            No se encontraron habitaciones disponibles para las fechas seleccionadas. 
            Por favor seleccione otras fechas.
          </p>
        </div>
      </div>
    );
  }

  // En lugar de filtrar habitaciones, mostrar todas y categorizar
  // El usuario debe tener total flexibilidad para elegir cualquier combinación
  const suitableRooms = availableRooms; // Mostrar todas las habitaciones disponibles
  
  // Solo mostrar advertencia si el usuario NO puede lograr la capacidad necesaria
  // ni siquiera combinando todas las habitaciones disponibles
  const totalPossibleCapacity = availableRooms.reduce((sum, room) => sum + room.capacity, 0);
  const isImpossibleToAccommodate = totalPossibleCapacity < numberOfGuests;

  // Calculate recommended number of rooms based on guests
  const calculateRecommendedRooms = () => {
    if (numberOfGuests <= 1) return { 
      count: 1, 
      suggestion: "1 habitación individual" 
    };
    if (numberOfGuests === 2) return { 
      count: 1, 
      suggestion: "Opciones: 1 habitación doble (económico) o 2 habitaciones individuales (privacidad)" 
    };
    if (numberOfGuests === 3) return { 
      count: 1, 
      suggestion: "Opciones: 1 habitación triple/familiar o combinación de habitaciones individuales/dobles" 
    };
    if (numberOfGuests === 4) return { 
      count: 2, 
      suggestion: "Múltiples configuraciones disponibles según preferencias del huésped" 
    };
    if (numberOfGuests <= 6) return { 
      count: Math.ceil(numberOfGuests / 2), 
      suggestion: `Configuración flexible según presupuesto y preferencias del huésped` 
    };
    return { 
      count: Math.ceil(numberOfGuests / 2), 
      suggestion: `${Math.ceil(numberOfGuests / 2)}+ habitaciones - evaluar necesidades específicas del huésped` 
    };
  };

  const roomRecommendation = calculateRecommendedRooms();
  // Permitir selección múltiple para 2+ huéspedes para dar máxima flexibilidad
  const needsMultipleRooms = numberOfGuests >= 2;

  // =================== HELPER FUNCTIONS ===================

  /**
   * Handles recommendations for 2 guests
   */
  const getTwoGuestRecommendations = () => {
    const doubleRooms = availableRooms.filter(room => room.capacity === 2);
    const individualRooms = availableRooms.filter(room => room.capacity === 1);
    
    if (doubleRooms.length > 0 && individualRooms.length >= 2) {
      const doublePrice = doubleRooms[0]?.pricePerNight ?? 0;
      const twoIndividualPrice = individualRooms.slice(0, 2).reduce((sum, room) => sum + (room?.pricePerNight ?? 0), 0);
      
      return {
        message: `🛏️ Opciones para 2 huéspedes: Habitación doble ₡${doublePrice.toLocaleString()} vs. 2 individuales ₡${twoIndividualPrice.toLocaleString()} (consultar preferencia del huésped)`,
        rooms: [...doubleRooms.slice(0, 1), ...individualRooms.slice(0, 2)],
        highlight: true,
        showOptions: true
      };
    }
    return null;
  };

  /**
   * Handles recommendations for 4 guests
   */
  const getFourGuestRecommendations = () => {
    const doubleRooms = availableRooms.filter(room => room.capacity === 2);
    const familyRooms = availableRooms.filter(room => room.capacity >= 4);
    const individualRooms = availableRooms.filter(room => room.capacity === 1);
    
    if (doubleRooms.length >= 2) {
      const totalDoublePrice = doubleRooms.slice(0, 2).reduce((sum, room) => sum + (room?.pricePerNight ?? 0), 0);
      const familyPrice = familyRooms.length > 0 ? (familyRooms[0]?.pricePerNight ?? Infinity) : Infinity;
      const fourIndividualPrice = individualRooms.length >= 4 ? 
        individualRooms.slice(0, 4).reduce((sum, room) => sum + (room?.pricePerNight ?? 0), 0) : Infinity;
      
      const options = [
        `2 dobles: ₡${totalDoublePrice.toLocaleString()}`,
        familyPrice !== Infinity ? `1 familiar: ₡${familyPrice.toLocaleString()}` : null,
        fourIndividualPrice !== Infinity ? `4 individuales: ₡${fourIndividualPrice.toLocaleString()}` : null
      ].filter(Boolean).join(' | ');
      
      return {
        message: `🏨 Configuraciones disponibles para 4 huéspedes: ${options}`,
        rooms: [],
        highlight: true,
        showOptions: true
      };
    }
    return null;
  };

  /**
   * Handles recommendations for large groups (6+ guests)
   */
  const getLargeGroupRecommendations = () => {
    return {
      message: `💼 Grupo grande (${numberOfGuests} huéspedes): Considerar activar modo de reserva grupal para gestionar fechas diferentes por habitación`,
      rooms: [],
      highlight: false,
      showGroupToggle: true
    };
  };

  // Función para obtener recomendaciones específicas de habitaciones
  // Implementa lógica inteligente para sugerir habitaciones óptimas según el número de huéspedes
  const getSpecificRoomRecommendations = () => {
    if (numberOfGuests === 2) {
      return getTwoGuestRecommendations();
    }
    
    if (numberOfGuests === 4) {
      return getFourGuestRecommendations();
    }
    
    if (numberOfGuests >= 6) {
      return getLargeGroupRecommendations();
    }
    
    return null;
  };

  const specificRecommendation = getSpecificRoomRecommendations();

  // Removed auto-selection to give users full control and flexibility

  // Handle room selection
  const handleRoomSelection = (roomId: string) => {
    if (allowMultiple || needsMultipleRooms || isGroupReservation) {
      if (selectedRoomIds.includes(roomId)) {
        // Remove room
        onRoomSelect(selectedRoomIds.filter(id => id !== roomId));
      } else {
        // Add room
        onRoomSelect([...selectedRoomIds, roomId]);
      }
    } else {
      // Single selection
      onRoomSelect([roomId]);
    }
  };

  // Calculate total capacity of selected rooms
  const selectedRooms = availableRooms.filter(room => selectedRoomIds.includes(room.id));
  const totalCapacity = selectedRooms.reduce((sum, room) => sum + room.capacity, 0);
  const capacityStatus = totalCapacity >= numberOfGuests ? 'sufficient' : 'insufficient';

  return (
    <>
      {/* Group Reservation Toggle */}
      {onToggleGroupReservation && (
        <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-purple-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
              </svg>
              <div>
                <h4 className="text-sm font-medium text-purple-800">Reserva Grupal</h4>
                <p className="text-sm text-purple-700">
                  {isGroupReservation 
                    ? 'Modo activado: Cada habitación puede tener fechas diferentes'
                    : 'Activar para permitir fechas diferentes por habitación (ideal para grupos)'
                  }
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleGroupReservation}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                isGroupReservation ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isGroupReservation ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      )}

      {/* Recomendación específica para 4 huéspedes */}
      {specificRecommendation && (
        <div className="mb-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-emerald-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L3 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.734.99A.996.996 0 0118 6v2a1 1 0 11-2 0v-.277l-1.254.145a1 1 0 11-.992-1.736L14.984 6l-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.723V11a1 1 0 11-2 0v-.277l-1.246-.855a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.277l1.254.145a1 1 0 01-.992 1.736l-1.734-.99A.996.996 0 012 13v-1a1 1 0 011-1zm14 0a1 1 0 011 1v1a.996.996 0 01-.52.878l-1.734.99a1 1 0 11-.992-1.736L16 12.277V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364-.372l.254.145V16a1 1 0 112 0v.277l.254-.145a1 1 0 11.992 1.736l-1.735.992a.995.995 0 01-1.022 0l-1.735-.992a1 1 0 01-.372-1.364z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-emerald-800 font-medium">{specificRecommendation.message}</p>
                <p className="text-sm text-emerald-700 mt-1">
                  Habitaciones disponibles: {specificRecommendation.rooms.map(room => room.name).join(', ')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show recommendation for multiple rooms */}
      {(needsMultipleRooms || isGroupReservation) && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm text-blue-800">
                <strong>Información para recepcionista:</strong> 
                {isGroupReservation ? (
                  <>Modo grupal activado. Cada habitación puede configurarse con fechas independientes para mayor flexibilidad.</>
                ) : (
                  <>Para {numberOfGuests} huésped{numberOfGuests > 1 ? 'es' : ''}: 
                  {roomRecommendation.suggestion}. 
                  Seleccione las habitaciones más adecuadas según las preferencias del cliente.</>
                )}
              </p>
              {selectedRoomIds.length > 0 && (
                <p className="text-xs text-blue-600 mt-1">
                  Habitaciones seleccionadas: {selectedRoomIds.length}
                  {!isGroupReservation && (
                    <> | Capacidad total: {totalCapacity} huésped{totalCapacity > 1 ? 'es' : ''}
                    {capacityStatus === 'insufficient' && (
                      <span className="text-red-600 font-medium"> - Capacidad insuficiente</span>
                    )}
                    {capacityStatus === 'sufficient' && (
                      <span className="text-green-600 font-medium"> - Capacidad suficiente ✓</span>
                    )}</>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Show warning only if it's impossible to accommodate all guests */}
      {isImpossibleToAccommodate && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm text-red-800">
                <strong>¡Atención!</strong> La capacidad total de todas las habitaciones disponibles ({totalPossibleCapacity} personas) 
                es menor que el número de huéspedes ({numberOfGuests}). Necesitará reservar fechas adicionales o reducir el número de huéspedes.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suitableRooms.map((room) => {
          const isSelected = selectedRoomIds.includes(room.id);
          const hasExactCapacity = room.capacity === numberOfGuests;
          
          return (
            <div
              key={room.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md relative ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleRoomSelection(room.id)}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{room.name}</h3>
                  <p className="text-sm text-blue-600 font-medium">{room.type}</p>
                </div>
                <input
                  type={(needsMultipleRooms || isGroupReservation) ? "checkbox" : "radio"}
                  name={(needsMultipleRooms || isGroupReservation) ? undefined : "selectedRoom"}
                  value={room.id}
                  checked={isSelected}
                  onChange={(e) => {
                    e.stopPropagation(); // Prevenir que se ejecute también el onClick del div
                    handleRoomSelection(room.id);
                  }}
                  onClick={(e) => e.stopPropagation()} // Prevenir bubbling del click
                  className="text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Capacidad: {room.capacity} persona{room.capacity !== 1 ? 's' : ''}
                  {hasExactCapacity && (
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Ideal
                    </span>
                  )}
                </div>

                <p className="text-lg font-semibold text-green-600">
                  ₡{room.pricePerNight.toLocaleString()} / noche
                </p>
              </div>

              <div className="border-t pt-3">
                <p className="text-xs text-gray-500 mb-1">Servicios incluidos:</p>
                <div className="flex flex-wrap gap-1">
                  {room.amenities.slice(0, 3).map((amenity, index) => (
                    <span key={`${room.id}-${amenity}-${index}`} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {amenity}
                    </span>
                  ))}
                  {room.amenities.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{room.amenities.length - 3} más
                    </span>
                  )}
                </div>
              </div>

              {/* Fechas individuales para reservas grupales */}
              {isGroupReservation && isSelected && enableDifferentDates && (
                <div className="border-t pt-3 mt-3">
                  <p className="text-xs font-medium text-gray-700 mb-2">Fechas específicas para esta habitación:</p>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-gray-600">Check-in:</label>
                      <input
                        type="date"
                        className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        onChange={(e) => onRoomDatesChange?.(room.id, { checkIn: e.target.value, checkOut: '' })}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600">Check-out:</label>
                      <input
                        type="date"
                        className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        onChange={(e) => onRoomDatesChange?.(room.id, { checkIn: '', checkOut: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="h-4 w-4 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Capacity validation warning */}
      {selectedRoomIds.length > 0 && capacityStatus === 'insufficient' && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <svg className="h-4 w-4 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-yellow-800">
              Las habitaciones seleccionadas tienen capacidad para {totalCapacity} huésped{totalCapacity > 1 ? 'es' : ''}, 
              pero necesita acomodar {numberOfGuests}. Seleccione habitaciones adicionales.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
