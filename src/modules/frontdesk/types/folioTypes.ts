/**
 * 🏨 Tipos de Folio y División de Cargos
 * ======================================
 * Tipos compartidos para el sistema de facturación hotelera.
 * Define la estructura de cargos, facturas, responsables y estrategias de división.
 */

/**
 * Tipos de cargos hoteleros
 */
export type TipoCargo = 
  | 'hospedaje'      // Estadía en habitación
  | 'restaurante'    // Consumo en restaurante/bar
  | 'spa'            // Servicios de spa/masajes
  | 'lavanderia'     // Servicio de lavandería
  | 'tour'           // Tours y actividades
  | 'telefono'       // Llamadas telefónicas
  | 'minibar'        // Consumo de minibar
  | 'otros';         // Otros servicios

/**
 * Tipo de responsable del pago
 */
export type TipoResponsable = 
  | 'huesped'        // Huésped principal
  | 'acompanante'    // Acompañante en la habitación
  | 'empresa'        // Empresa patrocinadora
  | 'agencia'        // Agencia de viajes
  | 'otro';          // Otro tipo de responsable

/**
 * Estrategias de división de cargos
 */
export type EstrategiaDistribucion = 
  | 'single'   // Todo a una persona
  | 'equal'    // Partes iguales
  | 'percent'  // Por porcentajes
  | 'fixed';   // Montos fijos

/**
 * Estado del depósito
 */
export type EstadoDeposito = 
  | 'pendiente'   // No pagado
  | 'parcial'     // Pago parcial
  | 'completo'    // Pagado completamente
  | 'reembolsado' // Reembolsado
  | 'no_aplica';  // No requiere depósito

/**
 * Cargo individual en el folio
 */
export interface Cargo {
  id: string;
  id_folio: number;
  tipo: TipoCargo;
  descripcion: string;
  monto: number;
  cantidad: number;
  subtotal: number;
  fecha: Date;
  responsable?: string;           // id_cliente o identificador de empresa
  tipo_responsable?: TipoResponsable;
  distribuido: boolean;           // Si ya fue distribuido
  id_persona_asignada?: number;   // A quién se asignó
}

/**
 * Responsable de pago con su distribución
 */
export interface ResponsablePago {
  id_cliente: number;
  nombre: string;
  tipo: TipoResponsable;
  email?: string;
  nit?: string;                   // Para facturación
  razon_social?: string;          // Para empresas
  porcentaje?: number;            // Si aplica división porcentual
  monto_asignado?: number;        // Monto específico asignado
  cargos_asignados: Cargo[];      // Cargos asignados a este responsable
}

/**
 * Configuración de división de cargos
 */
export interface ConfiguracionDivision {
  estrategia: EstrategiaDistribucion;
  responsables: ResponsablePago[];
  aplicar_a_tipos?: TipoCargo[];  // Tipos de cargo a los que aplica
  notas?: string;
}

/**
 * Depósito de reserva
 */
export interface Deposito {
  id: string;
  id_folio: number;
  id_reserva: number;
  monto_requerido: number;        // Primera noche o % del total
  monto_pagado: number;
  estado: EstadoDeposito;
  fecha_pago?: Date;
  metodo_pago?: string;
  referencia?: string;
  notas?: string;
}

/**
 * Factura generada
 */
export interface Factura {
  id: string;
  numero_factura: string;
  id_folio: number;
  responsable: string;            // id_cliente o empresa
  tipo_responsable: TipoResponsable;
  nombre_responsable: string;
  nit?: string;
  razon_social?: string;
  direccion?: string;
  cargos: Cargo[];
  subtotal: number;
  impuestos: number;
  total: number;
  fecha_emision: Date;
  metodo_pago?: string;
  estado: 'borrador' | 'emitida' | 'pagada' | 'anulada';
  xml?: string;                   // XML de factura electrónica
  pdf_url?: string;
}

/**
 * Resumen de división de cargos
 */
export interface ResumenDivision {
  total_cargos: number;
  cargos_distribuidos: number;
  cargos_pendientes: number;
  monto_total: number;
  monto_distribuido: number;
  monto_pendiente: number;
  responsables_count: number;
}

/**
 * Resumen de folio completo
 */
export interface ResumenFolio {
  folio: number;
  id_reserva: number;
  fecha_checkin?: Date;
  fecha_checkout?: Date;
  estado: 'activo' | 'cerrado' | 'cancelado';
  
  // Totales
  total_hospedaje: number;
  total_servicios: number;
  total_cargos: number;
  total_pagos: number;
  saldo_pendiente: number;
  
  // Distribución
  cargos_sin_asignar: number;
  cargos_distribuidos: number;
  
  // Depósito
  deposito?: Deposito;
  
  // Personas/Responsables
  responsables: ResponsablePago[];
  
  // Facturación
  facturas: Factura[];
}

/**
 * Request para distribuir cargos
 */
export interface DistribucionRequest {
  id_folio: number;
  estrategia: EstrategiaDistribucion;
  configuracion: ConfiguracionDivision;
  aplicar_inmediatamente?: boolean; // Si false, solo guarda configuración
}

/**
 * Response de distribución
 */
export interface DistribucionResponse {
  success: boolean;
  mensaje: string;
  resumen: ResumenDivision;
  cargos_actualizados: Cargo[];
  responsables: ResponsablePago[];
}

/**
 * Request para generar factura
 */
export interface FacturacionRequest {
  id_folio: number;
  id_responsable: string;
  tipo_responsable: TipoResponsable;
  datos_fiscales: {
    nit?: string;
    nombre: string;
    razon_social?: string;
    direccion?: string;
    email?: string;
  };
  metodo_pago?: string;
  generar_xml?: boolean;
}

/**
 * Response de facturación
 */
export interface FacturacionResponse {
  success: boolean;
  mensaje: string;
  factura: Factura;
  pdf_url?: string;
  xml_url?: string;
}
