/**
 * Currency formatting utilities for reservations module
 */

/**
 * Formateador de moneda en dólares estadounidenses
 */
export const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formatea un valor numérico como moneda en dólares
 * @param amount - Monto a formatear
 * @returns String formateado (ej: "$450.00")
 */
export const formatCurrency = (amount: number): string => {
  return currencyFormatter.format(amount);
};

/**
 * Formatea un valor numérico como moneda en dólares sin decimales
 * @param amount - Monto a formatear
 * @returns String formateado (ej: "$450")
 */
export const formatCurrencyCompact = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
