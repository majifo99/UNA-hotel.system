/**
 * Componente: ReservationDetailDrawer
 * 
 * Drawer lateral que muestra un resumen de la reserva.
 * Usa componentes compartidos para evitar duplicación.
 * Link "Ver detalle completo" navega a /reservations/:id/detail
 */

import React from 'react';
import { X, ExternalLink, Copy, Check } from 'lucide-react';
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
import { toast } from 'sonner';

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
  const [copied, setCopied] = React.useState(false);

  const handleCopyCode = async () => {
    if (!reservation) return;
    
    try {
      await navigator.clipboard.writeText(reservation.confirmationNumber);
      setCopied(true);
      toast.success('Código copiado', {
        description: `${reservation.confirmationNumber} copiado al portapapeles`
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Error al copiar');
    }
  };
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
  }, [reservation]);

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
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl rounded-l-3xl">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-gradient-to-r from-[#304D3C] to-[#3d6149] px-6 py-5 rounded-tl-3xl">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-lg border border-white/30">
                  <span className="font-mono font-bold text-white text-lg tracking-wide">
                    {reservation.confirmationNumber}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-white/20 transition-colors"
                    title="Copiar código"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-white" />
                    ) : (
                      <Copy className="h-4 w-4 text-white/80 hover:text-white" />
                    )}
                  </button>
                </div>
                <ReservationStatusBadge status={reservation.status} />
              </div>
              <h2 className="text-xl font-semibold text-white">Detalle de reserva</h2>
              <p className="mt-1 text-sm text-white/80">
                ID: #{reservation.id} • Creada: {new Date(reservation.createdAt || '').toLocaleDateString('es-CR', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
              aria-label="Cerrar"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 p-6">
          {/* Botón ver detalle completo */}
          {onViewFull && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onViewFull(reservation.id)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#304D3C] to-[#3d6149] px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <ExternalLink className="h-4 w-4" />
                Ver detalle completo
              </button>
            </div>
          )}

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
