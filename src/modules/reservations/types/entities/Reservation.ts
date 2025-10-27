/**
 * Reservation Entity
 * 
 * Entidad principal que representa una reserva en el sistema.
 * Esta es la representación del dominio (frontend), optimizada para trabajar en la UI.
 */

import type { Guest, Room } from '../../../../types/core/domain';
import type { ReservationStatus, PaymentMethod } from '../enums';

/**
 * Reservation - Entidad del dominio
 * 
 * Representa una reserva completa con toda la información necesaria
 * para mostrar y manipular en el frontend.
 */
export interface Reservation {
  // Identificación
  id: string;
  confirmationNumber: string;
  
  // Referencias a entidades relacionadas
  guestId: string;
  guest?: Guest; // Poblado en algunos contextos
  roomId: string;
  roomType?: string; // Tipo de habitación para compatibilidad
  room?: Room; // Poblado en algunos contextos
  
  // Fechas y estadía
  checkInDate: string; // ISO 8601 date string
  checkOutDate: string; // ISO 8601 date string
  numberOfGuests: number;
  numberOfAdults: number;
  numberOfChildren: number;
  numberOfInfants: number;
  numberOfNights: number;
  
  // Servicios y precios
  additionalServices: string[];
  subtotal: number;
  servicesTotal: number;
  taxes: number;
  total: number;
  depositRequired: number;
  
  // Estado y metadata
  status: ReservationStatus;
  specialRequests?: string;
  paymentMethod?: PaymentMethod;
  createdAt: string; // ISO 8601 datetime string
  updatedAt: string; // ISO 8601 datetime string
}
