import { z } from 'zod';

// Guest Schema - using centralized guest type structure
export const guestSchema = z.object({
  id: z.string().min(1, 'ID es requerido'),
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(8, 'El teléfono debe tener al menos 8 dígitos'),
  nationality: z.string().min(2, 'La nacionalidad es requerida'),
  documentType: z.enum(['passport', 'id', 'license']),
  documentNumber: z.string().min(5, 'El documento debe tener al menos 5 caracteres'),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Reservation Details Schema
export const reservationDetailsSchema = z.object({
  checkInDate: z.string().min(1, 'La fecha de entrada es requerida'),
  checkOutDate: z.string().min(1, 'La fecha de salida es requerida'),
  numberOfGuests: z.number().min(1, 'Debe haber al menos 1 huésped').max(10, 'Máximo 10 huéspedes'),
});

// Complete Reservation Schema
export const reservationSchema = z.object({
  guest: guestSchema,
  checkInDate: z.string().min(1, 'La fecha de entrada es requerida'),
  checkOutDate: z.string().min(1, 'La fecha de salida es requerida'),
  numberOfGuests: z.number().min(1, 'Debe haber al menos 1 huésped').max(10, 'Máximo 10 huéspedes'),
  numberOfNights: z.number().min(1, 'Debe ser al menos 1 noche'),
  roomType: z.enum(['single', 'double', 'triple', 'suite', 'family']),
  roomId: z.string().optional(),
  additionalServices: z.array(z.string()),
  subtotal: z.number(),
  servicesTotal: z.number(),
  taxes: z.number(),
  total: z.number(),
  specialRequests: z.string().optional(),
  paymentMethod: z.enum(['credit_card', 'debit_card', 'cash', 'transfer']).optional(),
  depositRequired: z.number(),
}).refine((data) => {
  const checkIn = new Date(data.checkInDate);
  const checkOut = new Date(data.checkOutDate);
  return checkOut > checkIn;
}, {
  message: 'La fecha de salida debe ser posterior a la fecha de entrada',
  path: ['checkOutDate'],
});

// Simple Reservation Schema (without guest info) - Enhanced validation
export const simpleReservationSchema = z.object({
  guestId: z.string().min(1, 'Debe seleccionar un huésped para continuar'),
  checkInDate: z.string().min(1, 'La fecha de entrada es requerida'),
  checkOutDate: z.string().min(1, 'La fecha de salida es requerida'),
  numberOfAdults: z.number()
    .min(1, 'Debe haber al menos 1 adulto')
    .max(8, 'Máximo 8 adultos por reserva'),
  numberOfChildren: z.number()
    .min(0, 'El número de niños no puede ser negativo')
    .max(6, 'Máximo 6 niños por reserva'),
  numberOfGuests: z.number().min(1, 'No se puede hacer una reserva con 0 huéspedes'),
  numberOfNights: z.number().min(1, 'Debe ser al menos 1 noche').max(30, 'La estadía máxima permitida es de 30 noches'),
  roomIds: z.array(z.string()).min(1, 'Debe seleccionar al menos una habitación'),
  roomId: z.string().optional(), // Mantener por compatibilidad
  roomType: z.enum(['single', 'double', 'triple', 'suite', 'family'], {
    message: 'Debe seleccionar un tipo de habitación válido'
  }).optional(),
  additionalServices: z.array(z.string()),
  subtotal: z.number().min(0, 'El subtotal no puede ser negativo'),
  servicesTotal: z.number().min(0, 'El total de servicios no puede ser negativo'),
  taxes: z.number().min(0, 'Los impuestos no pueden ser negativos'),
  total: z.number().min(0, 'El total no puede ser negativo'),
  specialRequests: z.string().optional(),
  paymentMethod: z.enum(['credit_card', 'debit_card', 'cash', 'transfer']).optional(),
  depositRequired: z.number().min(0, 'El depósito no puede ser negativo'),
}).superRefine((data, ctx) => {
  // Calcular total de huéspedes
  const totalGuests = data.numberOfAdults + data.numberOfChildren;
  
  // Validar que coincida con numberOfGuests
  if (totalGuests !== data.numberOfGuests) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `El total de huéspedes (${totalGuests}) no coincide con el número registrado`,
      path: ['numberOfGuests'],
    });
  }

  // Validación de fechas
  const checkIn = new Date(data.checkInDate);
  const checkOut = new Date(data.checkOutDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fecha de entrada no puede ser anterior a hoy
  if (checkIn < today) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'La fecha de entrada no puede ser anterior a hoy',
      path: ['checkInDate'],
    });
  }

  // Fecha de salida debe ser posterior a la fecha de entrada
  if (checkOut <= checkIn) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'La fecha de salida debe ser posterior a la fecha de entrada',
      path: ['checkOutDate'],
    });
  }

  // Validación de rango de fechas razonable (máximo 1 año de anticipación)
  const maxDaysInAdvance = 365;
  const daysInAdvance = Math.ceil((checkIn.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (daysInAdvance > maxDaysInAdvance) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `No se pueden hacer reservas con más de ${maxDaysInAdvance} días de anticipación`,
      path: ['checkInDate'],
    });
  }

  // Validación de estadía mínima
  if (data.numberOfNights < 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'La reserva debe ser de al menos 1 noche',
      path: ['checkOutDate'],
    });
  }

  // Validación de límites razonables para huéspedes totales
  if (totalGuests > 12) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'El número máximo total de huéspedes es 12 (adultos + niños)',
      path: ['numberOfChildren'],
    });
  }
});

// Type exports
export type GuestFormData = z.infer<typeof guestSchema>;
export type ReservationDetailsFormData = z.infer<typeof reservationDetailsSchema>;
export type ReservationFormData = z.infer<typeof reservationSchema>;
export type SimpleReservationFormData = z.infer<typeof simpleReservationSchema>;
