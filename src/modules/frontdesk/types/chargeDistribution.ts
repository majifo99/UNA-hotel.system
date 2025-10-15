import type { PaymentMethod } from './checkin';

export type ChargeDistributionType = 
  | 'full' // Cargo completo a una sola fuente
  | 'equal' // Dividir equitativamente entre huéspedes
  | 'percentage' // Dividir por porcentajes
  | 'fixed_amount' // Montos fijos específicos
  | 'custom'; // División personalizada

export interface ChargeDistribution {
  id: string;
  type: ChargeDistributionType;
  description?: string;
  distributions: PaymentDistribution[];
  totalAmount: number;
  isValid: boolean; // Si la suma de distribuciones es correcta
}

export interface PaymentDistribution {
  id: string;
  guestId?: string; // ID del huésped responsable
  guestName: string; // Nombre del responsable del pago
  paymentMethod: PaymentMethod;
  amount: number; // Monto específico
  percentage?: number; // Porcentaje del total (si aplica)
  description?: string; // Descripción del cargo
  email?: string; // Email para facturación
  phone?: string; // Teléfono para contacto
  documentNumber?: string; // Número de documento
}

export interface RoomCharges {
  accommodationCost: number; // Costo de hospedaje base
  taxes: number; // Impuestos
  services: number; // Servicios adicionales
  deposits: number; // Depósitos requeridos
  total: number; // Total de cargos
}

// Plantillas predefinidas para división común
export type DistributionTemplate = 
  | 'single_guest' // Un solo huésped paga todo
  | 'equal_split' // División equitativa
  | 'primary_secondary' // Huésped principal + secundario
  | 'corporate_guest' // Empresa + huésped
  | 'family_split'; // División familiar

export interface DistributionTemplateConfig {
  template: DistributionTemplate;
  label: string;
  description: string;
  defaultDistribution: Omit<PaymentDistribution, 'id' | 'amount'>[];
}