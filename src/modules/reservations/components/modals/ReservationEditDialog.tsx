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
  numberOfAdults: z
    .number()
    .refine((value) => !Number.isNaN(value), 'Debes indicar la cantidad de adultos')
    .int('Usa valores enteros')
    .min(1, 'Al menos 1 adulto'),
  numberOfChildren: z
    .number()
    .refine((value) => !Number.isNaN(value), 'Debes indicar la cantidad de niños')
    .int('Usa valores enteros')
    .min(0, 'No puede ser negativo'),
  numberOfInfants: z
    .number()
    .refine((value) => !Number.isNaN(value), 'Debes indicar la cantidad de bebés')
    .int('Usa valores enteros')
    .min(0, 'No puede ser negativo'),
  numberOfGuests: z
    .number()
    .refine((value) => !Number.isNaN(value), 'Debes indicar la cantidad de huéspedes')
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
      numberOfAdults: reservation.numberOfAdults ?? Math.max(1, reservation.numberOfGuests || 1),
      numberOfChildren: reservation.numberOfChildren ?? 0,
      numberOfInfants: reservation.numberOfInfants ?? 0,
      numberOfGuests: reservation.numberOfGuests || 1,
      roomType: reservation.roomType || '',
    },
    mode: 'onChange',
  });

  const { register, handleSubmit, formState, watch, setValue, setError, clearErrors, reset } = form;

  const selectedRoomType = watch('roomType');
  const numberOfGuestsValue = watch('numberOfGuests');
  const numberOfAdultsValue = watch('numberOfAdults');
  const numberOfChildrenValue = watch('numberOfChildren');
  const numberOfInfantsValue = watch('numberOfInfants');
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
    if (!isOpen) return;
    reset({
      checkInDate: reservation.checkInDate || '',
      checkOutDate: reservation.checkOutDate || '',
      numberOfAdults: reservation.numberOfAdults ?? Math.max(1, reservation.numberOfGuests || 1),
      numberOfChildren: reservation.numberOfChildren ?? 0,
      numberOfInfants: reservation.numberOfInfants ?? 0,
      numberOfGuests: reservation.numberOfGuests || 1,
      roomType: reservation.roomType || reservation.room?.type || '',
    }, {
      keepDirty: false,
      keepErrors: false,
    });
  }, [isOpen, reservation, reset]);

  React.useEffect(() => {
    const totalGuests = (numberOfAdultsValue || 0) + (numberOfChildrenValue || 0) + (numberOfInfantsValue || 0);
    if (totalGuests !== numberOfGuestsValue) {
      setValue('numberOfGuests', totalGuests, { shouldValidate: true, shouldDirty: true });
    }

    if (totalGuests <= 0) {
      setError('numberOfGuests', { type: 'manual', message: 'Debe registrar al menos 1 huésped.' });
    } else if (formState.errors.numberOfGuests?.type === 'manual' && formState.errors.numberOfGuests.message?.includes('al menos 1 huésped')) {
      clearErrors('numberOfGuests');
    }
  }, [numberOfAdultsValue, numberOfChildrenValue, numberOfInfantsValue, numberOfGuestsValue, setValue, setError, clearErrors, formState.errors.numberOfGuests]);

  React.useEffect(() => {
    if (!maxGuests) return;
    if (numberOfGuestsValue > maxGuests) {
      setError('numberOfGuests', { type: 'manual', message: `La habitación seleccionada admite máximo ${maxGuests} huéspedes.` });
    } else if (formState.errors.numberOfGuests?.type === 'manual' && formState.errors.numberOfGuests.message?.includes('habitación seleccionada')) {
      clearErrors('numberOfGuests');
    }
  }, [numberOfGuestsValue, maxGuests, setError, clearErrors, formState.errors.numberOfGuests]);

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
      numberOfAdults: values.numberOfAdults,
      numberOfChildren: values.numberOfChildren,
      numberOfInfants: values.numberOfInfants,
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
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div>
            <label htmlFor="reservation-edit-adults" className="mb-1 block text-sm font-medium text-slate-700">
              Adultos
            </label>
            <input
              id="reservation-edit-adults"
              type="number"
              min={1}
              className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${formState.errors.numberOfAdults ? 'border-rose-300 ring-rose-200 bg-rose-50' : 'border-slate-200'}`}
              {...register('numberOfAdults', { valueAsNumber: true })}
            />
            {formState.errors.numberOfAdults ? (
              <p className="mt-1 text-xs text-rose-600">{formState.errors.numberOfAdults.message}</p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">Debe haber al menos un adulto responsable.</p>
            )}
          </div>

          <div>
            <label htmlFor="reservation-edit-children" className="mb-1 block text-sm font-medium text-slate-700">
              Niños (3-12 años)
            </label>
            <input
              id="reservation-edit-children"
              type="number"
              min={0}
              className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${formState.errors.numberOfChildren ? 'border-rose-300 ring-rose-200 bg-rose-50' : 'border-slate-200'}`}
              {...register('numberOfChildren', { valueAsNumber: true })}
            />
            {formState.errors.numberOfChildren ? (
              <p className="mt-1 text-xs text-rose-600">{formState.errors.numberOfChildren.message}</p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">Incluye menores que ocupan cama.</p>
            )}
          </div>

          <div>
            <label htmlFor="reservation-edit-infants" className="mb-1 block text-sm font-medium text-slate-700">
              Bebés (0-2 años)
            </label>
            <input
              id="reservation-edit-infants"
              type="number"
              min={0}
              className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${formState.errors.numberOfInfants ? 'border-rose-300 ring-rose-200 bg-rose-50' : 'border-slate-200'}`}
              {...register('numberOfInfants', { valueAsNumber: true })}
            />
            {formState.errors.numberOfInfants ? (
              <p className="mt-1 text-xs text-rose-600">{formState.errors.numberOfInfants.message}</p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">Considera cunas o corrales si aplica.</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
              Huéspedes totales
            </label>
            <input
              id="reservation-edit-pax"
              type="number"
              min={1}
              max={maxGuests}
              readOnly
              className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm bg-slate-50 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${formState.errors.numberOfGuests ? 'border-rose-300 ring-rose-200 bg-rose-50' : 'border-slate-200'}`}
              value={Number.isFinite(numberOfGuestsValue) ? numberOfGuestsValue : ''}
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
