import { useState, useCallback } from 'react';
import { folioService } from '../services/folioService';

interface UseFolioCierreParams {
  folioId: number;
  onError?: (error: any) => void;
  onSuccess?: (mensaje: string, data: any) => void;
}

export function useFolioCierre({ folioId, onError, onSuccess }: UseFolioCierreParams) {
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cerrado, setCerrado] = useState(false);

  const cerrarFolio = useCallback(async () => {
    try {
      setProcesando(true);
      setError(null);

      const resultado = await folioService.cerrarFolio(folioId);
      
      setCerrado(true);
      
      const mensaje = 'Folio cerrado exitosamente. Todos los cargos y saldos pendientes han sido reclasificados al titular.';
      
      if (onSuccess) {
        onSuccess(mensaje, resultado);
      }

      return resultado;
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al cerrar el folio';
      setError(errorMessage);
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setProcesando(false);
    }
  }, [folioId, onError, onSuccess]);

  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  const resetearEstado = useCallback(() => {
    setError(null);
    setCerrado(false);
  }, []);

  return {
    procesando,
    error,
    cerrado,
    cerrarFolio,
    limpiarError,
    resetearEstado
  };
}