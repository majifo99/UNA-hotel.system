/**
 * Reservation Form Types
 * 
 * Tipos relacionados con formularios de creación y edición de reservas.
 */

import type { Guest, Room } from '../../../../types/core/domain';
import type { PaymentMethod } from '../enums';

/**
 * ReservationFormData
 * 
 * Datos completos del formulario de reserva.
 * Incluye el objeto Guest completo.
 */
export interface ReservationFormData {
  // Información del huésped
  guest: Guest;
  
  // Detalles de la reserva
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  numberOfAdults: number;
  numberOfChildren: number;
  numberOfInfants: number;
  numberOfNights: number;
  
  // Selección de habitación
  roomType: Room['type'];
  roomId?: string;
  
  // Servicios adicionales
  additionalServices: string[]; // Array de IDs de servicios
  
  // Precios
  subtotal: number;
  servicesTotal: number;
  taxes: number;
  total: number;
  
  // Solicitudes especiales
  specialRequests?: string;
  
  // Pago
  paymentMethod?: PaymentMethod;
  depositRequired: number;
}

/**
 * SimpleReservationFormData
 * 
 * Formulario simplificado de reserva.
 * Usa ID del huésped en lugar del objeto completo.
 */
export interface SimpleReservationFormData {
  // Selección de huésped
  guestId: string; // ID del huésped seleccionado (requerido)
  
  // Detalles de la reserva
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  numberOfAdults: number;
  numberOfChildren: number;
  numberOfInfants: number;
  numberOfNights: number;
  
  // Selección de habitación
  roomType: Room['type'];
  roomId?: string;
  
  // Servicios adicionales
  additionalServices: string[]; // Array de IDs de servicios
  
  // Precios
  subtotal: number;
  servicesTotal: number;
  taxes: number;
  total: number;
  
  // Solicitudes especiales
  specialRequests?: string;
  
  // Pago
  paymentMethod?: PaymentMethod;
  depositRequired: number;
}

/**
 * ReservationValidationErrors
 * 
 * Errores de validación para formularios de reserva.
 */
export interface ReservationValidationErrors {
  guestId?: string;
  guest?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    documentNumber?: string;
  };
  checkInDate?: string;
  checkOutDate?: string;
  numberOfAdults?: string;
  numberOfChildren?: string;
  numberOfInfants?: string;
  numberOfGuests?: string;
  roomType?: string;
  general?: string;
}
