import { useState, useCallback, useEffect } from 'react';
import { folioService } from '../services/folioService';
import type { 
  FolioResumen, 
  DistribucionRequest, 
  DistributionStrategy 
} from '../services/folioService';

interface UseFolioDistribucionParams {
  folioId?: number;
  onError?: (error: any) => void;
}

interface Persona {
  id_cliente: number;
  nombre?: string; // Este campo tendrá que venir de otra parte o se podrá editar
}

export function useFolioDistribucion({ folioId, onError }: UseFolioDistribucionParams = {}) {
  // Estado para los datos del folio
  const [folioData, setFolioData] = useState<FolioResumen | null>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [distribuyendo, setDistribuyendo] = useState<boolean>(false);

  // Obtener el resumen del folio
  const obtenerResumen = useCallback(async (id?: number) => {
    if (!id && !folioId) return;
    
    try {
      setLoading(true);
      const id_folio = id || folioId;
      if (!id_folio) throw new Error('ID de folio requerido');
      
      const data = await folioService.getResumen(id_folio);
      setFolioData(data);
      
      // Extraer las personas del resumen
      if (data.personas) {
        setPersonas(data.personas.map(p => ({
          id_cliente: p.id_cliente,
          nombre: `Cliente ${p.id_cliente}` // Nombre provisional
        })));
      }
      
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al cargar el folio';
      setError(errorMessage);
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  }, [folioId, onError]);

  // Distribuir cargos entre personas
  const distribuirCargos = useCallback(async (
    strategy: DistributionStrategy,
    responsables: Array<{id_cliente: number, percent?: number, amount?: number}>,
    id?: number
  ) => {
    if (!id && !folioId) return;
    
    try {
      setDistribuyendo(true);
      const id_folio = id || folioId;
      if (!id_folio) throw new Error('ID de folio requerido');
      
      // Generar un ID único para la operación
      const operacion_uid = `dist-${Date.now()}-${Math.random().toString(36).substring(2, 12)}`;
      
      const requestData: DistribucionRequest = {
        operacion_uid,
        strategy,
        responsables
      };
      
      const resultado = await folioService.distribuirCargos(id_folio, requestData);
      setFolioData(resultado);
      
      // Actualizar personas si es necesario
      if (resultado.personas) {
        setPersonas(prevPersonas => {
          // Mantener nombres existentes pero actualizar con nuevos datos
          const personasMap = new Map(prevPersonas.map(p => [p.id_cliente, p]));
          return resultado.personas.map(p => ({
            id_cliente: p.id_cliente,
            nombre: personasMap.get(p.id_cliente)?.nombre || `Cliente ${p.id_cliente}`
          }));
        });
      }
      
      setError(null);
      return resultado;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al distribuir cargos';
      setError(errorMessage);
      if (onError) onError(err);
    } finally {
      setDistribuyendo(false);
    }
  }, [folioId, onError]);

  // Métodos para diferentes estrategias de distribución
  
  // Distribución a una sola persona
  const distribuirUnico = useCallback(async (idCliente: number, id?: number) => {
    return distribuirCargos('single', [{ id_cliente: idCliente }], id);
  }, [distribuirCargos]);
  
  // Distribución equitativa entre varias personas
  const distribuirEquitativo = useCallback(async (idClientes: number[], id?: number) => {
    return distribuirCargos(
      'equal',
      idClientes.map(id_cliente => ({ id_cliente })),
      id
    );
  }, [distribuirCargos]);
  
  // Distribución por porcentajes
  const distribuirPorcentual = useCallback(async (
    responsables: Array<{id_cliente: number, percent: number}>,
    id?: number
  ) => {
    return distribuirCargos('percent', responsables, id);
  }, [distribuirCargos]);
  
  // Distribución por montos fijos
  const distribuirMontosFijos = useCallback(async (
    responsables: Array<{id_cliente: number, amount: number}>,
    id?: number
  ) => {
    return distribuirCargos('fixed', responsables, id);
  }, [distribuirCargos]);
  
  // Cargar datos al montar el componente si se proporciona un ID
  useEffect(() => {
    if (folioId) {
      obtenerResumen(folioId);
    }
  }, [folioId, obtenerResumen]);

  return {
    folioData,
    personas,
    loading,
    distribuyendo,
    error,
    obtenerResumen,
    distribuirUnico,
    distribuirEquitativo,
    distribuirPorcentual,
    distribuirMontosFijos,
    
    // Valores derivados para facilitar el trabajo en UI
    cargosSinPersona: folioData?.resumen.cargos_sin_persona ? parseFloat(folioData.resumen.cargos_sin_persona) : 0,
    saldoGlobal: folioData?.totales.saldo_global || 0,
    hayPendiente: folioData?.resumen.cargos_sin_persona ? parseFloat(folioData.resumen.cargos_sin_persona) > 0 : false
  };
}