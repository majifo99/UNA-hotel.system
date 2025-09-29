import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import type { Reservation } from '../../types';
import { useRoomTypes, useUpdateReservation } from '../../hooks/useReservationQueries';
import { Modal } from '../../../../components/ui/Modal';
import { Alert } from '../../../../components/ui/Alert';

const reservationEditSchema = z.object({
  checkInDate: z.string().min(1, 'La fecha de entrada es obligatoria'),
  checkOutDate: z.string().min(1, 'La fecha de salida es obligatoria'),
  numberOfGuests: z.coerce.number({ invalid_type_error: 'Debes indicar la cantidad de huéspedes' })
    .int('Usa valores enteros')
    .min(1, 'Al menos 1 huésped'),
  roomType: z.string().min(1, 'Selecciona el tipo de habitación'),
});

type ReservationEditFormValues = z.infer<typeof reservationEditSchema>;

interface ReservationEditDialogProps {
  reservation: Reservation;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: (reservation: Reservation) => void;
}

export const ReservationEditDialog: React.FC<ReservationEditDialogProps> = ({
  reservation,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const { data: roomTypes = [], isLoading: isLoadingRoomTypes } = useRoomTypes();
  const updateReservation = useUpdateReservation();

  const form = useForm<ReservationEditFormValues>({
    resolver: zodResolver(reservationEditSchema),
    defaultValues: {
      checkInDate: reservation.checkInDate || '',
      checkOutDate: reservation.checkOutDate || '',
      numberOfGuests: reservation.numberOfGuests || 1,
      roomType: reservation.roomType || '',
    },
    mode: 'onChange',
  });

  const { register, handleSubmit, formState, watch, setValue, setError } = form;

  const selectedRoomType = watch('roomType');
  const numberOfGuestsValue = watch('numberOfGuests');
  const checkInValue = watch('checkInDate');
  const checkOutValue = watch('checkOutDate');

  const roomInfo = React.useMemo(() => (
    roomTypes.find((type) => type.type === selectedRoomType) || null
  ), [roomTypes, selectedRoomType]);

  const maxGuests = React.useMemo(() => {
    if (roomInfo?.capacity) return roomInfo.capacity;
    if (reservation.room?.capacity) return reservation.room.capacity;
    return Math.max(1, reservation.numberOfGuests, 6);
  }, [roomInfo, reservation.room?.capacity, reservation.numberOfGuests]);

  React.useEffect(() => {
    if (numberOfGuestsValue > maxGuests) {
      setValue('numberOfGuests', maxGuests, { shouldValidate: true, shouldDirty: true });
    }
  }, [numberOfGuestsValue, maxGuests, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    if (values.checkInDate && values.checkOutDate) {
      const checkIn = new Date(values.checkInDate);
      const checkOut = new Date(values.checkOutDate);
      if (!Number.isFinite(checkIn.getTime()) || !Number.isFinite(checkOut.getTime()) || checkOut <= checkIn) {
        setError('checkOutDate', { type: 'manual', message: 'La salida debe ser posterior a la entrada seleccionada.' });
        return;
      }
    }

    if (values.numberOfGuests > maxGuests) {
      setError('numberOfGuests', { type: 'manual', message: `La habitación seleccionada admite máximo ${maxGuests} huéspedes.` });
      return;
    }

    const updates: Partial<Reservation> = {
      checkInDate: values.checkInDate,
      checkOutDate: values.checkOutDate,
      numberOfGuests: values.numberOfGuests,
      roomType: values.roomType,
    };

    try {
      const updated = await updateReservation.mutateAsync({ id: reservation.id, updates });
      if (updated) {
        onUpdated?.(updated);
        onClose();
      }
    } catch (error) {
      console.error('No se pudo actualizar la reserva', error);
    }
  });

  const checkOutError = formState.errors.checkOutDate?.message;
  const nightsPreview = React.useMemo(() => {
    if (!checkInValue || !checkOutValue) return null;
    try {
      const checkIn = new Date(checkInValue);
      const checkOut = new Date(checkOutValue);
      const diff = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : null;
    } catch (error) {
      return null;
    }
  }, [checkInValue, checkOutValue]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar reserva" size="lg">
      <form onSubmit={onSubmit} className="space-y-6" noValidate>
        {updateReservation.isError && (
          <Alert
            type="error"
            title="No se pudo guardar los cambios"
            message="Intenta nuevamente o verifica tu conexión."
          />
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="reservation-edit-checkin" className="mb-1 block text-sm font-medium text-slate-700">
              Fecha de entrada
            </label>
            <input
              id="reservation-edit-checkin"
              type="date"
              className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${formState.errors.checkInDate ? 'border-rose-300 ring-rose-200 bg-rose-50' : 'border-slate-200'}`}
              {...register('checkInDate')}
            />
            {formState.errors.checkInDate && (
              <p className="mt-1 text-xs text-rose-600">{formState.errors.checkInDate.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="reservation-edit-checkout" className="mb-1 block text-sm font-medium text-slate-700">
              Fecha de salida
            </label>
            <input
              id="reservation-edit-checkout"
              type="date"
              className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${checkOutError ? 'border-rose-300 ring-rose-200 bg-rose-50' : 'border-slate-200'}`}
              {...register('checkOutDate')}
            />
            {checkOutError && (
              <p className="mt-1 text-xs text-rose-600">{checkOutError}</p>
            )}
          </div>

          <div>
            <label htmlFor="reservation-edit-room" className="mb-1 block text-sm font-medium text-slate-700">
              Tipo de habitación
            </label>
            <select
              id="reservation-edit-room"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              disabled={isLoadingRoomTypes}
              {...register('roomType')}
            >
              <option value="">Selecciona una opción</option>
              {roomTypes.map((type) => (
                <option key={type.type} value={type.type}>
                  {type.name} ({type.capacity ?? '—'} pax)
                </option>
              ))}
            </select>
            {formState.errors.roomType && (
              <p className="mt-1 text-xs text-rose-600">{formState.errors.roomType.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="reservation-edit-pax" className="mb-1 block text-sm font-medium text-slate-700">
              Huéspedes (PAX)
            </label>
            <input
              id="reservation-edit-pax"
              type="number"
              min={1}
              max={maxGuests}
              className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${formState.errors.numberOfGuests ? 'border-rose-300 ring-rose-200 bg-rose-50' : 'border-slate-200'}`}
              {...register('numberOfGuests', { valueAsNumber: true })}
            />
            <p className="mt-1 text-xs text-slate-500">
              Máximo permitido: {maxGuests} huésped{maxGuests === 1 ? '' : 'es'} según el tipo de habitación.
            </p>
            {formState.errors.numberOfGuests && (
              <p className="mt-1 text-xs text-rose-600">{formState.errors.numberOfGuests.message}</p>
            )}
          </div>
        </div>

        {nightsPreview && (
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-700">
            Duración estimada: {nightsPreview} noche{nightsPreview === 1 ? '' : 's'}.
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            disabled={updateReservation.isPending}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={updateReservation.isPending || !formState.isValid}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            {updateReservation.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            Guardar cambios
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ReservationEditDialog;
