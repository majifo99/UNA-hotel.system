// src/types/mantenimiento.ts

// --- Prioridades ---
export type Prioridad = "baja" | "media" | "alta" | "urgente";
export const PRIORIDADES: Readonly<Prioridad[]> = ["baja", "media", "alta", "urgente"] as const;

// --- Estados de mantenimiento (texto que muestra la UI) ---
export type MaintenanceStatus = "Pendiente" | "En Proceso" | "Completado";

// Filtro de estado que incluye "Todos" para la UI
export type StatusFilter = MaintenanceStatus | "Todos";

// --- (Si usas IDs en backend para estado de mantenimiento) ---
export const ESTADO_MANT = {
  MANTENIMIENTO: 1,
} as const;
export type EstadoMant = typeof ESTADO_MANT[keyof typeof ESTADO_MANT]; // 1

// --- Tipo de mantenimiento ---
export type TipoMantenimiento = "correctivo" | "preventivo";
export const TIPOS_MANT: Readonly<TipoMantenimiento[]> = ["correctivo", "preventivo"] as const;

// --- Tipos compartidos/relaciones ---
export type Usuario = {
  id: number;
  nombre: string;
  telefono?: string;
};

export type Habitacion = {
  id: number;
  numero: string;
  piso: string | number;
  tipo?: {
    id_tipo_hab: number;
    nombre: string;
    descripcion?: string;
    created_at?: string | null;
    updated_at?: string | null;
  };
};

// 👉 Aquí tipamos el nombre del estado con el union correcto
export type EstadoHabitacion = {
  id: number;
  nombre: MaintenanceStatus;
  tipo?: string;
  descripcion?: string;
};

// --- DTOs (para crear y actualizar) ---
export type MantenimientoCreateDTO = {
  notas?: string | null;
  prioridad?: Prioridad | null;
  fecha_inicio?: string | null;
  fecha_final?: string | null;
  id_habitacion?: number | null;
  id_usuario_asigna?: number | null;
  id_estado_mant?: EstadoMant | null;
};

export type MantenimientoUpdateDTO = Partial<MantenimientoCreateDTO>;

export type FinalizarMantenimientoDTO = {
  fecha_final: string; // ISO
  notas?: string | null;
};

// --- Estructura de un mantenimiento ---
export type MantenimientoItem = {
  id: number;
  notas?: string | null;
  prioridad?: Prioridad | null;
  fecha_inicio?: string | null;
  fecha_final?: string | null;
  fecha_reporte?: string | null;
  created_at?: string | null;
  updated_at?: string | null;

  habitacion?: Habitacion;

  usuario_asignado?: Usuario;
  usuario_reporta?: Usuario;

  estado?: EstadoHabitacion;
};

// --- Paginación y filtros ---
export type MantenimientoPaginatedResponse = {
  data: MantenimientoItem[];
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number;
  to?: number;
};

export type MantenimientoFilters = {
  per_page?: number;
  prioridad?: Prioridad;
  pendientes?: boolean;
  id_habitacion?: number;
  estado_id?: number;
  tipo?: TipoMantenimiento;
  desde?: string;
  hasta?: string;
};
