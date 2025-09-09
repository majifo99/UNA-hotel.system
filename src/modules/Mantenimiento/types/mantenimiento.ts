// Tipos base del módulo de Mantenimiento

export type MaintenanceStatus = 'Pendiente' | 'En Proceso' | 'Completado';
export type MaintenancePriority = 'Baja' | 'Media' | 'Alta' | 'Urgente';
export type MaintenanceKind = 'Correctivo' | 'Preventivo';

export interface Assignee {
  id: string;
  name: string;
  title?: string;
  eta?: string; // ej. "2-3 horas"
}

export interface MaintenanceItem {
  id: string;           // UUID interno
  code: string;         // MNT-001
  roomNumber: number;   // 201
  kind: MaintenanceKind;// Correctivo / Preventivo
  area: string;         // Plomería, Eléctrica, Carpintería...
  status: MaintenanceStatus;
  assignee?: Assignee;
  scheduledAt?: string; // ISO o dd/mm/yyyy
  priority: MaintenancePriority;
  createdAt: string;    // ISO
}
