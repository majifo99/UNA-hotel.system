/**
 * Report Filters Component
 * 
 * Reusable filters for reservation reports
 */

import React from 'react';
import { Filter, X } from 'lucide-react';
import type { ReservationReportFilters } from '../../types/reports';
import type { ReservationStatus } from '../../types/enums/ReservationStatus';

export interface ReportFiltersProps {
  readonly filters: ReservationReportFilters;
  readonly onFiltersChange: (filters: ReservationReportFilters) => void;
  readonly onApply: () => void;
  readonly onClear: () => void;
}

const STATUS_OPTIONS: Array<{ value: ReservationStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'checked_in', label: 'Check-in' },
  { value: 'checked_out', label: 'Check-out' },
  { value: 'cancelled', label: 'Cancelada' },
  { value: 'no_show', label: 'No show' },
  { value: 'waiting', label: 'En espera' },
  { value: 'completed', label: 'Finalizada' },
];

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters,
  onFiltersChange,
  onApply,
  onClear
}) => {
  const handleChange = (field: keyof ReservationReportFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value || undefined
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-neutral-600" />
          <h2 className="text-lg font-semibold text-neutral-900">
            Filtros
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Fecha desde */}
        <div>
          <label 
            htmlFor="startDate" 
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            Fecha desde
          </label>
          <input
            type="date"
            id="startDate"
            value={filters.startDate || ''}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
          />
        </div>

        {/* Fecha hasta */}
        <div>
          <label 
            htmlFor="endDate" 
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            Fecha hasta
          </label>
          <input
            type="date"
            id="endDate"
            value={filters.endDate || ''}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
          />
        </div>

        {/* Estado */}
        <div>
          <label 
            htmlFor="status" 
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            Estado
          </label>
          <select
            id="status"
            value={filters.status || 'all'}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
          >
            {STATUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo de habitación */}
        <div>
          <label 
            htmlFor="roomType" 
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            Tipo de habitación
          </label>
          <input
            type="text"
            id="roomType"
            value={filters.roomType || ''}
            onChange={(e) => handleChange('roomType', e.target.value)}
            placeholder="Ej: Suite, Doble..."
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
          />
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex items-center justify-end space-x-3">
        <button
          type="button"
          onClick={onClear}
          className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 transition-colors flex items-center space-x-2"
        >
          <X className="w-4 h-4" />
          <span>Limpiar</span>
        </button>
        <button
          type="button"
          onClick={onApply}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 transition-colors flex items-center space-x-2"
        >
          <Filter className="w-4 h-4" />
          <span>Aplicar filtros</span>
        </button>
      </div>
    </div>
  );
};
