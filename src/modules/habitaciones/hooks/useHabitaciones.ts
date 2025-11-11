// src/modules/habitaciones/hooks/useHabitaciones.ts
/**
 * Hook para gestión de habitaciones
 * Usa TanStack Query para cache, retries automáticos y mejor performance
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchHabitaciones,
  fetchTiposHabitacion,
  fetchEstadosHabitacion,
  checkDisponibilidad,
  createHabitacion,
  updateHabitacion,
  changeEstadoHabitacion,
} from '../services/habitacionService';
import type { HabitacionFormData } from '../components/HabitacionForm';

interface UseHabitacionesOptions {
  perPage?: number;
  estado?: number;
  tipo?: number;
  enabled?: boolean;
}

/**
 * Hook con TanStack Query para cargar habitaciones
 * - Cache automático de 5 minutos
 * - Reintentos automáticos en caso de error
 * - Revalidación en background
 */
export function useHabitaciones(options: UseHabitacionesOptions = {}) {
  const { perPage = 100, estado, tipo, enabled = true } = options;

  const query = useQuery({
    queryKey: ['habitaciones', { perPage, estado, tipo }],
    queryFn: async () => {
      const response = await fetchHabitaciones({
        page: 1,
        per_page: perPage,
        estado,
        tipo,
      });
      return response;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos - datos frescos
    gcTime: 10 * 60 * 1000, // 10 minutos - en caché
    retry: 3, // Reintentar 3 veces
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Backoff exponencial
  });

  return {
    habitaciones: query.data?.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    total: query.data?.total || 0,
    totalPages: query.data?.last_page || 1,
    currentPage: query.data?.current_page || 1,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  };
}

// ============================================
// Hook para catálogos con TanStack Query
// ============================================

interface UseCatalogosOptions {
  enabled?: boolean;
}

/**
 * Hook para cargar tipos y estados de habitación
 * - Cache agresivo (30 minutos) porque no cambian frecuentemente
 * - Reintentos automáticos
 */
export function useCatalogos(options: UseCatalogosOptions = {}) {
  const { enabled = true } = options;

  // Query para tipos de habitación
  const tiposQuery = useQuery({
    queryKey: ['tipos-habitacion'],
    queryFn: fetchTiposHabitacion,
    enabled,
    staleTime: 30 * 60 * 1000, // 30 minutos - los tipos casi nunca cambian
    gcTime: 60 * 60 * 1000, // 1 hora en caché
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Query para estados de habitación
  const estadosQuery = useQuery({
    queryKey: ['estados-habitacion'],
    queryFn: fetchEstadosHabitacion,
    enabled,
    staleTime: 30 * 60 * 1000, // 30 minutos - los estados casi nunca cambian
    gcTime: 60 * 60 * 1000, // 1 hora en caché
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    tipos: tiposQuery.data || [],
    estados: estadosQuery.data || [],
    loading: tiposQuery.isLoading || estadosQuery.isLoading,
    error: tiposQuery.error?.message || estadosQuery.error?.message || null,
    loaded: tiposQuery.isSuccess && estadosQuery.isSuccess,
    refetch: () => {
      tiposQuery.refetch();
      estadosQuery.refetch();
    },
  };
}

// ============================================
// Hook para disponibilidad con TanStack Query
// ============================================

interface UseDisponibilidadOptions {
  desde?: string;
  hasta?: string;
  tipo?: number;
  enabled?: boolean;
}

/**
 * Hook para consultar disponibilidad de habitaciones
 * Solo se ejecuta cuando las fechas están completas
 */
export function useDisponibilidad(options: UseDisponibilidadOptions = {}) {
  const { desde, hasta, tipo, enabled = true } = options;

  // Solo ejecutar query si tenemos ambas fechas
  const shouldFetch = enabled && !!desde && !!hasta;

  const query = useQuery({
    queryKey: ['disponibilidad', { desde, hasta, tipo }],
    queryFn: async () => {
      if (!desde || !hasta) {
        throw new Error('Fechas requeridas');
      }
      return checkDisponibilidad({ desde, hasta, tipo });
    },
    enabled: shouldFetch,
    staleTime: 2 * 60 * 1000, // 2 minutos - disponibilidad cambia más frecuentemente
    gcTime: 5 * 60 * 1000, // 5 minutos en caché
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  return {
    habitaciones: query.data?.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    total: query.data?.total || 0,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  };
}

// ============================================
// Mutations para crear, actualizar y cambiar estado
// ============================================

/**
 * Hook para crear una nueva habitación
 * Invalida automáticamente el cache de habitaciones al completar
 */
export function useCreateHabitacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: HabitacionFormData) => createHabitacion(data),
    onSuccess: () => {
      // Invalidar y refrescar lista de habitaciones
      queryClient.invalidateQueries({ queryKey: ['habitaciones'] });
    },
  });
}

/**
 * Hook para actualizar una habitación existente
 * Invalida automáticamente el cache al completar
 */
export function useUpdateHabitacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: HabitacionFormData }) =>
      updateHabitacion(id, data),
    onSuccess: () => {
      // Invalidar y refrescar lista de habitaciones
      queryClient.invalidateQueries({ queryKey: ['habitaciones'] });
    },
  });
}

/**
 * Hook para cambiar el estado de una habitación
 * Invalida automáticamente el cache al completar
 */
export function useChangeEstado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, idEstado }: { id: number; idEstado: number }) =>
      changeEstadoHabitacion(id, idEstado),
    onSuccess: () => {
      // Invalidar y refrescar lista de habitaciones
      queryClient.invalidateQueries({ queryKey: ['habitaciones'] });
    },
  });
}