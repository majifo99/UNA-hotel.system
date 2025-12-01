/**
 * Date Range Validator
 * 
 * Utilidad para validar rangos de fechas con mensajes de error claros
 */

export interface DateValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
  suggestedFix?: string;
}

/**
 * Valida un rango de fechas para reservas
 */
export function validateDateRange(
  checkInDate: string | null,
  checkOutDate: string | null,
  options: {
    minStayNights?: number;
    maxStayNights?: number;
    allowSameDay?: boolean;
  } = {}
): DateValidationResult {
  const { minStayNights = 1, maxStayNights = 365, allowSameDay = false } = options;

  // Validación básica: campos requeridos
  if (!checkInDate || !checkOutDate) {
    return {
      isValid: false,
      error: 'Ambas fechas son requeridas',
      suggestedFix: 'Complete las fechas de check-in y check-out',
    };
  }

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Validación: Check-in en el pasado
  if (checkIn < today) {
    return {
      isValid: false,
      error: 'La fecha de check-in no puede ser en el pasado',
      suggestedFix: `Seleccione una fecha desde hoy (${today.toLocaleDateString('es-CR')}) en adelante`,
    };
  }

  // Validación: Check-out antes o igual que check-in
  if (checkOut <= checkIn) {
    if (checkOut.getTime() === checkIn.getTime() && !allowSameDay) {
      return {
        isValid: false,
        error: 'El check-out debe ser al menos un día después del check-in',
        suggestedFix: 'Seleccione una fecha de salida posterior a la entrada',
      };
    }
    return {
      isValid: false,
      error: 'La fecha de check-out debe ser posterior al check-in',
      suggestedFix: 'Ajuste las fechas para que check-out sea después de check-in',
    };
  }

  // Calcular noches
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  // Validación: Estadía mínima
  if (nights < minStayNights) {
    return {
      isValid: false,
      error: `La estadía mínima es de ${minStayNights} noche${minStayNights > 1 ? 's' : ''}`,
      suggestedFix: `Extienda su estadía a al menos ${minStayNights} noche${minStayNights > 1 ? 's' : ''}`,
    };
  }

  // Validación: Estadía máxima
  if (nights > maxStayNights) {
    return {
      isValid: false,
      error: `La estadía máxima es de ${maxStayNights} noches`,
      suggestedFix: `Reduzca su estadía a máximo ${maxStayNights} noches o contacte al hotel para estadías más largas`,
    };
  }

  // Advertencia: Estadías muy largas
  if (nights > 30) {
    return {
      isValid: true,
      warning: `Estadía larga: ${nights} noches`,
      suggestedFix: 'Considere contactar al hotel para descuentos en estadías prolongadas',
    };
  }

  // Advertencia: Reservas muy anticipadas
  const daysUntilCheckIn = Math.ceil((checkIn.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntilCheckIn > 365) {
    return {
      isValid: true,
      warning: `Reserva muy anticipada: ${daysUntilCheckIn} días de antelación`,
      suggestedFix: 'Las tarifas pueden cambiar. Confirme precios más cerca de la fecha',
    };
  }

  // All validations passed
  return { isValid: true };
}

/**
 * Formatea un rango de fechas de manera legible
 */
export function formatDateRange(checkInDate: string, checkOutDate: string): string {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  
  const formatOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };

  const checkInFormatted = checkIn.toLocaleDateString('es-CR', formatOptions);
  const checkOutFormatted = checkOut.toLocaleDateString('es-CR', formatOptions);

  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  return `${checkInFormatted} → ${checkOutFormatted} (${nights} noche${nights > 1 ? 's' : ''})`;
}

/**
 * Calcula el número de noches entre dos fechas
 */
export function calculateNights(checkInDate: string, checkOutDate: string): number {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Obtiene la fecha mínima permitida para check-in (hoy)
 */
export function getMinCheckInDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Obtiene la fecha mínima para check-out dado un check-in
 */
export function getMinCheckOutDate(checkInDate: string): string {
  const checkIn = new Date(checkInDate);
  const nextDay = new Date(checkIn);
  nextDay.setDate(nextDay.getDate() + 1);
  return nextDay.toISOString().split('T')[0];
}

/**
 * Verifica si una fecha está en el pasado
 */
export function isDateInPast(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

/**
 * Verifica si una fecha está en el futuro
 */
export function isDateInFuture(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
}

/**
 * Verifica si una fecha es hoy
 */
export function isDateToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}
