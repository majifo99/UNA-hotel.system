export type Prioridad = "baja" | "media" | "alta" | "urgente";
export const PRIORIDADES: Readonly<Prioridad[]> = ["baja", "media", "alta", "urgente"] as const;

// Tipos para las relaciones
export type Usuario = {
  id_usuario: number;
  name: string;
  email: string;
};

export type Habitacion = {
  id: number; // Maps to id_habitacion
  numero: string; // Maps to numero
  piso: string | number; // Maps to piso
  tipo?: {
    id_tipo_hab: number;
    nombre: string;
    descripcion: string;
    created_at?: string | null;
    updated_at?: string | null;
  };
};

export type EstadoHabitacion = {
  id_estado_hab: number; // Maps to id_estado_hab or id
  nombre: string;
  tipo?: string; // From estadoHabitacion
  descripcion?: string; // From estadoHabitacion
};

export type HistorialLimpieza = {
  id_historial: number;
  accion: string;
  fecha: string;
  usuario?: Usuario;
};

// DTO para crear limpieza
export type LimpiezaCreateDTO = {
  nombre: string;
  descripcion?: string | null;
  notas?: string | null;
  prioridad?: Prioridad | null;
  fecha_inicio: string; // ISO date
  fecha_final?: string | null; // ISO date
  id_habitacion?: number | null;
  id_usuario_asigna?: number | null;
  id_estado_hab?: number | null;
};

// DTO para actualizar limpieza
export type LimpiezaUpdateDTO = Partial<Omit<LimpiezaCreateDTO, "fecha_reporte" | "id_usuario_reporta">>;

// Respuesta completa de la API
export type LimpiezaItem = {
  id_limpieza: number;
  nombre: string;
  descripcion?: string | null;
  notas?: string | null;
  prioridad?: Prioridad | null;
  fecha_inicio: string;
  fecha_final?: string | null;
  fecha_reporte: string;
  id_habitacion?: number | null;
  id_usuario_asigna?: number | null;
  id_usuario_reporta?: number | null;
  id_estado_hab?: number | null;
  created_at: string;
  updated_at: string;
  // Relaciones cargadas
  habitacion?: Habitacion;
  asignador?: Usuario;
  reportante?: Usuario;
  estadoHabitacion?: EstadoHabitacion;
  historialLimpiezas?: HistorialLimpieza[];
};

// Respuesta paginada
export type LimpiezaPaginatedResponse = {
  data: LimpiezaItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
};

// Filtros para la consulta
export type LimpiezaFilters = {
  per_page?: number;
  prioridad?: Prioridad;
  pendientes?: boolean;
  id_habitacion?: number;
  estado_id?: number;
  desde?: string; // YYYY-MM-DD
  hasta?: string; // YYYY-MM-DD
};

// DTO para finalizar limpieza
export type FinalizarLimpiezaDTO = {
  fecha_final: string; // ISO date
  notas?: string | null;
};