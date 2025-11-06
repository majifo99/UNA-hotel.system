/**
 * Página: ReservationDetailFullPage
 * 
 * Vista de pantalla completa para ver todos los detalles de una reserva.
 * Integra con la nueva estructura del API que devuelve:
 * - cliente con nombre completo, email, teléfono, nacionalidad
 * - estado de la reserva
 * - fuente (Booking.com, etc.)
 * - habitaciones[] con fechas, PAX y detalles de cada habitación
 * 
 * Ruta: /reservations/:id/detail
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Ban, AlertCircle, Copy, Check } from 'lucide-react';
import { useReservationById } from '../hooks/useReservationQueries';
import { ReservationStatusBadge } from '../components/ReservationStatusBadge';
import {
  ReservationGuestCard,
  ReservationFinancialCard,
  ReservationMetadataCard,
  ReservationRoomsList,
  ReservationSourceCard,
  ReservationNotesCard,
} from '../components/detail';
import { ReservationDetailSkeleton } from '../components/ui/ReservationDetailSkeleton';
import { toast } from 'sonner';

export const ReservationDetailFullPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: reservation, isLoading, isError, error } = useReservationById(id || '');
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

  // Loading state
  if (isLoading) {
    return <ReservationDetailSkeleton />;
  }

  // Error state
  if (isError || !reservation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="max-w-md text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h2 className="mb-2 text-2xl font-bold text-slate-900">Reserva no encontrada</h2>
          <p className="mb-6 text-slate-600">
            {error instanceof Error ? error.message : 'No se pudo cargar la información de esta reserva.'}
          </p>
          <button
            onClick={() => navigate('/reservations')}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a reservaciones
          </button>
        </div>
      </div>
    );
  }

  const canEdit = reservation.status !== 'cancelled' && reservation.status !== 'no_show';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-12">
      {/* Header fijo */}
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/reservations')}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Volver"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-xl font-bold text-slate-900">Detalle de reserva</h1>
                  <div className="inline-flex items-center gap-2 bg-[#304D3C] text-white px-3 py-1 rounded-lg">
                    <span className="font-mono font-bold text-sm tracking-wide">{reservation.confirmationNumber}</span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="inline-flex items-center justify-center w-5 h-5 rounded hover:bg-white/20 transition-colors"
                      title="Copiar código"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-500">
                  ID Interno: <span className="font-mono font-medium">#{reservation.id}</span>
                </p>
              </div>
            </div>
            {canEdit && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/reservations/${reservation.id}/edit`)}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors shadow-sm"
                >
                  <Edit className="h-4 w-4" />
                  <span className="hidden sm:inline">Editar</span>
                </button>
                <button
                  onClick={() => navigate(`/reservations/${reservation.id}/cancel`)}
                  className="inline-flex items-center gap-2 rounded-lg bg-rose-100 hover:bg-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition-colors shadow-sm"
                >
                  <Ban className="h-4 w-4" />
                  <span className="hidden sm:inline">Cancelar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Estado de la reserva */}
        <div className="mb-6 flex items-center justify-between">
          <ReservationStatusBadge status={reservation.status} />
          <p className="text-sm text-slate-500">
            Última actualización: {new Date(reservation.updatedAt).toLocaleString('es-CR', {
              dateStyle: 'medium',
              timeStyle: 'short'
            })}
          </p>
        </div>

        {/* Grid de contenido */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ReservationGuestCard reservation={reservation} />
          <ReservationFinancialCard reservation={reservation} />
          <ReservationSourceCard reservation={reservation} />
          <ReservationNotesCard reservation={reservation} />
        </div>

        {/* Habitaciones - Full width */}
        <div className="mt-6">
          <ReservationRoomsList reservation={reservation} />
        </div>

        {/* Metadata - Full width */}
        <div className="mt-6">
          <ReservationMetadataCard reservation={reservation} />
        </div>
      </div>
    </div>
  );
};

export default ReservationDetailFullPage;
