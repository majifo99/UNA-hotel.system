/**
 * Componente compartido: ReservationDatesCard
 * Muestra fechas de check-in/check-out y duración de la estadía
 */

import React from 'react';
import { Calendar } from 'lucide-react';
import type { Reservation } from '../../types';

interface ReservationDatesCardProps {
  reservation: Reservation;
  nights: number;
}

const dateFormatter = new Intl.DateTimeFormat('es-CR', {
  dateStyle: 'long',
});

export const ReservationDatesCard: React.FC<ReservationDatesCardProps> = ({ reservation, nights }) => {
  return (
    <section>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-700">
        <Calendar className="h-4 w-4" />
        Fechas de estadía
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Check-in</p>
          <p className="mt-1 font-semibold text-slate-900">
            {reservation.checkInDate ? dateFormatter.format(new Date(reservation.checkInDate)) : '—'}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Check-out</p>
          <p className="mt-1 font-semibold text-slate-900">
            {reservation.checkOutDate ? dateFormatter.format(new Date(reservation.checkOutDate)) : '—'}
          </p>
        </div>
      </div>
      {nights > 0 && (
        <p className="mt-3 text-sm text-slate-600">
          Duración: <strong>{nights}</strong> noche{nights === 1 ? '' : 's'}
        </p>
      )}
    </section>
  );
};
