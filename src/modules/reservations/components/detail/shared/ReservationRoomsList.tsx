/**
 * Componente: ReservationRoomsList
 * Muestra la lista de habitaciones asociadas a la reserva
 * con sus fechas individuales y cantidad de huéspedes (PAX)
 */

import React from 'react';
import { Home, Calendar, Users } from 'lucide-react';
import type { Reservation } from '../../../types';

interface ReservationRoomsListProps {
  reservation: Reservation;
}

const dateFormatter = new Intl.DateTimeFormat('es-CR', {
  dateStyle: 'medium',
});

const currencyFormatter = new Intl.NumberFormat('es-CR', {
  style: 'currency',
  currency: 'CRC',
  maximumFractionDigits: 0,
});

/**
 * Calculate nights between two dates
 */
function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export const ReservationRoomsList: React.FC<ReservationRoomsListProps> = ({ reservation }) => {
  // Get rooms from reservation metadata (if available)
  // For now, we'll show a single room card as fallback
  // In the future, this will iterate over reservation.rooms[] array
  
  const hasRoom = reservation.room || reservation.roomType;
  
  if (!hasRoom) {
    return (
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-700">
          <Home className="h-4 w-4" />
          Habitaciones
        </h3>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-900">No hay habitaciones asignadas a esta reserva.</p>
        </div>
      </section>
    );
  }

  const nights = calculateNights(reservation.checkInDate, reservation.checkOutDate);
  const roomPrice = reservation.room?.basePrice || reservation.room?.pricePerNight || 0;

  return (
    <section>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-700">
        <Home className="h-4 w-4" />
        Habitaciones
      </h3>
      
      <div className="space-y-4">
        {/* Room Card */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          {/* Room Header */}
          <div className="mb-3 flex items-start justify-between">
            <div>
              <h4 className="text-lg font-semibold text-slate-900">
                {reservation.room?.name || reservation.roomType || 'Habitación'}
              </h4>
              {reservation.room?.number && (
                <p className="mt-1 text-sm text-slate-600">N\u00ba {reservation.room.number}</p>
              )}
              {reservation.room?.description && (
                <p className="mt-1 text-sm text-slate-600">{reservation.room.description}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-500">Capacidad</p>
              <p className="text-2xl font-bold text-slate-900">{reservation.room?.capacity || 0}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="mb-3 grid grid-cols-2 gap-3 border-t border-slate-200 pt-3">
            <div>
              <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                <Calendar className="h-3 w-3" />
                Check-in
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {dateFormatter.format(new Date(reservation.checkInDate))}
              </p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                <Calendar className="h-3 w-3" />
                Check-out
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {dateFormatter.format(new Date(reservation.checkOutDate))}
              </p>
            </div>
          </div>

          {/* Duration */}
          {nights > 0 && (
            <div className="mb-3 rounded bg-white px-3 py-2">
              <p className="text-sm text-slate-600">
                Duración: <strong>{nights}</strong> noche{nights === 1 ? '' : 's'}
              </p>
            </div>
          )}

          {/* PAX (Guests) */}
          <div className="mb-3 border-t border-slate-200 pt-3">
            <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
              <Users className="h-3 w-3" />
              Huéspedes (PAX)
            </p>
            <div className="flex gap-4 text-sm text-slate-600">
              {reservation.numberOfAdults > 0 && (
                <span>
                  👤 {reservation.numberOfAdults} adulto{reservation.numberOfAdults > 1 ? 's' : ''}
                </span>
              )}
              {reservation.numberOfChildren > 0 && (
                <span>
                  👶 {reservation.numberOfChildren} niño{reservation.numberOfChildren > 1 ? 's' : ''}
                </span>
              )}
              {reservation.numberOfInfants > 0 && (
                <span>
                  🍼 {reservation.numberOfInfants} bebé{reservation.numberOfInfants > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-700">
              Total: {reservation.numberOfGuests} huésped{reservation.numberOfGuests === 1 ? '' : 'es'}
            </p>
          </div>

          {/* Price */}
          {roomPrice > 0 && (
            <div className="flex items-center justify-between border-t border-slate-200 pt-3">
              <span className="text-sm text-slate-600">Precio por noche</span>
              <span className="text-lg font-bold text-emerald-700">
                {currencyFormatter.format(roomPrice)}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
