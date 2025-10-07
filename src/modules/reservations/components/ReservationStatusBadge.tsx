import React from 'react';
import type { Reservation } from '../types';

const STATUS_STYLES: Record<Reservation['status'], { label: string; classes: string }> = {
  pending: { label: 'Pendiente', classes: 'bg-amber-100 text-amber-800 border-amber-200' },
  confirmed: { label: 'Confirmada', classes: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  checked_in: { label: 'En casa', classes: 'bg-blue-100 text-blue-800 border-blue-200' },
  checked_out: { label: 'Finalizada', classes: 'bg-slate-100 text-slate-700 border-slate-200' },
  cancelled: { label: 'Cancelada', classes: 'bg-rose-100 text-rose-800 border-rose-200' },
  no_show: { label: 'No Show', classes: 'bg-gray-200 text-gray-700 border-gray-300' },
};

interface ReservationStatusBadgeProps {
  status: Reservation['status'];
  className?: string;
}

export const ReservationStatusBadge: React.FC<ReservationStatusBadgeProps> = ({ status, className = '' }) => {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.pending;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium uppercase tracking-wide ${style.classes} ${className}`.trim()}
    >
      <span className="block h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {style.label}
    </span>
  );
};

export default ReservationStatusBadge;
