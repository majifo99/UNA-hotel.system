import { useState, useCallback } from 'react';
import { folioService as _folioService } from '../services/folioService';
import type {
  Factura,
  ResponsablePago,
  TipoResponsable,
  FacturacionRequest
} from '../types/folioTypes';

interface UseFacturacionProps {
  folioId?: number;
  autoLoad?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: (mensaje: string) => void;
}

interface UseFacturacionReturn {
  // Estado
  facturas: Factura[];
  loading: boolean;
  generando: boolean;
  error: Error | null;
  
  // Acciones
  cargarFacturas: () => Promise<void>;
  generarFactura: (
    idResponsable: string,
    tipoResponsable: TipoResponsable,
    datosFiscales: FacturacionRequest['datos_fiscales'],
    metodoPago?: string
  ) => Promise<Factura | null>;
  generarFacturasMultiples: (
    responsables: ResponsablePago[]
  ) => Promise<Factura[]>;
  anularFactura: (idFactura: string, motivo: string) => Promise<void>;
  descargarPDF: (idFactura: string) => Promise<string | null>;
  
  // Helpers
  obtenerFacturaPorResponsable: (idResponsable: string) => Factura | undefined;
  calcularTotalFacturas: () => number;
  hayFacturasPendientes: boolean;
  todasFacturasEmitidas: boolean;
}

/**
 * Hook para facturación hotelera
 */
