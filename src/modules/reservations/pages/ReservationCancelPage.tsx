/**
 * ReservationCancelPage Component
 * 
 * Vista dedicada para cancelar reservas existentes.
 * Navega desde /reservations mediante el botón "Cancelar".
 * 
 * Flujo de datos:
 * - useQuery: obtiene datos de la reserva desde API
 * - useMutation: cancela la reserva y actualiza estado
 * - useNavigate: redirige de vuelta a /reservations
 * 
 * @see docs/Backend.md - Endpoints PATCH /api/reservas/:id
 * @see docs/GUIA-DESARROLLO.md - Patrones React Query
 */

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { ReservationDetailSkeleton } from '../components/ui/Skeleton';
import type { Reservation } from '../types';
import { useCancelReservation } from '../hooks/useReservationQueries';
import { reservationService } from '../services/reservationService';
import { Alert } from '../../../components/ui/Alert';

/**
 * Reglas de penalización por cancelación según políticas del Hotel Lanaku
 * 
 * POLÍTICA ESTÁNDAR:
 * - 72 horas (3 días) antes: Sin cargo
 * - Menos de 72 horas: 100% primera noche
 * 
 * POLÍTICA TEMPORADA ALTA:
 * - 15 días antes: Sin cargo
 * - Menos de 15 días: 100% primera noche
 * 
 * POLÍTICA NO REEMBOLSABLE:
 * - Cualquier momento: 100% total (pago anticipado)
 * 
 * NO-SHOW:
 * - No presentación: 100% estancia completa
 */

/**
 * Calcula penalización basada en días de anticipación y políticas del Hotel Lanaku
 */
const calculatePenalty = (checkInDate: string, isHighSeason = false): { percent: number; label: string } => {
  const checkIn = new Date(checkInDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  checkIn.setHours(0, 0, 0, 0);

  const diffTime = checkIn.getTime() - today.getTime();
  const daysUntilCheckIn = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Política diferenciada según temporada
  const minDaysForFree = isHighSeason ? 15 : 3;
  
  if (daysUntilCheckIn >= minDaysForFree) {
    return { 
      percent: 0, 
      label: isHighSeason 
        ? 'Sin penalización (Temporada alta: 15 días de anticipación)' 
        : 'Sin penalización (Estándar: 72 horas de anticipación)' 
    };
  }

  // Menos del plazo requerido: penalización del 100% de la primera noche
  return { 
    percent: 100, 
    label: isHighSeason
      ? '100% primera noche (cancelación con menos de 15 días)'
      : '100% primera noche (cancelación con menos de 72 horas)'
  };
};

/**
 * Formatea fecha ISO a formato legible: "15 de enero de 2025"
 */
const formatDate = (isoDate: string | undefined): string => {
  if (!isoDate) return '—';
  try {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return '—';
  }
};

export const ReservationCancelPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const cancelReservation = useCancelReservation();
  const [confirming, setConfirming] = React.useState(false);

  /**
   * Query: obtiene datos de la reserva desde API
   */
  const { data: reservation, isLoading, isError } = useQuery<Reservation | null>({
    queryKey: ['reservation', id],
    queryFn: () => reservationService.getReservationById(id!),
    enabled: !!id,
  });

  const penalty = React.useMemo(() => {
    if (!reservation?.checkInDate) return null;
    return calculatePenalty(reservation.checkInDate);
  }, [reservation?.checkInDate]);

  /**
   * Handler: confirma cancelación usando mutation
   */
  const handleConfirmCancel = async () => {
    if (!id || !reservation) return;

    setConfirming(true);
    try {
      await cancelReservation.mutateAsync({
        id,
        notas: penalty?.percent 
          ? `Cancelación con ${penalty.percent}% de penalización` 
          : 'Cancelación sin penalidad',
      });
      toast.success('Reserva cancelada correctamente');
      navigate('/reservations');
    } catch (error) {
      toast.error('Error al cancelar la reserva');
      console.error('Error:', error);
      setConfirming(false);
    }
  };

  /**
   * Loading state: muestra skeleton
   */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <ReservationDetailSkeleton />
        </div>
      </div>
    );
  }

  /**
   * Error state: reserva no encontrada
   */
  if (isError || !reservation) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <button
            onClick={() => navigate('/reservations')}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Reservas
          </button>
          <Alert
            type="error"
            title="Reserva no encontrada"
            message="No se pudo cargar la reserva solicitada. Verifica el ID e intenta nuevamente."
          />
        </div>
      </div>
    );
  }

  /**
   * Check: reserva ya cancelada
   */
  if (reservation.status === 'cancelled') {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <button
            onClick={() => navigate('/reservations')}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Reservas
          </button>
          <Alert
            type="warning"
            title="Reserva ya cancelada"
            message="Esta reserva ya fue cancelada anteriormente. No es posible cancelarla nuevamente."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        {/* Header con botón Volver */}
        <button
          onClick={() => navigate('/reservations')}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Reservas
        </button>

        {/* Contenedor principal con fondo blanco */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          {/* Título */}
          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-slate-900">Cancelar reserva</h1>
            <p className="mt-1 text-sm text-slate-500">
              Confirmación: <span className="font-mono font-semibold">{reservation.confirmationNumber}</span>
            </p>
            {reservation.guest && (
              <p className="mt-1 text-sm text-slate-600">
                {reservation.guest.firstName} {reservation.guest.firstLastName}
              </p>
            )}
          </div>

          {/* Alerta de advertencia */}
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
            <div className="text-sm">
              <p className="font-semibold text-amber-900">Esta acción no se puede deshacer</p>
              <p className="mt-1 text-amber-700">
                La reserva será cancelada permanentemente y no podrá reactivarse posteriormente.
              </p>
            </div>
          </div>

          {/* Detalles de la reserva */}
          <div className="mb-6 space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Fecha de entrada</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{formatDate(reservation.checkInDate)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Fecha de salida</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{formatDate(reservation.checkOutDate)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Habitación</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {reservation.room?.number || reservation.roomType || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Huéspedes</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{reservation.numberOfGuests || '—'}</p>
              </div>
            </div>

            {reservation.specialRequests && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Solicitudes especiales</p>
                <p className="mt-1 text-sm text-slate-700">{reservation.specialRequests}</p>
              </div>
            )}
          </div>

          {/* Penalización */}
          {penalty && (
            <div className="mb-6 rounded-lg border-2 border-rose-200 bg-rose-50 p-4">
              <p className="text-sm font-semibold text-rose-900">Política de cancelación</p>
              <div className="mt-2 flex items-baseline justify-between">
                <p className="text-2xl font-bold text-rose-700">{penalty.percent}%</p>
                <p className="text-sm text-rose-600">{penalty.label}</p>
              </div>
              <p className="mt-2 text-xs text-rose-700">
                Penalización aplicable según los días de anticipación a la fecha de entrada.
              </p>
            </div>
          )}

          {cancelReservation.isError && (
            <Alert
              type="error"
              title="Error al cancelar"
              message="No se pudo cancelar la reserva. Intenta nuevamente."
            />
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() => navigate('/reservations')}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              disabled={confirming}
            >
              Volver sin cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmCancel}
              disabled={confirming}
              className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
            >
              {confirming && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirmar cancelación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
