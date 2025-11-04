/**
 * Componente compartido: ReservationRoomCard
 * Muestra información de la habitación de una reserva
 */

import React from 'react';
import { Home } from 'lucide-react';
import type { Reservation } from '../../../types';

interface ReservationRoomCardProps {
  reservation: Reservation;
}

export const ReservationRoomCard: React.FC<ReservationRoomCardProps> = ({ reservation }) => {
  return (
    <section>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-700">
        <Home className="h-4 w-4" />
        Habitación
      </h3>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-900">
              {reservation.room?.name || reservation.roomType || 'Por asignar'}
            </p>
            {reservation.room?.type && (
              <p className="mt-1 text-sm text-slate-600">Tipo: {reservation.room.type}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Huéspedes</p>
            <p className="text-lg font-bold text-slate-900">{reservation.numberOfGuests || 0}</p>
          </div>
        </div>
        {(reservation.numberOfAdults || reservation.numberOfChildren || reservation.numberOfInfants) && (
          <div className="mt-3 flex gap-4 border-t border-slate-200 pt-3 text-xs text-slate-600">
            {!!reservation.numberOfAdults && (
              <span>👤 {reservation.numberOfAdults} adulto{reservation.numberOfAdults > 1 ? 's' : ''}</span>
            )}
            {!!reservation.numberOfChildren && (
              <span>👶 {reservation.numberOfChildren} niño{reservation.numberOfChildren > 1 ? 's' : ''}</span>
            )}
            {!!reservation.numberOfInfants && (
              <span>🍼 {reservation.numberOfInfants} bebé{reservation.numberOfInfants > 1 ? 's' : ''}</span>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
