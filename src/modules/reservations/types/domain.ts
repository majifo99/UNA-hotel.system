/**
 * Reservation Domain Types - Specific to Reservations Module
 * 
 * These types represent the reservation workflow and business logic
 * that are specific to the reservations module. They should not be
 * shared across other modules.
 */

import type { Guest, Room } from '../../../types/core/domain';

// =================== RESERVATION ENTITIES ===================

/**
 * Reservation Status - specific to reservation workflow
 */
export type ReservationStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'checked_in' 
  | 'checked_out' 
  | 'cancelled' 
  | 'no_show';

/**
 * Payment Method - for reservation payments
 */
export type PaymentMethod = 
  | 'credit_card' 
  | 'debit_card' 
  | 'cash' 
  | 'transfer';

/**
 * Reservation entity - specific to the reservations module
 */
export interface Reservation {
  id: string;
  confirmationNumber: string;
  
  // Guest & Room references
  guestId: string;
  guest?: Guest; // Populated in some contexts
  roomId: string;
  roomType?: string; // Room type for compatibility
  room?: Room; // Populated in some contexts
  
  // Dates & Stay
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  numberOfAdults: number;
  numberOfChildren: number;
  numberOfInfants: number;
  numberOfNights: number;
  
  // Services & Pricing
  additionalServices: string[];
  subtotal: number;
  servicesTotal: number;
  taxes: number;
  total: number;
  depositRequired: number;
  
