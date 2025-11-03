/**
 * Tipos específicos para integración de Checkout con Folios
 * Extiende los tipos base de checkout para soportar el sistema completo de folios
 */

import type { CheckoutFormData } from './checkout';
import type { FolioResumen } from '../services/folioService';

/**
 * Datos extendidos del checkout con información del folio
 */
export interface CheckoutConFolio extends CheckoutFormData {
  /** ID del folio asociado a la reservación */
  folioId?: number;
  
  /** Resumen actualizado del folio */
  folioResumen?: FolioResumen;
  
  /** Timestamp del cierre del folio */
  fechaCierre?: string;
  
  /** UID de la operación de cierre */
  operacionCierreUID?: string;
  
  /** Saldo final después de aplicar todos los pagos */
  saldoFinal?: number;
  
  /** Detalles de los pagos registrados */
  pagosRegistrados?: PagoRegistrado[];
}

/**
 * Pago registrado en el folio
 */
export interface PagoRegistrado {
  /** UID único del pago */
  operacion_uid: string;
  
  /** Monto del pago */
  monto: number;
  
  /** Método de pago utilizado */
  metodo: string;
  
  /** ID del cliente que pagó (opcional para pagos generales) */
  id_cliente?: number;
  
  /** Nombre del cliente que pagó */
  nombre_cliente?: string;
  
  /** Resultado del procesamiento */
  resultado: string;
  
  /** Nota adicional */
  nota?: string;
  
  /** Timestamp del pago */
  fecha: string;
}

/**
 * Resultado del proceso de checkout con folio
 */
export interface ResultadoCheckoutFolio {
  /** Indica si el checkout fue exitoso */
  exito: boolean;
  
  /** ID del folio cerrado */
  folioId: number;
  
  /** Resumen final del folio */
  resumenFinal: FolioResumen;
  
  /** Número de recibo generado */
  numeroRecibo: string;
  
  /** Operaciones realizadas durante el checkout */
  operaciones: {
    pagos: PagoRegistrado[];
    cierre: {
      operacion_uid: string;
      id_cliente_titular: number;
      fecha: string;
    };
  };
  
  /** Mensajes informativos del proceso */
  mensajes: string[];
  
  /** Errores encontrados (vacío si exito = true) */
  errores: string[];
  
  /** Saldo final (debe ser 0 para checkout exitoso) */
  saldoFinal: number;
}

/**
 * Configuración del proceso de checkout
 */
export interface ConfiguracionCheckout {
  /** Permitir checkout con saldo pendiente */
  permitirSaldoPendiente?: boolean;
  
  /** Generar recibo automáticamente */
  generarRecibo?: boolean;
  
  /** Enviar recibo por email */
  enviarEmailRecibo?: boolean;
  
  /** Email de destino del recibo */
  emailRecibo?: string;
  
  /** Aplicar depósito automáticamente */
  aplicarDeposito?: boolean;
  
  /** Validar división de cargos */
  validarDivision?: boolean;
}

/**
 * Estado del proceso de checkout
 */
export interface EstadoCheckout {
  /** Paso actual del checkout */
  paso: 'inicio' | 'validacion' | 'pago' | 'cierre' | 'completado' | 'error';
  
  /** Descripción del paso actual */
  descripcion: string;
  
  /** Progreso (0-100) */
  progreso: number;
  
  /** Timestamp del último cambio */
  timestamp: string;
}

/**
 * Validación previa al checkout
 */
export interface ValidacionCheckout {
  /** Indica si puede proceder con el checkout */
  puedeCheckout: boolean;
  
  /** Folio tiene saldo pendiente */
  tieneSaldoPendiente: boolean;
  
  /** Monto del saldo pendiente */
  montoPendiente: number;
  
  /** Todos los cargos están distribuidos */
  cargosDistribuidos: boolean;
  
  /** Todos los responsables tienen asignaciones */
  responsablesAsignados: boolean;
  
  /** Advertencias no bloqueantes */
  advertencias: string[];
  
  /** Errores bloqueantes */
  errores: string[];
}
