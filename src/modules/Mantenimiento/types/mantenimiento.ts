export type MaintenanceStatus = "Pendiente" | "En Proceso" | "Completado";
export type MaintenancePriority = "Baja" | "Media" | "Alta" | "Urgente";

export type MaintenanceItem = {
  id: string;
  code: string;
  roomNumber: number;
  kind: "Correctivo" | "Preventivo";   // o string si lo tienes así
  area: string;                        // Plomería, Eléctrica, etc.
  status: MaintenanceStatus;
  assignee?: { id: string; name: string; eta?: string };
  scheduledAt?: string;
  priority: MaintenancePriority;
  createdAt?: string;

  /** NUEVO: para mostrar como en tu captura */
  name?: string;       // "Reparación de aire acondicionado"
  summary?: string;    // "El aire acondicionado no enfría correctamente"


   sourceNotificationId?: string | number;
};
