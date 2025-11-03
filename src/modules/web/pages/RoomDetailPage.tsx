/**
 * Room Detail Page
 * 
 * Displays comprehensive room information with availability calendar
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Room } from '../../../types/core';
import { roomService } from '../../reservations/services/roomService';
import { RoomAvailabilityCalendar } from '../components/RoomAvailabilityCalendar';
import { formatCurrency } from '../utils/currency';

export function RoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCheckIn, setSelectedCheckIn] = useState<string>('');
  const [selectedCheckOut, setSelectedCheckOut] = useState<string>('');

  useEffect(() => {
    const loadRoom = async () => {
      if (!id) return;
      
      try {
        const roomData = await roomService.getRoomById(id);
        setRoom(roomData);
      } catch (error) {
        console.error('Error loading room:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRoom();
  }, [id]);

  const handleSelectDates = (checkIn: string, checkOut: string) => {
    setSelectedCheckIn(checkIn);
    setSelectedCheckOut(checkOut);
  };

  const handleReserve = () => {
    if (room) {
      // Build query params with all necessary data
      const params = new URLSearchParams({
        room: room.id
      });
      
      // If dates are selected, include them so Step 1 can be pre-filled
      if (selectedCheckIn && selectedCheckOut) {
        params.append('checkIn', selectedCheckIn);
        params.append('checkOut', selectedCheckOut);
        
        // Calculate nights for capacity calculation
        const nights = Math.ceil(
          (new Date(selectedCheckOut).getTime() - new Date(selectedCheckIn).getTime()) / 
          (1000 * 60 * 60 * 24)
        );
        params.append('nights', nights.toString());
      }
      
      navigate(`/reservar?${params.toString()}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-una-primary-600" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Habitación no encontrada</h2>
          <Link to="/habitaciones" className="text-una-primary-600 hover:underline">
            Ver todas las habitaciones
          </Link>
        </div>
      </div>
    );
  }

  const getRoomTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      single: 'Individual',
      double: 'Doble',
      triple: 'Triple',
      suite: 'Suite',
      family: 'Familiar'
    };
    return types[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link 
            to="/habitaciones"
            className="inline-flex items-center text-una-primary-600 hover:text-una-primary-700 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a habitaciones
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Room Info */}
          <div className="space-y-6">
            {/* Room Image/Placeholder */}
            <div className="bg-gradient-to-br from-una-primary-100 to-una-primary-200 rounded-lg aspect-video flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto rounded-full bg-una-primary-600 flex items-center justify-center text-white mb-4">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <p className="text-una-primary-600 font-medium">Imagen de la habitación</p>
              </div>
            </div>

            {/* Room Details Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{room.name}</h1>
                  <span className="inline-block bg-una-primary-100 text-una-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                    {getRoomTypeLabel(room.type)}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatCurrency(room.pricePerNight)}
                  </div>
                  <div className="text-sm text-gray-500">por noche</div>
                </div>
              </div>

              {/* Capacity */}
              <div className="flex items-center gap-2 mb-6 text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-medium">Capacidad:</span>
                <span>{room.capacity} {room.capacity === 1 ? 'persona' : 'personas'}</span>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
                <p className="text-gray-600 leading-relaxed">
                  {room.description || `Disfrute de una estancia cómoda en nuestra ${room.name}. Equipada con todas las comodidades modernas para garantizar su confort durante su visita.`}
                </p>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Servicios incluidos</h3>
                <div className="grid grid-cols-2 gap-3">
                  {room.amenities.map((amenity: string, index: number) => (
                    <div
                      key={`${room.id}-amenity-${amenity}-${index}`}
                      className="flex items-center gap-2 text-gray-700"
                    >
                      <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Calendar */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Disponibilidad</h2>
            <p className="text-gray-600 mb-6">Selecciona tus fechas de entrada y salida</p>

            {/* Embed calendar component */}
            <div className="mb-6">
              <RoomAvailabilityCalendar
                room={room}
                onClose={() => {}} // Not used in embedded mode
                onSelectDates={handleSelectDates}
                embedded={true}
              />
            </div>

            {/* Selected dates summary */}
            {selectedCheckIn && selectedCheckOut && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-green-900 mb-2">Fechas seleccionadas</h3>
                <div className="space-y-1 text-sm text-green-800">
                  <div className="flex justify-between">
                    <span>Entrada:</span>
                    <span className="font-medium">
                      {new Date(selectedCheckIn).toLocaleDateString('es-ES', { 
                        weekday: 'short', 
                        day: 'numeric', 
                        month: 'long' 
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Salida:</span>
                    <span className="font-medium">
                      {new Date(selectedCheckOut).toLocaleDateString('es-ES', { 
                        weekday: 'short', 
                        day: 'numeric', 
                        month: 'long' 
                      })}
                    </span>
                  </div>
                  <div className="border-t border-green-300 pt-2 mt-2 flex justify-between font-semibold">
                    <span>Total noches:</span>
                    <span>
                      {Math.ceil(
                        (new Date(selectedCheckOut).getTime() - new Date(selectedCheckIn).getTime()) / 
                        (1000 * 60 * 60 * 24)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Reserve button */}
            <button
              type="button"
              onClick={handleReserve}
              disabled={!room.isAvailable}
              className="w-full px-6 py-3 text-white rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--color-darkGreen1)' }}
            >
              {selectedCheckIn && selectedCheckOut ? 'Reservar estas fechas' : 'Continuar con la reserva'}
            </button>

            {!room.isAvailable && (
              <p className="text-center text-red-600 mt-3 text-sm">
                Esta habitación no está disponible en este momento
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
