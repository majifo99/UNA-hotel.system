import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { folioService, type FolioResumen, type DistribucionRequest, type PagoRequest, type CerrarFolioRequest } from '../services/folioService';

/**
 * Estado del flujo de folios
 */
interface FolioFlowState {
  folioId: number | null;
  resumen: FolioResumen | null;
  isLoading: boolean;
  error: string | null;
  currentStep: 'idle' | 'checkin' | 'distribucion' | 'pago' | 'cerrado';
}

/**
 * Hook personalizado para manejar el flujo completo de folios
 * Cubre: check-in → distribución → pago → cierre → historial
 */
export const useFolioFlow = () => {
  const [state, setState] = useState<FolioFlowState>({
    folioId: null,
    resumen: null,
    isLoading: false,
    error: null,
    currentStep: 'idle',
  });

  // ============================================================================
  // 1. CHECK-IN: Crear estadía y folio
  // ============================================================================

  /**
   * Realiza el check-in completo
   * Devuelve el folioId generado para usarlo en siguientes pasos
   */
  const realizarCheckIn = useCallback(async (
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
  ): Promise<number | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('🏨 Iniciando check-in con folio...');
      
      // ✅ 1. Log de información de la reserva
      console.log('🔍 Procesando reserva:', reservaId);
      console.log('� Datos del check-in:', {
        titular: data.id_cliente_titular,
        habitacion: data.id_hab,
        fechas: `${data.fecha_llegada} - ${data.fecha_salida}`
      });
      
      const response = await folioService.realizarCheckIn(reservaId, data);

      console.log('📥 Respuesta del backend:', response);

      // El backend devuelve la estructura directamente, no envuelta en { success, data }
      let folioId: number;
      
      // Opción 1: Si viene en response.folio (estructura actual del backend)
      if (response.folio) {
        folioId = typeof response.folio === 'number' ? response.folio : Number.parseInt(response.folio);
      }
      // Opción 2: Si viene en response.data.id (estructura esperada originalmente)
      else if ((response as any).data?.id) {
        folioId = (response as any).data.id;
      }
      // Opción 3: Si viene en response.data.folio
      else if ((response as any).data?.folio) {
        folioId = (response as any).data.folio;
      }
      // No se encontró el folio
      else {
        throw new Error('No se pudo obtener el ID del folio de la respuesta');
      }
      
      setState(prev => ({
        ...prev,
        folioId,
        isLoading: false,
        currentStep: 'checkin',
      }));

      toast.success('Check-in realizado', {
        description: `Folio #${folioId} creado exitosamente`,
      });

      console.log('✅ Check-in completado. Folio ID:', folioId);
      return folioId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido en check-in';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast.error('Error en check-in', {
        description: errorMessage,
      });

      console.error('❌ Error en check-in:', errorMessage);
      return null;
    }
  }, []);

  // ============================================================================
  // 2. DISTRIBUCIÓN: Distribuir cargos
  // ============================================================================

  /**
   * Distribuye los cargos del folio según estrategia
   */
  const distribuirCargos = useCallback(async (
    folioId: number,
    strategy: 'single' | 'equal' | 'percent' | 'fixed',
    responsables: Array<{
      id_cliente: number;
      percent?: number;
      amount?: number;
    }>
  ): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('💰 Distribuyendo cargos del folio:', folioId);

      const operacionUID = folioService.generarOperacionUID('dist');

      const data: DistribucionRequest = {
        operacion_uid: operacionUID,
        strategy,
        responsables,
      };

      const resumen = await folioService.distribuirCargos(folioId, data);

      setState(prev => ({
        ...prev,
        resumen,
        isLoading: false,
        currentStep: 'distribucion',
      }));

      toast.success('Distribución aplicada', {
        description: `Cargos distribuidos según estrategia: ${strategy}`,
      });

      console.log('✅ Distribución completada:', resumen);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error en distribución';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast.error('Error en distribución', {
        description: errorMessage,
      });

      console.error('❌ Error en distribución:', errorMessage);
      return false;
    }
  }, []);

  // ============================================================================
  // 3. PAGO: Registrar pago
  // ============================================================================

  /**
   * Registra un pago en el folio
   * Si id_cliente no se especifica, es pago general
   */
  const registrarPago = useCallback(async (
    folioId: number,
    monto: number,
    metodo: string,
    resultado: string,
    id_cliente?: number,
    nota?: string
  ): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('💳 Registrando pago en folio:', folioId);

      const operacionUID = folioService.generarOperacionUID('pay');

      const data: PagoRequest = {
        operacion_uid: operacionUID,
        monto,
        metodo,
        resultado,
        ...(id_cliente && { id_cliente }),
        ...(nota && { nota }),
      };

      const resumen = await folioService.registrarPago(folioId, data);

      setState(prev => ({
        ...prev,
        resumen,
        isLoading: false,
        currentStep: 'pago',
      }));

      const tipoPago = id_cliente ? 'individual' : 'general';
      toast.success('Pago registrado', {
        description: `Pago ${tipoPago} de $${monto} registrado exitosamente`,
      });

      console.log('✅ Pago registrado:', resumen);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al registrar pago';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast.error('Error en pago', {
        description: errorMessage,
      });

      console.error('❌ Error en pago:', errorMessage);
      return false;
    }
  }, []);

  // ============================================================================
  // 4. CIERRE: Cerrar folio (check-out)
  // ============================================================================

  /**
   * Cierra el folio trasladando todo al titular
   */
  const cerrarFolio = useCallback(async (
    folioId: number,
    id_cliente_titular: number
  ): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('🔒 Cerrando folio:', folioId);

      const operacionUID = folioService.generarOperacionUID('close');

      const data: CerrarFolioRequest = {
        operacion_uid: operacionUID,
        id_cliente_titular,
      };

      const resumen = await folioService.cerrarFolio(folioId, data);

      setState(prev => ({
        ...prev,
        resumen,
        isLoading: false,
        currentStep: 'cerrado',
      }));

      toast.success('Folio cerrado', {
        description: `El folio #${folioId} ha sido cerrado exitosamente`,
      });

      console.log('✅ Folio cerrado:', resumen);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cerrar folio';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast.error('Error al cerrar folio', {
        description: errorMessage,
      });

      console.error('❌ Error al cerrar folio:', errorMessage);
      return false;
    }
  }, []);

  // ============================================================================
  // 5. CONSULTAS: Obtener información
  // ============================================================================

  /**
   * Obtiene el resumen actualizado del folio
   */
  const obtenerResumen = useCallback(async (folioId: number): Promise<FolioResumen | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('📊 Obteniendo resumen del folio:', folioId);

      const resumen = await folioService.getResumen(folioId);

      setState(prev => ({
        ...prev,
        resumen,
        folioId,
        isLoading: false,
      }));

      console.log('✅ Resumen obtenido:', resumen);
      return resumen;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al obtener resumen';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast.error('Error al obtener resumen', {
        description: errorMessage,
      });

      console.error('❌ Error al obtener resumen:', errorMessage);
      return null;
    }
  }, []);

  /**
   * Obtiene el historial de operaciones
   */
  const obtenerHistorial = useCallback(async (
    folioId: number,
    tipo?: 'pago' | 'distribucion' | 'cierre',
    page: number = 1
  ) => {
    try {
      console.log('📜 Obteniendo historial del folio:', folioId);

      const historial = await folioService.getHistorial(folioId, tipo, page);

      console.log('✅ Historial obtenido:', historial);
      return historial;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al obtener historial';
      
      toast.error('Error al obtener historial', {
        description: errorMessage,
      });

      console.error('❌ Error al obtener historial:', errorMessage);
      return null;
    }
  }, []);

  /**
   * Exporta el historial a CSV
   */
  const exportarHistorial = useCallback(async (
    folioId: number,
    tipo?: 'pago' | 'distribucion' | 'cierre'
  ) => {
    try {
      console.log('📥 Exportando historial del folio:', folioId);

      const blob = await folioService.exportarHistorial(folioId, tipo);

      // Crear y descargar el archivo
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `folio_${folioId}_historial.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Historial exportado', {
        description: 'El archivo CSV se ha descargado exitosamente',
      });

      console.log('✅ Historial exportado exitosamente');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al exportar historial';
      
      toast.error('Error al exportar historial', {
        description: errorMessage,
      });

      console.error('❌ Error al exportar historial:', errorMessage);
      return false;
    }
  }, []);

  // ============================================================================
  // UTILIDADES
  // ============================================================================

  /**
   * Resetea el estado del hook
   */
  const resetear = useCallback(() => {
    setState({
      folioId: null,
      resumen: null,
      isLoading: false,
      error: null,
      currentStep: 'idle',
    });
  }, []);

  /**
   * Limpia el error actual
   */
  const limpiarError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // Estado
    folioId: state.folioId,
    resumen: state.resumen,
    isLoading: state.isLoading,
    error: state.error,
    currentStep: state.currentStep,

    // Acciones
    realizarCheckIn,
    distribuirCargos,
    registrarPago,
    cerrarFolio,
    obtenerResumen,
    obtenerHistorial,
    exportarHistorial,

    // Utilidades
    resetear,
    limpiarError,
  };
};

export default useFolioFlow;
