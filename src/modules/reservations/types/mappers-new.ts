/**
 * Mapper: New API Structure → Frontend Domain Model
 * Converts ApiReservaFull to Reservation
 */

import type { Reservation } from './entities';
import type { Guest, Room } from '../../../types/core/domain';
import type { ApiReservaFull, ApiCliente, ApiReservaHabitacion } from './api';

/**
 * Map ApiCliente to Guest
 */
export function mapApiClienteToGuest(cliente: ApiCliente): Guest {
  console.log('👤 Mapping ApiCliente to Guest:', {
    id_cliente: cliente.id_cliente,
    nombre: cliente.nombre,
    apellido1: cliente.apellido1,
    apellido2: cliente.apellido2,
    nombre_completo: cliente.nombre_completo,
    email: cliente.email,
  });

  return {
    id: cliente.id_cliente.toString(),
    firstName: cliente.nombre,
    firstLastName: cliente.apellido1 || '',
    secondLastName: cliente.apellido2 || undefined,
    email: cliente.email || '',
    phone: cliente.telefono || '',
    nationality: cliente.nacionalidad || '',
    documentType: 'id_card',
    documentNumber: cliente.numero_doc || '',
    isActive: true,
    createdAt: cliente.created_at,
    updatedAt: cliente.updated_at,
  };
}

/**
 * Map ApiReservaHabitacion to Room (single room from assignment)
 */
export function mapApiHabitacionToRoom(habitacion: ApiReservaHabitacion): Room {
  const precioBase = Number.parseFloat(habitacion.habitacion.precio_base);
  
  console.log('🏨 Mapping habitacion to Room:', {
    id_habitacion: habitacion.habitacion.id_habitacion,
    nombre: habitacion.habitacion.nombre,
    numero: habitacion.habitacion.numero,
    piso: habitacion.habitacion.piso,
  });
  
  return {
    id: habitacion.habitacion.id_habitacion.toString(),
    name: habitacion.habitacion.nombre,
    type: 'single', // Default type
    floor: habitacion.habitacion.piso,
    number: habitacion.habitacion.numero, // Este es el número que se usa en CheckIn
    capacity: habitacion.habitacion.capacidad,
    description: habitacion.habitacion.descripcion || '',
    basePrice: precioBase,
    pricePerNight: precioBase,
    amenities: [],
    images: [],
    isAvailable: true,
  };
}

/**
 * Map estado nombre to ReservationStatus
 */
export function mapEstadoNombreToStatus(nombre: string): Reservation['status'] {
  const normalizado = nombre.toLowerCase();
  if (normalizado.includes('cancelada')) return 'cancelled';
  if (normalizado.includes('pendiente')) return 'pending';
  if (normalizado.includes('confirmada')) return 'confirmed';
  if (normalizado.includes('check-in') || normalizado.includes('checkin')) return 'checked_in';
  if (normalizado.includes('check-out') || normalizado.includes('checkout')) return 'checked_out';
  if (normalizado.includes('no show') || normalizado.includes('no-show')) return 'no_show';
  return 'pending';
}

/**
 * Calculate total nights from all rooms
 */
function calculateTotalNights(habitaciones: ApiReservaHabitacion[]): number {
  if (habitaciones.length === 0) return 0;
  
  // Use the first room's dates as reference
  const firstRoom = habitaciones[0];
  const checkIn = new Date(firstRoom.fecha_llegada);
  const checkOut = new Date(firstRoom.fecha_salida);
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Calculate total guests from all rooms
 */
function calculateTotalGuests(habitaciones: ApiReservaHabitacion[]): {
  total: number;
  adults: number;
  children: number;
  infants: number;
} {
  const totals = habitaciones.reduce(
    (acc, hab) => ({
      adults: acc.adults + hab.adultos,
      children: acc.children + hab.ninos,
      infants: acc.infants + hab.bebes,
    }),
    { adults: 0, children: 0, infants: 0 }
  );

  return {
    total: totals.adults + totals.children + totals.infants,
    ...totals,
  };
}

/**
 * Get earliest check-in and latest check-out from all rooms
 */
function getCheckInOutDates(habitaciones: ApiReservaHabitacion[]): {
  checkInDate: string;
  checkOutDate: string;
} {
  if (habitaciones.length === 0) {
    return {
      checkInDate: new Date().toISOString(),
      checkOutDate: new Date().toISOString(),
    };
  }

  const checkInDates = habitaciones.map(h => new Date(h.fecha_llegada));
  const checkOutDates = habitaciones.map(h => new Date(h.fecha_salida));

  const earliestCheckIn = new Date(Math.min(...checkInDates.map(d => d.getTime())));
  const latestCheckOut = new Date(Math.max(...checkOutDates.map(d => d.getTime())));

  return {
    checkInDate: earliestCheckIn.toISOString(),
    checkOutDate: latestCheckOut.toISOString(),
  };
}

/**
 * Main mapper: ApiReservaFull → Reservation
 */
export function mapApiReservaFullToReservation(api: ApiReservaFull): Reservation {
  console.log('🔄 Mapping ApiReservaFull to Reservation:', {
    id_reserva: api.id_reserva,
    codigo_reserva: api.codigo_reserva,
    habitaciones_count: api.habitaciones?.length || 0,
    first_room: api.habitaciones?.[0] ? {
      id_habitacion: api.habitaciones[0].habitacion.id_habitacion,
      numero: api.habitaciones[0].habitacion.numero,
      nombre: api.habitaciones[0].habitacion.nombre,
    } : null,
  });

  const guestTotals = calculateTotalGuests(api.habitaciones);
  const { checkInDate, checkOutDate } = getCheckInOutDates(api.habitaciones);
  const nights = calculateTotalNights(api.habitaciones);

  // Map first room if available (for backward compatibility)
  const firstRoom = api.habitaciones[0];
  const room = firstRoom ? mapApiHabitacionToRoom(firstRoom) : undefined;

  console.log('🏨 Mapped room object:', {
    room_id: room?.id,
    room_number: room?.number,
    room_name: room?.name,
  });

  return {
    id: api.id_reserva.toString(),
    // Use codigo_reserva if available, otherwise fall back to id_reserva
    confirmationNumber: api.codigo_reserva || api.id_reserva.toString(),
    
    // Guest
    guestId: api.cliente.id_cliente.toString(),
    guest: mapApiClienteToGuest(api.cliente),
    
    // Room
    roomId: firstRoom?.habitacion.id_habitacion.toString() || '',
    roomType: firstRoom?.habitacion.nombre || 'Por asignar',
    room,
    
    // Room assignment ID (for modifications)
    idReservaHabitacion: firstRoom?.id_reserva_hab,
    
    // Dates
    checkInDate,
    checkOutDate,
    numberOfNights: nights,
    
    // Guests
    numberOfGuests: guestTotals.total,
    numberOfAdults: guestTotals.adults,
    numberOfChildren: guestTotals.children,
    numberOfInfants: guestTotals.infants,
    
    // Financial
    subtotal: api.total_monto_reserva,
    servicesTotal: 0,
    taxes: 0,
    total: api.total_monto_reserva,
    depositRequired: api.total_monto_reserva * 0.5, // Default 50% deposit
    
    // Status & Meta
    status: mapEstadoNombreToStatus(api.estado.nombre),
    source: api.fuente?.nombre || undefined,
    specialRequests: api.notas || undefined,
    additionalServices: [],
    createdAt: api.created_at,
    updatedAt: api.updated_at,
  } as Reservation & { idReservaHabitacion?: number };
}
