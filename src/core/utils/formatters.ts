/**
 * Formatting Utilities - Funciones centralizadas de formateo
 * 
 * Single source of truth para formatos de:
 * - Moneda (currency)
 * - Fechas (dates)
 * - Porcentajes (percentages)
 * - Números (numbers)
 */

/**
 * Currency Configuration
 */
const CURRENCY_CONFIG = {
  locale: 'en-US',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
} as const;

/**
 * Date Configuration
 */
const DATE_CONFIG = {
  locale: 'es-CR',
  timezone: 'America/Costa_Rica',
} as const;

/**
 * Currency Formatters
 */

/**
 * Formato completo de moneda con símbolo y decimales
 * 
 * @param amount - Monto a formatear
 * @returns String formateado (ej: "$1,500.00")
 * 
 * @example
 * ```ts
 * formatCurrency(1500.50)  // "$1,500.50"
 * formatCurrency(99)       // "$99.00"
 * ```
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
    style: 'currency',
    currency: CURRENCY_CONFIG.currency,
    minimumFractionDigits: CURRENCY_CONFIG.minimumFractionDigits,
    maximumFractionDigits: CURRENCY_CONFIG.maximumFractionDigits,
  }).format(amount);
}

/**
 * Formato compacto de moneda sin decimales
 * 
 * @param amount - Monto a formatear
 * @returns String formateado (ej: "$1,500")
 * 
 * @example
 * ```ts
 * formatCurrencyCompact(1500.99)  // "$1,501"
 * formatCurrencyCompact(99.10)    // "$99"
 * ```
 */
export function formatCurrencyCompact(amount: number): string {
  return new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
    style: 'currency',
    currency: CURRENCY_CONFIG.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Obtiene el símbolo de moneda actual
 * 
 * @returns Símbolo de moneda (ej: "$")
 */
export function getCurrencySymbol(): string {
  return new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
    style: 'currency',
    currency: CURRENCY_CONFIG.currency,
  })
    .formatToParts(0)
    .find((part) => part.type === 'currency')?.value || '$';
}

/**
 * Obtiene el código de moneda actual
 * 
 * @returns Código ISO (ej: "USD")
 */
export function getCurrencyCode(): string {
  return CURRENCY_CONFIG.currency;
}

/**
 * Date Formatters
 */

/**
 * Formatea fecha en formato corto (DD/MM/YYYY)
 * 
 * @param date - Fecha a formatear (Date, string ISO, timestamp)
 * @param locale - Locale opcional (default: es-CR)
 * @returns String formateado
 * 
 * @example
 * ```ts
 * formatDate(new Date('2024-01-15'))     // "15/01/2024"
 * formatDate('2024-01-15')               // "15/01/2024"
 * formatDate(1705305600000)              // "15/01/2024"
 * ```
 */
export function formatDate(
  date: Date | string | number,
  locale: string = DATE_CONFIG.locale
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Fecha inválida';
  }
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(dateObj);
}

/**
 * Formatea fecha en formato largo (15 de enero de 2024)
 * 
 * @param date - Fecha a formatear
 * @param locale - Locale opcional
 * @returns String formateado
 * 
 * @example
 * ```ts
 * formatDateLong(new Date('2024-01-15'))  // "15 de enero de 2024"
 * ```
 */
export function formatDateLong(
  date: Date | string | number,
  locale: string = DATE_CONFIG.locale
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Fecha inválida';
  }
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}

/**
 * Formatea fecha y hora (15/01/2024, 14:30)
 * 
 * @param date - Fecha a formatear
 * @param locale - Locale opcional
 * @returns String formateado
 * 
 * @example
 * ```ts
 * formatDateTime(new Date('2024-01-15T14:30:00'))  // "15/01/2024, 14:30"
 * ```
 */
export function formatDateTime(
  date: Date | string | number,
  locale: string = DATE_CONFIG.locale
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Fecha inválida';
  }
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

/**
 * Formatea solo la hora (14:30)
 * 
 * @param date - Fecha a formatear
 * @param locale - Locale opcional
 * @returns String formateado
 */
export function formatTime(
  date: Date | string | number,
  locale: string = DATE_CONFIG.locale
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Hora inválida';
  }
  
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

/**
 * Number Formatters
 */

/**
 * Formatea porcentaje
 * 
 * @param value - Valor decimal (0.75 = 75%)
 * @param decimals - Número de decimales (default: 1)
 * @returns String formateado
 * 
 * @example
 * ```ts
 * formatPercent(0.755)       // "75.5%"
 * formatPercent(0.755, 0)    // "76%"
 * formatPercent(0.755, 2)    // "75.50%"
 * ```
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formatea número con separadores de miles
 * 
 * @param value - Número a formatear
 * @param decimals - Número de decimales (default: 0)
 * @returns String formateado
 * 
 * @example
 * ```ts
 * formatNumber(1500)        // "1,500"
 * formatNumber(1500.5, 2)   // "1,500.50"
 * ```
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formatea número compacto (1.5K, 2.3M)
 * 
 * @param value - Número a formatear
 * @returns String formateado
 * 
 * @example
 * ```ts
 * formatNumberCompact(1500)      // "1.5K"
 * formatNumberCompact(2500000)   // "2.5M"
 * ```
 */
export function formatNumberCompact(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Utility Helpers
 */

/**
 * Calcula diferencia entre dos fechas en días
 * 
 * @param startDate - Fecha inicio
 * @param endDate - Fecha fin
 * @returns Número de días
 */
export function dateDiffInDays(
  startDate: Date | string,
  endDate: Date | string
): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Verifica si una fecha es hoy
 * 
 * @param date - Fecha a verificar
 * @returns true si es hoy
 */
export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}
