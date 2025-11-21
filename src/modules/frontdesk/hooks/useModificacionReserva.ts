import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import ModificacionReservaService from '../services/ModificacionReservaService';
import type {
  CambiarHabitacionRequest,
  CambiarHabitacionResponse,
  ModificarFechasRequest,
  ModificarFechasResponse,
  ReducirEstadiaRequest,
  ReducirEstadiaResponse,
} from '../services/ModificacionReservaService';

/**
 * Hook para manejar modificaciones de reservas
 */
export const useModificacionReserva = () => {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Mutation para cambiar habitación
  const cambiarHabitacionMutation = useMutation({
    mutationFn: ({ idReserva, data }: { idReserva: number | string; data: CambiarHabitacionRequest }) =>
      ModificacionReservaService.cambiarHabitacion(idReserva, data),
    onSuccess: (response) => {
      setError(null);
      
      // Mostrar información detallada del cambio
      toast.success('Cambio de habitación realizado exitosamente', {
        description: `De habitación #${response.habitacion_antigua.nombre} a #${response.habitacion_nueva.nombre}`,
        duration: 5000,
      });

      // Si hay diferencia de precio, mostrar info adicional
      if (response.tipo_ajuste !== 'sin_cambio') {
        const tipoMensaje = response.tipo_ajuste === 'cargo_adicional' ? '💰 Cargo adicional' : '💵 Reembolso';
        toast.info(`${tipoMensaje}: $${Math.abs(response.monto_ajuste).toFixed(2)}`, {
          duration: 5000,
        });
      }
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['checkIns'] });
    },
    onError: (err: unknown) => {
      console.error('Error al cambiar habitación:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cambiar habitación';
      setError(errorMessage);
      
      // Toast de error con mensaje específico del backend
      toast.error('Error al cambiar la habitación', {
        description: errorMessage,
        duration: 6000,
      });
    },
  });

  // Mutation para modificar fechas
  const modificarFechasMutation = useMutation({
    mutationFn: ({ idReserva, data }: { idReserva: number | string; data: ModificarFechasRequest }) =>
      ModificacionReservaService.modificarFechas(idReserva, data),
    onSuccess: () => {
      setError(null);
      toast.success('Fechas modificadas exitosamente');
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
    onError: (err: unknown) => {
      console.error('Error al modificar fechas:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al modificar fechas';
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
    },
  });

  // Mutation para reducir estadía
  const reducirEstadiaMutation = useMutation({
    mutationFn: ({ idReserva, data }: { idReserva: number | string; data: ReducirEstadiaRequest }) =>
      ModificacionReservaService.reducirEstadia(idReserva, data),
    onSuccess: () => {
      setError(null);
      toast.success('Estadía reducida exitosamente');
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
    onError: (err: unknown) => {
      console.error('Error al reducir estadía:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al reducir estadía';
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
    },
  });

  /**
   * Cambiar habitación de una reserva
   */
  const cambiarHabitacion = async (
    idReserva: number | string,
    idReservaHabitacion: number,
    idHabitacionNueva: number,
    motivo: string
  ): Promise<CambiarHabitacionResponse | null> => {
    try {
      const result = await cambiarHabitacionMutation.mutateAsync({
        idReserva,
        data: {
          id_reserva_habitacion: idReservaHabitacion,
          id_habitacion_nueva: idHabitacionNueva,
          motivo,
        },
      });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
      return null;
    }
  };

  /**
   * Modificar fechas de una reserva
   */
  const modificarFechas = async (
    idReserva: number | string,
    idReservaHabitacion: number,
    nuevaFechaLlegada?: string,
    nuevaFechaSalida?: string,
    aplicarPolitica: boolean = true
  ): Promise<ModificarFechasResponse | null> => {
    try {
      const result = await modificarFechasMutation.mutateAsync({
        idReserva,
        data: {
          id_reserva_habitacion: idReservaHabitacion,
          nueva_fecha_llegada: nuevaFechaLlegada,
          nueva_fecha_salida: nuevaFechaSalida,
          aplicar_politica: aplicarPolitica,
        },
      });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
      return null;
    }
  };

  /**
   * Reducir estadía (checkout anticipado)
   */
  const reducirEstadia = async (
    idReserva: number | string,
    idReservaHabitacion: number,
    nuevaFechaSalida: string,
    aplicarPolitica: boolean = true
  ): Promise<ReducirEstadiaResponse | null> => {
    try {
      const result = await reducirEstadiaMutation.mutateAsync({
        idReserva,
        data: {
          id_reserva_habitacion: idReservaHabitacion,
          nueva_fecha_salida: nuevaFechaSalida,
          aplicar_politica: aplicarPolitica,
        },
      });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
      return null;
    }
  };

  return {
    // Estados de carga
    isCambiandoHabitacion: cambiarHabitacionMutation.isPending,
    isModificandoFechas: modificarFechasMutation.isPending,
    isReduciendoEstadia: reducirEstadiaMutation.isPending,
    isLoading:
      cambiarHabitacionMutation.isPending ||
      modificarFechasMutation.isPending ||
      reducirEstadiaMutation.isPending,

    // Funciones
    cambiarHabitacion,
    modificarFechas,
    reducirEstadia,
    validarDisponibilidad: ModificacionReservaService.validarDisponibilidad,

    // Error handling
    error,
    clearError: () => setError(null),
  };
};

export default useModificacionReserva;