export const useFacturacion = ({
  folioId,
  autoLoad: _autoLoad = true,
  onError,
  onSuccess
}: UseFacturacionProps = {}): UseFacturacionReturn => {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [generando, setGenerando] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Carga las facturas existentes del folio
   */
  const cargarFacturas = useCallback(async (): Promise<void> => {
    if (!folioId) {
      const err = new Error('Se requiere folioId');
      setError(err);
      onError?.(err);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // TODO: Implementar llamada al API
      // const response = await apiClient.get(`/folios/${folioId}/facturas`);
      
      // Simulación temporal
      const facturasSimuladas: Factura[] = [];
      setFacturas(facturasSimuladas);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al cargar facturas');
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [folioId, onError]);

  /**
   * Genera una factura para un responsable específico
   */
  const generarFactura = useCallback(async (
    idResponsable: string,
    tipoResponsable: TipoResponsable,
    datosFiscales: FacturacionRequest['datos_fiscales'],
    metodoPago?: string
  ): Promise<Factura | null> => {
    if (!folioId) {
      const err = new Error('Se requiere folioId');
      setError(err);
      onError?.(err);
      return null;
    }

    setGenerando(true);
    setError(null);

    try {
      // TODO: Implementar llamada al API dedicado o adaptar al endpoint de historial

      const nuevaFactura: Factura = {
        id: `FAC-${Date.now()}`,
        numero_factura: `F-${folioId}-${facturas.length + 1}`,
        id_folio: folioId,
        responsable: idResponsable,
        tipo_responsable: tipoResponsable,
        nombre_responsable: datosFiscales.nombre,
        nit: datosFiscales.nit,
        razon_social: datosFiscales.razon_social,
        direccion: datosFiscales.direccion,
        cargos: [],
        subtotal: 0,
        impuestos: 0,
        total: 0,
        fecha_emision: new Date(),
        metodo_pago: metodoPago,
        estado: 'emitida'
      };

      setFacturas(prev => [...prev, nuevaFactura]);
      onSuccess?.(`Factura ${nuevaFactura.numero_factura} generada exitosamente`);
      
      return nuevaFactura;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al generar factura');
      setError(error);
      onError?.(error);
      return null;
    } finally {
      setGenerando(false);
    }
  }, [folioId, facturas.length, onError, onSuccess]);

  /**
   * Genera facturas para múltiples responsables en batch
   */
  const generarFacturasMultiples = useCallback(async (
    responsables: ResponsablePago[]
  ): Promise<Factura[]> => {
    if (!folioId) {
      const err = new Error('Se requiere folioId');
      setError(err);
      onError?.(err);
      return [];
    }

    if (responsables.length === 0) {
      const err = new Error('Debe proporcionar al menos un responsable');
      setError(err);
      onError?.(err);
      return [];
    }

    setGenerando(true);
    setError(null);

    try {
      const facturasGeneradas: Factura[] = [];

      for (const responsable of responsables) {
        // Solo generar si tiene cargos asignados
        if (responsable.cargos_asignados.length === 0) continue;

        const datosFiscales = {
          nit: responsable.nit,
          nombre: responsable.nombre,
          razon_social: responsable.razon_social,
          email: responsable.email
        };

        const factura = await generarFactura(
          responsable.id_cliente.toString(),
          responsable.tipo,
          datosFiscales
        );

        if (factura) {
          facturasGeneradas.push(factura);
        }
      }

      onSuccess?.(
        `${facturasGeneradas.length} factura${facturasGeneradas.length !== 1 ? 's' : ''} generada${facturasGeneradas.length !== 1 ? 's' : ''} exitosamente`
      );

      return facturasGeneradas;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al generar facturas múltiples');
      setError(error);
      onError?.(error);
      return [];
    } finally {
      setGenerando(false);
    }
  }, [folioId, generarFactura, onError, onSuccess]);

  /**
   * Anula una factura existente
   */
  const anularFactura = useCallback(async (
    idFactura: string,
    _motivo: string
  ): Promise<void> => {
    if (!folioId) {
      const err = new Error('Se requiere folioId');
      setError(err);
      onError?.(err);
      return;
    }

    setGenerando(true);
    setError(null);

    try {
      // TODO: Implementar llamada al API
      // await apiClient.post(`/folios/${folioId}/facturas/${idFactura}/anular`, { motivo: _motivo });

      setFacturas(prev =>
        prev.map(f =>
          f.id === idFactura
            ? { ...f, estado: 'anulada' as const }
            : f
        )
      );

      onSuccess?.(`Factura anulada exitosamente`);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al anular factura');
      setError(error);
      onError?.(error);
    } finally {
      setGenerando(false);
    }
  }, [folioId, onError, onSuccess]);

  /**
   * Descarga el PDF de una factura
   */
  const descargarPDF = useCallback(async (
    idFactura: string
  ): Promise<string | null> => {
    if (!folioId) {
      const err = new Error('Se requiere folioId');
      setError(err);
      onError?.(err);
      return null;
    }

    try {
      // TODO: Implementar llamada al API
      // const response = await apiClient.get(`/folios/${folioId}/facturas/${idFactura}/pdf`);
      // return response.data.url;

      const factura = facturas.find(f => f.id === idFactura);
      if (factura?.pdf_url) {
        return factura.pdf_url;
      }

      return null;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al descargar PDF');
      setError(error);
      onError?.(error);
      return null;
    }
  }, [folioId, facturas, onError]);

  /**
   * Obtiene una factura por responsable
   */
  const obtenerFacturaPorResponsable = useCallback((
    idResponsable: string
  ): Factura | undefined => {
    return facturas.find(f => f.responsable === idResponsable && f.estado !== 'anulada');
  }, [facturas]);

  /**
   * Calcula el total de todas las facturas emitidas
   */
  const calcularTotalFacturas = useCallback((): number => {
    return facturas
      .filter(f => f.estado === 'emitida' || f.estado === 'pagada')
      .reduce((sum, f) => sum + f.total, 0);
  }, [facturas]);

  // Computed values
  const hayFacturasPendientes = facturas.some(f => f.estado === 'borrador');
  const todasFacturasEmitidas = facturas.length > 0 && facturas.every(f => 
    f.estado === 'emitida' || f.estado === 'pagada'
  );

  return {
    facturas,
    loading,
    generando,
    error,
    cargarFacturas,
    generarFactura,
    generarFacturasMultiples,
    anularFactura,
    descargarPDF,
    obtenerFacturaPorResponsable,
    calcularTotalFacturas,
    hayFacturasPendientes,
    todasFacturasEmitidas
  };
};
