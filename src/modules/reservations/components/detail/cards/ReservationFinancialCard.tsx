/**
 * Componente compartido: ReservationFinancialCard
 * Muestra información financiera de la reserva
 */

import React from 'react';
import { CreditCard } from 'lucide-react';
import type { Reservation } from '../../../types';
import { formatCurrency } from '../../../utils/currency';

interface ReservationFinancialCardProps {
  reservation: Reservation;
}

export const ReservationFinancialCard: React.FC<ReservationFinancialCardProps> = ({ reservation }) => {
  return (
    <section className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#304D3C]">
        <CreditCard className="h-4 w-4" />
        Información Financiera
      </h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 p-4">
          <span className="text-sm font-medium text-slate-600">Total de la Reserva</span>
          <span className="text-xl font-bold text-slate-900">
            {formatCurrency(reservation.total)}
          </span>
        </div>
        {reservation.depositRequired > 0 && (
          <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 p-4">
            <span className="text-sm font-medium text-emerald-700">Depósito Requerido</span>
            <span className="text-lg font-bold text-emerald-900">
              {formatCurrency(reservation.depositRequired)}
            </span>
          </div>
        )}
        
        {/* Desglose adicional si está disponible */}
        {(reservation.subtotal > 0 || reservation.taxes > 0) && (
          <div className="mt-4 pt-4 border-t border-slate-200 space-y-2 text-sm">
            {reservation.subtotal > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-medium">{formatCurrency(reservation.subtotal)}</span>
              </div>
            )}
            {reservation.taxes > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Impuestos</span>
                <span className="font-medium">{formatCurrency(reservation.taxes)}</span>
              </div>
            )}
            {reservation.servicesTotal > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Servicios adicionales</span>
                <span className="font-medium">{formatCurrency(reservation.servicesTotal)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
