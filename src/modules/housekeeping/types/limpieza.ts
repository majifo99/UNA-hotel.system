// --- Prioridades ---
export type Prioridad = "baja" | "media" | "alta" | "urgente";
export const PRIORIDADES: Readonly<Prioridad[]> = ["baja", "media", "alta", "urgente"] as const;

// --- Estados de habitación usados en limpieza ---
export const ESTADO_HAB = { SUCIA: 3, LIMPIA: 4 } as const;
export type EstadoHab = typeof ESTADO_HAB[keyof typeof ESTADO_HAB]; // 3 | 4

// --- Tipos base ---
export type Usuario = {
  id_usuario?: number;   // compat
  id?: number;           // compat/back simple
  name?: string;         // compat
  nombre?: string;       // back actual
  email?: string;
  telefono?: string;
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
  id?: number;               // back actual usa "id"
  id_estado_hab?: number;    // compat
  nombre: string;
  tipo?: string;
  descripcion?: string;
};

// --- DTOs (back Laravel) ---
export type LimpiezaCreateDTO = {
  notas?: string | null;
  prioridad?: Prioridad | null;

  fecha_inicio: string;
  fecha_final?: string | null;

  id_habitacion?: number | null;
  id_usuario_asigna?: number | null;
  id_usuario_reporta?: number | null;
  id_estado_hab?: EstadoHab | null;
};

export type LimpiezaUpdateDTO = Partial<LimpiezaCreateDTO>;

export type FinalizarLimpiezaDTO = {
  fecha_final: string;
  notas?: string | null;
};

// --- Item devuelto por el API (según tu JSON) ---
export type LimpiezaItem = {
  id_limpieza?: number; // compat
  id: number;

  notas?: string | null;
  prioridad?: Prioridad | null;

  fecha_inicio: string;
  fecha_final?: string | null;
  fecha_reporte?: string;

  id_habitacion?: number | null;
  id_usuario_asigna?: number | null;
  id_usuario_reporta?: number | null;
  id_estado_hab?: EstadoHab | null;

  created_at: string;
  updated_at: string;

  // Relaciones (nombres del back actual)
  habitacion?: Habitacion;
  usuario_asignado?: { id: number; nombre: string; telefono?: string };
  usuario_reporta?: Usuario | null;
  estado?: EstadoHabitacion;

  // Compat (por si algo viejo lo usa)
  asignador?: Usuario;
  reportante?: Usuario;
  estadoHabitacion?: EstadoHabitacion;
};

// --- Paginación ---
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
  page?: number;
  prioridad?: Prioridad;
  pendientes?: boolean;
  id_habitacion?: number;
  estado_id?: EstadoHab;
  desde?: string; // YYYY-MM-DD
  hasta?: string; // YYYY-MM-DD
};
