import apiClient from '../../../services/apiClient';
import type { 
  CargoPayload, 
  CargoResponse,
  FolioApiResponse,
  FolioLinea
} from '../types/folio.types';

// ============================================================================
// INTERFACES PARA MANEJAR LOS DATOS DEL API DE FOLIOS
// ============================================================================

/**
 * Resumen completo del folio con saldos y distribución
 */
export interface FolioResumen {
  folio: number;
  resumen: {
    id_folio: number;
    a_distribuir: string;
    distribuido: string;
    cargos_sin_persona: string;
    pagos_generales: string;
  };
  personas: Array<{
    id_cliente: number;
    nombre?: string;
    email?: string;
    documento?: string;
    asignado: number;
    pagos: number;
    saldo: number;
  }>;
  totales: {
    pagos_por_persona_total: number;
    pagos_generales: number;
    pagos_totales: number;
    saldo_global: number;
    control_diff: number;
  };
}

/**
 * Estrategias de distribución disponibles
 */
export type DistributionStrategy = 'single' | 'equal' | 'percent' | 'fixed';

/**
 * Responsable de una distribución con su monto o porcentaje
 */
export interface ResponsableDistribucion {
  id_cliente: number;
  percent?: number;  // Para estrategia 'percent'
  amount?: number;   // Para estrategia 'fixed'
}

/**
 * Request para distribuir cargos entre responsables
 */
export interface DistribucionRequest {
  operacion_uid: string;
  strategy: DistributionStrategy;
  responsables: ResponsableDistribucion[];
}

/**
 * Request para registrar un pago
 */
export interface PagoRequest {
  operacion_uid: string;
  id_cliente?: number;  // Si no se especifica, es pago general
  monto: number;
  metodo: string;
  resultado: string;
  nota?: string;
}

/**
 * Request para cerrar un folio
 */
export interface CerrarFolioRequest {
  operacion_uid: string;
  id_cliente_titular: number;
}

/**
 * Item del historial de operaciones
 */
export interface HistorialItem {
  id: number;
  tipo: 'pago' | 'distribucion' | 'cierre';
  operacion_uid: string;
  fecha: string;
  monto?: number;
  metodo?: string;
  id_cliente?: number;
  nombre_cliente?: string;
  detalles?: Record<string, any>;
}

/**
 * Respuesta del historial con paginación
 */
