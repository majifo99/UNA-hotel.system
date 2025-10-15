export interface BillingItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: 'room' | 'service' | 'amenity' | 'tax' | 'fee' | 'discount';
}

export interface BillSplit {
  id: string;
  guestName: string;
  items: BillingItem[];
  subtotal: number;
  tax: number;
  total: number;
  percentage: number; // Percentage of total bill
}

export interface CheckoutData {
  reservationId: string;
  guestName: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  identificationNumber: string;
  paymentStatus: 'pending' | 'completed';
  totalAmount: number;
  additionalCharges: number;
  finalAmount: number;
  notes?: string;
  billingItems: BillingItem[];
  billSplits: BillSplit[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  receiptNumber: string;
  checkoutTime: string;
}

export interface CheckoutResponse {
  success: boolean;
  data?: CheckoutData;
  error?: string;
}

export interface CheckoutFormData {
  reservationId: string;
  guestName: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  identificationNumber: string;
  paymentStatus: 'pending' | 'completed';
  totalAmount: number;
  additionalCharges: number;
  finalAmount: number;
  notes: string;
  email: string;
  phone: string;
  nationality: string;
  billingItems: BillingItem[];
  billSplits: BillSplit[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  taxRate: number;
  splitBill: boolean;
  numberOfSplits: number;
  // ⚖️ División de cargos
  requiereDivisionCargos?: boolean;
  notasDivision?: string;
  empresaPagadora?: string;
}

export interface ReceiptData {
  receiptNumber: string;
  hotelName: string;
  hotelAddress: string;
  guestName: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  checkoutTime: string;
  billingItems: BillingItem[];
  billSplits: BillSplit[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  paymentMethod: string;
  paymentStatus: string;
  notes: string;
}
