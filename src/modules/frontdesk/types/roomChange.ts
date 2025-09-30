export interface RoomChangeData {
  id_hab_nueva: number; // ID de la nueva habitación
  desde: string; // Fecha desde cuando aplica el cambio
  adultos: number; // Número de adultos
  ninos: number; // Número de niños
  bebes: number; // Número de bebés
  // Campos adicionales para el contexto
  currentRoomId?: number; // Habitación actual (para referencia)
  guestId?: string; // ID del huésped
  reservationId?: string; // ID de la reserva
  motivo?: string; // Motivo del cambio
  observaciones?: string; // Observaciones adicionales
}

export interface RoomChangeRequest {
  id_hab_nueva: number;
  desde: string;
  adultos: number;
  ninos: number;
  bebes: number;
}

export interface RoomChangeResponse {
  success: boolean;
  data?: RoomChangeData;
  error?: string;
  message?: string;
}

export type RoomChangeReason = 
  | 'guest_request' // Solicitud del huésped
  | 'maintenance' // Mantenimiento de habitación
  | 'upgrade' // Upgrade de habitación
  | 'downgrade' // Downgrade por disponibilidad
  | 'noise_complaint' // Queja por ruido
  | 'room_issue' // Problema con la habitación
  | 'preference' // Preferencia del huésped
  | 'other'; // Otro motivo