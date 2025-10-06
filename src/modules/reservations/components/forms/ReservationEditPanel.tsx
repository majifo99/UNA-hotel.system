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
import type { Reservation } from '../../types';
import { useRoomTypes, useUpdateReservation } from '../../hooks/useReservationQueries';
import {
  ReservationPanelBase,
  FormInput,
  FormSelect,
  FormTextarea,
  ActionButtons,
  formatDateForInput,
  calculateNights,
} from './shared';

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
  const nightsPreview = React.useMemo(() => 
    calculateNights(checkInValue, checkOutValue),
    [checkInValue, checkOutValue]
  );

  const roomOptions = roomTypes.map((type) => ({
    value: type.type,
    label: `${type.name} (Capacidad: ${type.capacity ?? '—'})`,
  }));

  return (
    <ReservationPanelBase
      variant="edit"
      title="Editar reserva"
      reservation={reservation}
      onClose={onClose}
      mutationError={updateReservation.isError}
    >
      <form onSubmit={onSubmit} className="space-y-6" noValidate>

        {/* Fechas */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormInput
            id="edit-checkin"
            label="Fecha de entrada"
            type="date"
            required
            error={formState.errors.checkInDate?.message}
            register={register('checkInDate')}
          />
          <FormInput
            id="edit-checkout"
            label="Fecha de salida"
            type="date"
            required
            error={formState.errors.checkOutDate?.message}
            register={register('checkOutDate')}
          />
        </div>

        {/* Huéspedes */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <FormInput
            id="edit-adults"
            label="Adultos"
            type="number"
            required
            min={1}
            max={8}
            error={formState.errors.numberOfAdults?.message}
            helperText="Mín: 1, Máx: 8"
            register={register('numberOfAdults', { valueAsNumber: true })}
          />
          <FormInput
            id="edit-children"
            label="Niños (3-12 años)"
            type="number"
            min={0}
            max={6}
            error={formState.errors.numberOfChildren?.message}
            helperText="Máx: 6"
            register={register('numberOfChildren', { valueAsNumber: true })}
          />
          <FormInput
            id="edit-infants"
            label="Bebés (0-2 años)"
            type="number"
            min={0}
            max={4}
            error={formState.errors.numberOfInfants?.message}
            helperText="Máx: 4"
            register={register('numberOfInfants', { valueAsNumber: true })}
          />
        </div>

        {/* Habitación y Total */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormSelect
            id="edit-room"
            label="Tipo de habitación"
            required
            error={formState.errors.roomType?.message}
            disabled={isLoadingRoomTypes}
            options={roomOptions}
            register={register('roomType')}
          />
          <FormInput
            id="edit-pax"
            label="Huéspedes totales"
            type="number"
            readOnly
            value={Number.isFinite(numberOfGuestsValue) ? numberOfGuestsValue : ''}
            error={formState.errors.numberOfGuests?.message}
            helperText={`Máximo: ${maxGuests} según tipo de habitación`}
            register={register('numberOfGuests', { valueAsNumber: true })}
          />
        </div>

        {/* Solicitudes especiales */}
        <FormTextarea
          id="edit-special"
          label="Solicitudes especiales"
          rows={3}
          maxLength={300}
          placeholder="Ej: Cama extra, vista al mar, piso alto..."
          error={formState.errors.specialRequests?.message}
          helperText="Máximo 300 caracteres"
          register={register('specialRequests')}
        />

        {/* Preview de noches */}
        {nightsPreview && (
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            ✓ Duración estimada: <strong>{nightsPreview}</strong> noche{nightsPreview === 1 ? '' : 's'}
          </div>
        )}

        <ActionButtons
          variant="primary"
          cancelLabel="Cancelar"
          confirmLabel="Guardar cambios"
          onCancel={onClose}
          onConfirm={onSubmit}
          disabled={updateReservation.isPending}
          confirmDisabled={!formState.isValid}
          isLoading={updateReservation.isPending}
        />
      </form>
    </ReservationPanelBase>
  );
};
