/**
 * Tipos TypeScript para el módulo de Gestión de Folios
 * 
 * Define todas las interfaces y tipos necesarios para trabajar con folios,
 * cargos, pagos y distribuciones en el sistema PMS hotelero.
 */

// ============================================================================
// TIPOS DE CARGO
// ============================================================================

/**
 * Tipo de cargo: general (sin cliente) o individual (asociado a un cliente)
 */
export type TipoCargo = 'general' | 'individual';

/**
 * Payload para crear un nuevo cargo en el folio
 */
export interface CargoPayload {
  monto: number;
  descripcion: string;
  cliente_id: number | null; // null = cargo general, número = cargo individual
}

/**
 * Respuesta del backend al crear un cargo
 */
export interface CargoResponse {
  id_folio_linea: number;
  id_folio: number;
  id_cliente: number | null;
  descripcion: string;
  monto: number;
  tipo: TipoCargo;
  created_at: string;
}

/**
 * Línea de cargo en el folio (detallada)
 */
export interface FolioLinea {
  id_folio_linea: number;
  id_folio: number;
  id_cliente: number | null;
  descripcion: string;
  monto: number;
  tipo: TipoCargo;
  created_at: string;
  updated_at: string;
  // Información adicional del cliente si está disponible
  cliente?: {
    id_cliente: number;
    nombre: string;
    documento: string;
  };
}

// ============================================================================
// TIPOS DE CLIENTE/HUÉSPED
// ============================================================================

/**
 * Cliente/Huésped asociado al folio
 */
export interface ClienteFolio {
  id_cliente: number;
  nombre: string;
  documento?: string;
  email?: string;
  telefono?: string;
  es_titular?: boolean;
}

// ============================================================================
// TIPOS DE PAGO
// ============================================================================

/**
 * Método de pago disponible
 */
export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia' | 'cheque' | 'otro';

/**
 * Resultado de un pago
 */
export type ResultadoPago = 'aprobado' | 'rechazado' | 'pendiente';

/**
 * Payload para registrar un pago
 */
export interface PagoPayload {
  operacion_uid: string;
  id_cliente?: number; // Opcional: null/undefined = pago general
  monto: number;
  metodo: MetodoPago;
  resultado: ResultadoPago;
  nota?: string;
}

/**
 * Registro de pago en el folio
 */
export interface Pago {
  id_pago: number;
  id_folio: number;
  id_cliente?: number;
  operacion_uid: string;
  monto: number;
  metodo: MetodoPago;
  resultado: ResultadoPago;
  nota?: string;
  created_at: string;
  // Información del cliente si está disponible
  cliente?: {
    id_cliente: number;
    nombre: string;
  };
}

// ============================================================================
// TIPOS DE DISTRIBUCIÓN
// ============================================================================

/**
 * Estrategias de distribución de cargos
 */
export type DistributionStrategy = 'single' | 'equal' | 'percent' | 'fixed';

/**
 * Responsable en una distribución
 */
export interface ResponsableDistribucion {
  id_cliente: number;
  percent?: number;  // Para estrategia 'percent' (0-100)
  amount?: number;   // Para estrategia 'fixed'
}

/**
 * Request para distribuir cargos
 */
export interface DistribucionRequest {
  operacion_uid: string;
  strategy: DistributionStrategy;
  responsables: ResponsableDistribucion[];
}

// ============================================================================
// TIPOS DE RESUMEN DE FOLIO
// ============================================================================

/**
 * Resumen de un folio con todos sus datos
 */
export interface FolioResumen {
  folio: number;
  resumen: {
    id_folio: number;
    a_distribuir: string | number;
    distribuido: string | number;
    cargos_sin_persona: string | number;
    pagos_generales: string | number;
  };
  personas: Array<{
    id_cliente: number;
    nombre?: string;
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

// ============================================================================
// TIPOS DE HISTORIAL
// ============================================================================

/**
 * Tipo de evento en el historial
 */
export type TipoEvento = 'pago' | 'distribucion' | 'cierre' | 'cargo';

/**
 * Item del historial de operaciones
 */
export interface HistorialItem {
  id: number;
  tipo: TipoEvento;
  operacion_uid: string;
  fecha: string;
  monto?: number;
  metodo?: string;
  id_cliente?: number;
  nombre_cliente?: string;
  descripcion?: string;
  detalles?: Record<string, unknown>;
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
// RESPUESTAS GENÉRICAS DEL API
// ============================================================================

/**
 * Respuesta genérica del API de folios
 */
export interface FolioApiResponse<T = unknown> {
  status: 'ok' | 'error';
  message: string;
  data?: T;
  // Compatibilidad con formatos antiguos
  success?: boolean;
  folio?: number;
  estadia?: unknown;
  acompanantes?: unknown[];
  asignacion?: unknown;
}

/**
 * Error del API
 */
export interface FolioApiError {
  status: 'error';
  message: string;
  errors?: Record<string, string[]>;
  code?: string;
}

// ============================================================================
// OPCIONES Y SELECTORES
// ============================================================================

/**
 * Opción para un selector (cliente, método de pago, etc.)
 */
export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

/**
 * Estado de un tab en la interfaz
 */
export type TabState = 'resumen' | 'cargos' | 'pagos' | 'distribucion' | 'historial';

// ============================================================================
// ESTADOS DE FOLIO
// ============================================================================

/**
 * Estado de un folio
 */
export type EstadoFolio = 'abierto' | 'cerrado' | 'cancelado';

/**
 * Información completa del folio
 */
export interface Folio {
  id_folio: number;
  id_estadia: number;
  estado: EstadoFolio;
  fecha_apertura: string;
  fecha_cierre?: string;
  created_at: string;
  updated_at: string;
}
