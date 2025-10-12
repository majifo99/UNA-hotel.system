/**
 * Tipos para la API de Check-In
 * Definiciones fuertemente tipadas para la integración con el backend
 */

// DTO para el request de check-in
export interface CheckInRequestDTO {
  id_cliente_titular: number;
  fecha_llegada: string; // formato YYYY-MM-DD
  fecha_salida: string;  // formato YYYY-MM-DD
  id_hab: number;
  nombre_asignacion: string;
  observacion_checkin?: string;
}

// Respuesta de la API de check-in
export interface CheckInResponseDTO {
  success: boolean;
  message: string;
  data?: {
    id: number;
    estado: string;
    fecha_llegada: string;
    fecha_salida: string;
    // ... otros campos según el backend
  };
}

// Error response structure
export interface ApiErrorResponse {
  message: string;
  errors: Record<string, string[]>;
}

// Información de cliente para validación
export interface ClienteInfo {
  id: number | null;
  nombre: string | null;
  email: string | null;
  telefono: string | null;
  nacionalidad: string | null;
}

// Datos de estadía para el contexto
export interface EstadiaInfo {
  id: number;
  estado: string;
  fecha_llegada: string;
  fecha_salida: string;
  adultos: number;
  ninos: number;
  bebes: number;
  cliente: ClienteInfo;
}

// Validación previa al check-in
export interface CheckInValidation {
  isValid: boolean;
  errors: string[];
  requiredFields: {
    clienteId: boolean;
    habitacionId: boolean;
    fechas: boolean;
  };
}