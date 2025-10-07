/**
 * Componente: ReservationDetailDrawer
 * 
 * Drawer lateral que muestra un resumen de la reserva.
 * Usa componentes compartidos para evitar duplicación.
 * Link "Ver detalle completo" navega a /reservations/:id/detail
 */

import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import type { Reservation } from '../../types';
import { ReservationStatusBadge } from '../ReservationStatusBadge';
import {
  ReservationGuestCard,
  ReservationDatesCard,
  ReservationRoomCard,
  ReservationFinancialCard,
  ReservationSpecialRequestsCard,
  ReservationMetadataCard,
} from '../detail';

interface ReservationDetailDrawerProps {
  reservation: Reservation | null;
  isOpen: boolean;
  onClose: () => void;
  onViewFull?: (reservationId: string) => void;
}

export const ReservationDetailDrawer: React.FC<ReservationDetailDrawerProps> = ({
  reservation,
  isOpen,
  onClose,
  onViewFull,
}) => {
  // Cerrar con ESC
  React.useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Calcular noches (siempre ejecutar hook)
  const nights = React.useMemo(() => {
    if (!reservation || !reservation.checkInDate || !reservation.checkOutDate) return 0;
    const checkIn = new Date(reservation.checkInDate);
    const checkOut = new Date(reservation.checkOutDate);
    return Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  }, [reservation?.checkInDate, reservation?.checkOutDate]);

  // Early return DESPUÉS de todos los hooks
  if (!isOpen || !reservation) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Detalle de reserva</h2>
            <p className="mt-1 text-sm text-slate-500">
              Confirmación: <span className="font-mono font-medium">{reservation.confirmationNumber}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 p-6">
          {/* Estado y acciones */}
          <div className="flex items-center justify-between">
            <ReservationStatusBadge status={reservation.status} />
            {onViewFull && (
              <button
                type="button"
                onClick={() => onViewFull(reservation.id)}
                className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 transition hover:text-emerald-700"
              >
                <ExternalLink className="h-4 w-4" />
                Ver detalle completo
              </button>
            )}
          </div>

          {/* Componentes compartidos */}
          <ReservationGuestCard reservation={reservation} />
          <ReservationDatesCard reservation={reservation} nights={nights} />
          <ReservationRoomCard reservation={reservation} />
          <ReservationSpecialRequestsCard reservation={reservation} />
          <ReservationFinancialCard reservation={reservation} />
          <ReservationMetadataCard reservation={reservation} />
        </div>
      </div>
    </>
  );
};
