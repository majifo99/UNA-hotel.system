/**
 * Componente compartido: ReservationGuestCard
 * Muestra información del huésped de una reserva
 */

import React from 'react';
import { Users } from 'lucide-react';
import type { Reservation } from '../../../types';

interface ReservationGuestCardProps {
  reservation: Reservation;
}

export const ReservationGuestCard: React.FC<ReservationGuestCardProps> = ({ reservation }) => {
  const guestName = reservation.guest
    ? `${reservation.guest.firstName} ${reservation.guest.firstLastName || ''} ${reservation.guest.secondLastName || ''}`.trim()
    : 'Sin información';

  return (
    <section>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-700">
        <Users className="h-4 w-4" />
        Huésped
      </h3>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="font-semibold text-slate-900">{guestName}</p>
        {reservation.guest?.email && (
          <p className="mt-1 text-sm text-slate-600">
            📧 {reservation.guest.email}
          </p>
        )}
        {reservation.guest?.phone && (
          <p className="mt-1 text-sm text-slate-600">
            📱 {reservation.guest.phone}
          </p>
        )}
        {reservation.guest?.nationality && (
          <p className="mt-1 text-sm text-slate-600">
            🌍 {reservation.guest.nationality}
          </p>
        )}
      </div>
    </section>
  );
};
