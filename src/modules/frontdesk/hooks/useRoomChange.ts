import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { RoomChangeData, RoomChangeRequest } from '../types/roomChange';
import apiClient from '../../../services/apiClient';

// Servicio real para cambio de habitación
const roomChangeService = {
  changeRoom: async (data: RoomChangeRequest): Promise<RoomChangeData> => {
    console.log('🔄 Enviando cambio de habitación:', data);
    
    // Intentar múltiples endpoints
    const endpoints = [
      '/api/frontdesk/room-change',
      '/api/reservations/room-change', 
      '/api/frontdesk/cambio-habitacion',
      '/frontdesk/room-change'
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`🎯 Intentando: ${endpoint}`);
        const response = await apiClient.post(endpoint, data);
        
        if (response.data) {
          console.log(`✅ Cambio exitoso en: ${endpoint}`, response.data);
          
          // Mapear respuesta al formato esperado
          const responseData = response.data.data || response.data;
          
          return {
            ...data,
            currentRoomId: responseData.currentRoomId || responseData.id_hab_anterior,
            guestId: responseData.guestId || responseData.id_cliente,
            reservationId: responseData.reservationId || responseData.id_reserva,
            motivo: responseData.motivo,
            observaciones: responseData.observaciones
          };
        }
      } catch (error) {
        console.log(`❌ Falló: ${endpoint}`, error);
        continue;
      }
    }
    
    // Si todos fallan, lanzar error
    throw new Error('No se pudo procesar el cambio de habitación. Verifique la conexión con el servidor.');
  }
};

export const useRoomChange = () => {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const changeRoomMutation = useMutation({
    mutationFn: (data: RoomChangeRequest) => roomChangeService.changeRoom(data),
    onSuccess: () => {
      setError(null);
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['checkIns'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
    onError: (err: unknown) => {
      console.error('Error changing room:', err);
      setError((err instanceof Error) ? err.message : 'Error desconocido al cambiar habitación');
    }
  });

  const validateAndChangeRoom = async (data: RoomChangeData) => {
    try {
      // Validaciones
      if (!data.id_hab_nueva) {
        throw new Error('La nueva habitación es requerida');
      }
      
      if (!data.desde) {
        throw new Error('La fecha de cambio es requerida');
      }
      
      if (data.adultos < 1) {
        throw new Error('Debe haber al menos 1 adulto');
      }
      
      if (data.adultos + data.ninos + data.bebes < 1) {
        throw new Error('Debe haber al menos 1 huésped');
      }
      
      // Validar que la fecha no sea anterior a hoy
      const today = new Date().toISOString().split('T')[0];
      if (data.desde < today) {
        throw new Error('La fecha de cambio no puede ser anterior a hoy');
      }
      
      // Preparar datos para el API
      const requestData: RoomChangeRequest = {
        id_hab_nueva: data.id_hab_nueva,
        desde: data.desde,
        adultos: data.adultos,
        ninos: data.ninos,
        bebes: data.bebes
      };
      
      await changeRoomMutation.mutateAsync(requestData);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
      return false;
    }
  };

  return {
    isChangingRoom: changeRoomMutation.isPending,
    error,
    validateAndChangeRoom,
    clearError: () => setError(null)
  };
};