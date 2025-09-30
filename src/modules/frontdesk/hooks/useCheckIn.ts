import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { CheckInData } from '../types/checkin';
import { guestApiService } from '../../guests/services/guestApiService';
import type { CreateGuestData } from '../../../types/core/forms';
import type { DocumentType } from '../../../types/core/enums';

export const useCheckIn = () => {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const validateAndSubmit = async (data: CheckInData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Validación mejorada para walk-ins y reservas
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
      
      // Validación específica para reservas existentes
      if (!data.isWalkIn && (!data.reservationId || data.reservationId === '')) {
        throw new Error('El ID de reserva es requerido para reservas existentes');
      }
      
      // Validación específica para walk-ins
      if (data.isWalkIn) {
        if (!data.guestEmail) {
          throw new Error('El email es requerido para walk-ins');
        }
        if (!data.guestPhone) {
          throw new Error('El teléfono es requerido para walk-ins');
        }
        if (!data.guestNationality) {
          throw new Error('La nacionalidad es requerida para walk-ins');
        }
      }
      
      // Para walk-ins nuevos, crear el huésped primero (solo si no se seleccionó uno existente)
      if (data.isWalkIn && !data.existingGuestId) {
        console.log('Creating new guest for walk-in...');
        
        // Extraer nombre y apellidos del guestName
        const nameParts = data.guestName.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Preparar datos del huésped para el endpoint regular POST /clientes
        const guestData: CreateGuestData = {
          firstName: firstName,
          firstLastName: lastName,
          email: data.guestEmail || '',
          phone: data.guestPhone || '',
          nationality: data.guestNationality || '',
          documentNumber: data.identificationNumber,
          documentType: 'id_card' as DocumentType // Defaulting to ID card, could be made configurable
        };
        
        console.log('Guest data to create:', guestData);
        
        try {
          const guestResult = await guestApiService.createGuest(guestData);
          
          console.log('Guest created successfully:', guestResult);
          // Add the created guest ID to check-in data
          data.createdGuestId = guestResult.id;
        } catch (guestError) {
          console.error('Error creating guest:', guestError);
          // Log the error but don't fail the check-in
          console.warn('Proceeding with check-in despite guest creation error');
        }
      }
      
      // TODO: Implement actual check-in API call when Laravel route is available
      console.log('Check-in data ready for submission:', data);
      
      // Invalidate relevant queries when we have real check-in API
      queryClient.invalidateQueries({ queryKey: ['checkIns'] });
      
      setIsSubmitting(false);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
      setIsSubmitting(false);
      return false;
    }
  };

  return {
    isSubmitting,
    error,
    validateAndSubmit,
  };
};
