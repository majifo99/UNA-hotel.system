/**
 * Configuración del Sistema de Folios
 * ===================================
 * 
 * Centraliza todas las configuraciones relacionadas con la gestión de folios.
 * Facilita el mantenimiento y personalización del sistema.
 */

// Métodos de pago disponibles
export const METODOS_PAGO = [
  'Efectivo',
  'Tarjeta',
  'Transferencia',
  'Cheque',
  'Voucher',
  'Cortesía'
] as const;

// Estrategias de distribución
export const ESTRATEGIAS_DISTRIBUCION = {
  single: {
    id: 'single' as const,
    label: 'Todo a una persona',
    description: 'Asigna todo el monto pendiente a un solo cliente.',
    icon: 'User',
    requiresSelection: true,
    maxClientes: 1,
    allowsCustomValues: false
  },
  equal: {
    id: 'equal' as const,
    label: 'Partes iguales',
    description: 'Divide el monto pendiente en partes iguales entre los clientes seleccionados.',
    icon: 'Users',
    requiresSelection: true,
    maxClientes: null,
    allowsCustomValues: false
  },
  percent: {
    id: 'percent' as const,
    label: 'Por porcentajes',
    description: 'Distribuye el monto según los porcentajes definidos (deben sumar 100%).',
    icon: 'Percent',
    requiresSelection: true,
    maxClientes: null,
    allowsCustomValues: true,
    validationRule: 'sum100'
  },
  fixed: {
    id: 'fixed' as const,
    label: 'Montos fijos',
    description: 'Asigna montos específicos a cada cliente (deben sumar el monto pendiente).',
    icon: 'DollarSign',
    requiresSelection: true,
    maxClientes: null,
    allowsCustomValues: true,
    validationRule: 'sumTotal'
  }
} as const;

// Tipos de evento para el historial
export const TIPOS_EVENTO = {
  pago: {
    id: 'pago' as const,
    label: 'Pago',
    icon: 'DollarSign',
    color: 'green'
  },
  distribucion: {
    id: 'distribucion' as const,
    label: 'Distribución',
    icon: 'Divide',
    color: 'blue'
  },
  cierre: {
    id: 'cierre' as const,
    label: 'Cierre',
    icon: 'FileX',
    color: 'red'
  }
} as const;

// Configuración de validaciones
export const VALIDACIONES = {
  // Tolerancia para validación de porcentajes (±0.01%)
  TOLERANCIA_PORCENTAJES: 0.01,
  
  // Tolerancia para validación de montos (±0.01)
  TOLERANCIA_MONTOS: 0.01,
  
  // Monto mínimo para pagos
  MONTO_MINIMO_PAGO: 0.01,
  
  // Porcentaje mínimo para distribución
  PORCENTAJE_MINIMO: 0.01,
  
  // Máximo número de decimales para montos
  DECIMALES_MONTO: 2,
  
  // Máximo número de decimales para porcentajes
  DECIMALES_PORCENTAJE: 2
} as const;

// Configuración de la interfaz
export const UI_CONFIG = {
  // Pestañas del FolioManager
  TABS: {
    distribucion: {
      id: 'distribucion' as const,
      label: 'Distribuir Servicios',
      icon: 'Coffee',
      description: 'Asignar cargos por servicios a clientes'
    },
    pagos: {
      id: 'pagos' as const,
      label: 'Registrar Pagos',
      icon: 'CreditCard',
      description: 'Procesar pagos'
    },
    cierre: {
      id: 'cierre' as const,
      label: 'Cerrar Folio',
      icon: 'FileX',
      description: 'Reclasificar al titular'
    },
    historial: {
      id: 'historial' as const,
      label: 'Historial',
      icon: 'Clock',
      description: 'Ver línea de tiempo'
    },
    resumen: {
      id: 'resumen' as const,
      label: 'Resumen',
      icon: 'FileText',
      description: 'Ver estado actual'
    }
  },
  
  // Configuración de paginación para historial
  HISTORIAL_PAGE_SIZE: 20,
  
  // Tiempo de auto-refresh para datos (en milisegundos)
  AUTO_REFRESH_INTERVAL: 30000, // 30 segundos
  
  // Tiempo de visualización de mensajes de éxito/error
  MESSAGE_DISPLAY_TIME: 5000, // 5 segundos
  
  // Colores para diferentes estados
  COLORS: {
    pending: 'amber',
    success: 'green',
    error: 'red',
    info: 'blue',
    warning: 'yellow'
  }
} as const;

// Configuración de API
export const API_CONFIG = {
  // Tiempo máximo de espera para peticiones (en milisegundos)
  TIMEOUT: 30000, // 30 segundos
  
  // Número máximo de reintentos para peticiones fallidas
  MAX_RETRIES: 3,
  
  // Intervalo entre reintentos (en milisegundos)
  RETRY_DELAY: 1000, // 1 segundo
  
  // Endpoints base
  ENDPOINTS: {
    RESUMEN: (folioId: number) => `/api/folios/${folioId}/resumen`,
    DISTRIBUIR: (folioId: number) => `/api/folios/${folioId}/distribuir`,
    PAGOS: (folioId: number) => `/api/folios/${folioId}/pagos`,
    CERRAR: (folioId: number) => `/api/folios/${folioId}/cerrar`,
    HISTORIAL: (folioId: number) => `/api/folios/${folioId}/historial`
  }
} as const;

