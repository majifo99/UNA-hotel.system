/**
 * Legacy API Mappers
 * 
 * Funciones para mapear entre tipos legacy de la API y entidades del dominio.
 */

import type { Guest, Room } from '../../../../types/core/domain';
import type { Reservation } from '../entities';
import type { ApiReservation, ApiGuest, ApiReservaHabitacionLegacy, ApiCreateReservaPayload } from '../api';
import type { SimpleReservationFormData } from '../forms';
import { mapEstadoIdToStatus, mapStatusToEstadoId } from './statusMappers';

/**
 * Interfaz para datos extraídos de habitaciones
 */
interface ExtractedRoomData {
  checkIn: string;
  checkOut: string;
  numberOfGuests: number;
  roomId: string;
  roomNumber: string;
  roomName: string;
}

/**
 * Extrae información de fechas y habitación desde el array de habitaciones
 */
function extractRoomDataFromHabitaciones(
  habitaciones: ApiReservaHabitacionLegacy[],
  initialGuests: number
): ExtractedRoomData {
  const sorted = habitaciones.slice().sort((a, b) => 
    new Date(a.fecha_llegada).getTime() - new Date(b.fecha_llegada).getTime()
  );
  
  const first = sorted[0];
  const last = sorted.at(-1)!;
  
  const totalPax = habitaciones.reduce((acc, h) => acc + (h.pax_total || 0), 0);
  
  return {
    checkIn: first.fecha_llegada,
    checkOut: last.fecha_salida || first.fecha_salida,
    numberOfGuests: totalPax > 0 ? totalPax : initialGuests,
    roomId: first.id_habitacion ? String(first.id_habitacion) : '',
    roomNumber: first.habitacion?.numero || '',
    roomName: first.habitacion?.nombre || '',
  };
}

/**
 * Calcula el número de noches entre dos fechas
 */
function calculateNumberOfNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 1;
  
  try {
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    const diffMs = outDate.getTime() - inDate.getTime();
    return Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
  } catch {
    return 1;
  }
}

/**
 * Mapea un ApiGuest a un Guest del dominio
 */
function mapApiGuestToGuest(apiCliente: ApiGuest, api: ApiReservation): Guest {
  return {
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
    gender: (apiCliente.genero as 'male' | 'female' | 'other' | 'prefer_not_to_say') || undefined,
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

/**
 * mapApiReservationToReservation
 * 
 * Mapea una ApiReservation (backend legacy) al modelo Reservation del dominio (frontend).
 * Opcionalmente acepta habitaciones para poblar fechas y calcular noches.
 * 
 * @param api - Reserva del backend
 * @param guest - Objeto Guest opcional para poblar
 * @param room - Objeto Room opcional para poblar
 * @param habitaciones - Array de habitaciones para extraer fechas
 * @returns Reserva mapeada al dominio frontend
 */
export function mapApiReservationToReservation(
  api: ApiReservation,
  guest?: Guest,
  room?: Room,
  habitaciones?: ApiReservaHabitacionLegacy[]
): Reservation {
  const adultsFromApi = Number(api.adultos ?? 0);
  const childrenFromApi = Number(api.ninos ?? 0);
  const infantsFromApi = Number(api.bebes ?? 0);
  const numberOfGuestsFromApi = adultsFromApi + childrenFromApi + infantsFromApi;

  // Extraer datos de habitaciones o usar valores por defecto
  const hasHabitaciones = Array.isArray(habitaciones) && habitaciones.length > 0;
  const roomData = hasHabitaciones 
    ? extractRoomDataFromHabitaciones(habitaciones, numberOfGuestsFromApi)
    : {
        checkIn: '',
        checkOut: '',
        numberOfGuests: numberOfGuestsFromApi,
        roomId: '',
        roomNumber: '',
        roomName: '',
      };

  const numberOfGuests = Math.max(0, roomData.numberOfGuests);
  const numberOfAdults = adultsFromApi > 0 ? adultsFromApi : Math.max(0, numberOfGuests - childrenFromApi - infantsFromApi);
  const numberOfNights = calculateNumberOfNights(roomData.checkIn, roomData.checkOut);

  // Mapear guest desde api.cliente si está disponible
  const apiCliente = (api as unknown as { cliente?: ApiGuest }).cliente;
  const mappedGuest = apiCliente ? mapApiGuestToGuest(apiCliente, api) : guest;

  return {
    id: String(api.id_reserva),
    confirmationNumber: String(api.id_reserva),
    guestId: String(api.id_cliente),
    guest: mappedGuest,
    roomId: room?.id || roomData.roomId || '',
    roomType: room?.type,
    room: room || (roomData.roomId ? {
      id: roomData.roomId,
      number: roomData.roomNumber,
      name: roomData.roomName,
    } as Partial<Room> as Room : undefined),
    checkInDate: roomData.checkIn,
    checkOutDate: roomData.checkOut,
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
 * mapSimpleFormToApiPayload
 * 
 * Mapea un SimpleReservationFormData a ApiCreateReservaPayload para enviar al backend.
 * 
 * @param form - Datos del formulario
 * @returns Payload para la API
 */
export function mapSimpleFormToApiPayload(
  form: SimpleReservationFormData & Partial<{ guestId: string; estadoId: number }>
): ApiCreateReservaPayload {
  const payload: ApiCreateReservaPayload = {
    id_cliente: Number(form.guestId),
    total_monto_reserva: form.total || 0,
    notas: form.specialRequests,
    adultos: form.numberOfAdults || 0,
    ninos: form.numberOfChildren || 0,
    bebes: form.numberOfInfants || 0,
  };

  // Agregar id_estado_res si está presente
  if ('estadoId' in form && typeof form.estadoId === 'number') {
    payload.id_estado_res = form.estadoId;
  } else if ('status' in form) {
    // Mapear status a id_estado_res si está presente
    payload.id_estado_res = mapStatusToEstadoId(form.status as Reservation['status']);
  }

  return payload;
}
