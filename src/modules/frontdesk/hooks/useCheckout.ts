import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CheckoutData, CheckoutFormData, BillingItem, BillSplit } from '../types/checkout';

// Mock data para desarrollo
const mockCheckouts: CheckoutData[] = [];

// Generate unique receipt number
const generateReceiptNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `RCP-${year}${month}${day}-${random}`;
};

// Calculate bill splits
const calculateBillSplits = (
  billingItems: BillingItem[], 
  numberOfSplits: number, 
  guestNames: string[]
): BillSplit[] => {
  if (numberOfSplits <= 1) return [];
  
  const subtotal = billingItems.reduce((sum, item) => sum + item.total, 0);
  const splitAmount = subtotal / numberOfSplits;
  
  return guestNames.map((name, index) => ({
    id: `split-${index + 1}`,
    guestName: name,
    items: billingItems.map(item => ({
      ...item,
      total: item.total / numberOfSplits
    })),
    subtotal: splitAmount,
    tax: 0, // Will be calculated separately
    total: splitAmount,
    percentage: 100 / numberOfSplits
  }));
};

// Simular servicio de check-out
const mockCheckoutService = {
  getCheckouts: async (): Promise<CheckoutData[]> => {
    return new Promise(resolve => setTimeout(() => resolve(mockCheckouts), 300));
  },
  createCheckout: async (data: CheckoutData): Promise<CheckoutData> => {
    return new Promise(resolve => {
      const newCheckout = { ...data, id: Date.now().toString() };
      mockCheckouts.push(newCheckout);
      setTimeout(() => resolve(newCheckout), 300);
    });
  },
  searchReservation: async (reservationId: string): Promise<CheckoutFormData | null> => {
    // Mock search for existing reservation
    return new Promise(resolve => {
      setTimeout(() => {
        if (reservationId.startsWith('RES-')) {
          const mockBillingItems: BillingItem[] = [
            {
              id: 'room-1',
              description: 'Habitación Standard - 2 noches',
              quantity: 2,
              unitPrice: 75.00,
              total: 150.00,
              category: 'room'
            },
            {
              id: 'service-1',
              description: 'Servicio de Limpieza',
              quantity: 1,
              unitPrice: 15.00,
              total: 15.00,
              category: 'service'
            },
            {
              id: 'amenity-1',
              description: 'WiFi Premium',
              quantity: 2,
              unitPrice: 5.00,
              total: 10.00,
              category: 'amenity'
            }
          ];

          resolve({
            reservationId,
            guestName: 'John Doe',
            roomNumber: '101',
            checkInDate: '2024-01-15',
            checkOutDate: new Date().toISOString().split('T')[0],
            numberOfGuests: 2,
            identificationNumber: '123456789',
            paymentStatus: 'pending',
            totalAmount: 150.00,
            additionalCharges: 25.00,
            finalAmount: 175.00,
            notes: '',
            email: 'john.doe@example.com',
            phone: '+1234567890',
            nationality: 'US',
            billingItems: mockBillingItems,
            billSplits: [],
            subtotal: 175.00,
            taxAmount: 0,
            discountAmount: 0,
            grandTotal: 175.00,
            taxRate: 0,
            splitBill: false,
            numberOfSplits: 1
          });
        }
        resolve(null);
      }, 300);
    });
  }
};

export const useCheckout = () => {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: checkouts = [], isLoading: isLoadingCheckouts, error: queryError } = useQuery({
    queryKey: ['checkouts'],
    queryFn: () => mockCheckoutService.getCheckouts(),
  });

  // Handle query error
  if (queryError && !error) {
    setError('Failed to load checkouts');
  }

  const createMutation = useMutation({
    mutationFn: (data: CheckoutData) => mockCheckoutService.createCheckout(data),
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['checkouts'] });
    },
    onError: (err: unknown) => {
      console.error('Error creating check-out:', err);
      setError((err instanceof Error) ? err.message : 'Unknown error');
    }
  });

  const searchReservationMutation = useMutation({
    mutationFn: (reservationId: string) => mockCheckoutService.searchReservation(reservationId),
  });

  const validateAndSubmit = async (data: CheckoutFormData) => {
    try {
      // Validación básica
      if (!data.reservationId || !data.roomNumber) {
        throw new Error('Reservation ID and Room Number are required');
      }
      
      if (!data.checkOutDate) {
        throw new Error('Check-out date is required');
      }

      if (data.grandTotal < 0) {
        throw new Error('Grand total cannot be negative');
      }

      // Calculate totals
      const subtotal = data.billingItems.reduce((sum, item) => sum + item.total, 0);
      const taxAmount = subtotal * (data.taxRate / 100);
      const grandTotal = subtotal + taxAmount - data.discountAmount;

      // Generate bill splits if enabled
      let billSplits: BillSplit[] = [];
      if (data.splitBill && data.numberOfSplits > 1) {
        const guestNames = Array.from({ length: data.numberOfSplits }, (_, i) => 
          `Guest ${i + 1}`
        );
        billSplits = calculateBillSplits(data.billingItems, data.numberOfSplits, guestNames);
      }

      const checkoutData: CheckoutData = {
        reservationId: data.reservationId,
        guestName: data.guestName,
        roomNumber: data.roomNumber,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        numberOfGuests: data.numberOfGuests,
        identificationNumber: data.identificationNumber,
        paymentStatus: data.paymentStatus,
        totalAmount: data.totalAmount,
        additionalCharges: data.additionalCharges,
        finalAmount: data.finalAmount,
        notes: data.notes,
        billingItems: data.billingItems,
        billSplits,
        subtotal,
        taxAmount,
        discountAmount: data.discountAmount,
        grandTotal,
        receiptNumber: generateReceiptNumber(),
        checkoutTime: new Date().toISOString()
      };
      
      await createMutation.mutateAsync(checkoutData);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
      return false;
    }
  };

  const searchReservation = async (reservationId: string) => {
    try {
      const result = await searchReservationMutation.mutateAsync(reservationId);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search reservation');
      return null;
    }
  };

  return {
    checkouts,
    isLoadingCheckouts,
    isSubmitting: createMutation.isPending,
    isSearching: searchReservationMutation.isPending,
    error,
    validateAndSubmit,
    searchReservation,
  };
};
