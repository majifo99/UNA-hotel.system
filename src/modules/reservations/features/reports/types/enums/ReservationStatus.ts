/**
 * Reservation Status Enum
 * 
 * Estados de reserva según la base de datos:
 * 1 - Pendiente
 * 2 - Cancelada
 * 3 - Confirmada
 * 4 - Check-in
 * 5 - Check-out
 * 6 - No show
 * 7 - En espera
 * 8 - Finalizada
 */
export type ReservationStatus = 
  | 'pending'        // 1 - Pendiente
  | 'cancelled'      // 2 - Cancelada
  | 'confirmed'      // 3 - Confirmada
  | 'checked_in'     // 4 - Check-in
  | 'checked_out'    // 5 - Check-out
  | 'no_show'        // 6 - No show
  | 'waiting'        // 7 - En espera
  | 'completed';     // 8 - Finalizada

/**
 * Payment Method Enum
 * 
 * Métodos de pago aceptados para reservas
 */
export type PaymentMethod = 
  | 'credit_card' 
  | 'debit_card' 
  | 'cash' 
  | 'transfer';
