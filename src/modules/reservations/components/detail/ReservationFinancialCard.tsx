/**
 * Componente compartido: ReservationFinancialCard
 * Muestra información financiera de la reserva
 */

import React from 'react';
import { CreditCard } from 'lucide-react';
import type { Reservation } from '../../types';

interface ReservationFinancialCardProps {
  reservation: Reservation;
}

const currencyFormatter = new Intl.NumberFormat('es-CR', {
  style: 'currency',
  currency: 'CRC',
  maximumFractionDigits: 0,
});

export const ReservationFinancialCard: React.FC<ReservationFinancialCardProps> = ({ reservation }) => {
  return (
    <section>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-700">
        <CreditCard className="h-4 w-4" />
        Información financiera
      </h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4">
          <span className="text-sm text-slate-600">Total estimado</span>
          <span className="text-lg font-bold text-slate-900">
            {reservation.depositRequired ? currencyFormatter.format(reservation.depositRequired * 2) : '—'}
          </span>
        </div>
        {reservation.depositRequired && (
          <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <span className="text-sm text-emerald-700">Depósito requerido</span>
            <span className="font-semibold text-emerald-900">
              {currencyFormatter.format(reservation.depositRequired)}
            </span>
          </div>
        )}
      </div>
    </section>
  );
};
