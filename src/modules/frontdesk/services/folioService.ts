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

  // V2: Obtener resumen completo del folio (nueva estructura)
  getFolioSummary: async (folioId: number): Promise<any> => {
    try {
      const response = await apiClient.get<FolioResumen>(`/api/folios/${folioId}/resumen`);
      const data = response.data;
      
      // Transform legacy data to new structure
      return {
        id: folioId,
        reservationId: data.folio,
        guestName: `Cliente ${folioId}`, // This would come from reservation data
        roomNumber: '101', // This would come from reservation data
        checkInDate: '2025-10-08', // This would come from reservation data
        checkOutDate: '2025-10-10', // This would come from reservation data
        status: 'active',
        
        totalAmount: parseFloat(data.resumen.a_distribuir) + parseFloat(data.resumen.distribuido),
        paidAmount: data.totales.pagos_totales,
        pendingAmount: data.totales.saldo_global,
        
        unassignedCharges: parseFloat(data.resumen.cargos_sin_persona),
        distributedCharges: parseFloat(data.resumen.distribuido),
        
        pendingBills: data.personas.filter(p => p.saldo > 0).length,
        generatedBills: 0,
        
        responsibles: data.personas.map(p => ({
          id: p.id_cliente,
          name: `Cliente ${p.id_cliente}`,
          type: 'guest' as const,
          assignedAmount: p.asignado,
          paidAmount: p.pagos,
          pendingAmount: p.saldo
        })),
        
        charges: [], // Would be populated from detailed endpoint
        payments: [] // Would be populated from detailed endpoint
      };
    } catch (error) {
      console.error('Error fetching folio summary:', error);
      throw error;
    }
  },

  // Distribuir cargos entre responsables
  distribuirCargos: async (folioId: number, data: DistribucionRequest): Promise<FolioResumen> => {
    const response = await apiClient.post<FolioResumen>(`/api/folios/${folioId}/distribuir`, data);
    return response.data;
  },

  // V2: Distribuir cargos (nueva interfaz)
  distributeCharges: async (folioId: number, request: any): Promise<any> => {
    // Transform new request format to legacy format
    const legacyRequest: DistribucionRequest = {
      operacion_uid: `dist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      strategy: request.strategy,
      responsables: request.responsibles.map((r: any) => ({
        id_cliente: r.id,
        percent: r.percentage,
        amount: r.amount
      }))
    };
    
    return await folioService.distribuirCargos(folioId, legacyRequest);
  },

  // Registrar un pago (general o por persona)
  registrarPago: async (folioId: number, data: PagoRequest): Promise<FolioResumen> => {
    const response = await apiClient.post<FolioResumen>(`/api/folios/${folioId}/pagos`, data);
    return response.data;
  },

  // V2: Procesar pago (nueva interfaz)
  processPayment: async (folioId: number, request: any): Promise<any> => {
    // Transform new request format to legacy format
    const legacyRequest: PagoRequest = {
      operacion_uid: `pay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      id_cliente: request.responsibleId,
      monto: request.amount,
      metodo: request.method,
      resultado: 'success'
    };
    
    return await folioService.registrarPago(folioId, legacyRequest);
  },

  // Cerrar folio (mover todo al titular)
  cerrarFolio: async (folioId: number): Promise<FolioResumen> => {
    const response = await apiClient.post<FolioResumen>(`/api/folios/${folioId}/cerrar`, {});
    return response.data;
  },

  // V2: Cerrar folio (nueva interfaz)
  closeFolio: async (folioId: number): Promise<any> => {
    return await folioService.cerrarFolio(folioId);
  },

  // V2: Generar factura (placeholder)
  generateBill: async (folioId: number, request: any): Promise<any> => {
    // This would be implemented when billing endpoints are available
    console.log('Generating bill for folio:', folioId, request);
    
    // For now, return a mock response
    return {
      success: true,
      billId: `bill-${folioId}-${Date.now()}`,
      message: 'Factura generada exitosamente'
    };
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