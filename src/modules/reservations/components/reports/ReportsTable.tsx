/**
 * Reports Table Component
 * 
 * Displays detailed reservation data in table format with pagination and sorting
 */

import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { ReservationReportRow } from '../../types/reports';
import { ReservationStatusBadge } from '../ReservationStatusBadge';

export interface ReportsTableProps {
  readonly data: readonly ReservationReportRow[];
  readonly isLoading?: boolean;
}

type SortKey = 'checkInDate' | 'checkOutDate' | 'totalAmount' | 'nights';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

const ITEMS_PER_PAGE = 10;

const currencyFormatter = new Intl.NumberFormat('es-CR', {
  style: 'currency',
  currency: 'CRC',
  maximumFractionDigits: 0,
});

export const ReportsTable: React.FC<ReportsTableProps> = ({
  data,
  isLoading = false
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  // Sort data
  const sortedData = useMemo(() => {
    if (!data || !sortConfig) return data || [];
    
    const sorted = [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      // Handle date strings
      if (sortConfig.key === 'checkInDate' || sortConfig.key === 'checkOutDate') {
        const aDate = new Date(aValue as string).getTime();
        const bDate = new Date(bValue as string).getTime();
        return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
      }
      
      // Handle numbers
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });
    
    return sorted;
  }, [data, sortConfig]);

  // Calculate pagination
  const totalPages = Math.ceil((sortedData?.length || 0) / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    if (!sortedData) return [];
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage]);

  // Reset to page 1 when data changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSort = (key: SortKey) => {
    setSortConfig((prevConfig) => {
      if (prevConfig?.key === key) {
        // Toggle direction
        return {
          key,
          direction: prevConfig.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      // New sort key, default to descending
      return { key, direction: 'desc' };
    });
    // Reset to first page when sorting changes
    setCurrentPage(1);
  };

  const getSortIcon = (key: SortKey) => {
    if (sortConfig?.key !== key) {
      return null;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="inline-block w-4 h-4 ml-1" />
    ) : (
      <ChevronDown className="inline-block w-4 h-4 ml-1" />
    );
  };
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-neutral-200 rounded w-1/4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={`skeleton-${i + 1}`} className="h-12 bg-neutral-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <p className="text-neutral-500 text-lg">
          No hay datos disponibles para este rango
        </p>
        <p className="text-neutral-400 text-sm mt-2">
          Intenta ajustar los filtros para ver resultados
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900">
          Detalle de Reservaciones
        </h3>
        <p className="text-sm text-neutral-500 mt-1">
          {data.length} registro{data.length === 1 ? '' : 's'} encontrado{data.length === 1 ? '' : 's'}
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Confirmación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Huésped
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Habitación
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer select-none hover:bg-neutral-100 transition-colors"
                onClick={() => handleSort('checkInDate')}
              >
                Check-in {getSortIcon('checkInDate')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer select-none hover:bg-neutral-100 transition-colors"
                onClick={() => handleSort('checkOutDate')}
              >
                Check-out {getSortIcon('checkOutDate')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer select-none hover:bg-neutral-100 transition-colors"
                onClick={() => handleSort('nights')}
              >
                Noches {getSortIcon('nights')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Estado
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer select-none hover:bg-neutral-100 transition-colors"
                onClick={() => handleSort('totalAmount')}
              >
                Total {getSortIcon('totalAmount')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {paginatedData.map((row) => (
              <tr key={row.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                  {row.confirmationNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                  {row.guestName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                  {row.roomType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                  {new Date(row.checkInDate).toLocaleDateString('es-CR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                  {new Date(row.checkOutDate).toLocaleDateString('es-CR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                  {row.nights}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <ReservationStatusBadge status={row.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-neutral-900">
                  {currencyFormatter.format(row.totalAmount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-neutral-700">
                Mostrando <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> a{' '}
                <span className="font-medium">
                  {Math.min(currentPage * ITEMS_PER_PAGE, data.length)}
                </span>{' '}
                de <span className="font-medium">{data.length}</span> resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-neutral-300 bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Anterior</span>‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => {
                  const page = i + 1;
                  // Show first, last, current, and neighbors
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-[#1A3636] border-[#1A3636] text-white'
                            : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="relative inline-flex items-center px-4 py-2 border border-neutral-300 bg-white text-sm font-medium text-neutral-700">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-neutral-300 bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Siguiente</span>›
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
