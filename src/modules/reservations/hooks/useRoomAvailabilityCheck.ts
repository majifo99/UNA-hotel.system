/**
 * Real-time Room Availability Check Hook
 * 
 * Valida disponibilidad de habitaciones mientras el usuario selecciona fechas
 */

import { useState, useEffect } from 'react';
import { roomService } from '../services/roomService';
import type { Room } from '../../../types/core';

export interface AvailabilityCheckResult {
  isChecking: boolean;
  isAvailable: boolean | null;
  availableRooms: Room[];
  errorMessage: string | null;
  hasChecked: boolean;
}

/**
 * Hook para validación de disponibilidad en tiempo real
 * 
 * Valida automáticamente cuando cambian las fechas con debounce de 500ms
 */
export function useRoomAvailabilityCheck(
  checkInDate: string | null,
  checkOutDate: string | null,
  numberOfGuests: number = 1
): AvailabilityCheckResult {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Reset state if dates are incomplete
    if (!checkInDate || !checkOutDate) {
      setIsAvailable(null);
      setAvailableRooms([]);
      setErrorMessage(null);
      setHasChecked(false);
      return;
    }

    // Validate dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      setIsAvailable(false);
      setErrorMessage('La fecha de entrada no puede ser en el pasado');
      setHasChecked(true);
      return;
    }

    if (checkOut <= checkIn) {
      setIsAvailable(false);
      setErrorMessage('La fecha de salida debe ser posterior a la fecha de entrada');
      setHasChecked(true);
      return;
    }

    // Debounce: wait 500ms after last change before checking
    const timeoutId = setTimeout(async () => {
      setIsChecking(true);
      setErrorMessage(null);
      
      try {
        const rooms = await roomService.getAvailableRooms(checkInDate, checkOutDate);
        
        if (rooms.length === 0) {
          setIsAvailable(false);
          setAvailableRooms([]);
          setErrorMessage('No hay habitaciones disponibles para estas fechas');
        } else {
          // Filter rooms by capacity if needed
          const suitableRooms = rooms.filter(room => room.capacity >= numberOfGuests);
          
          if (suitableRooms.length === 0) {
            setIsAvailable(false);
            setAvailableRooms(rooms); // Still return all rooms for alternative suggestions
            setErrorMessage(`No hay habitaciones disponibles para ${numberOfGuests} huéspedes. Hay ${rooms.length} habitaciones disponibles para menos personas.`);
          } else {
            setIsAvailable(true);
            setAvailableRooms(suitableRooms);
            setErrorMessage(null);
          }
        }
        
        setHasChecked(true);
      } catch (error) {
        console.error('[Availability Check] Error:', error);
        setIsAvailable(false);
        setAvailableRooms([]);
        setErrorMessage('Error al verificar disponibilidad. Por favor intente nuevamente.');
        setHasChecked(true);
      } finally {
        setIsChecking(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [checkInDate, checkOutDate, numberOfGuests]);

  return {
    isChecking,
    isAvailable,
    availableRooms,
    errorMessage,
    hasChecked,
  };
}

/**
 * Helper para determinar el estilo visual del estado
 */
export function getAvailabilityStatus(result: AvailabilityCheckResult): {
  type: 'idle' | 'checking' | 'available' | 'unavailable' | 'error';
  message: string;
  color: string;
} {
  if (!result.hasChecked) {
    return {
      type: 'idle',
      message: 'Seleccione fechas para verificar disponibilidad',
      color: 'gray'
    };
  }

  if (result.isChecking) {
    return {
      type: 'checking',
      message: 'Verificando disponibilidad...',
      color: 'blue'
    };
  }

  if (result.errorMessage) {
    return {
      type: 'error',
      message: result.errorMessage,
      color: 'red'
    };
  }

  if (result.isAvailable && result.availableRooms.length > 0) {
    return {
      type: 'available',
      message: `${result.availableRooms.length} habitación${result.availableRooms.length > 1 ? 'es' : ''} disponible${result.availableRooms.length > 1 ? 's' : ''}`,
      color: 'green'
    };
  }

  return {
    type: 'unavailable',
    message: 'No hay habitaciones disponibles',
    color: 'orange'
  };
}
