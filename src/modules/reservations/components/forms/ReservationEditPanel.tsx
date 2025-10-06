/**
 * ReservationEditPanel Component
 * 
 * Componente inline para edición de reservas que reemplaza el modal anterior.
 * Muestra un panel expansible con validaciones en tiempo real y tipado estricto.
 * 
 * Validaciones implementadas:
 * - fechaSalida > fechaEntrada
 * - fechaEntrada >= hoy
 * - total huéspedes <= capacidad habitación
 * - límites de PAX configurables por tipo de habitación
 * 
 * @see docs/GUIA-DESARROLLO.md - Patrones de validación con Zod
 * @see docs/Backend.md - Estructura de datos de reservas
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, X, AlertCircle } from 'lucide-react';
import type { Reservation } from '../../types';
import { useRoomTypes, useUpdateReservation } from '../../hooks/useReservationQueries';
import { Alert } from '../../../../components/ui/Alert';

/**
 * Schema de validación con Zod para edición de reservas.
 * Incluye validaciones cruzadas de fechas y límites de huéspedes.
 */
const reservationEditSchema = z.object({
  checkInDate: z.string().min(1, 'La fecha de entrada es obligatoria').max(10),
  checkOutDate: z.string().min(1, 'La fecha de salida es obligatoria').max(10),
  numberOfAdults: z
    .number()
    .int('Usa valores enteros')
    .min(1, 'Debe haber al menos 1 adulto')
    .max(8, 'Máximo 8 adultos por habitación'),
  numberOfChildren: z
    .number()
    .int('Usa valores enteros')
    .min(0, 'No puede ser negativo')
    .max(6, 'Máximo 6 niños por habitación'),
  numberOfInfants: z
    .number()
    .int('Usa valores enteros')
    .min(0, 'No puede ser negativo')
    .max(4, 'Máximo 4 bebés por habitación'),
  numberOfGuests: z
    .number()
    .int('Usa valores enteros')
    .min(1, 'Debe haber al menos 1 huésped')
    .max(12, 'Máximo 12 huéspedes total'),
  roomType: z.string().min(1, 'Selecciona el tipo de habitación').max(50),
  specialRequests: z.string().max(300, 'Máximo 300 caracteres').optional(),
}).superRefine((data, ctx) => {
  // Validación: fechaSalida > fechaEntrada
  const checkIn = new Date(data.checkInDate);
  const checkOut = new Date(data.checkOutDate);
  
  if (!Number.isFinite(checkIn.getTime()) || !Number.isFinite(checkOut.getTime())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Formato de fecha inválido',
      path: ['checkInDate'],
    });
    return;
  }

  // Validación: fecha entrada >= hoy
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  checkIn.setHours(0, 0, 0, 0);
  checkOut.setHours(0, 0, 0, 0);

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
      message: 'La fecha de salida debe ser posterior a la fecha de entrada',
      path: ['checkOutDate'],
    });
  }

  // Validación: adultos + niños + bebés = total huéspedes
  // 'calculatedTotal' representa la suma de todos los huéspedes individuales
  const calculatedTotal = data.numberOfAdults + data.numberOfChildren + data.numberOfInfants;
  if (calculatedTotal !== data.numberOfGuests) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `El total calculado (${calculatedTotal}) no coincide con el registrado`,
      path: ['numberOfGuests'],
    });
  }
});

type ReservationEditFormValues = z.infer<typeof reservationEditSchema>;

interface ReservationEditPanelProps {
  /** Reserva a editar con todos sus datos actuales */
  reservation: Reservation;
  /** Callback al cerrar el panel */
  onClose: () => void;
  /** Callback opcional al actualizar exitosamente */
  onUpdated?: (reservation: Reservation) => void;
}

