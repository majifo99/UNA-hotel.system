/**
 * useReservationFormLogic Hook
 * 
 * Lógica compartida para formularios de reservas (creación, edición, cancelación).
 * Centraliza validaciones, cálculos y transformaciones comunes.
 * 
 * @module hooks/useReservationFormLogic
 */

import type { ReservationValidationErrors } from '../types';
import { validateAdvanceBooking } from '../constants/businessRules';

/**
 * Parsea valor a número seguro
 */
export const parseGuestCount = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

/**
 * Valida selección de huésped
 */
export const validateGuest = (guestId: string, errors: ReservationValidationErrors): void => {
  if (!guestId) {
    errors.guestId = 'Debe seleccionar un huésped para continuar';
  }
};

/**
 * Valida presencia de fechas básicas
 */
export const validateBasicDates = (
  checkInDate: string,
  checkOutDate: string,
  errors: ReservationValidationErrors
): void => {
  if (!checkInDate) {
    errors.checkInDate = 'La fecha de entrada es requerida';
  }
  if (!checkOutDate) {
    errors.checkOutDate = 'La fecha de salida es requerida';
  }
};

/**
 * Valida lógica de fechas (orden, pasado, futuro lejano)
 */
export const validateDateLogic = (
  checkInDate: string,
  checkOutDate: string,
  numberOfNights: number,
  errors: ReservationValidationErrors
): void => {
  if (!checkInDate || !checkOutDate) return;

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkIn < today) {
    errors.checkInDate = 'La fecha de entrada no puede ser anterior a hoy';
  }

  if (checkOut <= checkIn) {
    errors.checkOutDate = 'La fecha de salida debe ser posterior a la fecha de entrada';
  }

  const advanceBookingValidation = validateAdvanceBooking(checkIn, today);
  if (!advanceBookingValidation.isValid && advanceBookingValidation.isTooFarInFuture) {
    errors.checkInDate = `No se pueden hacer reservas con más de ${advanceBookingValidation.maxDaysAllowed} días de anticipación`;
  }

  const maxStayDays = 30;
  if (numberOfNights > maxStayDays) {
    errors.checkOutDate = `La estadía máxima permitida es de ${maxStayDays} noches`;
  }
  if (numberOfNights < 1) {
    errors.checkOutDate = 'La reserva debe ser de al menos 1 noche';
  }
};

/**
 * Valida conteo y capacidad de huéspedes
 */
export const validateGuestCapacity = (
  numberOfGuests: number,
  roomCapacity: number | undefined,
  roomName: string | undefined,
  errors: ReservationValidationErrors
): void => {
  if (numberOfGuests < 1) {
    errors.numberOfGuests = 'Debe especificar al menos 1 huésped';
  }
  if (numberOfGuests > 10) {
    errors.numberOfGuests = 'El número máximo de huéspedes por reserva es 10';
  }

  if (roomCapacity && numberOfGuests > roomCapacity) {
    errors.numberOfGuests = `La habitación ${roomName || ''} tiene capacidad máxima de ${roomCapacity} huésped${roomCapacity > 1 ? 'es' : ''}. Seleccione otra habitación o reduzca el número de huéspedes.`;
  }
};

/**
 * Valida disponibilidad de habitación
 */
export const validateRoomAvailability = (
  roomType: string,
  availableRoomsCount: number,
  hasValidDates: boolean,
  errors: ReservationValidationErrors
): void => {
  if (!roomType && availableRoomsCount > 0) {
    errors.roomType = 'Debe seleccionar un tipo de habitación';
  }

  if (availableRoomsCount === 0 && hasValidDates) {
    errors.roomType = 'No hay habitaciones disponibles para las fechas seleccionadas. Por favor, seleccione otras fechas.';
  }
};

/**
 * Calcula número de noches entre dos fechas
 */
export const calculateNights = (checkInDate: string, checkOutDate: string): number => {
  if (!checkInDate || !checkOutDate) return 0;

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  if (checkOut <= checkIn) return 0;

  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Calcula pricing para reserva
 */
export const calculatePricing = (
  roomPricePerNight: number,
  numberOfNights: number,
  servicesTotal: number,
  taxRate = 0.13,
  depositRate = 0.5
): {
  subtotal: number;
  taxes: number;
  total: number;
  depositRequired: number;
} => {
  const subtotal = roomPricePerNight * numberOfNights;
  const taxes = (subtotal + servicesTotal) * taxRate;
  const total = subtotal + servicesTotal + taxes;
  const depositRequired = total * depositRate;

  return { subtotal, taxes, total, depositRequired };
};

/**
 * Valida campo de fecha en tiempo real
 */
export const validateDateField = (
  field: 'checkInDate' | 'checkOutDate',
  value: string,
  otherDate: string
): string | undefined => {
  if (!value) return undefined;

  const date = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (field === 'checkInDate' && date < today) {
    return 'La fecha de entrada no puede ser anterior a hoy';
  }

  if (field === 'checkOutDate' && otherDate) {
    const checkIn = new Date(otherDate);
    if (date <= checkIn) {
      return 'La fecha de salida debe ser posterior a la fecha de entrada';
    }
  }

  return undefined;
};

/**
 * Valida conteo de huéspedes en tiempo real
 */
export const validateGuestCount = (
  count: number,
  roomCapacity: number | undefined,
  roomName: string | undefined
): string | undefined => {
  if (count < 1) {
    return 'Debe especificar al menos 1 huésped';
  }
  if (count > 10) {
    return 'El número máximo de huéspedes por reserva es 10';
  }
  if (roomCapacity && count > roomCapacity) {
    return `La habitación ${roomName || ''} tiene capacidad máxima de ${roomCapacity} huésped${roomCapacity > 1 ? 'es' : ''}`;
  }
  return undefined;
};
