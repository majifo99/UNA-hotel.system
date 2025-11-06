import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../services/apiClient';
import FrontdeskService from '../services/frontdeskService';

interface GuestData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  identificationNumber: string;
}

interface StayData {
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  adultos: number;
  ninos: number;
  bebes: number;
  paymentMethod?: string;
  observacion_checkin?: string;
}

interface WalkInResult {
  success: boolean;
  folioId?: number;
  message?: string;
}

interface WalkInBackendPayload {
  // Datos del huésped (si es nuevo)
  cliente?: {
    nombre: string;
    apellido1: string;
    email: string;
    telefono: string;
    nacionalidad: string;
  };
  // Cédula (requerido para huésped nuevo)
  cedula?: string;
  // ID del cliente si es existente
  id_cliente?: number;
  // Datos de la estancia
  id_habitacion: number;
  fecha_llegada: string;
  fecha_salida: string;
  adultos: number;
  ninos: number;
  bebes: number;
  metodo_pago?: string;
  observacion_checkin?: string;
}

/**
 * Hook para manejar Walk-Ins (check-in sin reserva previa)
 * Maneja tanto huéspedes nuevos como existentes
 */
export const useWalkIn = () => {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  /**
   * Realiza walk-in con un huésped nuevo
   */
  const performWalkInWithNewGuest = async (
    guestData: GuestData,
    stayData: StayData
  ): Promise<WalkInResult> => {
    try {
      setIsSubmitting(true);
      setError(null);

      console.log('🆕 Walk-In con huésped NUEVO:', {
        guest: guestData,
        stay: stayData
      });
      
      // Validaciones básicas
      if (!guestData.firstName || !guestData.lastName) {
        throw new Error('Nombre y apellido son requeridos');
      }
      
      if (!guestData.email) {
        throw new Error('Email es requerido para Walk-In');
      }
      
      if (!guestData.phone) {
        throw new Error('Teléfono es requerido para Walk-In');
      }
      
      if (!guestData.identificationNumber) {
        throw new Error('Número de identificación es requerido');
      }
      
      if (!stayData.roomNumber) {
        throw new Error('Número de habitación es requerido');
      }

      // PASO 1: Crear el cliente primero usando POST /clientes
      console.log('👤 PASO 1: Creando nuevo cliente...');
      
      const clientePayload = {
        nombre: guestData.firstName,
        apellido1: guestData.lastName,
        email: guestData.email,
        telefono: guestData.phone,
        nacionalidad: guestData.nationality,
        numero_doc: guestData.identificationNumber,
      };

      console.log('📤 Enviando datos del cliente:', clientePayload);

      const clienteResponse = await apiClient.post<{
        success?: boolean;
        message?: string;
        id_cliente?: number;
        data?: {
          id_cliente?: number;
          cliente?: {
            id_cliente?: number;
          };
        };
      }>('/clientes', clientePayload);

      console.log('✅ Cliente creado:', clienteResponse.data);

      // Extraer el ID del cliente de la respuesta (puede estar en varios lugares)
      const clienteId = clienteResponse.data.id_cliente || // Directamente en la respuesta
                       clienteResponse.data.data?.id_cliente || // Dentro de data
                       clienteResponse.data.data?.cliente?.id_cliente; // Dentro de data.cliente

      if (!clienteId) {
        console.error('❌ No se pudo obtener el ID del cliente creado:', clienteResponse.data);
        throw new Error('No se pudo crear el cliente: respuesta sin ID');
      }

      console.log('✅ Cliente creado con ID:', clienteId);

      // PASO 2: Buscar la habitación por su número para obtener el ID real
      console.log('🔍 PASO 2: Buscando habitación con número:', stayData.roomNumber);
      
      let roomId: number;
      try {
        const room = await FrontdeskService.getRoomById(stayData.roomNumber);
        roomId = Number.parseInt(room.id, 10);
        console.log('✅ Habitación encontrada - ID:', roomId, 'Número:', room.number);
      } catch (error) {
        console.error('❌ Error al buscar habitación:', error);
        throw new Error(`No se encontró la habitación número ${stayData.roomNumber}`);
      }

      if (Number.isNaN(roomId)) {
        throw new TypeError('ID de habitación inválido');
      }

      // PASO 3: Crear el Walk-In usando el ID del cliente recién creado
      console.log('🚶 PASO 3: Creando Walk-In con cliente ID:', clienteId);

      const walkInPayload: WalkInBackendPayload = {
        id_cliente: clienteId, // Usar el ID del cliente recién creado
        id_habitacion: roomId,
        fecha_llegada: stayData.checkInDate,
        fecha_salida: stayData.checkOutDate,
        adultos: stayData.adultos,
        ninos: stayData.ninos,
        bebes: stayData.bebes,
        metodo_pago: stayData.paymentMethod,
        observacion_checkin: stayData.observacion_checkin,
      };

      console.log('📤 Enviando Walk-In al backend:', walkInPayload);

      const response = await apiClient.post<{
        success: boolean;
        message: string;
        data?: {
          folio_id?: number;
          estadia_id?: number;
        };
      }>('/frontdesk/walkin', walkInPayload);

      console.log('✅ Walk-In creado exitosamente:', response.data);

      // Invalidar queries para refrescar datos
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['guests'] }),
        queryClient.invalidateQueries({ queryKey: ['checkIns'] }),
        queryClient.invalidateQueries({ queryKey: ['rooms'] }),
        queryClient.invalidateQueries({ queryKey: ['folios'] }),
      ]);

      return {
        success: true,
        folioId: response.data.data?.folio_id,
        message: response.data.message || 'Walk-In registrado exitosamente',
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error en Walk-In con huésped nuevo';
      console.error('❌ Error en Walk-In (nuevo):', errorMessage);
      console.error('❌ Error completo:', err);
      setError(errorMessage);
      
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Realiza walk-in con un huésped existente
   */
  const performWalkInWithExistingGuest = async (
    guestId: number,
    stayData: StayData
  ): Promise<WalkInResult> => {
    try {
      setIsSubmitting(true);
      setError(null);

      console.log('👥 Walk-In con huésped EXISTENTE:', {
        guestId,
        stay: stayData
      });

      // Validaciones básicas
      if (!guestId || guestId <= 0) {
        throw new Error('ID de huésped inválido');
      }
      
      if (!stayData.roomNumber) {
        throw new Error('Número de habitación es requerido');
      }

      // Buscar la habitación por su número para obtener el ID real
      console.log('🔍 Buscando habitación con número:', stayData.roomNumber);
      
      let roomId: number;
      try {
        const room = await FrontdeskService.getRoomById(stayData.roomNumber);
        roomId = Number.parseInt(room.id, 10);
        console.log('✅ Habitación encontrada - ID:', roomId, 'Número:', room.number);
      } catch (error) {
        console.error('❌ Error al buscar habitación:', error);
        throw new Error(`No se encontró la habitación número ${stayData.roomNumber}`);
      }

      if (Number.isNaN(roomId)) {
        throw new TypeError('ID de habitación inválido');
      }

      // Preparar payload para el backend
      const payload: WalkInBackendPayload = {
        id_cliente: guestId,
        id_habitacion: roomId,
        fecha_llegada: stayData.checkInDate,
        fecha_salida: stayData.checkOutDate,
        adultos: stayData.adultos,
        ninos: stayData.ninos,
        bebes: stayData.bebes,
        metodo_pago: stayData.paymentMethod,
        observacion_checkin: stayData.observacion_checkin,
      };

      console.log('📤 Enviando Walk-In al backend:', payload);

      // Llamar al endpoint de walk-in
      const response = await apiClient.post<{
        success: boolean;
        message: string;
        data?: {
          folio_id?: number;
          estadia_id?: number;
        };
      }>('/frontdesk/walkin', payload);

      console.log('✅ Respuesta del backend:', response.data);

      // Invalidar queries para refrescar datos
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['checkIns'] }),
        queryClient.invalidateQueries({ queryKey: ['rooms'] }),
        queryClient.invalidateQueries({ queryKey: ['reservations'] }),
        queryClient.invalidateQueries({ queryKey: ['folios'] }),
      ]);

      return {
        success: true,
        folioId: response.data.data?.folio_id,
        message: response.data.message || 'Walk-In registrado exitosamente',
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error en Walk-In con huésped existente';
      console.error('❌ Error en Walk-In (existente):', errorMessage);
      console.error('❌ Error completo:', err);
      setError(errorMessage);
      
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Limpia el estado de error
   */
  const clearError = () => {
    setError(null);
  };

  return {
    performWalkInWithNewGuest,
    performWalkInWithExistingGuest,
    isSubmitting,
    error,
    clearError,
  };
};

export default useWalkIn;
