export const ROOM_STATUS_COLORS = {
  available: '#10b981', // Verde
  reserved: '#f59e0b', // Amarillo/Naranja
  'checked-in': '#ef4444', // Rojo
  'checked-out': '#6b7280', // Gris
  maintenance: '#f97316', // Naranja
  cleaning: '#3b82f6' // Azul
} as const;

export const STATUS_LABELS = {
  available: 'Disponible',
  reserved: 'Reservada',
  'checked-in': 'Ocupada',
  'checked-out': 'Check-out',
  maintenance: 'Mantenimiento',
  cleaning: 'Limpieza'
} as const;

export const CALENDAR_CONFIG = {
  DEFAULT_DAYS_TO_SHOW: 14,
  MIN_RESERVATION_WIDTH: 5, // Mínimo 5% de ancho para visibilidad
  MIN_RESERVATION_PIXEL_WIDTH: '60px'
} as const;
