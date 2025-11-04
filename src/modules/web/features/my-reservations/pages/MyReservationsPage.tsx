/**
 * MyReservationsPage
 * 
 * Página principal para que los clientes vean y gestionen sus reservas.
 * Integra todos los componentes y hooks para una experiencia completa.
 * 
 * Características:
 * - Lista de todas las reservas del cliente autenticado
 * - Filtrado por estado
 * - Búsqueda por código de confirmación
 * - Cancelación de reservas
 * - Responsive y accesible
 * 
 * @module pages/web
 */

import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { ReservationList } from '../components/ReservationList';
import { useMyReservations, useCancelReservation } from '../hooks/useMyReservations';
import type { ReservationStatus } from '../../../../reservations/types/enums';

export const MyReservationsPage: React.FC = () => {
  // Estado local
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'all'>('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Query para obtener reservas
  const { data: reservations = [], isLoading, error } = useMyReservations({
    estado: statusFilter === 'all' ? undefined : statusFilter,
  });

  // Mutation para cancelar reservas
  const cancelReservation = useCancelReservation();

  // Filtrar reservas por búsqueda
  const filteredReservations = React.useMemo(() => {
    if (!searchQuery.trim()) return reservations;

    const query = searchQuery.toLowerCase();
    return reservations.filter((reservation) => {
      const confirmationNumber = reservation.confirmationNumber?.toLowerCase() || '';
      const guestFirstName = reservation.guest?.firstName?.toLowerCase() || '';
      const guestLastName = reservation.guest?.firstLastName?.toLowerCase() || '';
      const guestFullName = `${guestFirstName} ${guestLastName}`.trim();
      const roomType = reservation.roomType?.toLowerCase() || '';

      return (
        confirmationNumber.includes(query) ||
        guestFullName.includes(query) ||
        roomType.includes(query)
      );
    });
  }, [reservations, searchQuery]);

  // Handler para cancelar reserva
  const handleCancelReservation = React.useCallback(
    async (id: string) => {
      const reservation = reservations.find((r) => r.id === id);
      if (!reservation) return;

      // Confirmación del usuario
      const confirmed = globalThis.confirm(
        `¿Estás seguro de que deseas cancelar la reserva ${reservation.confirmationNumber}?\n\nEsta acción no se puede deshacer.`
      );

      if (!confirmed) return;

      try {
        setCancellingId(id);
        await cancelReservation.mutateAsync({ id });
        // Toast de éxito se muestra automáticamente por el hook
      } catch (err) {
        // Toast de error se muestra automáticamente por el hook
        console.error('Error al cancelar reserva:', err);
      } finally {
        setCancellingId(null);
      }
    },
    [reservations, cancelReservation]
  );

  // Opciones de filtro por estado
  const statusOptions: Array<{ value: ReservationStatus | 'all'; label: string }> = [
    { value: 'all', label: 'Todas' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'confirmed', label: 'Confirmadas' },
    { value: 'checked_in', label: 'Check-in' },
    { value: 'checked_out', label: 'Finalizadas' },
    { value: 'cancelled', label: 'Canceladas' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">Mis Reservas</h1>
          <p className="text-neutral-600 text-lg">
            Gestiona tus reservas y consulta el estado de tus estadías
          </p>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-lg shadow-md border border-neutral-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <label htmlFor="search" className="block text-sm font-medium text-neutral-700 mb-2">
                Buscar reserva
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="search"
                  type="text"
                  placeholder="Código, huésped o habitación..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    aria-label="Limpiar búsqueda"
                  >
                    <X className="h-5 w-5 text-neutral-400 hover:text-neutral-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Filtro por estado */}
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-neutral-700 mb-2">
                Filtrar por estado
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-neutral-400" />
                </div>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as ReservationStatus | 'all')}
                  className="block w-full pl-10 pr-3 py-2.5 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white transition-colors"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Resultados activos */}
          {(searchQuery || statusFilter !== 'all') && (
            <div className="mt-4 flex items-center justify-between border-t border-neutral-200 pt-4">
              <p className="text-sm text-neutral-600">
                {filteredReservations.length} {filteredReservations.length === 1 ? 'resultado' : 'resultados'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* Lista de reservas */}
        <ReservationList
          reservations={filteredReservations}
          isLoading={isLoading}
          error={error}
          onCancel={handleCancelReservation}
          isCancelling={cancellingId || undefined}
        />
      </div>
    </div>
  );
};
