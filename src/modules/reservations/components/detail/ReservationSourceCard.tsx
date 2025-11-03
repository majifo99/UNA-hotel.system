/**
 * Componente: ReservationSourceCard
 * Muestra la fuente de la reserva (Booking.com, direct, etc.)
 */

import React from 'react';
import { Globe } from 'lucide-react';
import type { Reservation } from '../../types';

interface ReservationSourceCardProps {
  reservation: Reservation;
}

export const ReservationSourceCard: React.FC<ReservationSourceCardProps> = () => {
  // For now, source info is not in the Reservation type
  // This can be extended when the API provides source data
  
  // Check if there's any source info (placeholder for future)
  const hasSource = false; // Will be: reservation.source?.name
  
  if (!hasSource) {
    return null; // Don't show card if no source
  }

  return (
    <section>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-700">
        <Globe className="h-4 w-4" />
        Fuente de reserva
      </h3>
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="text-base font-semibold text-slate-900">
          {/* {reservation.source.name} */}
          Booking.com
        </p>
      </div>
    </section>
  );
};
