/**
 * Hook personalizado para agregar cargos a un folio
 * 
 * Utiliza React Query para manejar el estado de la mutación,
 * proporcionando estados de loading, error y success.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { folioService } from '../services/folioService';
import type { CargoPayload, CargoResponse, FolioApiResponse } from '../types/folio.types';

/**
 * Opciones del hook
 */
interface UseAgregarCargoOptions {
  /**
   * Callback ejecutado cuando el cargo se agrega exitosamente
   */
  onSuccess?: (data: FolioApiResponse<CargoResponse>) => void;
  
  /**
   * Callback ejecutado cuando ocurre un error
   */
  onError?: (error: Error) => void;
  
  /**
   * Si true, invalida automáticamente las queries relacionadas con el folio
   * @default true
   */
  invalidateQueries?: boolean;
}

/**
 * Tipo de retorno del hook
 */
interface UseAgregarCargoReturn {
  /**
   * Función para agregar un cargo al folio
   */
  agregarCargo: (folioId: number, data: CargoPayload) => Promise<FolioApiResponse<CargoResponse>>;
  
  /**
   * Estado de carga de la mutación
   */
  isLoading: boolean;
  
  /**
   * Indica si la mutación fue exitosa
   */
  isSuccess: boolean;
  
  /**
   * Indica si hubo un error en la mutación
   */
  isError: boolean;
  
  /**
   * Error de la mutación (si existe)
   */
  error: Error | null;
  
  /**
   * Datos de la respuesta (si existe)
   */
  data: FolioApiResponse<CargoResponse> | undefined;
  
  /**
   * Resetea el estado de la mutación
   */
  reset: () => void;
}

/**
 * Hook para agregar cargos a un folio con React Query
 * 
 * @example
 * ```tsx
 * const { agregarCargo, isLoading, isSuccess, error } = useAgregarCargo({
 *   onSuccess: () => {
 *     toast.success('Cargo agregado exitosamente');
 *   },
 *   onError: (err) => {
 *     toast.error(`Error: ${err.message}`);
 *   }
 * });
 * 
 * // Agregar un cargo
 * await agregarCargo(folioId, {
 *   monto: 50.00,
 *   descripcion: 'Cargo por late checkout',
 *   cliente_id: null // Cargo general
 * });
 * ```
 */
export const useAgregarCargo = (
  options: UseAgregarCargoOptions = {}
): UseAgregarCargoReturn => {
  const queryClient = useQueryClient();
  
  const {
    onSuccess,
    onError,
    invalidateQueries = true
  } = options;

  const mutation = useMutation({
    mutationFn: async ({ 
      folioId, 
      data 
    }: { 
      folioId: number; 
      data: CargoPayload;
    }) => {
      return await folioService.postCargo(folioId, data);
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas con el folio si está habilitado
      if (invalidateQueries) {
        // Invalidar resumen del folio
        queryClient.invalidateQueries({ 
          queryKey: ['folio', 'resumen', variables.folioId] 
        });
        
        // Invalidar historial del folio
        queryClient.invalidateQueries({ 
          queryKey: ['folio', 'historial', variables.folioId] 
        });
        
        // Invalidar lista de cargos si existe
        queryClient.invalidateQueries({ 
          queryKey: ['folio', 'cargos', variables.folioId] 
        });
      }
      
      // Ejecutar callback personalizado
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      // Ejecutar callback personalizado
      onError?.(error);
    }
  });

  return {
    agregarCargo: (folioId: number, data: CargoPayload) => 
      mutation.mutateAsync({ folioId, data }),
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset
  };
};

export default useAgregarCargo;
