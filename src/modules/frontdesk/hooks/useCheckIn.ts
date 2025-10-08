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
      
      let checkInResult;
      if (data.isWalkIn) {
        // Walk-in check-in
        checkInResult = await FrontdeskService.createWalkIn({
          guestName: data.guestName,
          roomNumber: data.roomNumber,
          checkInDate: data.checkInDate,
          checkOutDate: data.checkOutDate,
          numberOfGuests: data.numberOfGuests,
          adultos: data.adultos,
          ninos: data.ninos,
          bebes: data.bebes,
          identificationNumber: data.identificationNumber,
          paymentMethod: data.paymentMethod,
          currency: data.currency,
          observacion_checkin: data.observacion_checkin,
          guestEmail: data.guestEmail,
          guestPhone: data.guestPhone,
          guestNationality: data.guestNationality,
          existingGuestId: data.existingGuestId,
          createdGuestId: data.createdGuestId,
          useChargeDistribution: data.useChargeDistribution,
          totalAmount: data.totalAmount,
          requiereDivisionCargos: data.requiereDivisionCargos,
          tiposCargoDividir: data.tiposCargoDividir,
          notasDivision: data.notasDivision,
          empresaPagadora: data.empresaPagadora,
          responsablesPrevios: data.responsablesPrevios
        });
      } else {
        // Check-in from existing reservation
        checkInResult = await FrontdeskService.checkInFromReservation(data.reservationId, {
          roomNumber: data.roomNumber,
          checkInDate: data.checkInDate,
          checkOutDate: data.checkOutDate,
          numberOfGuests: data.numberOfGuests,
          adultos: data.adultos,
          ninos: data.ninos,
          bebes: data.bebes,
          identificationNumber: data.identificationNumber,
          paymentMethod: data.paymentMethod,
          currency: data.currency,
          observacion_checkin: data.observacion_checkin,
          useChargeDistribution: data.useChargeDistribution,
          totalAmount: data.totalAmount,
          requiereDivisionCargos: data.requiereDivisionCargos,
          tiposCargoDividir: data.tiposCargoDividir,
          notasDivision: data.notasDivision,
          empresaPagadora: data.empresaPagadora,
          responsablesPrevios: data.responsablesPrevios
        });
      }
      
      const folioId = checkInResult.folioId;
      setFolioId(folioId);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['checkIns'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      
      setIsSubmitting(false);
      return { success: true, folioId, requiresChargeDistribution: data.requiereDivisionCargos };
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
