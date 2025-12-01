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
  estadiaByWalkin: (codigo: string) => [...checkoutQueryKeys.estadia(), 'walkin', codigo] as const,
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

/**
 * Hook para obtener información de estadía por código de walk-in para checkout
 */
export const useEstadiaByWalkinCode = (codigo: string) => {
  return useQuery({
    queryKey: checkoutQueryKeys.estadiaByWalkin(codigo),
    queryFn: () => estadiaService.getEstadiaByWalkInCode(codigo),
    enabled: !!codigo && codigo.trim().length > 0 && codigo.startsWith('WI-'),
    staleTime: 30 * 1000, // 30 segundos
    retry: 1,
    retryDelay: 1000,
  });
};

/**
 * Hook inteligente que busca por cualquier tipo de código (reserva o walk-in)
 * Detecta automáticamente el tipo basándose en el formato del código
 */
export const useEstadiaByCode = (codigo: string) => {
  const isWalkin = codigo.startsWith('WI-');
  
  // Usar el hook apropiado según el tipo de código
  const reservaQuery = useEstadiaByReservaCode(!isWalkin ? codigo : '');
  const walkinQuery = useEstadiaByWalkinCode(isWalkin ? codigo : '');
  
  // Retornar el query activo
  return isWalkin ? walkinQuery : reservaQuery;
};