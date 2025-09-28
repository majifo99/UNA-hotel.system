// --- Prioridades ---
export type Prioridad = "baja" | "media" | "alta" | "urgente";
export const PRIORIDADES: Readonly<Prioridad[]> = ["baja", "media", "alta", "urgente"] as const;

// --- Estados de habitación usados en limpieza ---
export const ESTADO_HAB = {
  SUCIA: 3,
  LIMPIA: 4,
} as const;
export type EstadoHab = typeof ESTADO_HAB[keyof typeof ESTADO_HAB]; // 3 | 4

// --- Tipos para las relaciones ---
export type Usuario = {
  id_usuario: number;
  name: string;
  email: string;
};

export type Habitacion = {
  id: number;
  numero: string;
  piso: string | number;
  descripcion?: string | null;
  tipo?: {
    id_tipo_hab: number;
    nombre: string;
    descripcion: string;
    created_at?: string | null;
    updated_at?: string | null;
  };
};

export type EstadoHabitacion = {
  id_estado_hab: number;
  nombre: string;
  tipo?: string;
  descripcion?: string;
};

export type HistorialLimpieza = {
  id_historial: number;
  accion: string;
  fecha: string;
  usuario?: Usuario;
};

// --- DTOs ---
export type LimpiezaCreateDTO = {
  nombre: string;
  descripcion?: string | null;
  notas?: string | null;
  prioridad?: Prioridad | null;
  fecha_inicio: string;
  fecha_final?: string | null;
  id_habitacion?: number | null;
  id_usuario_asigna?: number | null;
  id_estado_hab?: EstadoHab | null; // 3 | 4
};

export type LimpiezaUpdateDTO = Partial<
  Omit<LimpiezaCreateDTO, "fecha_reporte" | "id_usuario_reporta">
>;

export type LimpiezaEstadoUpdateDTO = {
  id_estado_hab: EstadoHab; // 3 | 4
};

export type FinalizarLimpiezaDTO = {
  fecha_final: string; // ISO
  notas?: string | null;
};

// --- Respuesta completa ---
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
  id_estado_hab?: EstadoHab | null; // 3 | 4
  created_at: string;
  updated_at: string;
  habitacion?: Habitacion;
  asignador?: Usuario;
  reportante?: Usuario;
  estadoHabitacion?: EstadoHabitacion;
  historialLimpiezas?: HistorialLimpieza[];
};

// --- Paginación y filtros ---
export type LimpiezaPaginatedResponse = {
  data: LimpiezaItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
};

export type LimpiezaFilters = {
  per_page?: number;
  prioridad?: Prioridad;
  pendientes?: boolean;
  id_habitacion?: number;
  estado_id?: EstadoHab; // 3 | 4
  desde?: string; // YYYY-MM-DD
  hasta?: string; // YYYY-MM-DD
};
