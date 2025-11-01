export type HistorialMantenimiento = {
  id_historial_mant: number;
  id_mantenimiento: number | null;
  actor_id: number | null;
  evento: string;          // "creación" | "actualización" | "finalización" ...
  fecha: string;           // ISO
  valor_anterior?: string | null; // JSON string o null
  valor_nuevo?: string | null;    // JSON string o null
  actor?: {
    id_usuario: number;
    nombre?: string;
    email?: string;
  } | null;
  mantenimiento?: {
    id_mantenimiento: number;
    // agrega aquí lo que devuelva tu include (opcional)
  } | null;
};

export type HistorialMantPagination = {
  data: HistorialMantenimiento[];
  current_page: number;
  per_page: number;
  total: number;
};
