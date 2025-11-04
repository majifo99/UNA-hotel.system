/**
 * LoadingState Component
 * 
 * Componente skeleton loader que muestra un estado de carga
 * mientras se obtienen las reservas del servidor.
 * 
 * Características:
 * - Animación pulsante suave
 * - Replica estructura de ReservationCard
 * - Grid responsivo (1-3 columnas)
 * - Accesible (aria-label para lectores de pantalla)
 * 
 * @module components/web
 */

import React from 'react';

export interface LoadingStateProps {
  readonly count?: number; // Número de skeletons a mostrar
}

/**
 * Skeleton individual de una tarjeta de reserva
 */
const ReservationCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-md border border-neutral-200 overflow-hidden animate-pulse">
    {/* Header skeleton */}
    <div className="bg-neutral-200 px-6 py-4 h-24"></div>

    {/* Content skeleton */}
    <div className="p-6 space-y-4">
      {/* Fechas */}
      <div className="flex items-start space-x-3">
        <div className="w-5 h-5 bg-neutral-200 rounded flex-shrink-0"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-neutral-200 rounded w-1/3"></div>
          <div className="h-5 bg-neutral-200 rounded w-3/4"></div>
          <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
        </div>
      </div>

      {/* Habitación */}
      <div className="flex items-start space-x-3">
        <div className="w-5 h-5 bg-neutral-200 rounded flex-shrink-0"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
          <div className="h-5 bg-neutral-200 rounded w-1/2"></div>
          <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
        </div>
      </div>

      {/* Huéspedes */}
      <div className="flex items-start space-x-3">
        <div className="w-5 h-5 bg-neutral-200 rounded flex-shrink-0"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-neutral-200 rounded w-1/3"></div>
          <div className="h-5 bg-neutral-200 rounded w-2/3"></div>
        </div>
      </div>

      {/* Precio */}
      <div className="flex items-start space-x-3 pt-4 border-t border-neutral-200">
        <div className="w-5 h-5 bg-neutral-200 rounded flex-shrink-0"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
          <div className="h-8 bg-neutral-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>

    {/* Actions skeleton */}
    <div className="bg-neutral-50 px-6 py-4 flex items-center justify-end space-x-3 border-t border-neutral-200">
      <div className="h-10 bg-neutral-200 rounded w-24"></div>
      <div className="h-10 bg-neutral-200 rounded w-28"></div>
      <div className="h-10 bg-neutral-200 rounded w-24"></div>
    </div>
  </div>
);

export const LoadingState: React.FC<LoadingStateProps> = ({ count = 6 }) => {
  // Generar IDs únicos para keys
  const skeletonIds = React.useMemo(
    () => Array.from({ length: count }, (_, i) => `skeleton-${Date.now()}-${i}`),
    [count]
  );

  return (
    <div className="space-y-6" aria-live="polite" aria-busy="true">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 bg-neutral-200 rounded w-48 animate-pulse"></div>
        <div className="h-5 bg-neutral-200 rounded w-36 animate-pulse"></div>
      </div>

      {/* Grid de skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {skeletonIds.map((id) => (
          <ReservationCardSkeleton key={id} />
        ))}
      </div>

      {/* Texto accesible para lectores de pantalla */}
      <span className="sr-only">Cargando sus reservas...</span>
    </div>
  );
};
