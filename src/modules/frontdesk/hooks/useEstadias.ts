/**
 * Hook personalizado para manejar estadías
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { estadiaService, type EstadiaListItem, type EstadiaFilters } from '../services/estadiaService';

export const useEstadias = (initialFilters?: EstadiaFilters) => {
  const [filters, setFilters] = useState<EstadiaFilters>(initialFilters || {
    fecha: new Date().toISOString().split('T')[0],
    estado: 'in_house',
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Query para obtener estadías
  const {
    data: estadias = [],
    isLoading,
    error,
    refetch,
  } = useQuery<EstadiaListItem[]>({
    queryKey: ['estadias', filters],
    queryFn: () => estadiaService.listEstadias(filters),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });

  // Filtrar estadías por término de búsqueda local
  const estadiasFiltradas = estadias.filter((estadia) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      estadia.codigo_referencia.toLowerCase().includes(searchLower) ||
      estadia.cliente.nombre_completo.toLowerCase().includes(searchLower) ||
      estadia.cliente.email?.toLowerCase().includes(searchLower) ||
      estadia.habitacion.numero.toLowerCase().includes(searchLower)
    );
  });

  // Actualizar filtros
  const updateFilters = useCallback((newFilters: Partial<EstadiaFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Cambiar fecha
  const setFecha = useCallback((fecha: string) => {
    updateFilters({ fecha });
  }, [updateFilters]);

  // Cambiar estado (in_house, arribos, salidas)
  const setEstado = useCallback((estado: 'in_house' | 'arribos' | 'salidas') => {
    updateFilters({ estado });
  }, [updateFilters]);

  // Actualizar búsqueda
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  // Invalidar y refrescar
  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['estadias'] });
    refetch();
  }, [queryClient, refetch]);

  // Estadísticas
  const stats = {
    total: estadiasFiltradas.length,
    inHouse: estadias.filter(e => e.tipo_estadia === 'in_house').length,
    arribos: estadias.filter(e => e.tipo_estadia === 'arribo').length,
    salidas: estadias.filter(e => e.tipo_estadia === 'salida').length,
    walkins: estadias.filter(e => e.origen === 'walkin').length,
    reservas: estadias.filter(e => e.origen === 'reserva').length,
  };

  // Error handling
  useEffect(() => {
    if (error) {
      toast.error('Error al cargar estadías', {
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }, [error]);

  return {
    // Datos
    estadias: estadiasFiltradas,
    allEstadias: estadias,
    isLoading,
    error,
    stats,
    
    // Filtros
    filters,
    updateFilters,
    setFecha,
    setEstado,
    
    // Búsqueda
    searchTerm,
    handleSearch,
    
    // Acciones
    refresh,
  };
};
