import React from 'react';
import type { Reservation } from '../../types';

export interface ReservationListFilters {
  query: string;
  status: Reservation['status'] | 'all';
  startDate?: string;
  endDate?: string;
}

interface ReservationsFiltersProps {
  filters: ReservationListFilters;
  onChange: (filters: ReservationListFilters) => void;
  onReset: () => void;
}

const statusOptions: Array<{ value: Reservation['status'] | 'all'; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'confirmed', label: 'Confirmadas' },
  { value: 'checked_in', label: 'En casa' },
  { value: 'checked_out', label: 'Finalizadas' },
  { value: 'cancelled', label: 'Canceladas' },
  { value: 'no_show', label: 'No show' },
];

export const ReservationsFilters: React.FC<ReservationsFiltersProps> = ({ filters, onChange, onReset }) => {
  const handleFieldChange = (field: keyof ReservationListFilters, value: string) => {
    const updated: ReservationListFilters = {
      ...filters,
      [field]: value,
    };

    if (field === 'startDate' && filters.endDate && value && filters.endDate < value) {
      updated.endDate = value;
    }

    if (field === 'endDate' && filters.startDate && value && value < filters.startDate) {
      updated.startDate = value;
    }

    onChange(updated);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
      {/* Campo de búsqueda - Ocupa más espacio */}
      <div className="md:col-span-5">
        <label htmlFor="reservation-search" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600">
          Buscar
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            id="reservation-search"
            type="text"
            value={filters.query}
            onChange={(event) => handleFieldChange('query', event.target.value)}
            placeholder="Huésped, correo, confirmación..."
            className="block w-full h-10 rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-colors"
          />
        </div>
        <p className="mt-1.5 text-xs text-slate-500">
          Filtra por nombre, correo, número de confirmación o notas.
        </p>
      </div>

      {/* Estado */}
      <div className="md:col-span-2">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600" htmlFor="reservation-status">
          Estado
        </label>
        <select
          id="reservation-status"
          value={filters.status}
          onChange={(event) => handleFieldChange('status', event.target.value)}
          className="block w-full h-10 rounded-lg border border-slate-300 py-2 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-colors"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Desde */}
      <div className="md:col-span-2">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600" htmlFor="reservation-start">
          Desde
        </label>
        <input
          id="reservation-start"
          type="date"
          value={filters.startDate ?? ''}
          max={filters.endDate ?? undefined}
          onChange={(event) => handleFieldChange('startDate', event.target.value)}
          className="block w-full h-10 rounded-lg border border-slate-300 py-2 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-colors"
        />
      </div>

      {/* Hasta */}
      <div className="md:col-span-2">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600" htmlFor="reservation-end">
          Hasta
        </label>
        <input
          id="reservation-end"
          type="date"
          value={filters.endDate ?? ''}
          min={filters.startDate ?? undefined}
          onChange={(event) => handleFieldChange('endDate', event.target.value)}
          className="block w-full h-10 rounded-lg border border-slate-300 py-2 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-colors"
        />
      </div>

      {/* Botón limpiar */}
      <div className="md:col-span-1">
        <button
          type="button"
          onClick={onReset}
          className="w-full h-10 rounded-lg bg-slate-100 hover:bg-slate-200 px-4 text-sm font-medium text-slate-700 transition-colors shadow-sm"
          title="Limpiar filtros"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
};

export default ReservationsFilters;
