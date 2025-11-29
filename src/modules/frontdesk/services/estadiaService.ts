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
    cliente_titular?: {
      id_cliente: number;
      nombre: string;
      apellido1: string;
      apellido2?: string;
      email?: string;
      telefono?: string;
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
 * Interface para listado de estadías
 */
export interface EstadiaListItem {
  id_estadia: number;
  codigo_referencia: string; // Código de reserva o Walk-In
  cliente: {
    id_cliente: number;
    nombre_completo: string;
    email?: string;
    telefono?: string;
  };
  habitacion: {
    id_hab: number;
    numero: string;
  };
  fechas: {
    llegada: string;
    salida: string;
    checkin_at?: string;
  };
  ocupacion: {
    adultos: number;
    ninos: number;
    bebes: number;
    total: number;
  };
  estado: {
    id: number;
    nombre: string;
    codigo: string;
  };
  folio_id?: number;
  origen: 'reserva' | 'walkin';
  tipo_estadia: 'in_house' | 'arribo' | 'salida';
}

/**
 * Filtros para listado de estadías
 */
export interface EstadiaFilters {
  fecha?: string; // YYYY-MM-DD
  estado?: 'in_house' | 'arribos' | 'salidas';
  search?: string; // Buscar por nombre, código, etc.
  habitacion?: string; // Filtrar por habitación
}

/**
 * Convierte la respuesta del API de estadía al formato esperado por el checkout
 */
const adaptEstadiaToCheckout = async (apiResponse: EstadiaApiResponse, codigo: string): Promise<EstadiaCheckout> => {
  const { estadia, asignacion, folio } = apiResponse;
  
  // Usar datos del cliente titular que vienen del backend
  const clienteTitular = estadia.cliente_titular;
  
  const firstName = clienteTitular?.nombre || '';
  const firstLastName = clienteTitular?.apellido1 || '';
  const secondLastName = clienteTitular?.apellido2 || undefined;
  const email = clienteTitular?.email || '';
  const phone = clienteTitular?.telefono || '';

  return {
    id: estadia.id_estadia,
    codigo_reserva: codigo,
    guest: {
      id: estadia.id_cliente_titular,
      firstName,
      firstLastName,
      secondLastName,
      email,
      phone,
      nationality: '', // No viene del backend actualmente
      documentNumber: '', // No viene del backend actualmente
    },
    // Incluir información de acompañantes
    acompanantes: apiResponse.acompanantes,
    room: {
      id: asignacion.id_hab,
      number: asignacion.id_hab.toString(), // Usar el ID como número por ahora
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

  /**
   * Obtiene información de estadía por código de Walk-In
   * Endpoint: GET /frontdesk/estadia/walkin/{codigo}
   */
  getEstadiaByWalkInCode: async (codigo: string): Promise<EstadiaCheckout> => {
    const response = await apiClient.get<EstadiaApiResponse>(
      `/frontdesk/estadia/walkin/${codigo}`
    );
    
    return await adaptEstadiaToCheckout(response.data, codigo);
  },

  /**
   * Obtiene información de estadía por ID
   * Endpoint: GET /frontdesk/estadia/{id}
   */
  getEstadiaById: async (id: number): Promise<EstadiaApiResponse> => {
    const response = await apiClient.get<EstadiaApiResponse>(
      `/frontdesk/estadia/${id}`
    );
    
    return response.data;
  },

  /**
   * Lista todas las estadías con filtros
   * Endpoint: GET /frontdesk/estadias?fecha={fecha}&estado={estado}
   */
  listEstadias: async (filters?: EstadiaFilters): Promise<EstadiaListItem[]> => {
    const params = new URLSearchParams();
    
    if (filters?.fecha) {
      params.append('fecha', filters.fecha);
    }
    
    if (filters?.estado) {
      params.append('estado', filters.estado);
    }

    const response = await apiClient.get<{ estadias: any[] }>(
      `/frontdesk/estadias${params.toString() ? `?${params.toString()}` : ''}`
    );

    // Transformar respuesta a formato EstadiaListItem
    return response.data.estadias?.map(transformarEstadiaListItem) || [];
  },
};

/**
 * Transforma un item del API al formato de lista
 */
const transformarEstadiaListItem = (item: any): EstadiaListItem => {
  const cliente = item.cliente_titular || item.clienteTitular;
  const asignacion = item.asignaciones?.[0] || item.asignacion;
  
  return {
    id_estadia: item.id_estadia,
    // Usar el codigo_referencia que viene del backend directamente
    codigo_referencia: item.codigo_referencia || `EST-${item.id_estadia}`,
    cliente: {
      id_cliente: cliente?.id_cliente || item.id_cliente_titular,
      nombre_completo: `${cliente?.nombre || ''} ${cliente?.apellido1 || ''} ${cliente?.apellido2 || ''}`.trim(),
      email: cliente?.email || cliente?.correo,
      telefono: cliente?.telefono || cliente?.phone,
    },
    habitacion: {
      id_hab: asignacion?.id_hab || asignacion?.habitacion?.id_habitacion,
      numero: asignacion?.habitacion?.numero || asignacion?.id_hab?.toString() || 'N/A',
    },
    fechas: {
      llegada: item.fecha_llegada,
      salida: item.fecha_salida,
      checkin_at: asignacion?.created_at,
    },
    ocupacion: {
      adultos: item.adultos || 0,
      ninos: item.ninos || 0,
      bebes: item.bebes || 0,
      total: (item.adultos || 0) + (item.ninos || 0) + (item.bebes || 0),
    },
    estado: {
      id: item.id_estado_estadia || item.estado_estadia?.id_estado_estadia,
      nombre: item.estado_estadia?.nombre || item.estado?.nombre || 'Desconocido',
      codigo: item.estado_estadia?.codigo || item.estado?.codigo || 'UNKNOWN',
    },
    folio_id: item.folios?.[0]?.id_folio || item.folio_id || item.folio,
    // Usar el origen que viene del backend directamente
    origen: item.origen || (item.id_reserva ? 'reserva' : 'walkin'),
    tipo_estadia: determinarTipoEstadia(item.fecha_llegada, item.fecha_salida),
  };
};

/**
 * Determina el tipo de estadía según las fechas
 */
const determinarTipoEstadia = (llegada: string, salida: string): 'in_house' | 'arribo' | 'salida' => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  const fechaLlegada = new Date(llegada);
  fechaLlegada.setHours(0, 0, 0, 0);
  
  const fechaSalida = new Date(salida);
  fechaSalida.setHours(0, 0, 0, 0);

  if (fechaLlegada.getTime() === hoy.getTime()) {
    return 'arribo';
  }
  
  if (fechaSalida.getTime() === hoy.getTime()) {
    return 'salida';
  }
  
  if (fechaLlegada < hoy && fechaSalida > hoy) {
    return 'in_house';
  }
  
  return 'in_house';
};