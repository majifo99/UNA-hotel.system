/**
 * ReservationList Component
 * 
 * Componente que muestra una lista de reservas en formato de grid responsivo.
 * Maneja estados de loading y empty state automáticamente.
 * 
 * Características:
 * - Grid responsivo (1 col móvil, 2 cols tablet, 3 cols desktop)
 * - Integración con estados de loading y vacío
 * - Paginación cuando hay muchas reservas
 * - Acciones delegadas al componente padre
 * 
 * @module components/web
 */

import React from 'react';
import { ReservationCard } from './ReservationCard';
import { EmptyState } from './EmptyState';
import { LoadingState } from './LoadingState';
import type { Reservation } from '../../../../reservations/types/entities';

export interface ReservationListProps {
  readonly reservations: Reservation[];
  readonly isLoading?: boolean;
  readonly error?: Error | null;
  readonly onCancel?: (id: string) => void;
  readonly isCancelling?: string; // ID de la reserva que se está cancelando
}

export const ReservationList: React.FC<ReservationListProps> = ({
  reservations,
  isLoading = false,
  error = null,
  onCancel,
  isCancelling
}) => {
  // Estado de carga
  if (isLoading) {
    return <LoadingState />;
  }

  // Estado de error
  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <svg
            className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1">
            <h3 className="text-rose-900 font-semibold text-lg">Error al cargar reservas</h3>
            <p className="text-rose-700 mt-1">{error.message}</p>
            <button
              type="button"
              onClick={() => globalThis.location.reload()}
              className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-rose-700 bg-white border border-rose-300 rounded-md hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
            >
              Intentar nuevamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Estado vacío
  if (reservations.length === 0) {
    return <EmptyState />;
  }

  // Lista de reservas
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Mis Reservas</h2>
          <p className="text-neutral-600 mt-1">
            {reservations.length} {reservations.length === 1 ? 'reserva encontrada' : 'reservas encontradas'}
          </p>
        </div>
      </div>

      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {reservations.map((reservation) => (
          <ReservationCard
            key={reservation.id}
            reservation={reservation}
            onCancel={onCancel}
            isLoading={isCancelling === reservation.id}
          />
        ))}
      </div>
    </div>
  );
};
