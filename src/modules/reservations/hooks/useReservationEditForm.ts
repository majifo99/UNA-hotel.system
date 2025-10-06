/**
 * Custom Hook: useReservationEditForm
 * 
 * Encapsula toda la lógica de formulario de edición de reservas para eliminar duplicación
 * entre ReservationEditPanel y ReservationEditPage.
 * 
 * Responsabilidades:
 * - Watch de campos del formulario
 * - Cálculo de capacidad máxima según tipo de habitación
 * - Validación automática de total de huéspedes
 * - Validación de capacidad de habitación
 * - Handler de submit con validaciones finales
 */

import React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { Reservation } from '../types';

export interface ReservationEditFormValues {
  checkInDate: string;
  checkOutDate: string;
  numberOfAdults: number;
  numberOfChildren: number;
  numberOfInfants: number;
  numberOfGuests: number;
  roomType: string;
  specialRequests?: string;
}

export interface UseReservationEditFormParams {
  form: UseFormReturn<ReservationEditFormValues>;
  reservation: Reservation;
  roomTypes: Array<{ type: string; capacity?: number }>;
  onSubmitSuccess: (updates: Partial<Reservation>) => Promise<void>;
}

export interface UseReservationEditFormReturn {
  selectedRoomType: string;
  numberOfGuestsValue: number;
  numberOfAdultsValue: number;
  numberOfChildrenValue: number;
  numberOfInfantsValue: number;
  checkInValue: string;
  checkOutValue: string;
  roomInfo: { type: string; capacity?: number } | null;
  maxGuests: number;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

/**
 * Hook personalizado para manejar la lógica del formulario de edición de reservas
 */
export const useReservationEditForm = ({
  form,
  reservation,
  roomTypes,
  onSubmitSuccess,
}: UseReservationEditFormParams): UseReservationEditFormReturn => {
  const { watch, setValue, setError, clearErrors, handleSubmit, formState } = form;

  // Observar valores del formulario
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
   * Handler: envía la actualización de la reserva con validaciones finales
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

    await onSubmitSuccess(updates);
  });

  return {
    selectedRoomType,
    numberOfGuestsValue,
    numberOfAdultsValue,
    numberOfChildrenValue,
    numberOfInfantsValue,
    checkInValue,
    checkOutValue,
    roomInfo,
    maxGuests,
    onSubmit,
  };
};
