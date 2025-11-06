/**
 * Componente: TablePagination
 * 
 * Control de paginación completo con:
 * - Navegación entre páginas
 * - Selector de elementos por página
 * - Información de rango actual
 * - Estados disabled para navegación
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationInfo {
  currentPage: number;
  perPage: number;
  total: number;
  from: number;
  to: number;
  lastPage: number;
}

interface TablePaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  perPageOptions?: number[];
}

const DEFAULT_PER_PAGE_OPTIONS = [5, 10, 15, 20, 50];

export const TablePagination: React.FC<TablePaginationProps> = ({
  pagination,
  onPageChange,
  onPerPageChange,
  perPageOptions = DEFAULT_PER_PAGE_OPTIONS,
}) => {
  const { currentPage, perPage, total, from, to, lastPage } = pagination;

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < lastPage;

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row">
      {/* Info de rango */}
      <div className="text-sm text-slate-600">
        Mostrando <span className="font-medium">{from}</span> a <span className="font-medium">{to}</span> de{' '}
        <span className="font-medium">{total}</span> resultados
      </div>

      {/* Controles */}
      <div className="flex items-center gap-4">
        {/* Selector de elementos por página */}
        <div className="flex items-center gap-2">
          <label htmlFor="per-page-select" className="text-sm text-slate-600">
            Por página:
          </label>
          <select
            id="per-page-select"
            value={perPage}
            onChange={(e) => onPerPageChange(Number.parseInt(e.target.value, 10))}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          >
            {perPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Navegación de páginas */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!canGoPrevious}
            className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <span className="text-sm font-medium text-slate-700">
            Página {currentPage} de {lastPage}
          </span>

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!canGoNext}
            className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Página siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
