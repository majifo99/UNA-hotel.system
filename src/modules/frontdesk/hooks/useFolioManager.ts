/**
 * 🏨 Hook de Gestión de Folios - Versión 2.0
 * ==========================================
 * 
 * Hook principal para gestión completa de folios hoteleros.
 * Integra todas las operaciones: distribución, pagos, facturación, cierre.
 */

import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { folioService } from '../services/folioService';

export interface FolioData {
  id: number;
  reservationId: number;
  guestName: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  status: 'active' | 'closed' | 'cancelled';
  
  // Amounts
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  
  // Distribution
  unassignedCharges: number;
  distributedCharges: number;
  
  // Billing
  pendingBills: number;
  generatedBills: number;
  
  // Responsibles
  responsibles: Array<{
    id: number;
    name: string;
    type: 'guest' | 'company' | 'agency';
    assignedAmount: number;
    paidAmount: number;
    pendingAmount: number;
  }>;
  
  // Charges
  charges: Array<{
    id: number;
    type: string;
    description: string;
    amount: number;
    date: string;
    assignedTo?: number;
    status: 'pending' | 'assigned' | 'paid';
  }>;
  
  // Payments
  payments: Array<{
    id: number;
    amount: number;
    method: string;
    date: string;
    responsibleId?: number;
    reference?: string;
  }>;
}

export interface DistributionRequest {
  strategy: 'single' | 'equal' | 'percent' | 'fixed';
  responsibles: Array<{
    id: number;
    percentage?: number;
    amount?: number;
  }>;
  chargeIds?: number[];
}

export interface PaymentRequest {
  amount: number;
  method: string;
  responsibleId?: number;
  reference?: string;
  notes?: string;
}

export interface BillingRequest {
  responsibleId: number;
  chargeIds: number[];
  billingData: {
    name: string;
    taxId?: string;
    address?: string;
    email?: string;
  };
}

export const useFolioManager = (folioId: number) => {
  const [folio, setFolio] = useState<FolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Operation states
  const [isDistributing, setIsDistributing] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isGeneratingBill, setIsGeneratingBill] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  const queryClient = useQueryClient();

  // Load folio data
  const loadFolio = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await folioService.getFolioSummary(folioId);
      setFolio(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading folio');
      console.error('Error loading folio:', err);
    } finally {
      setLoading(false);
    }
  }, [folioId]);

  // Refresh folio data
  const refreshFolio = useCallback(() => {
    loadFolio();
    // Also invalidate related queries
    queryClient.invalidateQueries({ queryKey: ['folio', folioId] });
  }, [loadFolio, queryClient, folioId]);

  // Distribute charges
  const distributeCargos = useCallback(async (request: DistributionRequest): Promise<boolean> => {
    try {
      setIsDistributing(true);
      setError(null);
      
      await folioService.distributeCharges(folioId, request);
      await loadFolio(); // Refresh data
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error distributing charges');
      console.error('Error distributing charges:', err);
      return false;
    } finally {
      setIsDistributing(false);
    }
  }, [folioId, loadFolio]);

  // Process payment
  const processPayment = useCallback(async (request: PaymentRequest): Promise<boolean> => {
    try {
      setIsProcessingPayment(true);
      setError(null);
      
      await folioService.processPayment(folioId, request);
      await loadFolio(); // Refresh data
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error processing payment');
      console.error('Error processing payment:', err);
      return false;
    } finally {
      setIsProcessingPayment(false);
    }
  }, [folioId, loadFolio]);

  // Generate bill
  const generateBill = useCallback(async (request: BillingRequest): Promise<boolean> => {
    try {
      setIsGeneratingBill(true);
      setError(null);
      
      await folioService.generateBill(folioId, request);
      await loadFolio(); // Refresh data
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generating bill');
      console.error('Error generating bill:', err);
      return false;
    } finally {
      setIsGeneratingBill(false);
    }
  }, [folioId, loadFolio]);

  // Close folio
  const closeFolio = useCallback(async (): Promise<boolean> => {
    try {
      setIsClosing(true);
      setError(null);
      
      await folioService.closeFolio(folioId);
      await loadFolio(); // Refresh data
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error closing folio');
      console.error('Error closing folio:', err);
      return false;
    } finally {
      setIsClosing(false);
    }
  }, [folioId, loadFolio]);

  // Load data on mount
  useEffect(() => {
    loadFolio();
  }, [loadFolio]);

  // Computed values
  const isFullyPaid = folio ? folio.pendingAmount === 0 : false;
  const isFullyDistributed = folio ? folio.unassignedCharges === 0 : false;
  const canClose = isFullyPaid && isFullyDistributed;
  const completionPercentage = folio ? 
    Math.round(((folio.totalAmount - folio.pendingAmount) / folio.totalAmount) * 100) : 0;

  return {
    // Data
    folio,
    loading,
    error,
    
    // Computed
    isFullyPaid,
    isFullyDistributed,
    canClose,
    completionPercentage,
    
    // Operation states
    isDistributing,
    isProcessingPayment,
    isGeneratingBill,
    isClosing,
    
    // Actions
    refreshFolio,
    distributeCargos,
    processPayment,
    generateBill,
    closeFolio,
    
    // Utilities
    loadFolio
  };
};

export default useFolioManager;