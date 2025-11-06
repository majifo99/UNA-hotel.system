/**
 * ============================================================================
 * SERVICIO DE ESTADÍA PARA CHECKOUT
 * ============================================================================
 * 
 * Servicios específicos para manejar la información de estadía durante el checkout
 */

import apiClient from '../../../services/apiClient';

/**
 * Interface para la respuesta cruda del API de estadía
 */
export interface EstadiaApiResponse {
  message: string;
  estadia: {
    id_estadia: number;
    id_reserva: number;
    id_cliente_titular: number;
    id_fuente: number;
    fecha_llegada: string;
    fecha_salida: string;
    adultos: number;
    ninos: number;
    bebes: number;
    id_estado_estadia: number;
    created_at: string;
    updated_at: string;
    estado: {
      id_estado_estadia: number;
      nombre: string;
      codigo: string;
    };
  };
  acompanantes: Array<{
    id_cliente: number;
    nombre: string;
    apellido1: string;
    email?: string;
    folio_asociado?: number | null;
  }>;
  asignacion: {
    id_asignacion: number;
    id_hab: number;
    id_reserva: number;
    id_estadia: number;
    origen: string;
    nombre: string;
    fecha_asignacion: string;
    adultos: number;
    ninos: number;
    bebes: number;
    created_at: string;
    updated_at: string;
  };
  folio: number;
  checkin_at: string;
}

/**
 * Interface adaptada para el checkout (compatible con el código existente)
 */
export interface EstadiaCheckout {
  id: number;
  codigo_reserva: string;
  guest: {
    id: number;
    firstName: string;
    firstLastName: string;
    secondLastName?: string;
    email?: string;
    phone?: string;
    nationality?: string;
    documentNumber?: string;
  };
  // Agregar información de acompañantes
  acompanantes?: Array<{
    id_cliente: number;
    nombre: string;
    apellido1: string;
    email?: string;
    folio_asociado?: number | null;
  }>;
  room: {
    id: number;
    number: string;
  };
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  folioId?: number;
  idClienteTitular?: number;
  confirmationNumber: string;
  roomId: number | string;
  // Agregar información adicional de la estadía
  estadiaId?: number;
  asignacionId?: number;
}

/**
 * Convierte la respuesta del API de estadía al formato esperado por el checkout
 */
const adaptEstadiaToCheckout = async (apiResponse: EstadiaApiResponse, codigo: string): Promise<EstadiaCheckout> => {
  const { estadia, asignacion, folio } = apiResponse;
  
  // Extraer nombre y apellidos del cliente titular desde asignacion.nombre
  const nombreCompleto = asignacion.nombre.split(' ');
  const firstName = nombreCompleto[0] || '';
  const firstLastName = nombreCompleto[1] || '';
  const secondLastName = nombreCompleto.slice(2).join(' ') || undefined;

  // Buscar email del cliente titular en acompañantes (si está disponible)
  const clienteTitular = apiResponse.acompanantes.find(
    acomp => acomp.id_cliente === estadia.id_cliente_titular
  );

  // Intentar obtener información adicional de la habitación
  let roomNumber = asignacion.id_hab.toString();
  try {
    const roomResponse = await apiClient.get(`/rooms/${asignacion.id_hab}`);
    roomNumber = roomResponse.data.number || roomNumber;
  } catch (error) {
    console.warn('No se pudo obtener información detallada de la habitación:', error);
  }

  // Intentar obtener información adicional del cliente
  let guestDetails = {
    phone: '',
    nationality: '',
    documentNumber: '',
  };
  try {
    const clientResponse = await apiClient.get(`/clients/${estadia.id_cliente_titular}`);
    guestDetails = {
      phone: clientResponse.data.phone || '',
      nationality: clientResponse.data.nationality || '',
      documentNumber: clientResponse.data.documentNumber || '',
    };
  } catch (error) {
    console.warn('No se pudo obtener información detallada del cliente:', error);
  }

  return {
    id: estadia.id_estadia,
    codigo_reserva: codigo,
    guest: {
      id: estadia.id_cliente_titular,
      firstName,
      firstLastName,
      secondLastName,
      email: clienteTitular?.email || '',
      phone: guestDetails.phone,
      nationality: guestDetails.nationality,
      documentNumber: guestDetails.documentNumber,
    },
    // Incluir información de acompañantes
    acompanantes: apiResponse.acompanantes,
    room: {
      id: asignacion.id_hab,
      number: roomNumber,
    },
    checkInDate: estadia.fecha_llegada,
    checkOutDate: estadia.fecha_salida,
    numberOfGuests: estadia.adultos + estadia.ninos + estadia.bebes,
    folioId: folio,
    idClienteTitular: estadia.id_cliente_titular,
    confirmationNumber: codigo,
    roomId: asignacion.id_hab,
    // Información adicional
    estadiaId: estadia.id_estadia,
    asignacionId: asignacion.id_asignacion,
  };
};

/**
 * Servicio de Estadía
 */
export const estadiaService = {
  /**
   * Obtiene información de estadía por código de reserva
   * Endpoint: GET /frontdesk/estadia/by-reserva/{codigo}
   */
  getEstadiaByReservaCode: async (codigo: string): Promise<EstadiaCheckout> => {
    const response = await apiClient.get<EstadiaApiResponse>(
      `/frontdesk/estadia/by-reserva/${codigo}`
    );
    
    // Adaptar la respuesta al formato esperado por el checkout
    return await adaptEstadiaToCheckout(response.data, codigo);
  },
};