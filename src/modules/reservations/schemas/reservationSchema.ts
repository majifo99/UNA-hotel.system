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

// Simple Reservation Schema (without guest info)
export const simpleReservationSchema = z.object({
  checkInDate: z.string().min(1, 'La fecha de entrada es requerida'),
  checkOutDate: z.string().min(1, 'La fecha de salida es requerida'),
  numberOfGuests: z.number().min(1, 'Debe haber al menos 1 huésped').max(10, 'Máximo 10 huéspedes'),
  numberOfNights: z.number().min(1, 'Debe ser al menos 1 noche'),
  roomType: z.enum(['single', 'double', 'triple', 'suite', 'family']),
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

// Type exports
export type GuestFormData = z.infer<typeof guestSchema>;
export type ReservationDetailsFormData = z.infer<typeof reservationDetailsSchema>;
export type ReservationFormData = z.infer<typeof reservationSchema>;
export type SimpleReservationFormData = z.infer<typeof simpleReservationSchema>;