// Configuración de cache
export const CACHE_CONFIG = {
  // Tiempo de vida del cache para datos de folio (en milisegundos)
  FOLIO_CACHE_TTL: 5 * 60 * 1000, // 5 minutos
  
  // Tiempo de vida del cache para historial (en milisegundos)
  HISTORIAL_CACHE_TTL: 2 * 60 * 1000, // 2 minutos
  
  // Claves de cache
  CACHE_KEYS: {
    FOLIO_RESUMEN: (folioId: number) => `folio-resumen-${folioId}`,
    FOLIO_HISTORIAL: (folioId: number, filters?: string) => 
      `folio-historial-${folioId}${filters ? `-${filters}` : ''}`,
  }
} as const;

// Mensajes del sistema
export const MESSAGES = {
  SUCCESS: {
    DISTRIBUCION_COMPLETA: 'Distribución completada exitosamente',
    PAGO_REGISTRADO: (monto: number, cliente?: number) => 
      `Pago de $${monto.toFixed(2)} registrado exitosamente${cliente ? ` para cliente #${cliente}` : ''}`,
    FOLIO_CERRADO: 'Folio cerrado exitosamente. Todos los cargos y saldos pendientes han sido reclasificados al titular.',
    DATOS_ACTUALIZADOS: 'Datos actualizados correctamente'
  },
  
  ERROR: {
    FOLIO_NO_ENCONTRADO: 'El folio especificado no fue encontrado',
    SIN_CARGOS_PENDIENTES: 'No hay cargos pendientes para distribuir',
    PORCENTAJES_INVALIDOS: (total: number) => `Los porcentajes suman ${total.toFixed(2)}%. Deben sumar exactamente 100%.`,
    MONTOS_INVALIDOS: (total: number, esperado: number) => 
      `Los montos suman $${total.toFixed(2)}. Deben sumar exactamente $${esperado.toFixed(2)}.`,
    MONTO_EXCESIVO: (monto: number, maximo: number) => 
      `El monto $${monto.toFixed(2)} excede el máximo permitido $${maximo.toFixed(2)}`,
    CLIENTE_REQUERIDO: 'Debe seleccionar al menos un cliente',
    MONTO_MINIMO: 'El monto debe ser mayor a 0',
    CONEXION_ERROR: 'Error de conexión con el servidor',
    OPERACION_FALLIDA: 'La operación no pudo completarse'
  },
  
  WARNING: {
    DATOS_DESACTUALIZADOS: 'Los datos podrían estar desactualizados. Considera actualizar.',
    OPERACION_IRREVERSIBLE: 'Esta operación no se puede deshacer',
    REVISION_RECOMENDADA: 'Se recomienda revisar los datos antes de continuar'
  },
  
  INFO: {
    CARGANDO: 'Cargando información del folio...',
    PROCESANDO: 'Procesando operación...',
    SIN_DATOS: 'No hay datos disponibles',
    SELECCIONAR_CLIENTE: 'Selecciona al menos un cliente para continuar'
  }
} as const;

// Utilidades de configuración
export const CONFIG_UTILS = {
  // Obtener configuración de estrategia por ID
  getEstrategia: (id: keyof typeof ESTRATEGIAS_DISTRIBUCION) => ESTRATEGIAS_DISTRIBUCION[id],
  
  // Obtener configuración de pestaña por ID
  getTab: (id: keyof typeof UI_CONFIG.TABS) => UI_CONFIG.TABS[id],
  
  // Obtener configuración de tipo de evento por ID
  getTipoEvento: (id: keyof typeof TIPOS_EVENTO) => TIPOS_EVENTO[id],
  
  // Validar si un monto es válido
  isValidMonto: (monto: number) => monto >= VALIDACIONES.MONTO_MINIMO_PAGO,
  
  // Validar si un porcentaje es válido
  isValidPorcentaje: (porcentaje: number) => 
    porcentaje >= VALIDACIONES.PORCENTAJE_MINIMO && porcentaje <= 100,
  
  // Formatear monto con decimales configurados
  formatMonto: (monto: number) => monto.toFixed(VALIDACIONES.DECIMALES_MONTO),
  
  // Formatear porcentaje con decimales configurados
  formatPorcentaje: (porcentaje: number) => porcentaje.toFixed(VALIDACIONES.DECIMALES_PORCENTAJE),
  
  // Generar ID único para operaciones
  generateOperationUID: (prefix: string) => 
    `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 12)}`
} as const;

export default {
  METODOS_PAGO,
  ESTRATEGIAS_DISTRIBUCION,
  TIPOS_EVENTO,
  VALIDACIONES,
  UI_CONFIG,
  API_CONFIG,
  CACHE_CONFIG,
  MESSAGES,
  CONFIG_UTILS
};