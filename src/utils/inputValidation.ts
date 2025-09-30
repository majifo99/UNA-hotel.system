// Límites de caracteres para inputs del sistema
export const INPUT_LIMITS = {
  // Información personal
  FIRST_NAME: 15,
  LAST_NAME: 15,
  FULL_NAME: 30,
  EMAIL: 40, // Límite más prudente
  PHONE: 20,
  IDENTIFICATION: 25,
  
  // Información de habitación
  ROOM_NUMBER: 10,
  OBSERVATIONS: 500,
  
  // Reservas
  RESERVATION_ID: 20,
  
  // Búsquedas
  SEARCH_TERM: 100,
  
  // Direcciones
  ADDRESS: 200,
  CITY: 50,
  STATE: 50,
  POSTAL_CODE: 10,
  COUNTRY: 50,
  
  // Información adicional
  COMPANY: 100,
  TITLE: 50,
  NOTES: 1000,
  
  // Financiero
  AMOUNT_DECIMALS: 2,
  CURRENCY_CODE: 3,
  
  // Números
  GUESTS_MAX: 20,
  CHILDREN_MAX: 15,
  BABIES_MAX: 10,
  
  // Documentos
  PASSPORT: 15,
  DRIVER_LICENSE: 20,
  
  // Contacto de emergencia
  EMERGENCY_CONTACT_NAME: 100,
  EMERGENCY_CONTACT_PHONE: 20,
  
  // Preferencias
  SPECIAL_REQUESTS: 300,
  DIETARY_RESTRICTIONS: 200
} as const;

// Patrones de validación
export const INPUT_PATTERNS = {
  // Solo letras y espacios
  LETTERS_ONLY: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/,
  
  // Solo números
  NUMBERS_ONLY: /^[0-9]+$/,
  
  // Alfanumérico
  ALPHANUMERIC: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]+$/,
  
  // Email básico
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  
  // Teléfono (números, espacios, guiones, paréntesis, +)
  PHONE: /^[\d\s()+-]+$/,
  
  // Código postal (alfanumérico)
  POSTAL_CODE: /^[a-zA-Z0-9\s-]+$/,
  
  // Número de habitación (números y letras)
  ROOM_NUMBER: /^[a-zA-Z0-9-]+$/,
  
  // ID de documento (alfanumérico con guiones)
  DOCUMENT_ID: /^[a-zA-Z0-9-]+$/,
  
  // Moneda (números con hasta 2 decimales)
  CURRENCY: /^\d+(\.\d{1,2})?$/,
  
  // Solo texto (letras, números, espacios y puntuación básica)
  TEXT_WITH_PUNCTUATION: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:!?()-]+$/
} as const;

// Mensajes de error
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Este campo es obligatorio',
  MAX_LENGTH: (limit: number) => `Máximo ${limit} caracteres`,
  MIN_LENGTH: (limit: number) => `Mínimo ${limit} caracteres`,
  INVALID_EMAIL: 'Formato de email inválido',
  INVALID_PHONE: 'Formato de teléfono inválido',
  LETTERS_ONLY: 'Solo se permiten letras',
  NUMBERS_ONLY: 'Solo se permiten números',
  ALPHANUMERIC_ONLY: 'Solo se permiten letras y números',
  INVALID_ROOM: 'Formato de habitación inválido',
  INVALID_CURRENCY: 'Formato de moneda inválido (ej: 123.45)',
  MAX_GUESTS: (limit: number) => `Máximo ${limit} huéspedes`,
  MIN_GUESTS: 'Mínimo 1 huésped',
  FUTURE_DATE: 'La fecha debe ser futura',
  INVALID_DATE_RANGE: 'La fecha de salida debe ser posterior a la de llegada'
} as const;