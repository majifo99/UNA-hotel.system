import { useState, useCallback, useEffect } from 'react';
import { folioService, type HistorialItem, type HistorialResponse } from '../services/folioService';

type TipoEvento = 'pago' | 'distribucion' | 'cierre' | null;

interface UseFolioHistorialParams {
  folioId: number;
  autoLoad?: boolean;
  onError?: (error: any) => void;
}

export function useFolioHistorial({ folioId, autoLoad = true, onError }: UseFolioHistorialParams) {
  const [eventos, setEventos] = useState<HistorialItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<TipoEvento>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const cargarHistorial = useCallback(async (
    reset = false,
    tipo?: TipoEvento,
    pageNumber?: number
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const pageToLoad = pageNumber || (reset ? 1 : page);
      const tipoFiltro = tipo !== undefined ? tipo : filtroTipo;
      
      const data: HistorialResponse = await folioService.getHistorial(
        folioId, 
        tipoFiltro || undefined, 
        pageToLoad, 
        20
      );
      
      if (reset || pageNumber === 1) {
        setEventos(data.data || []);
        setPage(2);
      } else {
        setEventos(prev => [...prev, ...(data.data || [])]);
        setPage(prev => prev + 1);
      }
      
      setHasMore(data.current_page < data.last_page);
      setTotal(data.total || 0);
      
      return data;
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al cargar el historial';
      setError(errorMessage);
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [folioId, filtroTipo, page, onError]);

  const cargarMas = useCallback(() => {
    if (!loading && hasMore) {
      return cargarHistorial(false);
    }
  }, [loading, hasMore, cargarHistorial]);

  const filtrarPorTipo = useCallback((tipo: TipoEvento) => {
    setFiltroTipo(tipo);
    setPage(1);
    return cargarHistorial(true, tipo, 1);
  }, [cargarHistorial]);

  const refrescar = useCallback(() => {
    setPage(1);
    return cargarHistorial(true, filtroTipo, 1);
  }, [cargarHistorial, filtroTipo]);

  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    if (autoLoad && folioId) {
      cargarHistorial(true);
    }
  }, [folioId, autoLoad]); // Solo dependemos de folioId y autoLoad, no de cargarHistorial para evitar loops

  // Recargar cuando cambia el filtro
  useEffect(() => {
    if (folioId) {
      cargarHistorial(true);
    }
  }, [filtroTipo]); // Solo dependemos del filtro, no de cargarHistorial para evitar loops

  return {
    eventos,
    loading,
    error,
    filtroTipo,
    page,
    hasMore,
    total,
    cargarHistorial,
    cargarMas,
    filtrarPorTipo,
    refrescar,
    limpiarError
  };
}