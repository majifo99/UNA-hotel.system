/**
 * ReservationCancelPanel Component
 * 
 * Componente inline para cancelación de reservas que reemplaza el modal anterior.
 * Muestra un panel expansible con cálculo de penalidades según política del hotel.
 * 
 * Políticas de cancelación:
 * - Más de 7 días de antelación: sin cargo
 * - Entre 3 y 7 días: 25% del depósito
 * - Entre 24 y 72 horas: 50% del depósito
 * - Menos de 24 horas: 75% del depósito
 * - Entrada vencida: 100% del depósito
 * 
 * Características de seguridad:
 * - Confirmación mediante número de reserva
 * - Checkbox de aceptación de términos
 * - Validación de entrada antes de procesar
 * 
 * @see docs/Backend.md - Endpoints de cancelación de reservas
 */

import React from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import type { Reservation } from '../../types';
import { useCancelReservation } from '../../hooks/useReservationQueries';
import { Alert } from '../../../../components/ui/Alert';
import { ReservationStatusBadge } from '../ReservationStatusBadge';

/**
 * Regla de penalidad con rangos de tiempo y porcentajes
 */
interface PenaltyRule {
  maxHours: number;
  rate: number;
  rule: string;
}

/**
 * Reglas de penalidad ordenadas de más restrictiva a más permisiva
 */
const PENALTY_RULES: ReadonlyArray<PenaltyRule> = [
  {
    maxHours: 0,
    rate: 1,
    rule: 'Cancelación con entrada vencida: penalidad del 100% del depósito.',
  },
  {
    maxHours: 24,
    rate: 0.75,
    rule: 'Menos de 24 horas: se retiene el 75% del depósito.',
  },
  {
    maxHours: 72,
    rate: 0.5,
    rule: 'Entre 24 y 72 horas: penalidad del 50% del depósito.',
  },
  {
    maxHours: 168,
    rate: 0.25,
    rule: 'Entre 3 y 7 días: penalidad del 25% del depósito.',
  },
  {
    maxHours: Number.POSITIVE_INFINITY,
    rate: 0,
    rule: 'Cancelación sin cargo (más de 7 días de antelación).',
  },
] as const;

const DEFAULT_PENALTY_RULE = PENALTY_RULES[PENALTY_RULES.length - 1];

/**
 * Formateador para moneda costarricense (Colones)
 */
const colonFormatter = new Intl.NumberFormat('es-CR', {
  style: 'currency',
  currency: 'CRC',
  maximumFractionDigits: 0,
});

/**
 * Resultado del cálculo de penalidad
 */
interface PenaltyResult {
  penalty: number;
  rate: number;
  rule: string;
  hoursUntilCheckIn: number | null;
}

/**
 * Calcula la penalidad aplicable según la política del hotel
 * y las horas restantes hasta el check-in.
 * 
 * @param reservation - Reserva a cancelar
 * @returns Resultado con monto de penalidad y regla aplicada
 */
function calculatePenalty(reservation: Reservation): PenaltyResult {
  if (!reservation.checkInDate) {
    return {
      penalty: 0,
      rate: 0,
      rule: 'Sin fecha de entrada, no se aplica penalidad automática.',
      hoursUntilCheckIn: null,
    };
  }

  const now = new Date();
  const checkIn = new Date(reservation.checkInDate);
  
  if (Number.isNaN(checkIn.getTime())) {
    return {
      penalty: 0,
      rate: 0,
      rule: 'Fecha de entrada inválida, no se aplica penalidad automática.',
      hoursUntilCheckIn: null,
    };
  }

  const diffHours = (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60);
  const matchingRule = PENALTY_RULES.find((rule) => diffHours <= rule.maxHours) ?? DEFAULT_PENALTY_RULE;
  const deposit = reservation.depositRequired ?? 0;

  return {
    penalty: Math.round(deposit * matchingRule.rate),
    rate: matchingRule.rate,
    rule: matchingRule.rule,
    hoursUntilCheckIn: diffHours,
  };
}

interface ReservationCancelPanelProps {
  /** Reserva a cancelar */
  reservation: Reservation;
  /** Callback al cerrar el panel */
  onClose: () => void;
  /** Callback opcional al cancelar exitosamente */
  onCancelled?: (reservation: Reservation) => void;
}