/**
 * Panel inline para editar reservas existentes.
 * 
 * Características:
 * - Precarga correcta de datos (formato ISO para inputs date)
 * - Validaciones en tiempo real con React Hook Form + Zod
 * - Cálculo automático de total de huéspedes
 * - Validación de capacidad según tipo de habitación
 * - Mensajes de error claros y específicos
 * - Sin uso de tipos `any`
 */
export const ReservationEditPanel: React.FC<ReservationEditPanelProps> = ({
  reservation,
  onClose,
  onUpdated,
}) => {
  const { data: roomTypes = [], isLoading: isLoadingRoomTypes } = useRoomTypes();
  const updateReservation = useUpdateReservation();

  /**
   * Helper: convierte fecha ISO completa a formato YYYY-MM-DD para input[type="date"]
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

  const form = useForm<ReservationEditFormValues>({
    resolver: zodResolver(reservationEditSchema),
    defaultValues: {
      checkInDate: formatDateForInput(reservation.checkInDate),
      checkOutDate: formatDateForInput(reservation.checkOutDate),
      numberOfAdults: reservation.numberOfAdults ?? Math.max(1, reservation.numberOfGuests || 1),
      numberOfChildren: reservation.numberOfChildren ?? 0,
      numberOfInfants: reservation.numberOfInfants ?? 0,
      numberOfGuests: reservation.numberOfGuests || 1,
      roomType: reservation.roomType || reservation.room?.type || '',
      specialRequests: reservation.specialRequests || '',
    },
    mode: 'onChange', // Validación en tiempo real
  });

  const { register, handleSubmit, formState, watch, setValue, setError, clearErrors } = form;

  // Observar valores para validaciones dinámicas
  const selectedRoomType = watch('roomType');
  const numberOfGuestsValue = watch('numberOfGuests');
  const numberOfAdultsValue = watch('numberOfAdults');
  const numberOfChildrenValue = watch('numberOfChildren');
  const numberOfInfantsValue = watch('numberOfInfants');
  const checkInValue = watch('checkInDate');
  const checkOutValue = watch('checkOutDate');

  /**
   * Busca la información del tipo de habitación seleccionado
   */
  const roomInfo = React.useMemo(() => (
    roomTypes.find((type) => type.type === selectedRoomType) || null
  ), [roomTypes, selectedRoomType]);

  /**
   * Calcula la capacidad máxima permitida según la habitación
   */
  const maxGuests = React.useMemo(() => {
    if (roomInfo?.capacity) return roomInfo.capacity;
    if (reservation.room?.capacity) return reservation.room.capacity;
    return Math.max(1, reservation.numberOfGuests, 6);
  }, [roomInfo, reservation.room?.capacity, reservation.numberOfGuests]);

  /**
   * Efecto: recalcula total de huéspedes cuando cambian adultos, niños o bebés
   */
  React.useEffect(() => {
    const totalGuests = (numberOfAdultsValue || 0) + (numberOfChildrenValue || 0) + (numberOfInfantsValue || 0);
    if (totalGuests !== numberOfGuestsValue) {
      setValue('numberOfGuests', totalGuests, { shouldValidate: true, shouldDirty: true });
    }

    // Validación manual: debe haber al menos 1 huésped
    if (totalGuests <= 0) {
      setError('numberOfGuests', { type: 'manual', message: 'Debe registrar al menos 1 huésped.' });
    } else if (formState.errors.numberOfGuests?.type === 'manual' && formState.errors.numberOfGuests.message?.includes('al menos 1 huésped')) {
      clearErrors('numberOfGuests');
    }
  }, [numberOfAdultsValue, numberOfChildrenValue, numberOfInfantsValue, numberOfGuestsValue, setValue, setError, clearErrors, formState.errors.numberOfGuests]);

  /**
   * Efecto: valida que los huéspedes no excedan la capacidad de la habitación
   */
  React.useEffect(() => {
    if (!maxGuests) return;
    if (numberOfGuestsValue > maxGuests) {
      setError('numberOfGuests', { type: 'manual', message: `La habitación seleccionada admite máximo ${maxGuests} huéspedes.` });
    } else if (formState.errors.numberOfGuests?.type === 'manual' && formState.errors.numberOfGuests.message?.includes('habitación seleccionada')) {
      clearErrors('numberOfGuests');
    }
  }, [numberOfGuestsValue, maxGuests, setError, clearErrors, formState.errors.numberOfGuests]);

  /**
   * Handler: envía la actualización de la reserva
   */
  const onSubmit = handleSubmit(async (values) => {
    // Validación final de fechas antes de enviar
    if (values.checkInDate && values.checkOutDate) {
      const checkIn = new Date(values.checkInDate);
      const checkOut = new Date(values.checkOutDate);
      if (!Number.isFinite(checkIn.getTime()) || !Number.isFinite(checkOut.getTime()) || checkOut <= checkIn) {
        setError('checkOutDate', { type: 'manual', message: 'La salida debe ser posterior a la entrada seleccionada.' });
        return;
      }
    }

    // Validación final de capacidad
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
      specialRequests: values.specialRequests,
    };

    try {
      const updated = await updateReservation.mutateAsync({ id: reservation.id, updates });
      if (updated) {
        onUpdated?.(updated);
        onClose();
      }
    } catch (error) {
      console.error('Error al actualizar la reserva:', error);
    }
  });

  /**
   * Calcula y muestra el preview de noches de estadía
   */
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

  return (
    <div className="mb-6 rounded-2xl border-2 border-emerald-500 bg-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-emerald-50 px-6 py-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">✏️ Editar reserva</h2>
          <p className="text-sm text-slate-600">Confirmación: <span className="font-mono font-semibold">{reservation.confirmationNumber}</span></p>
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
      <form onSubmit={onSubmit} className="space-y-6 px-6 py-6" noValidate>
            {updateReservation.isError && (
              <Alert
                type="error"
                title="No se pudo guardar los cambios"
                message="Intenta nuevamente o verifica tu conexión."
              />
            )}

            {/* Fechas */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="edit-checkin" className="mb-1 block text-sm font-medium text-slate-700">
                  Fecha de entrada <span className="text-rose-500">*</span>
                </label>
                <input
                  id="edit-checkin"
                  type="date"
                  className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${formState.errors.checkInDate ? 'border-rose-300 bg-rose-50' : 'border-slate-200'}`}
                  {...register('checkInDate')}
                />
                {formState.errors.checkInDate && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-rose-600">
                    <AlertCircle className="h-3 w-3" />
                    {formState.errors.checkInDate.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="edit-checkout" className="mb-1 block text-sm font-medium text-slate-700">
                  Fecha de salida <span className="text-rose-500">*</span>
                </label>
                <input
                  id="edit-checkout"
                  type="date"
                  className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${formState.errors.checkOutDate ? 'border-rose-300 bg-rose-50' : 'border-slate-200'}`}
                  {...register('checkOutDate')}
                />
                {formState.errors.checkOutDate && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-rose-600">
                    <AlertCircle className="h-3 w-3" />
                    {formState.errors.checkOutDate.message}
                  </p>
                )}
              </div>
            </div>

            {/* Huéspedes */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div>
                <label htmlFor="edit-adults" className="mb-1 block text-sm font-medium text-slate-700">
                  Adultos <span className="text-rose-500">*</span>
                </label>
                <input
                  id="edit-adults"
                  type="number"
                  min={1}
                  max={8}
                  className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${formState.errors.numberOfAdults ? 'border-rose-300 bg-rose-50' : 'border-slate-200'}`}
                  {...register('numberOfAdults', { valueAsNumber: true })}
                />
                {formState.errors.numberOfAdults ? (
                  <p className="mt-1 flex items-center gap-1 text-xs text-rose-600">
                    <AlertCircle className="h-3 w-3" />
                    {formState.errors.numberOfAdults.message}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-slate-500">Mín: 1, Máx: 8</p>
                )}
              </div>

              <div>
                <label htmlFor="edit-children" className="mb-1 block text-sm font-medium text-slate-700">
                  Niños (3-12 años)
                </label>
                <input
                  id="edit-children"
                  type="number"
                  min={0}
                  max={6}
                  className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${formState.errors.numberOfChildren ? 'border-rose-300 bg-rose-50' : 'border-slate-200'}`}
                  {...register('numberOfChildren', { valueAsNumber: true })}
                />
                {formState.errors.numberOfChildren ? (
                  <p className="mt-1 flex items-center gap-1 text-xs text-rose-600">
                    <AlertCircle className="h-3 w-3" />
                    {formState.errors.numberOfChildren.message}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-slate-500">Máx: 6</p>
                )}
              </div>

              <div>
                <label htmlFor="edit-infants" className="mb-1 block text-sm font-medium text-slate-700">
                  Bebés (0-2 años)
                </label>
                <input
                  id="edit-infants"
                  type="number"
                  min={0}
                  max={4}
                  className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${formState.errors.numberOfInfants ? 'border-rose-300 bg-rose-50' : 'border-slate-200'}`}
                  {...register('numberOfInfants', { valueAsNumber: true })}
                />
                {formState.errors.numberOfInfants ? (
                  <p className="mt-1 flex items-center gap-1 text-xs text-rose-600">
                    <AlertCircle className="h-3 w-3" />
                    {formState.errors.numberOfInfants.message}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-slate-500">Máx: 4</p>
                )}
              </div>
            </div>

            {/* Habitación y Total */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="edit-room" className="mb-1 block text-sm font-medium text-slate-700">
                  Tipo de habitación <span className="text-rose-500">*</span>
                </label>
                <select
                  id="edit-room"
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
                  <p className="mt-1 flex items-center gap-1 text-xs text-rose-600">
                    <AlertCircle className="h-3 w-3" />
                    {formState.errors.roomType.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="edit-pax" className="mb-1 block text-sm font-medium text-slate-700">
                  Huéspedes totales
                </label>
                <input
                  id="edit-pax"
                  type="number"
                  readOnly
                  className={`w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm shadow-sm ${formState.errors.numberOfGuests ? 'border-rose-300 bg-rose-50' : 'border-slate-200'}`}
                  value={Number.isFinite(numberOfGuestsValue) ? numberOfGuestsValue : ''}
                  {...register('numberOfGuests', { valueAsNumber: true })}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Máximo: {maxGuests} según tipo de habitación
                </p>
                {formState.errors.numberOfGuests && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-rose-600">
                    <AlertCircle className="h-3 w-3" />
                    {formState.errors.numberOfGuests.message}
                  </p>
                )}
              </div>
            </div>

            {/* Solicitudes especiales */}
            <div>
              <label htmlFor="edit-special" className="mb-1 block text-sm font-medium text-slate-700">
                Solicitudes especiales
              </label>
              <textarea
                id="edit-special"
                rows={3}
                maxLength={300}
                className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${formState.errors.specialRequests ? 'border-rose-300 bg-rose-50' : 'border-slate-200'}`}
                placeholder="Ej: Cama extra, vista al mar, piso alto..."
                {...register('specialRequests')}
              />
              {formState.errors.specialRequests && (
                <p className="mt-1 flex items-center gap-1 text-xs text-rose-600">
                  <AlertCircle className="h-3 w-3" />
                  {formState.errors.specialRequests.message}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500">Máximo 300 caracteres</p>
            </div>

            {/* Preview de noches */}
            {nightsPreview && (
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                ✓ Duración estimada: <strong>{nightsPreview}</strong> noche{nightsPreview === 1 ? '' : 's'}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={onClose}
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
                {updateReservation.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                Guardar cambios
              </button>
            </div>
          </form>
    </div>
  );
};
