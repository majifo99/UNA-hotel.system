import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Users, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGuests } from '../hooks';
import { ROUTES } from '../../../router/routes';
import type { Guest } from '../../../types/core';

interface PaginationInfo {
  currentPage: number;
  perPage: number;
  total: number;
  from: number;
  to: number;
  lastPage: number;
}

export const GuestsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const { guests, totalGuests, isSearching } = useGuests();

  // Filtrar huéspedes por término de búsqueda
  const filteredGuests = useMemo(() => guests.filter((guest: Guest) =>
    guest.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.firstLastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.secondLastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.documentNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  ), [guests, searchTerm]);

  // Paginación local
  const paginatedGuests = useMemo(() => {
    const startIndex = (currentPage - 1) * perPage;
    const endIndex = startIndex + perPage;
    return filteredGuests.slice(startIndex, endIndex);
  }, [filteredGuests, currentPage, perPage]);

  const pagination: PaginationInfo = useMemo(() => {
    const total = filteredGuests.length;
    const lastPage = Math.ceil(total / perPage);
    const from = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
    const to = Math.min(currentPage * perPage, total);

    return {
      currentPage,
      perPage,
      total,
      from,
      to,
      lastPage,
    };
  }, [filteredGuests.length, currentPage, perPage]);

  // Reset a página 1 cuando cambia el término de búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  const handleCreateGuest = () => {
    navigate(ROUTES.GUESTS.CREATE);
  };

  if (isSearching) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="text-blue-600" />
              Gestión de Huéspedes
            </h1>
            <p className="text-gray-600 mt-2">
              Administre la base de datos de huéspedes del hotel
            </p>
          </div>
          <button
            onClick={handleCreateGuest}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
          >
            <Plus size={20} />
            Agregar Huésped
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre, email o documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 flex items-center gap-2">
            <Filter size={20} />
            Filtros
          </button>
        </div>
        {filteredGuests.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Se encontraron <strong>{filteredGuests.length}</strong> huésped{filteredGuests.length === 1 ? '' : 'es'}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 font-medium">Total Huéspedes</p>
              <p className="text-2xl font-bold text-blue-900">{totalGuests}</p>
            </div>
            <Users className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 font-medium">Huéspedes Activos</p>
              <p className="text-2xl font-bold text-green-900">{filteredGuests.length}</p>
            </div>
            <Users className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 font-medium">Nuevos este mes</p>
              <p className="text-2xl font-bold text-purple-900">12</p>
            </div>
            <Plus className="text-purple-600" size={32} />
          </div>
        </div>
      </div>

      {/* Guests Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Lista de Huéspedes</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Huésped
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nacionalidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedGuests.length > 0 ? paginatedGuests.map((guest: Guest, index: number) => (
                <tr key={guest.id || `guest-${index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {guest.firstName} {guest.firstLastName} {guest.secondLastName || ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{guest.email}</div>
                    <div className="text-sm text-gray-500">{guest.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {guest.documentType.toUpperCase()}: {guest.documentNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{guest.nationality}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => guest.id && navigate(ROUTES.GUESTS.DETAIL(guest.id))}
                      className="text-blue-600 hover:underline"
                    >
                      Ver perfil
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? 'No se encontraron huéspedes con ese criterio' : 'No hay huéspedes registrados'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {filteredGuests.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 bg-gray-50 px-6 py-4 sm:flex-row">
            {/* Info de rango */}
            <div className="text-sm text-gray-600">
              Mostrando <span className="font-medium">{pagination.from}</span> a <span className="font-medium">{pagination.to}</span> de{' '}
              <span className="font-medium">{pagination.total}</span> resultados
            </div>

            {/* Controles */}
            <div className="flex items-center gap-4">
              {/* Selector de elementos por página */}
              <div className="flex items-center gap-2">
                <label htmlFor="per-page-select" className="text-sm text-gray-600">
                  Por página:
                </label>
                <select
                  id="per-page-select"
                  value={perPage}
                  onChange={(e) => handlePerPageChange(Number.parseInt(e.target.value, 10))}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Navegación de páginas */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Página anterior"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <span className="text-sm font-medium text-gray-700">
                  Página {currentPage} de {pagination.lastPage}
                </span>

                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= pagination.lastPage}
                  className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Página siguiente"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
