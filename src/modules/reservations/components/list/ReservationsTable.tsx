import React from 'react';
import { Pencil, Ban, Eye, Copy, Check, CheckCircle, Loader2 } from 'lucide-react';
import type { Reservation } from '../../types';
import { ReservationStatusBadge } from '../ReservationStatusBadge';
import { ReservationTableSkeleton } from '../ui/Skeleton';
import { formatCurrency } from '../../utils/currency';
import { toast } from 'sonner';

interface ReservationsTableProps {
  reservations: Reservation[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onEdit: (reservation: Reservation) => void;
  onCancel: (reservation: Reservation) => void;
  onConfirm: (reservation: Reservation) => void;
  onViewDetail: (reservation: Reservation) => void;
  confirmingId?: string | null;
}

const isActionDisabled = (reservation: Reservation) => {
  const immutableStatuses: Reservation['status'][] = ['cancelled', 'checked_out', 'no_show'];
  return immutableStatuses.includes(reservation.status);
};

export const ReservationsTable: React.FC<ReservationsTableProps> = ({
  reservations,
  isLoading = false,
  isError = false,
  onRetry,
  onEdit,
  onCancel,
  onConfirm,
  onViewDetail,
  confirmingId = null,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopyCode = async (code: string, reservationId: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(reservationId);
      toast.success('Código copiado', {
        description: `${code} copiado al portapapeles`
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast.error('Error al copiar', {
        description: 'No se pudo copiar el código'
      });
    }
  };

  if (isLoading) {
    return <ReservationTableSkeleton rows={10} />;
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
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Vista de tabla para pantallas grandes */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <colgroup>
            <col style={{width: '18%'}} />
            <col style={{width: '14%'}} />
            <col style={{width: '12%'}} />
            <col style={{width: '6%'}} />
            <col style={{width: '11%'}} />
            <col style={{width: '10%'}} />
            <col style={{width: '29%'}} />
          </colgroup>
          
          <thead className="bg-[#304D3C] text-white border-b border-slate-200">
            <tr>
              <th scope="col" className="px-4 py-3 text-left font-medium text-white">Código / Huésped</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-white">Fechas</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-white">Habitación</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-white">Pax</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-white">Estado</th>
              <th scope="col" className="px-4 py-3 text-left font-medium text-white">Total</th>
              <th scope="col" className="px-4 py-3 text-center font-medium text-white">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {reservations.map((reservation) => {
              const disabled = isActionDisabled(reservation);
              const guestName = reservation.guest
                ? `${reservation.guest.firstName} ${reservation.guest.firstLastName ?? ''}`.trim()
                : `Cliente #${reservation.guestId}`;
              const dateRange = reservation.checkInDate && reservation.checkOutDate
                ? `${new Date(reservation.checkInDate).toLocaleDateString()} → ${new Date(reservation.checkOutDate).toLocaleDateString()}`
                : 'Por definir';

              return (
                <tr key={reservation.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 align-middle">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#304D3C] text-sm tracking-wide">
                          {reservation.confirmationNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(reservation.confirmationNumber, reservation.id)}
                          className="inline-flex items-center justify-center w-6 h-6 rounded-md hover:bg-[#304D3C]/10 transition-colors group"
                          title="Copiar código"
                        >
                          {copiedId === reservation.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#304D3C]" />
                          )}
                        </button>
                      </div>
                      <span className="font-semibold text-slate-800 text-sm">{guestName}</span>
                      {reservation.guest?.email && (
                        <span className="text-xs text-slate-500">{reservation.guest.email}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 align-middle text-sm text-slate-700">{dateRange}</td>
                  <td className="p-4 align-middle">
                    <div className="flex flex-col">
                      <span className="font-medium capitalize text-sm text-slate-800">{reservation.roomType ?? '--'}</span>
                      <span className="text-xs text-slate-500">Hab {reservation.room?.number ?? reservation.roomId}</span>
                    </div>
                  </td>
                  <td className="p-4 align-middle text-sm text-slate-700">{reservation.numberOfGuests}</td>
                  <td className="p-4 align-middle">
                    <ReservationStatusBadge status={reservation.status} />
                  </td>
                  <td className="p-4 align-middle text-sm font-semibold text-slate-800">
                    {formatCurrency(reservation.total)}
                  </td>
                  <td className="p-3 align-middle">
                    <div className="flex justify-center items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onViewDetail(reservation)}
                        className="inline-flex items-center gap-1 rounded-md bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors"
                        title="Ver detalle completo"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Ver
                      </button>
                      {reservation.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => onConfirm(reservation)}
                          disabled={confirmingId === reservation.id}
                          className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                            confirmingId === reservation.id
                              ? 'cursor-not-allowed bg-green-100 text-green-700 opacity-60'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                          title="Confirmar reserva"
                        >
                          {confirmingId === reservation.id ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Confirmando...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-3.5 w-3.5" />
                              Confirmar
                            </>
                          )}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onEdit(reservation)}
                        disabled={disabled}
                        className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                          disabled
                            ? 'cursor-not-allowed bg-slate-100 text-slate-300 opacity-50'
                            : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        }`}
                        title={disabled ? 'No disponible para reservas finalizadas o canceladas' : 'Editar reserva'}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => onCancel(reservation)}
                        disabled={disabled}
                        className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                          disabled
                            ? 'cursor-not-allowed bg-slate-100 text-slate-300 opacity-50'
                            : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                        }`}
                        title={disabled ? 'Esta reserva ya no admite cancelaciones' : 'Cancelar reserva'}
                      >
                        <Ban className="h-3.5 w-3.5" />
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

      {/* Vista de cards para móvil/tablet */}
      <div className="lg:hidden divide-y divide-slate-100">
        {reservations.map((reservation) => {
          const disabled = isActionDisabled(reservation);
          const guestName = reservation.guest
            ? `${reservation.guest.firstName} ${reservation.guest.firstLastName ?? ''}`.trim()
            : `Cliente #${reservation.guestId}`;
          const dateRange = reservation.checkInDate && reservation.checkOutDate
            ? `${new Date(reservation.checkInDate).toLocaleDateString()} → ${new Date(reservation.checkOutDate).toLocaleDateString()}`
            : 'Por definir';

          return (
            <div key={reservation.id} className="p-4 hover:bg-slate-50/50 transition-colors">
              {/* Header del card */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 bg-[#304D3C] text-white px-3 py-1.5 rounded-lg mb-2">
                    <span className="font-mono font-bold text-sm tracking-wide">{reservation.confirmationNumber}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(reservation.confirmationNumber, reservation.id)}
                      className="inline-flex items-center justify-center w-5 h-5 rounded hover:bg-white/20 transition-colors"
                      title="Copiar código"
                    >
                      {copiedId === reservation.id ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                  <h3 className="font-semibold text-slate-800">{guestName}</h3>
                  {reservation.guest?.email && (
                    <p className="text-xs text-slate-500 mt-1">{reservation.guest.email}</p>
                  )}
                </div>
                <ReservationStatusBadge status={reservation.status} />
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Fechas</p>
                  <p className="text-slate-700 font-medium">{dateRange}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Habitación</p>
                  <p className="text-slate-700 font-medium capitalize">
                    {reservation.roomType ?? '--'}
                    <span className="block text-xs text-slate-500">Hab {reservation.room?.number ?? reservation.roomId}</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Huéspedes</p>
                  <p className="text-slate-700 font-medium">{reservation.numberOfGuests}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Total</p>
                  <p className="text-slate-800 font-semibold">{formatCurrency(reservation.total)}</p>
                </div>
              </div>

              {/* Acciones */}
              <div className="space-y-2">
                {/* Fila 1: Ver y Confirmar */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onViewDetail(reservation)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 transition-colors shadow-sm"
                  >
                    <Eye className="h-4 w-4" />
                    Ver
                  </button>
                  {reservation.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => onConfirm(reservation)}
                      disabled={confirmingId === reservation.id}
                      className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors shadow-sm ${
                        confirmingId === reservation.id
                          ? 'cursor-not-allowed bg-green-100 text-green-700 opacity-60'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {confirmingId === reservation.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Confirmando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Confirmar
                        </>
                      )}
                    </button>
                  )}
                </div>
                
                {/* Fila 2: Editar y Cancelar */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(reservation)}
                    disabled={disabled}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors shadow-sm ${
                      disabled
                        ? 'cursor-not-allowed bg-slate-100 text-slate-300 opacity-50'
                        : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    }`}
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => onCancel(reservation)}
                    disabled={disabled}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors shadow-sm ${
                      disabled
                        ? 'cursor-not-allowed bg-slate-100 text-slate-300 opacity-50'
                        : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                    }`}
                  >
                    <Ban className="h-4 w-4" />
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReservationsTable;
