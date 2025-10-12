import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { CheckInData } from '../types/checkin';
import { guestApiService } from '../../guests/services/guestApiService';
import { FrontdeskService } from '../services/frontdeskService';
import type { CreateGuestData } from '../../../types/core/forms';
import type { DocumentType } from '../../../types/core/enums';

// Helper function to validate basic check-in data
const validateBasicData = (data: CheckInData) => {
  if (!data.roomNumber) {
    throw new Error('El número de habitación es requerido');
  }
  
  if (!data.guestName || data.guestName.trim() === '') {
    throw new Error('El nombre del huésped es requerido');
  }
  
  if (!data.identificationNumber) {
    throw new Error('El número de identificación es requerido');
  }
  
  if (!data.paymentMethod) {
    throw new Error('El método de pago es requerido');
  }
};

// Helper function to validate reservation data
const validateReservationData = (data: CheckInData) => {
  if (!data.isWalkIn && (!data.reservationId || data.reservationId === '')) {
    throw new Error('El ID de reserva es requerido para reservas existentes');
  }
};

// Helper function to validate walk-in data
const validateWalkInData = (data: CheckInData) => {
  if (!data.isWalkIn) return;
  
  if (!data.guestEmail) {
    throw new Error('El email es requerido para walk-ins');
  }
  if (!data.guestPhone) {
    throw new Error('El teléfono es requerido para walk-ins');
  }
  if (!data.guestNationality) {
    throw new Error('La nacionalidad es requerida para walk-ins');
  }
};

// Helper function to create guest data
const createGuestDataFromCheckIn = (data: CheckInData): CreateGuestData => {
  const guestName = data.guestName || '';
  const nameParts = guestName.trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  return {
    firstName: firstName,
    firstLastName: lastName,
    email: data.guestEmail || '',
    phone: data.guestPhone || '',
    nationality: data.guestNationality || '',
    documentNumber: data.identificationNumber,
    documentType: 'id_card' as DocumentType
  };
};

// Helper function to handle guest creation for walk-ins
const handleWalkInGuestCreation = async (data: CheckInData) => {
  if (!data.isWalkIn || data.existingGuestId) return;
  
  console.log('Creating new guest for walk-in...');
  const guestData = createGuestDataFromCheckIn(data);
  console.log('Guest data to create:', guestData);
  
  try {
    const guestResult = await guestApiService.createGuest(guestData);
    console.log('Guest created successfully:', guestResult);
    data.createdGuestId = guestResult.id;
  } catch (guestError) {
    console.error('Error creating guest:', guestError);
    console.warn('Proceeding with check-in despite guest creation error');
  }
};

export const useCheckIn = () => {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [folioId, setFolioId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const validateAndSubmit = async (data: CheckInData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Use helper functions for validation
      validateBasicData(data);
      validateReservationData(data);
      validateWalkInData(data);
      
      // Handle guest creation for walk-ins
      await handleWalkInGuestCreation(data);
      
      // Perform actual check-in API call
      console.log('Check-in data ready for submission:', data);
      
      // Simulate folio creation - Replace with actual API call
      const simulatedFolioId = Math.floor(Math.random() * 1000) + 1;
      setFolioId(simulatedFolioId);
      
      // Invalidate relevant queries when we have real check-in API
      queryClient.invalidateQueries({ queryKey: ['checkIns'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      
      setIsSubmitting(false);
      return { success: true, folioId: simulatedFolioId, requiresChargeDistribution: data.requiereDivisionCargos };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
      setIsSubmitting(false);
      return { success: false, folioId: null, requiresChargeDistribution: false };
    }
  };

  return {
    isSubmitting,
    error,
    folioId,
    validateAndSubmit,
  };
};
