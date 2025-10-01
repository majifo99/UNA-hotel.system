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
    <div className="flex flex-col gap-4 md:flex-row md:items-end">
      <div className="flex-1">
        <label htmlFor="reservation-search" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
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
            className="block w-full rounded-2xl border border-slate-200 py-2 pl-10 pr-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Filtra por nombre, correo, número de confirmación o notas.
        </p>
      </div>

      <div className="w-full md:w-40">
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="reservation-status">
          Estado
        </label>
        <select
          id="reservation-status"
          value={filters.status}
          onChange={(event) => handleFieldChange('status', event.target.value)}
          className="block w-full rounded-2xl border border-slate-200 py-2 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full md:w-44">
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="reservation-start">
          Desde
        </label>
        <input
          id="reservation-start"
          type="date"
          value={filters.startDate ?? ''}
          max={filters.endDate ?? undefined}
          onChange={(event) => handleFieldChange('startDate', event.target.value)}
          className="block w-full rounded-2xl border border-slate-200 py-2 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        />
      </div>

      <div className="w-full md:w-44">
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="reservation-end">
          Hasta
        </label>
        <input
          id="reservation-end"
          type="date"
          value={filters.endDate ?? ''}
          min={filters.startDate ?? undefined}
          onChange={(event) => handleFieldChange('endDate', event.target.value)}
          className="block w-full rounded-2xl border border-slate-200 py-2 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onReset}
          className="h-10 rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
};

export default ReservationsFilters;
