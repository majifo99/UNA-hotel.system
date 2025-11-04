/**
 * Componente: ReservationNotesCard
 * Muestra las notas especiales de la reserva
 */

import React from 'react';
import { FileText } from 'lucide-react';
import type { Reservation } from '../../../types';

interface ReservationNotesCardProps {
  reservation: Reservation;
}

export const ReservationNotesCard: React.FC<ReservationNotesCardProps> = ({ reservation }) => {
  if (!reservation.specialRequests) {
    return null;
  }

  const notes = reservation.specialRequests;

  return (
    <section>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-700">
        <FileText className="h-4 w-4" />
        Notas y solicitudes especiales
      </h3>
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="whitespace-pre-wrap text-sm text-amber-900">{notes}</p>
      </div>
    </section>
  );
};
