/**
 * Currency Formatting Utility
 *
 * Centraliza el formateo de moneda para todo el módulo web.
 * Cambia aquí para actualizar el formato en toda la aplicación web.
 */

/**
 * Configuración de moneda
 * 
 * Para cambiar de dólares a colones, modificar:
 * - locale: 'en-US' → 'es-CR'
 * - currency: 'USD' → 'CRC'
 * - minimumFractionDigits: 2 → 0
 */
const CURRENCY_CONFIG = {
  locale: 'en-US',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
} as const;

/**
 * Formatea un número como moneda
 * 
 * @param amount - Monto a formatear
 * @returns String formateado con símbolo de moneda
 * 
 * @example
 * ```ts
 * formatCurrency(1500) // "$1,500.00"
 * formatCurrency(99.99) // "$99.99"
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
 * Obtiene solo el símbolo de la moneda actual
 * 
 * @returns Símbolo de moneda (ej: "$" o "₡")
 * 
 * @example
 * ```ts
 * getCurrencySymbol() // "$"
 * ```
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
 * Obtiene el código de la moneda actual
 * 
 * @returns Código ISO de la moneda (ej: "USD" o "CRC")
 */
export function getCurrencyCode(): string {
  return CURRENCY_CONFIG.currency;
}
