/**
 * ReservationEditPage Component
 * 
 * Vista dedicada para editar reservas existentes.
 * Navega desde /reservations mediante el botón "Editar".
 * 
 * Flujo de datos:
 * - useQuery: obtiene datos de la reserva desde API
 * - useMutation: guarda cambios y invalida caché
 * - useNavigate: redirige de vuelta a /reservations
 * 
 * @see docs/Backend.md - Endpoints PUT /api/reservas/:id
 * @see docs/GUIA-DESARROLLO.md - Patrones React Query
 */

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import type { Reservation } from '../types';
import { useRoomTypes, useUpdateReservation } from '../hooks/useReservationQueries';
import { reservationService } from '../services/reservationService';
import { Alert } from '../../../components/ui/Alert';

/**
 * Schema de validación para edición de reservas
 */
const editReservationSchema = z.object({
  checkInDate: z.string().min(1, 'La fecha de entrada es obligatoria').max(10),
  checkOutDate: z.string().min(1, 'La fecha de salida es obligatoria').max(10),
  numberOfAdults: z.number().int().min(1, 'Mínimo 1 adulto').max(8, 'Máximo 8 adultos'),
  numberOfChildren: z.number().int().min(0).max(6, 'Máximo 6 niños'),
  numberOfInfants: z.number().int().min(0).max(4, 'Máximo 4 bebés'),
  numberOfGuests: z.number().int().min(1).max(12),
  roomType: z.string().min(1, 'Selecciona tipo de habitación').max(50),
  specialRequests: z.string().max(300, 'Máximo 300 caracteres').optional(),
}).superRefine((data, ctx) => {
  const checkIn = new Date(data.checkInDate);
  const checkOut = new Date(data.checkOutDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!Number.isFinite(checkIn.getTime()) || !Number.isFinite(checkOut.getTime())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Formato de fecha inválido',
      path: ['checkInDate'],
    });
    return;
  }

  if (checkIn < today) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'La fecha de entrada no puede ser anterior a hoy',
      path: ['checkInDate'],
    });
  }

  if (checkOut <= checkIn) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'La fecha de salida debe ser posterior a la entrada',
      path: ['checkOutDate'],
    });
  }

  const calculatedGuestTotal = data.numberOfAdults + data.numberOfChildren + data.numberOfInfants;
  if (calculatedGuestTotal !== data.numberOfGuests) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Total calculado (${calculatedGuestTotal}) no coincide`,
      path: ['numberOfGuests'],
    });
  }
});

type EditReservationFormData = z.infer<typeof editReservationSchema>;

/**
 * Helper: formatea fecha ISO a YYYY-MM-DD para input[type="date"]
 */
const formatDateForInput = (isoDate: string | undefined): string => {
  if (!isoDate) return '';
  try {
    const date = new Date(isoDate);
    if (!Number.isFinite(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

export const ReservationEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const updateReservation = useUpdateReservation();

  /**
   * Query: obtiene datos de la reserva desde API
   */
  const { data: reservation, isLoading, isError } = useQuery<Reservation | null>({
    queryKey: ['reservation', id],
    queryFn: () => reservationService.getReservationById(id!),
    enabled: !!id,
  });

  /**
   * Query: obtiene tipos de habitación disponibles
   */
  const { data: roomTypes = [], isLoading: isLoadingRoomTypes } = useRoomTypes();

  const form = useForm<EditReservationFormData>({
    resolver: zodResolver(editReservationSchema),
    values: reservation ? {
      checkInDate: formatDateForInput(reservation.checkInDate),
      checkOutDate: formatDateForInput(reservation.checkOutDate),
      numberOfAdults: reservation.numberOfAdults ?? 1,
      numberOfChildren: reservation.numberOfChildren ?? 0,
      numberOfInfants: reservation.numberOfInfants ?? 0,
      numberOfGuests: reservation.numberOfGuests || 1,
      roomType: reservation.roomType || reservation.room?.type || '',
      specialRequests: reservation.specialRequests || '',
    } : undefined,
    mode: 'onChange',
  });

  const { register, handleSubmit, formState, watch, setValue, setError, clearErrors } = form;

  const selectedRoomType = watch('roomType');
  const numberOfGuestsValue = watch('numberOfGuests');
  const numberOfAdultsValue = watch('numberOfAdults');
  const numberOfChildrenValue = watch('numberOfChildren');
  const numberOfInfantsValue = watch('numberOfInfants');
  const checkInValue = watch('checkInDate');
  const checkOutValue = watch('checkOutDate');

  const roomInfo = React.useMemo(
    () => roomTypes.find((type) => type.type === selectedRoomType) || null,
    [roomTypes, selectedRoomType]
  );

  const maxGuests = React.useMemo(() => {
    if (roomInfo?.capacity) return roomInfo.capacity;
    if (reservation?.room?.capacity) return reservation.room.capacity;
    return 6;
  }, [roomInfo, reservation?.room?.capacity]);

  /**
   * Efecto: calcula total de huéspedes automáticamente
   * Solo actualiza si el total calculado difiere del valor actual
   */
  React.useEffect(() => {
    const calculatedGuestTotal = (numberOfAdultsValue || 0) + (numberOfChildrenValue || 0) + (numberOfInfantsValue || 0);
    if (calculatedGuestTotal !== numberOfGuestsValue) {
      setValue('numberOfGuests', calculatedGuestTotal, { shouldValidate: true });
    }
  }, [numberOfAdultsValue, numberOfChildrenValue, numberOfInfantsValue, numberOfGuestsValue, setValue]);

  /**
   * Efecto: valida capacidad de habitación
   * Actualiza error solo cuando numberOfGuests o maxGuests cambian
   */
  React.useEffect(() => {
    if (!maxGuests) return;
    if (numberOfGuestsValue > maxGuests) {
      setError('numberOfGuests', { type: 'manual', message: `Máximo ${maxGuests} huéspedes para esta habitación` });
    } else {
      clearErrors('numberOfGuests');
    }
  }, [numberOfGuestsValue, maxGuests, setError, clearErrors]);

  /**
   * Handler: guarda cambios usando mutation
   */
  const onSubmit = handleSubmit(async (values) => {
    if (!id || !reservation) return;

    if (values.numberOfGuests > maxGuests) {
      setError('numberOfGuests', { type: 'manual', message: `Máximo ${maxGuests} huéspedes` });
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
      specialRequests: values.specialRequests,
    };

    try {
      await updateReservation.mutateAsync({ id: reservation.id, updates });
      toast.success('Reserva actualizada correctamente');
      navigate('/reservations');
    } catch (error) {
      toast.error('Error al actualizar la reserva');
      console.error('Error:', error);
    }
  });

  const nightsPreview = React.useMemo(() => {
    if (!checkInValue || !checkOutValue) return null;
    try {
      const checkIn = new Date(checkInValue);
      const checkOut = new Date(checkOutValue);
      const diff = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : null;
    } catch {
      return null;
    }
  }, [checkInValue, checkOutValue]);

  /**
   * Loading state: muestra skeleton
   */
  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-10 w-32 animate-pulse rounded-lg bg-slate-200" />
        </div>
        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-24 animate-pulse rounded-lg bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  /**
   * Error state: reserva no encontrada
   */
  if (isError || !reservation) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
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
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
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
            <h1 className="text-3xl font-semibold text-slate-900">Editar reserva</h1>
            <p className="mt-1 text-sm text-slate-500">
              Confirmación: <span className="font-mono font-semibold">{reservation.confirmationNumber}</span>
            </p>
            {reservation.guest && (
              <p className="mt-1 text-sm text-slate-600">
                {reservation.guest.firstName} {reservation.guest.firstLastName}
              </p>
            )}
          </div>

          {/* Formulario */}
          <form onSubmit={onSubmit} className="space-y-6" noValidate>
        {updateReservation.isError && (
          <Alert
            type="error"
            title="Error al guardar"
            message="No se pudieron guardar los cambios. Intenta nuevamente."
          />
        )}

        {/* Fechas */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="checkInDate" className="mb-1 block text-sm font-medium text-slate-700">
              Fecha de entrada <span className="text-rose-500">*</span>
            </label>
            <input
              id="checkInDate"
              type="date"
              className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${formState.errors.checkInDate ? 'border-rose-300 bg-rose-50' : 'border-slate-200'}`}
              {...register('checkInDate')}
            />
            {formState.errors.checkInDate && (
              <p className="mt-1 text-xs text-rose-600">{formState.errors.checkInDate.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="checkOutDate" className="mb-1 block text-sm font-medium text-slate-700">
              Fecha de salida <span className="text-rose-500">*</span>
            </label>
            <input
              id="checkOutDate"
              type="date"
              className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${formState.errors.checkOutDate ? 'border-rose-300 bg-rose-50' : 'border-slate-200'}`}
              {...register('checkOutDate')}
            />
            {formState.errors.checkOutDate && (
              <p className="mt-1 text-xs text-rose-600">{formState.errors.checkOutDate.message}</p>
            )}
          </div>
        </div>

        {/* Huéspedes */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div>
            <label htmlFor="numberOfAdults" className="mb-1 block text-sm font-medium text-slate-700">
              Adultos <span className="text-rose-500">*</span>
            </label>
            <input
              id="numberOfAdults"
              type="number"
              min={1}
              max={8}
              className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${formState.errors.numberOfAdults ? 'border-rose-300 bg-rose-50' : 'border-slate-200'}`}
              {...register('numberOfAdults', { valueAsNumber: true })}
            />
            {formState.errors.numberOfAdults ? (
              <p className="mt-1 text-xs text-rose-600">{formState.errors.numberOfAdults.message}</p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">Mín: 1, Máx: 8</p>
            )}
          </div>

          <div>
            <label htmlFor="numberOfChildren" className="mb-1 block text-sm font-medium text-slate-700">
              Niños (3-12 años)
            </label>
            <input
              id="numberOfChildren"
              type="number"
              min={0}
              max={6}
              className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${formState.errors.numberOfChildren ? 'border-rose-300 bg-rose-50' : 'border-slate-200'}`}
              {...register('numberOfChildren', { valueAsNumber: true })}
            />
            {formState.errors.numberOfChildren ? (
              <p className="mt-1 text-xs text-rose-600">{formState.errors.numberOfChildren.message}</p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">Máx: 6</p>
            )}
          </div>

          <div>
            <label htmlFor="numberOfInfants" className="mb-1 block text-sm font-medium text-slate-700">
              Bebés (0-2 años)
            </label>
            <input
              id="numberOfInfants"
              type="number"
              min={0}
              max={4}
              className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${formState.errors.numberOfInfants ? 'border-rose-300 bg-rose-50' : 'border-slate-200'}`}
              {...register('numberOfInfants', { valueAsNumber: true })}
            />
            {formState.errors.numberOfInfants ? (
              <p className="mt-1 text-xs text-rose-600">{formState.errors.numberOfInfants.message}</p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">Máx: 4</p>
            )}
          </div>
        </div>

        {/* Habitación y Total */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="roomType" className="mb-1 block text-sm font-medium text-slate-700">
              Tipo de habitación <span className="text-rose-500">*</span>
            </label>
            <select
              id="roomType"
              className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${formState.errors.roomType ? 'border-rose-300 bg-rose-50' : 'border-slate-200'}`}
              disabled={isLoadingRoomTypes}
              {...register('roomType')}
            >
              <option value="">Selecciona una opción</option>
              {roomTypes.map((type) => (
                <option key={type.type} value={type.type}>
                  {type.name} (Capacidad: {type.capacity ?? '—'})
                </option>
              ))}
            </select>
            {formState.errors.roomType && (
              <p className="mt-1 text-xs text-rose-600">{formState.errors.roomType.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="numberOfGuests" className="mb-1 block text-sm font-medium text-slate-700">
              Huéspedes totales
            </label>
            <input
              id="numberOfGuests"
              type="number"
              readOnly
              className={`w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm shadow-sm ${formState.errors.numberOfGuests ? 'border-rose-300 bg-rose-50' : 'border-slate-200'}`}
              value={Number.isFinite(numberOfGuestsValue) ? numberOfGuestsValue : ''}
              {...register('numberOfGuests', { valueAsNumber: true })}
            />
            <p className="mt-1 text-xs text-slate-500">Máximo: {maxGuests} según habitación</p>
            {formState.errors.numberOfGuests && (
              <p className="mt-1 text-xs text-rose-600">{formState.errors.numberOfGuests.message}</p>
            )}
          </div>
        </div>

        {/* Solicitudes especiales */}
        <div>
          <label htmlFor="specialRequests" className="mb-1 block text-sm font-medium text-slate-700">
            Solicitudes especiales
          </label>
          <textarea
            id="specialRequests"
            rows={3}
            maxLength={300}
            className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${formState.errors.specialRequests ? 'border-rose-300 bg-rose-50' : 'border-slate-200'}`}
            placeholder="Ej: Cama extra, vista al mar, piso alto..."
            {...register('specialRequests')}
          />
          {formState.errors.specialRequests && (
            <p className="mt-1 text-xs text-rose-600">{formState.errors.specialRequests.message}</p>
          )}
          <p className="mt-1 text-xs text-slate-500">Máximo 300 caracteres</p>
        </div>

        {/* Preview noches */}
        {nightsPreview && (
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            ✓ Duración: <strong>{nightsPreview}</strong> noche{nightsPreview === 1 ? '' : 's'}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={() => navigate('/reservations')}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            disabled={updateReservation.isPending}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={updateReservation.isPending || !formState.isValid}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            {updateReservation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Guardar cambios
          </button>
        </div>
      </form>
        </div>
      </div>
    </div>
  );
};
