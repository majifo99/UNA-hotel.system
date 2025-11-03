/**
 * Hook especializado para Checkout con integración completa de Folios
 * 
 * Maneja el flujo completo:
 * 1. Validación pre-checkout
 * 2. Registro de pagos finales
 * 3. Cierre del folio
 * 4. Generación de recibo con datos del folio
 * 5. Consulta de resumen e historial
 * 
 * @module useCheckoutFolio
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { folioService, type FolioResumen, type PagoRequest, type CerrarFolioRequest } from '../services/folioService';
import type {
  CheckoutConFolio,
  ResultadoCheckoutFolio,
  ValidacionCheckout,
  PagoRegistrado,
  ConfiguracionCheckout,
  EstadoCheckout
} from '../types/checkout-folio';

interface UseCheckoutFolioProps {
  /** ID del folio a procesar */
  folioId: number | null;
  
  /** ID del cliente titular */
  idClienteTitular?: number;
  
  /** Configuración del proceso */
  configuracion?: ConfiguracionCheckout;
}

/**
 * Hook para manejar checkout con folios
 */
export const useCheckoutFolio = ({
  folioId,
  idClienteTitular,
  configuracion = {
    permitirSaldoPendiente: false,
    generarRecibo: true,
    enviarEmailRecibo: false,
    aplicarDeposito: true,
    validarDivision: true,
  }
}: UseCheckoutFolioProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estado, setEstado] = useState<EstadoCheckout>({
    paso: 'inicio',
    descripcion: 'Esperando inicio del checkout',
    progreso: 0,
    timestamp: new Date().toISOString(),
  });
  const [resumenFolio, setResumenFolio] = useState<FolioResumen | null>(null);
  const [pagosRegistrados, setPagosRegistrados] = useState<PagoRegistrado[]>([]);

  // ============================================================================
  // 1️⃣ VALIDACIÓN PRE-CHECKOUT
  // ============================================================================

  /**
   * Valida si el folio está listo para checkout
   */
  const validarPreCheckout = useCallback(async (): Promise<ValidacionCheckout> => {
    if (!folioId) {
      return {
        puedeCheckout: false,
        tieneSaldoPendiente: false,
        montoPendiente: 0,
        cargosDistribuidos: false,
        responsablesAsignados: false,
        advertencias: [],
        errores: ['No hay folio asociado'],
      };
    }

    try {
      console.log('🔍 Validando folio para checkout:', folioId);
      
      const resumen = await folioService.getResumen(folioId);
      setResumenFolio(resumen);

      const saldoGlobal = resumen.totales.saldo_global;
      const tieneSaldo = saldoGlobal > 0.01; // Tolerancia de 1 centavo
      const cargosDistribuidos = parseFloat(resumen.resumen.a_distribuir) === 0;

      const advertencias: string[] = [];
      const errores: string[] = [];

      // Validar saldo
      if (tieneSaldo && !configuracion.permitirSaldoPendiente) {
        errores.push(`Existe un saldo pendiente de $${saldoGlobal.toFixed(2)}`);
      } else if (tieneSaldo) {
        advertencias.push(`Saldo pendiente: $${saldoGlobal.toFixed(2)}`);
      }

      // Validar distribución
      if (!cargosDistribuidos && configuracion.validarDivision) {
        advertencias.push('Hay cargos sin distribuir');
      }

      // Validar responsables
      const responsablesAsignados = resumen.personas.every(p => p.asignado > 0 || p.saldo === 0);
      if (!responsablesAsignados && configuracion.validarDivision) {
        advertencias.push('Algunos responsables no tienen cargos asignados');
      }

      const validacion: ValidacionCheckout = {
        puedeCheckout: errores.length === 0,
        tieneSaldoPendiente: tieneSaldo,
        montoPendiente: saldoGlobal,
        cargosDistribuidos,
        responsablesAsignados,
        advertencias,
        errores,
      };

      console.log('✅ Validación completada:', validacion);
      return validacion;
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al validar folio';
      console.error('❌ Error en validación:', mensaje);
      
      return {
        puedeCheckout: false,
        tieneSaldoPendiente: false,
        montoPendiente: 0,
        cargosDistribuidos: false,
        responsablesAsignados: false,
        advertencias: [],
        errores: [mensaje],
      };
    }
  }, [folioId, configuracion]);

  // ============================================================================
  // 2️⃣ REGISTRO DE PAGOS
  // ============================================================================

  /**
   * Registra un pago en el folio antes del cierre
   */
  const registrarPago = useCallback(async (
    monto: number,
    metodo: string,
    id_cliente?: number,
    nota?: string
  ): Promise<boolean> => {
    if (!folioId) {
      toast.error('No hay folio activo');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('💳 Registrando pago:', { monto, metodo, id_cliente });

      const operacion_uid = folioService.generarOperacionUID('pay');

      const data: PagoRequest = {
        operacion_uid,
        monto,
        metodo,
        resultado: 'OK',
        ...(id_cliente && { id_cliente }),
        ...(nota && { nota }),
      };

      const resumen = await folioService.registrarPago(folioId, data);
      setResumenFolio(resumen);

      // Agregar a pagos registrados
      const pagoRegistrado: PagoRegistrado = {
        operacion_uid,
        monto,
        metodo,
        id_cliente,
        resultado: 'OK',
        nota,
        fecha: new Date().toISOString(),
      };

      setPagosRegistrados(prev => [...prev, pagoRegistrado]);

      toast.success('Pago registrado', {
        description: `$${monto.toFixed(2)} - ${metodo}`,
      });

      console.log('✅ Pago registrado exitosamente');
      return true;
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al registrar pago';
      setError(mensaje);
      toast.error('Error al registrar pago', { description: mensaje });
      console.error('❌ Error:', mensaje);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [folioId]);

  /**
   * Registra múltiples pagos (útil para división de cuenta)
   */
  const registrarPagosMultiples = useCallback(async (
    pagos: Array<{
      monto: number;
      metodo: string;
      id_cliente?: number;
      nota?: string;
    }>
  ): Promise<boolean> => {
    for (const pago of pagos) {
      const exito = await registrarPago(pago.monto, pago.metodo, pago.id_cliente, pago.nota);
      if (!exito) {
        return false;
      }
    }
    return true;
  }, [registrarPago]);

  // ============================================================================
  // 3️⃣ CIERRE DE FOLIO (CHECKOUT)
  // ============================================================================

  /**
   * Cierra el folio y completa el checkout
   */
  const cerrarFolio = useCallback(async (): Promise<boolean> => {
    if (!folioId || !idClienteTitular) {
      toast.error('Faltan datos para cerrar el folio');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔒 Cerrando folio:', folioId);

      setEstado({
        paso: 'cierre',
        descripcion: 'Cerrando folio...',
        progreso: 80,
        timestamp: new Date().toISOString(),
      });

      const operacion_uid = folioService.generarOperacionUID('close');

      const data: CerrarFolioRequest = {
        operacion_uid,
        id_cliente_titular: idClienteTitular,
      };

      const resumen = await folioService.cerrarFolio(folioId, data);
      setResumenFolio(resumen);

      setEstado({
        paso: 'completado',
        descripcion: 'Checkout completado',
        progreso: 100,
        timestamp: new Date().toISOString(),
      });

      toast.success('Checkout completado', {
        description: `Folio #${folioId} cerrado exitosamente`,
      });

      console.log('✅ Folio cerrado exitosamente');
      return true;
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al cerrar folio';
      setError(mensaje);
      
      setEstado({
        paso: 'error',
        descripcion: mensaje,
        progreso: 0,
        timestamp: new Date().toISOString(),
      });

      toast.error('Error al cerrar folio', { description: mensaje });
      console.error('❌ Error:', mensaje);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [folioId, idClienteTitular]);

  // ============================================================================
  // 4️⃣ PROCESO COMPLETO DE CHECKOUT
  // ============================================================================

  /**
   * Ejecuta el proceso completo de checkout con validación
   */
  const ejecutarCheckout = useCallback(async (
    data: CheckoutConFolio
  ): Promise<ResultadoCheckoutFolio | null> => {
    if (!folioId) {
      toast.error('No hay folio asociado');
      return null;
    }

    setIsLoading(true);
    setError(null);
    
    const mensajes: string[] = [];
    const errores: string[] = [];

    try {
      console.log('🚀 Iniciando proceso de checkout completo');

      // Paso 1: Validación
      setEstado({
        paso: 'validacion',
        descripcion: 'Validando folio...',
        progreso: 20,
        timestamp: new Date().toISOString(),
      });

      const validacion = await validarPreCheckout();
      mensajes.push(...validacion.advertencias);

      if (!validacion.puedeCheckout) {
        errores.push(...validacion.errores);
        throw new Error(validacion.errores.join(', '));
      }

      // Paso 2: Registrar pago final (si hay monto)
      if (data.grandTotal > 0) {
        setEstado({
          paso: 'pago',
          descripcion: 'Registrando pago final...',
          progreso: 50,
          timestamp: new Date().toISOString(),
        });

        const exitoPago = await registrarPago(
          data.grandTotal,
          'Tarjeta de Crédito', // Método por defecto, podría venir de data
          idClienteTitular,
          'Pago final de checkout'
        );

        if (!exitoPago) {
          throw new Error('No se pudo registrar el pago final');
        }

        mensajes.push(`Pago de $${data.grandTotal.toFixed(2)} registrado`);
      }

      // Paso 3: Cerrar folio
      const exitoCierre = await cerrarFolio();
      if (!exitoCierre) {
        throw new Error('No se pudo cerrar el folio');
      }

      // Paso 4: Obtener resumen final
      const resumenFinal = await folioService.getResumen(folioId);

      const resultado: ResultadoCheckoutFolio = {
        exito: true,
        folioId,
        resumenFinal,
        numeroRecibo: generarNumeroRecibo(),
        operaciones: {
          pagos: pagosRegistrados,
          cierre: {
            operacion_uid: folioService.generarOperacionUID('close'),
            id_cliente_titular: idClienteTitular || 0,
            fecha: new Date().toISOString(),
          },
        },
        mensajes,
        errores: [],
        saldoFinal: resumenFinal.totales.saldo_global,
      };

      console.log('✅ Checkout completado:', resultado);
      return resultado;
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error en checkout';
      setError(mensaje);
      errores.push(mensaje);

      console.error('❌ Error en checkout:', mensaje);

      // Retornar resultado de error con lo que se alcanzó a procesar
      return {
        exito: false,
        folioId,
        resumenFinal: resumenFolio!,
        numeroRecibo: generarNumeroRecibo(),
        operaciones: {
          pagos: pagosRegistrados,
          cierre: {
            operacion_uid: '',
            id_cliente_titular: idClienteTitular || 0,
            fecha: '',
          },
        },
        mensajes,
        errores,
        saldoFinal: resumenFolio?.totales.saldo_global || 0,
      };
    } finally {
      setIsLoading(false);
    }
  }, [folioId, idClienteTitular, validarPreCheckout, registrarPago, cerrarFolio, pagosRegistrados, resumenFolio]);

  // ============================================================================
  // 5️⃣ CONSULTAS
  // ============================================================================

  /**
   * Obtiene el resumen actualizado del folio
   */
  const obtenerResumen = useCallback(async (): Promise<FolioResumen | null> => {
    if (!folioId) return null;

    try {
      const resumen = await folioService.getResumen(folioId);
      setResumenFolio(resumen);
      return resumen;
    } catch (err) {
      console.error('Error al obtener resumen:', err);
      return null;
    }
  }, [folioId]);

  /**
   * Obtiene el historial de operaciones del folio
   */
  const obtenerHistorial = useCallback(async () => {
    if (!folioId) return null;

    try {
      return await folioService.getHistorial(folioId);
    } catch (err) {
      console.error('Error al obtener historial:', err);
      return null;
    }
  }, [folioId]);

  /**
   * Exporta el historial a CSV
   */
  const exportarHistorial = useCallback(async () => {
    if (!folioId) return false;

    try {
      return await folioService.exportarHistorial(folioId);
    } catch (err) {
      console.error('Error al exportar historial:', err);
      return false;
    }
  }, [folioId]);

  // ============================================================================
  // UTILIDADES
  // ============================================================================

  const limpiarError = useCallback(() => setError(null), []);
  
  const resetear = useCallback(() => {
    setResumenFolio(null);
    setPagosRegistrados([]);
    setError(null);
    setEstado({
      paso: 'inicio',
      descripcion: 'Esperando inicio del checkout',
      progreso: 0,
      timestamp: new Date().toISOString(),
    });
  }, []);

  return {
    // Estado
    isLoading,
    error,
    estado,
    resumenFolio,
    pagosRegistrados,

    // Validación
    validarPreCheckout,

    // Pagos
    registrarPago,
    registrarPagosMultiples,

    // Checkout
    cerrarFolio,
    ejecutarCheckout,

    // Consultas
    obtenerResumen,
    obtenerHistorial,
    exportarHistorial,

    // Utilidades
    limpiarError,
    resetear,
  };
};

// ============================================================================
// UTILIDADES AUXILIARES
// ============================================================================

/**
 * Genera un número de recibo único y seguro
 */
function generarNumeroRecibo(): string {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const timePart = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
  const millisPart = String(now.getMilliseconds()).padStart(3, '0');
  
  const randomArray = new Uint32Array(1);
  crypto.getRandomValues(randomArray);
  const randomPart = (randomArray[0] % 10000).toString().padStart(4, '0');
  
  return `RCP-${datePart}-${timePart}${millisPart}-${randomPart}`;
}
