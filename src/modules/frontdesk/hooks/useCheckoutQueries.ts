/**
 * ============================================================================
 * HOOKS PARA CHECKOUT - GESTIÓN DE ESTADÍA
 * ============================================================================
 * 
 * Hooks específicos para manejar la información de estadía durante el checkout
 */

import { useQuery } from '@tanstack/react-query';
import { estadiaService } from '../services/estadiaService';

/**
 * Query keys para estadía en checkout
 */
export const checkoutQueryKeys = {
  all: ['checkout'] as const,
  estadia: () => [...checkoutQueryKeys.all, 'estadia'] as const,
  estadiaByCodigo: (codigo: string) => [...checkoutQueryKeys.estadia(), 'codigo', codigo] as const,
};

/**
 * Hook para obtener información de estadía por código de reserva para checkout
 */
export const useEstadiaByReservaCode = (codigo: string) => {
  return useQuery({
    queryKey: checkoutQueryKeys.estadiaByCodigo(codigo),
    queryFn: () => estadiaService.getEstadiaByReservaCode(codigo),
    enabled: !!codigo && codigo.trim().length > 0,
    staleTime: 30 * 1000, // 30 segundos
    retry: 1,
    retryDelay: 1000,
  });
};