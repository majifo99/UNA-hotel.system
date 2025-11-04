/**
 * Componente compartido: ReservationSpecialRequestsCard
 * Muestra solicitudes especiales de la reserva
 */

import React from 'react';
import { FileText } from 'lucide-react';
import type { Reservation } from '../../../types';

interface ReservationSpecialRequestsCardProps {
  reservation: Reservation;
}

export const ReservationSpecialRequestsCard: React.FC<ReservationSpecialRequestsCardProps> = ({ reservation }) => {
  if (!reservation.specialRequests) return null;

  return (
    <section>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-700">
        <FileText className="h-4 w-4" />
        Solicitudes especiales
      </h3>
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-900">{reservation.specialRequests}</p>
      </div>
    </section>
  );
};
