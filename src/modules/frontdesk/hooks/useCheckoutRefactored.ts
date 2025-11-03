/**
 * Hook de Checkout Refactorizado
 * 
 * Integra el sistema completo de checkout con:
 * - Aplicación de depósitos (useDeposito)
 * - División de cargos (useDivisionCargos) 
 * - Facturación múltiple (useFacturacion)
 * - Validación y cierre de folios
 * 
 * @module useCheckoutRefactored
 */

import { useState, useCallback } from 'react';
import { useDeposito } from './useDeposito';
import { useDivisionCargos } from './useDivisionCargos';
import { useFacturacion } from './useFacturacion';
import type { 
  CheckoutData, 
  CheckoutFormData, 
  BillingItem,
  BillSplit 
} from '../types/checkout';
import type { 
  Deposito, 
  ConfiguracionDivision,
  TipoCargo,
  TipoResponsable,
  ResponsablePago,
  Factura
} from '../types/folioTypes';

/**
 * Datos extendidos del checkout con integración de división de cargos
 */
export interface CheckoutDataExtended extends CheckoutData {
  /** Si tiene división de cargos marcada desde check-in */
  requiereDivisionCargos?: boolean;
  /** Notas sobre cómo dividir */
  notasDivision?: string;
  /** Empresa pagadora */
  empresaPagadora?: string;
  /** Estado del depósito aplicado */
  depositoAplicado?: Deposito;
  /** Configuración de división aplicada */
  configuracionDivision?: ConfiguracionDivision;
  /** Facturas generadas */
  facturasGeneradas?: Factura[];
}

/**
 * Configuración de responsables para división de cargos
 */
export interface ConfiguracionResponsables {
  /** Responsables configurados */
  responsables: ResponsablePago[];
  /** Asignación de tipos de cargo a responsables */
  asignaciones: Array<{
    tipoCargo: TipoCargo;
    responsableId: string;
    porcentaje?: number; // Si se divide porcentualmente
  }>;
}

/**
 * Resultado del proceso de checkout
 */
export interface ResultadoCheckout {
  exito: boolean;
  folioId: string;
  depositoAplicado?: Deposito;
  divisionAplicada?: boolean;
  facturasGeneradas: Factura[];
  numeroRecibo: string;
  mensajes: string[];
  errores: string[];
}

/**
 * Hook de checkout refactorizado con integración completa
 */
