import React from 'react';
import { Pencil, Ban, Loader2 } from 'lucide-react';
import type { Reservation } from '../../types';
import { ReservationStatusBadge } from '../ReservationStatusBadge';

interface ReservationsTableProps {
  reservations: Reservation[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onEdit: (reservation: Reservation) => void;
  onCancel: (reservation: Reservation) => void;
}

const isActionDisabled = (reservation: Reservation) => {
  const immutableStatuses: Reservation['status'][] = ['cancelled', 'checked_out', 'no_show'];
  return immutableStatuses.includes(reservation.status);
};

const currencyFormatter = new Intl.NumberFormat('es-CR', {
  style: 'currency',
  currency: 'CRC',
  maximumFractionDigits: 0,
});

export const ReservationsTable: React.FC<ReservationsTableProps> = ({
  reservations,
  isLoading = false,
  isError = false,
  onRetry,
  onEdit,
  onCancel,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 shadow-sm">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          <span className="text-sm font-medium">Cargando reservaciones...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-sm text-rose-700">
        <p className="font-medium">No pudimos cargar las reservaciones.</p>
        <p className="mt-1">Verifica tu conexión o intenta nuevamente en unos segundos.</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex items-center rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
          >
            Reintentar
          </button>
        )}
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800">Sin reservaciones registradas</h3>
        <p className="mt-2 text-sm text-slate-500">
          Puedes crear una nueva reserva desde "Nueva reservación" en la barra lateral o importar datos desde el PMS.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th scope="col" className="px-5 py-3">Huésped</th>
              <th scope="col" className="px-5 py-3">Fechas</th>
              <th scope="col" className="px-5 py-3">Habitación</th>
              <th scope="col" className="px-5 py-3">Pax</th>
              <th scope="col" className="px-5 py-3">Estado</th>
              <th scope="col" className="px-5 py-3">Total</th>
              <th scope="col" className="px-5 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reservations.map((reservation) => {
              const disabled = isActionDisabled(reservation);
              const guestName = reservation.guest
                ? `${reservation.guest.firstName} ${reservation.guest.firstLastName ?? ''}`.trim()
                : `Cliente #${reservation.guestId}`;
              const dateRange = reservation.checkInDate && reservation.checkOutDate
                ? `${new Date(reservation.checkInDate).toLocaleDateString()} → ${new Date(reservation.checkOutDate).toLocaleDateString()}`
                : 'Por definir';

              return (
                <tr key={reservation.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 align-middle">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800">{guestName}</span>
                      <span className="text-xs text-slate-500"># {reservation.confirmationNumber}</span>
                      {reservation.guest?.email && (
                        <span className="text-xs text-slate-500">{reservation.guest.email}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 align-middle text-slate-700">{dateRange}</td>
                  <td className="px-5 py-4 align-middle text-slate-700">
                    <div className="flex flex-col">
                      <span className="font-medium capitalize">{reservation.roomType ?? '--'}</span>
                      <span className="text-xs text-slate-500">Habitación {reservation.room?.number ?? reservation.roomId}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 align-middle text-slate-700">{reservation.numberOfGuests}</td>
                  <td className="px-5 py-4 align-middle">
                    <ReservationStatusBadge status={reservation.status} />
                  </td>
                  <td className="px-5 py-4 align-middle text-slate-800">
                    {currencyFormatter.format(reservation.total)}
                  </td>
                  <td className="px-5 py-4 align-middle text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(reservation)}
                        disabled={disabled}
                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                          disabled
                            ? 'cursor-not-allowed border-slate-200 text-slate-300'
                            : 'border-emerald-200 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50'
                        }`}
                        title={disabled ? 'No disponible para reservas finalizadas o canceladas' : 'Editar reserva'}
                      >
                        <Pencil className="h-4 w-4" aria-hidden />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => onCancel(reservation)}
                        disabled={disabled}
                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                          disabled
                            ? 'cursor-not-allowed border-slate-200 text-slate-300'
                            : 'border-rose-200 text-rose-700 hover:border-rose-300 hover:bg-rose-50'
                        }`}
                        title={disabled ? 'Esta reserva ya no admite cancelaciones' : 'Cancelar reserva'}
                      >
                        <Ban className="h-4 w-4" aria-hidden />
                        Cancelar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReservationsTable;
