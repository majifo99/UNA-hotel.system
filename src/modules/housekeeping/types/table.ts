// src/modules/housekeeping/types/table.ts

// Claves visibles en la tabla (UI)
export type ColumnKey =
  | "numero"
  | "tipo"
  | "piso"
  | "estado"
  | "prioridad"
  | "asignador"
  | "fecha_inicio"
  | "fecha_final";

// Claves que entiende el hook de ordenamiento (UI)
export type SortKey =
  | "id_limpieza"
  | "nombre"
  | "prioridad"
  | "habitacion"
  | "estado"
  | "fecha_inicio"
  | "fecha_final"
  | "tipo"
  | "piso";