export interface HistorialResponse {
  data: HistorialItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// ============================================================================
// SERVICIO DE FOLIOS
// ============================================================================

/**
 * Servicio completo para manejo de folios y distribuciones
 * Cubre todo el ciclo: check-in → distribución → pago → cierre → historial
 */
export const folioService = {
  // --------------------------------------------------------------------------
  // 1. CHECK-IN: Crear estadía y folio
  // --------------------------------------------------------------------------

  /**
   * Verifica si una reserva existe antes del check-in
   * Intenta tanto con código como con ID numérico
   */
  verificarReserva: async (reservaId: string): Promise<boolean> => {
    try {
      // Intentar primero con el código tal como viene
      let response = await apiClient.get(`/frontdesk/reserva/${reservaId}`);
      if (response.status === 200) return true;
    } catch (error) {
      console.warn(`⚠️ No se encontró reserva con código ${reservaId}, intentando con ID...`);
    }

    try {
      // Si es un código como YX3PU6KV, intentar buscar por endpoint de búsqueda
      const reservas = await apiClient.get('/reservas', {
        params: { codigo: reservaId }
      });
      return reservas.data.data && reservas.data.data.length > 0;
    } catch (error) {
      console.warn(`⚠️ Reserva ${reservaId} no encontrada en ningún endpoint:`, error);
      return false;
    }
  },

  /**
   * Buscar reservas por criterios (como código o nombre)
   */
  buscarReservas: async (criterio: string): Promise<any[]> => {
    try {
      const response = await apiClient.get('/frontdesk/reservas/buscar', {
        params: { q: criterio }
      });
      return response.data.data || [];
    } catch (error) {
      console.warn(`⚠️ Error al buscar reservas con criterio "${criterio}":`, error);
      return [];
    }
  },

  /**
   * Realiza el check-in y crea la estadía con su folio
   * Endpoint: POST /frontdesk/reserva/:id/checkin
   * Nota: Convierte código de reserva a ID si es necesario
   */
  realizarCheckIn: async (
    reservaId: number | string,
    data: {
      id_cliente_titular: number;
      fecha_llegada: string;
      fecha_salida: string;
      adultos: number;
      ninos: number;
      id_hab: number;
      nombre_asignacion: string;
      pago_modo: string;
      acompanantes?: Array<{
        nombre: string;
        documento: string;
        email?: string;
        id_cliente?: number;
      }>;
      observacion_checkin?: string;
    }
  ): Promise<FolioApiResponse> => {
    // Si recibimos un código de reserva (string), convertir a ID numérico
    let idReserva = reservaId;
    
    if (typeof reservaId === 'string' && isNaN(Number(reservaId))) {
      console.log(`🔄 Convirtiendo código de reserva "${reservaId}" a ID numérico...`);
      
      try {
        // Buscar la reserva por código para obtener su ID
        const reservas = await apiClient.get('/reservas', {
          params: { codigo: reservaId }
        });
        
        const reservaEncontrada = reservas.data.data?.find((r: any) => 
          r.codigo_reserva === reservaId
        );
        
        if (reservaEncontrada) {
          idReserva = reservaEncontrada.id_reserva;
          console.log(`✅ Código "${reservaId}" convertido a ID: ${idReserva}`);
        } else {
          throw new Error(`No se encontró reserva con código "${reservaId}"`);
        }
      } catch (error) {
        console.error(`❌ Error al convertir código a ID:`, error);
        throw new Error(`No se pudo encontrar la reserva "${reservaId}"`);
      }
    }

    const response = await apiClient.post(
      `/frontdesk/reserva/${idReserva}/checkin`,
      data
    );
    return response.data;
  },

  // --------------------------------------------------------------------------
  // 2. DISTRIBUCIÓN: Distribuir cargos entre huéspedes
  // --------------------------------------------------------------------------

  /**
   * Distribuye los cargos del folio entre los responsables según estrategia
   * Endpoint: POST /folios/:id/distribuir
   * 
   * Estrategias disponibles:
   * - 'single': Todo a una sola persona
   * - 'equal': Dividir equitativamente entre todos
   * - 'percent': Asignar porcentajes específicos
   * - 'fixed': Asignar montos fijos específicos
   */
  distribuirCargos: async (
    folioId: number,
    data: DistribucionRequest
  ): Promise<FolioResumen> => {
    const response = await apiClient.post<FolioResumen>(
      `/folios/${folioId}/distribuir`,
      data
    );
    return response.data;
  },

  // --------------------------------------------------------------------------
  // 3. PAGOS: Registrar pagos individuales o globales
  // --------------------------------------------------------------------------

  /**
   * Registra un pago en el folio
   * Endpoint: POST /folios/:id/pagos
   * 
   * - Si se especifica id_cliente: pago individual
   * - Si NO se especifica id_cliente: pago general del folio
   */
  registrarPago: async (
    folioId: number,
    data: PagoRequest
  ): Promise<FolioResumen> => {
    const response = await apiClient.post<FolioResumen>(
      `/folios/${folioId}/pagos`,
      data
    );
    return response.data;
  },

  // --------------------------------------------------------------------------
  // 4. CIERRE: Cerrar folio (check-out)
  // --------------------------------------------------------------------------

  /**
   * Cierra el folio trasladando todo al titular
   * Endpoint: POST /folios/:id/cerrar
   */
  cerrarFolio: async (
    folioId: number,
    data: CerrarFolioRequest
  ): Promise<FolioResumen> => {
    const response = await apiClient.post<FolioResumen>(
      `/folios/${folioId}/cerrar`,
      data
    );
    return response.data;
  },

  // --------------------------------------------------------------------------
  // 5. CONSULTAS: Obtener información del folio
  // --------------------------------------------------------------------------

  /**
   * Obtiene el resumen actualizado del folio con saldos
   * Endpoint: GET /folios/:id/resumen
   */
  getResumen: async (folioId: number): Promise<FolioResumen> => {
    const response = await apiClient.get<FolioResumen>(
      `/folios/${folioId}/resumen`
    );
    return response.data;
  },

  /**
   * Obtiene el historial completo de operaciones del folio
   * Endpoint: GET /folios/:id/historial
   */
  getHistorial: async (
    folioId: number,
    tipo?: 'pago' | 'distribucion' | 'cierre',
    page: number = 1,
    perPage: number = 50
  ): Promise<HistorialResponse> => {
    const params = new URLSearchParams();
    if (tipo) params.append('tipo', tipo);
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());

    const response = await apiClient.get<HistorialResponse>(
      `/folios/${folioId}/historial?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Exporta el historial del folio a CSV
   * Endpoint: GET /folios/:id/historial/export
   */
  exportarHistorial: async (
    folioId: number,
    tipo?: 'pago' | 'distribucion' | 'cierre'
  ): Promise<Blob> => {
    const params = new URLSearchParams();
    if (tipo) params.append('tipo', tipo);

    const response = await apiClient.get(
      `/folios/${folioId}/historial/export?${params.toString()}`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },

  // --------------------------------------------------------------------------
  // 6. CARGOS: Agregar y obtener cargos del folio
  // --------------------------------------------------------------------------

  /**
   * Obtiene la lista de cargos de un folio
   * Endpoint: GET /folios/:id/cargos
   * 
   * @param folioId - ID del folio
   * @returns Lista de cargos del folio
   */
  getCargos: async (folioId: number): Promise<FolioLinea[]> => {
    const response = await apiClient.get<{
      status: string;
      data: FolioLinea[];
      total: number;
    }>(`/folios/${folioId}/cargos`);
    return response.data.data || [];
  },

  /**
   * Agrega un cargo al folio (general o individual)
   * Endpoint: POST /folios/:id/cargos
   * 
   * @param folioId - ID del folio
   * @param data - Payload del cargo (monto, descripción, cliente_id)
   * @returns Respuesta con el cargo creado
   */
  postCargo: async (
    folioId: number,
    data: CargoPayload
  ): Promise<FolioApiResponse<CargoResponse>> => {
    const response = await apiClient.post<FolioApiResponse<CargoResponse>>(
      `/folios/${folioId}/cargos`,
      data
    );
    return response.data;
  },

  // --------------------------------------------------------------------------
  // 7. WORKAROUND: Agregar cargo inicial usando distribución
  // --------------------------------------------------------------------------

  /**
   * WORKAROUND: Agrega un cargo inicial al folio usando el endpoint de distribución
   * Esto es temporal hasta que el backend implemente la creación automática de cargos
   */
  agregarCargoInicial: async (
    folioId: number,
    cargoData: {
      descripcion: string;
      monto: number;
      id_cliente_titular: number;
    }
  ): Promise<FolioResumen> => {
    // Usar distribución con estrategia 'single' para asignar todo al titular
    const distribucionData: DistribucionRequest = {
      operacion_uid: folioService.generarOperacionUID('dist'),
      strategy: 'single',
      responsables: [
        {
          id_cliente: cargoData.id_cliente_titular,
          amount: cargoData.monto
        }
      ]
    };

    console.log("🔧 WORKAROUND: Agregando cargo inicial via distribución:", {
      folioId,
      descripcion: cargoData.descripcion,
      monto: cargoData.monto,
      distribucionData
    });

    const response = await apiClient.post<FolioResumen>(
      `/folios/${folioId}/distribuir`,
      distribucionData
    );
    
    return response.data;
  },

  // --------------------------------------------------------------------------
  // 8. UTILIDADES: Generadores de IDs únicos
  // --------------------------------------------------------------------------

  /**
   * Genera un UID único para operaciones (distribución, pago, cierre)
   */
  generarOperacionUID: (tipo: 'dist' | 'pay' | 'close'): string => {
    const timestamp = Date.now();
    // Usar crypto.randomUUID si está disponible, sino timestamp + random
    const random = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID().substring(0, 8)
      : Math.random().toString(36).substring(2, 8);
    return `${tipo}-${timestamp}-${random}`;
  },
};

export default folioService;