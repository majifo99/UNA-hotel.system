import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import type { Reservation } from '../../types';
import { useCancelReservation } from '../../hooks/useReservationQueries';
import { Modal } from '../../../../components/ui/Modal';
import { Alert } from '../../../../components/ui/Alert';
import { ReservationStatusBadge } from '../ReservationStatusBadge';

type PenaltyRule = {
  maxHours: number;
  rate: number;
  rule: string;
};

const PENALTY_RULES: PenaltyRule[] = [
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
];

const colonFormatter = new Intl.NumberFormat('es-CR', {
  style: 'currency',
  currency: 'CRC',
  maximumFractionDigits: 0,
});

interface PenaltyResult {
  penalty: number;
  rate: number;
  rule: string;
  hoursUntilCheckIn: number | null;
}

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
  const matchingRule = PENALTY_RULES.find((rule) => diffHours <= rule.maxHours) ?? PENALTY_RULES[PENALTY_RULES.length - 1];
  const deposit = reservation.depositRequired ?? 0;

  return {
    penalty: Math.round(deposit * matchingRule.rate),
    rate: matchingRule.rate,
    rule: matchingRule.rule,
    hoursUntilCheckIn: diffHours,
  };
}

interface ReservationCancelDialogProps {
  reservation: Reservation;
  isOpen: boolean;
  onClose: () => void;
  onCancelled?: (reservation: Reservation) => void;
}

export const ReservationCancelDialog: React.FC<ReservationCancelDialogProps> = ({
  reservation,
  isOpen,
  onClose,
  onCancelled,
}) => {
  const cancelReservation = useCancelReservation();
  const { penalty, rate, rule } = React.useMemo(() => calculatePenalty(reservation), [reservation]);

  const [confirmText, setConfirmText] = React.useState('');
  const [acknowledged, setAcknowledged] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) {
      setConfirmText('');
      setAcknowledged(false);
    }
  }, [isOpen]);

  const canConfirm = acknowledged && confirmText.trim().toUpperCase() === reservation.confirmationNumber.toUpperCase();

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
      console.error('No se pudo cancelar la reserva', error);
    }
  };

  const formattedPenalty = penalty > 0
    ? colonFormatter.format(penalty)
    : 'Sin penalidad';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cancelar reserva" size="md">
      <div className="space-y-6">
        {cancelReservation.isError && (
          <Alert
            type="error"
            title="No se pudo cancelar la reserva"
            message="Intenta de nuevo o verifica que la reserva no haya sido cerrada previamente."
          />
        )}

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-900">
                {reservation.guest?.firstName} {reservation.guest?.firstLastName}
              </p>
              <p className="text-xs text-slate-500">Confirmación: {reservation.confirmationNumber}</p>
              <p className="mt-2 text-xs text-slate-500">
                Estancia: {reservation.checkInDate || '--'} → {reservation.checkOutDate || '--'}
              </p>
            </div>
            <ReservationStatusBadge status={reservation.status} />
          </div>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden />
            <div>
              <p className="font-semibold">Penalidad estimada: {formattedPenalty}</p>
              <p className="text-xs text-amber-700">{rule}</p>
              {rate > 0 && (
                <p className="mt-1 text-xs text-amber-600">
                  Se retiene aproximadamente el {(rate * 100).toFixed(0)}% del depósito (
                  {reservation.depositRequired ? colonFormatter.format(reservation.depositRequired) : 'sin depósito configurado'}).
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-start gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              checked={acknowledged}
              onChange={(event) => setAcknowledged(event.target.checked)}
            />
            <span>Entiendo que esta acción aplicará la penalidad indicada y no se puede deshacer.</span>
          </label>

          <div>
            <label htmlFor="cancel-confirm-input" className="mb-1 block text-sm font-medium text-slate-700">
              Escribe el número de confirmación para cancelar
            </label>
            <input
              id="cancel-confirm-input"
              type="text"
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              placeholder={reservation.confirmationNumber}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
            <p className="mt-1 text-xs text-slate-500">
              Debes escribir exactamente {reservation.confirmationNumber} para confirmar la cancelación.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
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
    </Modal>
  );
};

export default ReservationCancelDialog;
