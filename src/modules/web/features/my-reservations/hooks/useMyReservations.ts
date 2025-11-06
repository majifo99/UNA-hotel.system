/**
 * Hook para gestión de reservas web (clientes)
 * 
 * Custom hook que encapsula toda la lógica de gestión de reservas
 * para clientes usando React Query.
 * 
 * Características:
 * - Lista solo las reservas del cliente autenticado
 * - Cache y revalidación automática
 * - Manejo de estados de carga y error
 * - Filtros por estado y fechas
 * - Métodos para crear, actualizar y cancelar
 * 
 * @module hooks/web
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationWebService } from '../../../../reservations/services/web/ReservationWebService';
import type { 
  CreateReservaWebDto, 
  UpdateReservaWebDto, 
  CancelReservaWebDto,
  ReservaWebFilters 
} from '../../../../reservations/types/web';
import type { Reservation } from '../../../../reservations/types/entities';
import { toast } from 'sonner';

/**
 * Query keys para React Query
 */
const QUERY_KEYS = {
  myReservations: (filters?: ReservaWebFilters) => 
    ['reservations', 'web', 'my', filters] as const,
  myReservation: (id: string) => 
    ['reservations', 'web', 'my', id] as const,
};

/**
 * Hook para listar mis reservas
 * 
 * @param filters - Filtros opcionales (estado, fechas)
 * @returns Query result con lista de reservas
 * 
 * @example
 * ```tsx
 * function MyReservationsPage() {
 *   const { data: reservations, isLoading, error } = useMyReservations();
 *   
 *   if (isLoading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage error={error} />;
 *   
 *   return <ReservationList reservations={reservations} />;
 * }
 * ```
 */
export function useMyReservations(filters?: ReservaWebFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.myReservations(filters),
    queryFn: () => reservationWebService.getAll(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook para obtener detalle de una reserva
 * 
 * @param id - ID de la reserva
 * @param enabled - Si debe ejecutar la query
 * @returns Query result con detalle de reserva
 * 
 * @example
 * ```tsx
 * function ReservationDetail({ id }: { id: string }) {
 *   const { data: reservation, isLoading } = useMyReservation(id);
 *   
 *   if (isLoading) return <LoadingSkeleton />;
 *   if (!reservation) return <NotFound />;
 *   
 *   return <ReservationCard reservation={reservation} />;
 * }
 * ```
 */
export function useMyReservation(id: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.myReservation(id),
    queryFn: () => reservationWebService.getById(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

/**
 * Hook para crear una nueva reserva
 * 
 * @returns Mutation para crear reserva
 * 
 * @example
 * ```tsx
 * function CreateReservationForm() {
 *   const createReservation = useCreateReservation();
 *   
 *   const handleSubmit = (data) => {
 *     createReservation.mutate(data, {
 *       onSuccess: (reservation) => {
 *         toast.success(`Reserva ${reservation.confirmationNumber} creada`);
 *         navigate('/mis-reservas');
 *       }
 *     });
 *   };
 *   
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */
export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReservaWebDto) => reservationWebService.create(data),
    onSuccess: (newReservation: Reservation) => {
      // Invalidar cache de lista de reservas
      queryClient.invalidateQueries({ 
        queryKey: ['reservations', 'web', 'my'] 
      });

      toast.success(
        `Reserva ${newReservation.confirmationNumber || newReservation.id} creada exitosamente`,
        { duration: 5000 }
      );

      console.log('[useMyReservations] Reservation created:', newReservation);
    },
    onError: (error: Error) => {
      toast.error(
        error.message || 'Error al crear la reserva',
        { duration: 5000 }
      );

      console.error('[useMyReservations] Error creating reservation:', error);
    },
  });
}

/**
 * Hook para actualizar una reserva
 * 
 * @returns Mutation para actualizar reserva
 * 
 * @example
 * ```tsx
 * function EditReservationForm({ reservationId }: { reservationId: string }) {
 *   const updateReservation = useUpdateReservation();
 *   
 *   const handleSubmit = (updates) => {
 *     updateReservation.mutate(
 *       { id: reservationId, updates },
 *       {
 *         onSuccess: () => {
 *           toast.success('Reserva actualizada');
 *           navigate(`/mis-reservas/${reservationId}`);
 *         }
 *       }
 *     );
 *   };
 *   
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */
export function useUpdateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateReservaWebDto }) =>
      reservationWebService.update(id, updates),
    onSuccess: (updatedReservation, variables) => {
      // Invalidar cache de lista de reservas
      queryClient.invalidateQueries({ 
        queryKey: ['reservations', 'web', 'my'] 
      });

      // Invalidar cache de reserva específica
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.myReservation(variables.id) 
      });

      toast.success('Reserva actualizada exitosamente', { duration: 5000 });

      console.log('[useMyReservations] Reservation updated:', updatedReservation);
    },
    onError: (error: Error) => {
      toast.error(
        error.message || 'Error al actualizar la reserva',
        { duration: 5000 }
      );

      console.error('[useMyReservations] Error updating reservation:', error);
    },
  });
}

/**
 * Hook para cancelar una reserva
 * 
 * @returns Mutation para cancelar reserva
 * 
 * @example
 * ```tsx
 * function CancelReservationButton({ reservationId }: { reservationId: string }) {
 *   const cancelReservation = useCancelReservation();
 *   
 *   const handleCancel = () => {
 *     if (confirm('¿Estás seguro de cancelar esta reserva?')) {
 *       cancelReservation.mutate(
 *         { id: reservationId, data: { notas: 'Cancelación por el cliente' } },
 *         {
 *           onSuccess: () => {
 *             toast.success('Reserva cancelada');
 *             navigate('/mis-reservas');
 *           }
 *         }
 *       );
 *     }
 *   };
 *   
 *   return <button onClick={handleCancel}>Cancelar Reserva</button>;
 * }
 * ```
 */
export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: CancelReservaWebDto }) =>
      reservationWebService.cancel(id, data),
    onSuccess: (canceledReservation, variables) => {
      // Invalidar cache de lista de reservas
      queryClient.invalidateQueries({ 
        queryKey: ['reservations', 'web', 'my'] 
      });

      // Invalidar cache de reserva específica
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.myReservation(variables.id) 
      });

      toast.success('Reserva cancelada exitosamente', { duration: 5000 });

      console.log('[useMyReservations] Reservation canceled:', canceledReservation);
    },
    onError: (error: Error) => {
      toast.error(
        error.message || 'Error al cancelar la reserva',
        { duration: 5000 }
      );

      console.error('[useMyReservations] Error canceling reservation:', error);
    },
  });
}
