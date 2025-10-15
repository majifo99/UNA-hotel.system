export type HistorialLimpieza = {
  id_historial_limp: number;
  id_limpieza: number | null;
  actor_id: number | null;
  evento: string;          // p.ej. "asignacion", "estado_cambiado", "finalizada"
  fecha: string;           // ISO
  valor_anterior?: string | null;
  valor_nuevo?: string | null;
  actor?: {                 // si el backend lo incluye con with('actor')
    id_usuario: number;
    nombre?: string;
    email?: string;
  } | null;
};
export type HistorialPagination = {
  data: HistorialLimpieza[];
  current_page: number;
  per_page: number;
  total: number;
};