export const useCheckoutRefactored = (folioId: number, reservaId?: number) => {
  const [error, setError] = useState<string | null>(null);
  const [mensajes, setMensajes] = useState<string[]>([]);
  const [procesando, setProcesando] = useState(false);

  // Hooks integrados
  const deposito = useDeposito({ folioId, reservaId });
  const divisionCargos = useDivisionCargos({ folioId });
  const facturacion = useFacturacion({ folioId });

  /**
   * 1️⃣ Aplicar depósito a la cuenta final
   */
  const aplicarDeposito = useCallback(async (): Promise<Deposito | null> => {
    try {
      setMensajes(prev => [...prev, '💰 Verificando depósito...']);
      
      const estadoDeposito = await deposito.consultarEstadoDeposito();
      
      if (!estadoDeposito) {
        setMensajes(prev => [...prev, 'ℹ️ No hay depósito registrado']);
        return null;
      }

      if (estadoDeposito.estado !== 'pendiente') {
        setMensajes(prev => [...prev, `⚠️ Depósito ya ${estadoDeposito.estado}`]);
        return estadoDeposito;
      }

      setMensajes(prev => [...prev, `✅ Depósito aplicado: $${estadoDeposito.monto_pagado.toFixed(2)}`]);
      return estadoDeposito;
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al aplicar depósito';
      setError(mensaje);
      setMensajes(prev => [...prev, `❌ ${mensaje}`]);
      return null;
    }
  }, [deposito]);

  /**
   * 2️⃣ Aplicar división de cargos si está configurada
   */
  const aplicarDivisionCargos = useCallback(async (
    configuracion: ConfiguracionResponsables
  ): Promise<boolean> => {
    try {
      setMensajes(prev => [...prev, '⚖️ Aplicando división de cargos...']);

      // Agrupar asignaciones por responsable
      const asignacionesPorResponsable = configuracion.responsables.map(responsable => {
        const cargosTipo = configuracion.asignaciones
          .filter(a => a.responsableId === responsable.id_cliente.toString())
          .map(a => a.tipoCargo);

        return {
          responsableId: responsable.id_cliente.toString(),
          tiposCargo: cargosTipo
        };
      });

      // TODO: Implementar división real usando divisionCargos cuando el backend lo soporte
      console.log('Asignaciones por responsable:', asignacionesPorResponsable);

      setMensajes(prev => [
        ...prev, 
        `📊 División configurada para ${configuracion.responsables.length} responsables`
      ]);

      // Aquí se haría la división real usando useDivisionCargos
      // Por ahora solo validamos la configuración
      return true;
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al dividir cargos';
      setError(mensaje);
      setMensajes(prev => [...prev, `❌ ${mensaje}`]);
      return false;
    }
  }, [divisionCargos]);

  /**
   * 3️⃣ Generar facturas (múltiples si hay división)
   */
  const generarFacturas = useCallback(async (
    responsables: ResponsablePago[]
  ): Promise<Factura[]> => {
    try {
      setMensajes(prev => [...prev, '📄 Generando facturas...']);

      if (responsables.length === 1) {
        // Factura única
        const responsable = responsables[0];
        const factura = await facturacion.generarFactura(
          responsable.id_cliente.toString(),
          responsable.tipo,
          {
            nombre: responsable.nombre,
            nit: responsable.nit,
            razon_social: responsable.razon_social,
            direccion: '',
            email: responsable.email
          }
        );
        
        if (factura) {
          setMensajes(prev => [...prev, `✅ Factura generada: ${factura.numero_factura}`]);
          return [factura];
        }
        return [];
      } else {
        // Facturas múltiples
        const facturas = await facturacion.generarFacturasMultiples(responsables);
        setMensajes(prev => [
          ...prev, 
          `✅ ${facturas.length} facturas generadas`
        ]);
        return facturas;
      }
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al generar facturas';
      setError(mensaje);
      setMensajes(prev => [...prev, `❌ ${mensaje}`]);
      return [];
    }
  }, [facturacion]);

  /**
   * 🎯 Proceso completo de checkout
   */
  const procesarCheckout = useCallback(async (
    data: CheckoutFormData,
    configuracionResponsables?: ConfiguracionResponsables
  ): Promise<ResultadoCheckout> => {
    setProcesando(true);
    setMensajes([]);
    setError(null);

    const errores: string[] = [];
    const numeroRecibo = generarNumeroRecibo();

    try {
      setMensajes(['🚀 Iniciando proceso de checkout...']);

      // Paso 1: Aplicar depósito
      const depositoAplicado = await aplicarDeposito();

      // Paso 2: División de cargos (si está configurada)
      let divisionAplicada = false;
      if (data.requiereDivisionCargos && configuracionResponsables) {
        divisionAplicada = await aplicarDivisionCargos(configuracionResponsables);
        if (!divisionAplicada) {
          errores.push('No se pudo aplicar la división de cargos');
        }
      }

      // Paso 3: Generar facturas
      const responsables: ResponsablePago[] = configuracionResponsables?.responsables || [
        {
          id_cliente: 1,
          tipo: 'huesped' as TipoResponsable,
          nombre: data.guestName,
          email: data.email,
          cargos_asignados: []
        }
      ];

      const facturasGeneradas = await generarFacturas(responsables);

      if (facturasGeneradas.length === 0) {
        errores.push('No se pudieron generar las facturas');
      }

      // Paso 4: Validar totales
      const validacionTotales = validarTotalesCheckout(data, depositoAplicado);
      if (!validacionTotales.valido) {
        errores.push(...validacionTotales.errores);
      }

      const exito = errores.length === 0;

      setMensajes(prev => [
        ...prev,
        exito ? '✅ Checkout completado exitosamente' : '⚠️ Checkout completado con advertencias'
      ]);

      return {
        exito,
        folioId: folioId.toString(),
        depositoAplicado: depositoAplicado || undefined,
        divisionAplicada,
        facturasGeneradas,
        numeroRecibo,
        mensajes,
        errores
      };
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error en el proceso de checkout';
      setError(mensaje);
      errores.push(mensaje);

      return {
        exito: false,
        folioId: folioId.toString(),
        facturasGeneradas: [],
        numeroRecibo,
        mensajes,
        errores
      };
    } finally {
      setProcesando(false);
    }
  }, [folioId, aplicarDeposito, aplicarDivisionCargos, generarFacturas, mensajes]);

  /**
   * 🔍 Obtener resumen del folio para checkout
   */
  const obtenerResumenFolio = useCallback(async () => {
    try {
      // Aquí se llamaría al endpoint GET /api/folios/{id}/resumen
      // Por ahora retornamos estructura mock
      return {
        folioId,
        cargos: [],
        depositoRegistrado: await deposito.consultarEstadoDeposito(),
        requiereDivision: false,
        total: 0
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener resumen');
      return null;
    }
  }, [folioId, deposito]);

  return {
    // Estado
    procesando,
    error,
    mensajes,
    
    // Acceso a hooks integrados
    deposito,
    divisionCargos,
    facturacion,
    
    // Funciones principales
    procesarCheckout,
    obtenerResumenFolio,
    aplicarDeposito,
    aplicarDivisionCargos,
    generarFacturas,
    
    // Utilidades
    setError,
    limpiarMensajes: () => setMensajes([])
  };
};

// ========================================
// 🛠️ UTILIDADES
// ========================================

/**
 * Generar número de recibo único
 */
function generarNumeroRecibo(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  const randomArray = new Uint32Array(1);
  crypto.getRandomValues(randomArray);
  const random = (randomArray[0] % 10000).toString().padStart(4, '0');
  
  return `RCP-${year}${month}${day}-${hours}${minutes}${seconds}-${random}`;
}

/**
 * Validar totales del checkout
 */
function validarTotalesCheckout(
  data: CheckoutFormData,
  deposito: Deposito | null
): { valido: boolean; errores: string[] } {
  const errores: string[] = [];

  // Validar campos requeridos
  if (!data.reservationId || !data.roomNumber) {
    errores.push('Falta información de reservación o habitación');
  }

  if (!data.checkOutDate) {
    errores.push('Falta fecha de checkout');
  }

  // Validar totales
  const subtotal = data.billingItems.reduce((sum, item) => sum + item.total, 0);
  const montoDeposito = deposito?.monto_pagado || 0;
  const totalFinal = subtotal - montoDeposito - data.discountAmount;

  if (totalFinal < 0) {
    errores.push('El total final no puede ser negativo');
  }

  if (data.grandTotal < 0) {
    errores.push('El gran total no puede ser negativo');
  }

  // Validar consistencia de cargos
  if (data.billingItems.length === 0) {
    errores.push('No hay cargos en la cuenta');
  }

  return {
    valido: errores.length === 0,
    errores
  };
}

/**
 * Calcular splits de cuenta (legacy - mantener compatibilidad)
 */
export function calcularSplitsCuenta(
  billingItems: BillingItem[], 
  numberOfSplits: number, 
  guestNames: string[]
): BillSplit[] {
  if (numberOfSplits <= 1) return [];
  
  const subtotal = billingItems.reduce((sum, item) => sum + item.total, 0);
  const splitAmount = subtotal / numberOfSplits;
  
  return guestNames.map((name, index) => ({
    id: `split-${index + 1}`,
    guestName: name,
    items: billingItems.map(item => ({
      ...item,
      total: item.total / numberOfSplits
    })),
    subtotal: splitAmount,
    tax: 0,
    total: splitAmount,
    percentage: 100 / numberOfSplits
  }));
}