  // Status & Metadata
  status: ReservationStatus;
  specialRequests?: string;
  paymentMethod?: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

// =================== API (Backend) DTO TYPES ===================

/**
 * ApiReservation: structure returned by the backend (snake_case)
 * Fields use the exact names from `docs/Backend.md`.
 */
export interface ApiReservation {
  id_reserva: number;
  id_cliente: number;
  id_estado_res: number;
  fecha_creacion?: string;
  total_monto_reserva: number;
  notas?: string | null;
  adultos: number;
  ninos: number;
  bebes: number;
  id_fuente?: number | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * ApiGuest: backend representation of a guest (cliente)
 */
export interface ApiGuest {
  id_cliente: number;
  nombre: string;
  apellido1?: string | null;
  apellido2?: string | null;
  email?: string | null;
  telefono?: string | null;
  id_tipo_doc?: number | null;
  numero_doc?: string | null;
  nacionalidad?: string | null;
  direccion?: string | null;
  fecha_nacimiento?: string | null;
  genero?: string | null;
  es_vip?: number | null;
  notas_personal?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ApiEstado {
  id_estado_res: number;
  nombre: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiFuente {
  id_fuente: number;
  nombre: string;
  codigo?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

/**
 * ApiReservaHabitacion: room assignment for a reservation in backend format
 */
export interface ApiReservaHabitacion {
  id_reserva_hab: number;
  id_reserva: number;
  id_habitacion: number;
  fecha_llegada: string; // ISO datetime
  fecha_salida: string;  // ISO date or datetime
  pax_total: number;
  created_at?: string;
  updated_at?: string;
}

// =================== MAPPERS ===================

/**
 * Map an ApiReservation (backend) to the frontend Reservation domain model.
 * This is a best-effort mapper: some fields (like checkInDate/checkOutDate)
 * are usually stored per-room in `ApiReservaHabitacion` and cannot be
 * derived from a single ApiReservation record. Those fields are left
 * untouched (empty or sensible defaults) and should be populated by
 * combining reservation + reserva_habitacion responses when calling the API.
 */
/**
 * Convert backend estado id to frontend ReservationStatus.
 * Assumes common mapping; defaults to 'pending' for unknown values.
 */
export function mapEstadoIdToStatus(id?: number): Reservation['status'] {
  // Backend mapping observed in API: id_estado_res 1 => 'Cancelada'
  switch (id) {
    case 1:
      return 'cancelled';
    case 2:
      return 'pending';
    case 3:
      return 'confirmed';
    case 4:
      return 'checked_in';
    case 5:
      return 'checked_out';
    case 6:
      return 'no_show';
    default:
      return 'pending';
  }
}

export function mapStatusToEstadoId(status: Reservation['status']): number {
  switch (status) {
    case 'cancelled':
      return 1;
    case 'pending':
      return 2;
    case 'confirmed':
      return 3;
    case 'checked_in':
      return 4;
    case 'checked_out':
      return 5;
    case 'no_show':
      return 6;
    default:
      return 2;
  }
}

/**
 * Map an ApiReservation (backend) to the frontend Reservation domain model.
 * Optionally accepts an array of `ApiReservaHabitacion` to populate
 * check-in/check-out and calculate number of nights when available.
 */
export function mapApiReservationToReservation(
  api: ApiReservation,
  guest?: Guest,
  room?: Room,
  habitaciones?: ApiReservaHabitacion[]
): Reservation {
  // Prefer pax information from habitaciones if present, otherwise from the reserva record
  const adultsFromApi = Number(api.adultos ?? 0);
  const childrenFromApi = Number(api.ninos ?? 0);
  const infantsFromApi = Number(api.bebes ?? 0);
  const numberOfGuestsFromApi = adultsFromApi + childrenFromApi + infantsFromApi;

  let checkIn = '';
  let checkOut = '';
  let numberOfGuests = numberOfGuestsFromApi;

  if (Array.isArray(habitaciones) && habitaciones.length > 0) {
    // Use the earliest check-in and latest check-out among habitaciones
    const sorted = habitaciones.slice().sort((a, b) => new Date(a.fecha_llegada).getTime() - new Date(b.fecha_llegada).getTime());
    const first = sorted[0];
    checkIn = first.fecha_llegada;
    // If last habitaciÃ³n has fecha_salida, use it
    const last = sorted[sorted.length - 1];
    checkOut = last.fecha_salida || first.fecha_salida;
    // If habitaciones provide pax_total, sum them as a fallback
    const totalPax = habitaciones.reduce((acc, h) => acc + (h.pax_total || 0), 0);
    if (totalPax > 0) numberOfGuests = totalPax;
  }

  numberOfGuests = Math.max(0, numberOfGuests);
  let numberOfAdults = adultsFromApi;
  if (numberOfAdults <= 0 && numberOfGuests > 0) {
    const inferredAdults = numberOfGuests - childrenFromApi - infantsFromApi;
    numberOfAdults = inferredAdults > 0 ? inferredAdults : numberOfGuests;
  }

  // Calculate nights if we have both dates
  let numberOfNights = 1;
  if (checkIn && checkOut) {
    try {
      const inDate = new Date(checkIn);
      const outDate = new Date(checkOut);
      const diffMs = outDate.getTime() - inDate.getTime();
      const days = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
      numberOfNights = days;
    } catch (e) {
      numberOfNights = 1;
    }
  }

  // Build guest from api.cliente when available
  let mappedGuest: Guest | undefined = guest;
  // @ts-ignore - cliente may not be declared on ApiReservation type historically
  const apiCliente = (api as any).cliente as ApiGuest | undefined;
  if (apiCliente) {
    mappedGuest = {
      id: String(apiCliente.id_cliente),
      firstName: apiCliente.nombre || '',
      firstLastName: (apiCliente.apellido1 || ''),
      secondLastName: (apiCliente.apellido2 || ''),
      email: apiCliente.email || '',
      phone: apiCliente.telefono || '',
      documentType: 'id_card',
      documentNumber: apiCliente.numero_doc || '',
      nationality: apiCliente.nacionalidad || '',
      address: undefined,
      city: undefined,
      country: undefined,
      birthDate: apiCliente.fecha_nacimiento || undefined,
      dateOfBirth: apiCliente.fecha_nacimiento || undefined,
      preferredLanguage: undefined,
      gender: (apiCliente.genero as any) || undefined,
      allergies: undefined,
      specialRequests: apiCliente.notas_personal || undefined,
      notes: undefined,
      medicalNotes: undefined,
      dietaryRestrictions: undefined,
      communicationPreferences: undefined,
      roomPreferences: undefined,
      emergencyContact: undefined,
      vipStatus: !!apiCliente.es_vip,
      loyaltyProgram: undefined,
      createdAt: apiCliente.created_at || api.created_at || new Date().toISOString(),
      updatedAt: apiCliente.updated_at || api.updated_at || new Date().toISOString(),
      isActive: true,
    };
  }

  return {
    id: String(api.id_reserva),
    confirmationNumber: String(api.id_reserva),
    guestId: String(api.id_cliente),
    guest: mappedGuest,
    roomId: room?.id || '',
    roomType: room?.type,
    room: room,
    checkInDate: checkIn,
    checkOutDate: checkOut,
    numberOfGuests,
    numberOfAdults,
    numberOfChildren: Math.max(0, childrenFromApi),
    numberOfInfants: Math.max(0, infantsFromApi),
    numberOfNights,
    additionalServices: [],
    subtotal: api.total_monto_reserva || 0,
    servicesTotal: 0,
    taxes: 0,
    total: api.total_monto_reserva || 0,
    depositRequired: 0,
    status: mapEstadoIdToStatus(api.id_estado_res),
    specialRequests: api.notas || undefined,
    paymentMethod: undefined,
    createdAt: api.created_at || api.fecha_creacion || new Date().toISOString(),
    updatedAt: api.updated_at || api.fecha_creacion || new Date().toISOString(),
  };
}

/**
 * Payload used to create/update a reservation in the backend
 */
export interface ApiCreateReservaPayload {
  id_cliente: number;
  id_estado_res?: number;
  total_monto_reserva: number;
  notas?: string | null;
  adultos: number;
  ninos: number;
  bebes: number;
  id_fuente?: number | null;
}

/**
 * Map frontend simple reservation form data into backend payload.
 * The frontend uses camelCase names for ease; the backend expects snake_case.
 */
export function mapSimpleFormToApiPayload(form: SimpleReservationFormData & Partial<{
  numberOfAdults: number;
  numberOfChildren: number;
  numberOfInfants: number;
  adults: number;
  children: number;
  babies: number;
  id_estado_res: number;
  id_fuente: number;
  total: number;
}>): ApiCreateReservaPayload {
  // Prefer explicit fields if present (numberOfAdults / numberOfChildren / numberOfInfants)
  const adultos = form.numberOfAdults ?? form.adults ?? 1;
  const ninos = form.numberOfChildren ?? form.children ?? 0;
  const bebes = form.numberOfInfants ?? form.babies ?? 0;

  return {
    id_cliente: Number(form.guestId),
  id_estado_res: form.id_estado_res !== undefined ? Number(form.id_estado_res) : undefined,
    total_monto_reserva: form.total ?? 0,
    notas: form.specialRequests ?? null,
    adultos: Number(adultos),
    ninos: Number(ninos),
    bebes: Number(bebes),
    id_fuente: form.id_fuente !== undefined ? Number(form.id_fuente) : undefined,
  };
}

// =================== FORM DATA TYPES ===================

/**
 * Complete reservation form data (includes guest object)
 */
export interface ReservationFormData {
  // Guest information
  guest: Guest;
  
  // Reservation details
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  numberOfAdults: number;
  numberOfChildren: number;
  numberOfInfants: number;
  numberOfNights: number;
  
  // Room selection
  roomType: Room['type'];
  roomId?: string;
  
  // Additional services
  additionalServices: string[]; // Array of service IDs
  
  // Pricing
  subtotal: number;
  servicesTotal: number;
  taxes: number;
  total: number;
  
  // Special requests
  specialRequests?: string;
  
  // Payment
  paymentMethod?: PaymentMethod;
  depositRequired: number;
}

/**
 * Simplified reservation form (uses guest ID instead of guest object)
 */
export interface SimpleReservationFormData {
  // Guest selection
  guestId: string; // ID of selected guest (required)
  
  // Reservation details
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  numberOfAdults: number;
  numberOfChildren: number;
  numberOfInfants: number;
  numberOfNights: number;
  
  // Room selection
  roomType: Room['type'];
  roomId?: string;
  
  // Additional services
  additionalServices: string[]; // Array of service IDs
  
  // Pricing
  subtotal: number;
  servicesTotal: number;
  taxes: number;
  total: number;
  
  // Special requests
  specialRequests?: string;
  
  // Payment
  paymentMethod?: PaymentMethod;
  depositRequired: number;
}

// =================== VALIDATION TYPES ===================

/**
 * Validation errors for reservation forms
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


