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
import { ArrowLeft, Edit, Ban, AlertCircle } from 'lucide-react';
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

export const ReservationDetailFullPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: reservation, isLoading, isError, error } = useReservationById(id || '');

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-slate-600">Cargando detalles de la reserva...</p>
        </div>
      </div>
    );
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
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header fijo */}
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/reservations')}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Volver"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Detalle de reserva</h1>
                <p className="mt-0.5 text-sm text-slate-500">
                  ID: <span className="font-mono font-medium">#{reservation.confirmationNumber}</span>
                </p>
              </div>
            </div>
            {canEdit && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/reservations/${reservation.id}/edit`)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Edit className="h-4 w-4" />
                  <span className="hidden sm:inline">Editar</span>
                </button>
                <button
                  onClick={() => navigate(`/reservations/${reservation.id}/cancel`)}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
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
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          {/* Estado de la reserva */}
          <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
            <ReservationStatusBadge status={reservation.status} />
          </div>

          {/* Grid de contenido */}
          <div className="space-y-6">
            <ReservationGuestCard reservation={reservation} />
            <ReservationSourceCard reservation={reservation} />
            <ReservationRoomsList reservation={reservation} />
            <ReservationNotesCard reservation={reservation} />
            <ReservationFinancialCard reservation={reservation} />
            <ReservationMetadataCard reservation={reservation} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationDetailFullPage;
