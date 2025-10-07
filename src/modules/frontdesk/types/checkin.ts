import type { ChargeDistribution } from './chargeDistribution';
import type { TipoCargo, TipoResponsable } from './folioTypes';

export type PaymentMethod = 
  | 'credit_card'
  | 'debit_card'
  | 'cash'
  | 'bank_transfer'
  | 'agency_voucher'
  | 'courtesy'
  | 'corporate_account'
  | 'points_miles';

export type Currency = 
  | 'USD' // Dólar estadounidense
  | 'CRC' // Colón costarricense
  | 'EUR' // Euro
  | 'GBP' // Libra esterlina
  | 'CAD' // Dólar canadiense
  | 'MXN' // Peso mexicano
  | 'JPY' // Yen japonés
  | 'CHF' // Franco suizo
  | 'AUD' // Dólar australiano
  | 'BRL'; // Real brasileño

export interface CurrencyOption {
  code: Currency;
  name: string;
  symbol: string;
  flag?: string;
}

export interface CheckInData {
  reservationId: string;
  guestName?: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string; // fecha_salida
  numberOfGuests: number;
  adultos: number; // Número de adultos
  ninos: number; // Número de niños
  bebes: number; // Número de bebés
  identificationNumber: string;
  paymentStatus: 'pending' | 'completed';
  paymentMethod?: PaymentMethod;
  currency?: Currency; // Divisa de pago
  observacion_checkin?: string; // Observaciones del check-in
  isWalkIn?: boolean;
  guestEmail?: string;
  guestPhone?: string;
  guestNationality?: string;
  existingGuestId?: string; // ID del huésped existente para walk-ins
  createdGuestId?: string; // ID del huésped creado para walk-ins nuevos
  
  // División de cargos (NUEVO SISTEMA)
  useChargeDistribution?: boolean; // Si se utiliza división de cargos
  chargeDistribution?: ChargeDistribution; // Configuración de división (legacy)
  totalAmount?: number; // Monto total a dividir
  
  // ⚖️ Aviso de división de cargos (aplicada en checkout)
  requiereDivisionCargos?: boolean; // Si el folio requerirá división en checkout
  tiposCargoDividir?: TipoCargo[]; // Tipos de cargo que se dividirán
  notasDivision?: string; // Notas sobre la división planeada
  empresaPagadora?: string; // Nombre de empresa si aplica
  responsablesPrevios?: Array<{
    nombre: string;
    tipo: TipoResponsable;
    email?: string;
    nit?: string;
    tiposCargo?: TipoCargo[]; // Tipos que pagará este responsable
  }>;
}

export interface CheckInResponse {
  success: boolean;
  data?: CheckInData;
  error?: string;
}
