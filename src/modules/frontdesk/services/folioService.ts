import apiClient from '../../../services/apiClient';

// Interfaces para manejar los datos del API
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

export type DistributionStrategy = 'single' | 'equal' | 'percent' | 'fixed';

export interface DistribucionRequest {
  operacion_uid: string;
  strategy: DistributionStrategy;
  responsables: Array<{
    id_cliente: number;
    percent?: number;
    amount?: number;
  }>;
}

export interface PagoRequest {
  operacion_uid: string;
  id_cliente?: number;
  monto: number;
  metodo: string;
  resultado: string;
}

// Servicio para manejo de folios y distribuciones
export const folioService = {
  // Obtener resumen del folio
  getResumen: async (folioId: number): Promise<FolioResumen> => {
    const response = await apiClient.get<FolioResumen>(`/api/folios/${folioId}/resumen`);
    return response.data;
  },

  // Distribuir cargos entre responsables
  distribuirCargos: async (folioId: number, data: DistribucionRequest): Promise<FolioResumen> => {
    const response = await apiClient.post<FolioResumen>(`/api/folios/${folioId}/distribuir`, data);
    return response.data;
  },

  // Registrar un pago (general o por persona)
  registrarPago: async (folioId: number, data: PagoRequest): Promise<FolioResumen> => {
    const response = await apiClient.post<FolioResumen>(`/api/folios/${folioId}/pagos`, data);
    return response.data;
  },

  // Cerrar folio (mover todo al titular)
  cerrarFolio: async (folioId: number): Promise<FolioResumen> => {
    const response = await apiClient.post<FolioResumen>(`/api/folios/${folioId}/cerrar`, {});
    return response.data;
  },

  // Obtener historial del folio
  getHistorial: async (
    folioId: number, 
    tipo?: 'pago' | 'distribucion' | 'cierre',
    page: number = 1,
    perPage: number = 50
  ): Promise<any> => {
    const params = new URLSearchParams();
    if (tipo) params.append('tipo', tipo);
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());

    const response = await apiClient.get(`/api/folios/${folioId}/historial?${params.toString()}`);
    return response.data;
  }
};