/**
 * Panel inline para cancelar reservas existentes.
 * 
 * Flujo de cancelación:
 * 1. Muestra resumen de la reserva
 * 2. Calcula y muestra penalidad aplicable
 * 3. Usuario acepta términos con checkbox
 * 4. Usuario confirma escribiendo número de confirmación
 * 5. Procesa cancelación con penalidad
 * 
 * Seguridad:
 * - Requiere confirmación explícita del número de reserva
 * - Deshabilitado si no se aceptan términos
 * - Validación case-insensitive del número
 */
export const ReservationCancelPanel: React.FC<ReservationCancelPanelProps> = ({
  reservation,
  onClose,
  onCancelled,
}) => {
  const cancelReservation = useCancelReservation();
  const { penalty, rate, rule } = React.useMemo(() => calculatePenalty(reservation), [reservation]);

  const [confirmText, setConfirmText] = React.useState('');
  const [acknowledged, setAcknowledged] = React.useState(false);

  /**
   * Valida que se pueda confirmar la cancelación:
   * - Términos aceptados
   * - Número de confirmación coincide (case-insensitive)
   */
  const canConfirm = acknowledged && confirmText.trim().toUpperCase() === reservation.confirmationNumber.toUpperCase();

  /**
   * Handler: procesa la cancelación de la reserva
   */
  const handleConfirm = async () => {
    try {
      const updated = await cancelReservation.mutateAsync({
        id: reservation.id,
        options: {
          penalty,
        },
      });
      if (updated) {
        onCancelled?.(updated);
        onClose();
      }
    } catch (error) {
      console.error('Error al cancelar la reserva:', error);
    }
  };

  const formattedPenalty = penalty > 0
    ? colonFormatter.format(penalty)
    : 'Sin penalidad';

  return (
    <div className="mb-6 rounded-2xl border-2 border-rose-500 bg-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-rose-50 px-6 py-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">🚫 Cancelar reserva</h2>
          <p className="text-sm text-rose-600 font-medium">⚠️ Esta acción no se puede deshacer</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="Cerrar panel"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Body */}
      <div className="space-y-6 px-6 py-6">
            {cancelReservation.isError && (
              <Alert
                type="error"
                title="No se pudo cancelar la reserva"
                message="Intenta de nuevo o verifica que la reserva no haya sido cerrada previamente."
              />
            )}

            {/* Resumen de la reserva */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">
                    {reservation.guest?.firstName} {reservation.guest?.firstLastName}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Confirmación: <span className="font-mono font-medium">{reservation.confirmationNumber}</span>
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Estancia: {reservation.checkInDate || '--'} → {reservation.checkOutDate || '--'}
                  </p>
                  {reservation.roomType && (
                    <p className="mt-1 text-xs text-slate-500">
                      Habitación: {reservation.roomType} • {reservation.numberOfGuests} huésped{reservation.numberOfGuests !== 1 ? 'es' : ''}
                    </p>
                  )}
                </div>
                <ReservationStatusBadge status={reservation.status} />
              </div>
            </div>

            {/* Advertencia de penalidad */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden />
                <div className="flex-1">
                  <p className="font-semibold">Penalidad estimada: {formattedPenalty}</p>
                  <p className="mt-1 text-xs text-amber-700">{rule}</p>
                  {rate > 0 && (
                    <p className="mt-2 text-xs text-amber-600">
                      Se retiene aproximadamente el <strong>{(rate * 100).toFixed(0)}%</strong> del depósito{' '}
                      {reservation.depositRequired ? `(${colonFormatter.format(reservation.depositRequired)})` : '(sin depósito configurado)'}.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Confirmación */}
            <div className="space-y-4">
              <label className="flex items-start gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                  checked={acknowledged}
                  onChange={(event) => setAcknowledged(event.target.checked)}
                />
                <span>
                  Entiendo que esta acción aplicará la penalidad indicada y <strong>no se puede deshacer</strong>.
                </span>
              </label>

              <div>
                <label htmlFor="cancel-confirm-input" className="mb-1 block text-sm font-medium text-slate-700">
                  Escribe el número de confirmación para cancelar <span className="text-rose-500">*</span>
                </label>
                <input
                  id="cancel-confirm-input"
                  type="text"
                  value={confirmText}
                  onChange={(event) => setConfirmText(event.target.value)}
                  placeholder={reservation.confirmationNumber}
                  maxLength={50}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Debes escribir exactamente <span className="font-mono font-medium">{reservation.confirmationNumber}</span> para confirmar.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                disabled={cancelReservation.isPending}
              >
                Mantener reserva
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!canConfirm || cancelReservation.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
              >
                {cancelReservation.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                Confirmar cancelación
              </button>
            </div>
          </div>
    </div>
  );
};
