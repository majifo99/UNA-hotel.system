/**
 * Componente para listar y gestionar estadías
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Search,
  Calendar,
  Users,
  Home,
  DoorOpen,
  DoorClosed,
  RefreshCw,
  FileText,
  Eye,
  Receipt,
  LogOut,
  X,
} from 'lucide-react';
import { useEstadias } from '../hooks/useEstadias';
import type { EstadiaListItem } from '../services/estadiaService';
import { ROUTES } from '../../../router/routes';

export const EstadiasList: React.FC = () => {
  const navigate = useNavigate();
  const {
    estadias,
    isLoading,
    stats,
    filters,
    setFecha,
    setEstado,
    searchTerm,
    handleSearch,
    refresh,
  } = useEstadias();

  const [selectedEstadia, setSelectedEstadia] = useState<EstadiaListItem | null>(null);
  const [origenFilter, setOrigenFilter] = useState<'todos' | 'walkin' | 'reserva'>('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Filtrar por origen
  const estadiasFiltradas = useMemo(() => {
    if (origenFilter === 'todos') return estadias;
    return estadias.filter(e => e.origen === origenFilter);
  }, [estadias, origenFilter]);

  // Paginación
  const paginatedEstadias = useMemo(() => {
    const startIndex = (currentPage - 1) * perPage;
    const endIndex = startIndex + perPage;
    return estadiasFiltradas.slice(startIndex, endIndex);
  }, [estadiasFiltradas, currentPage, perPage]);

  const pagination = useMemo(() => {
    const total = estadiasFiltradas.length;
    const lastPage = Math.ceil(total / perPage);
    const from = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
    const to = Math.min(currentPage * perPage, total);
    return { currentPage, perPage, total, from, to, lastPage };
  }, [estadiasFiltradas.length, currentPage, perPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  // Formatear fecha para display
  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Formatear hora para display
  const formatHora = (fecha: string) => {
    return new Date(fecha).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Obtener badge de estado
  const getEstadoBadge = (tipo: string) => {
    const badges = {
      in_house: {
        label: 'In-House',
        icon: <Home className="w-4 h-4" />,
        className: 'bg-green-100 text-green-800 border-green-200',
      },
      arribo: {
        label: 'Arribo Hoy',
        icon: <DoorOpen className="w-4 h-4" />,
        className: 'bg-blue-100 text-blue-800 border-blue-200',
      },
      salida: {
        label: 'Salida Hoy',
        icon: <DoorClosed className="w-4 h-4" />,
        className: 'bg-orange-100 text-orange-800 border-orange-200',
      },
    };

    const badge = badges[tipo as keyof typeof badges] || badges.in_house;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${badge.className}`}>
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  // Obtener badge de origen
  const getOrigenBadge = (origen: 'reserva' | 'walkin') => {
    if (origen === 'walkin') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
          <Users className="w-3 h-3" />
          Walk-In
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
        <Calendar className="w-3 h-3" />
        Reserva
      </span>
    );
  };

  // Navegar a detalles
  const handleVerDetalles = (estadia: EstadiaListItem) => {
    setSelectedEstadia(estadia);
    // Aquí podrías abrir un modal o navegar a una vista de detalles
    console.log('Ver detalles de estadía:', estadia);
  };

  // Navegar a folio
  const handleVerFolio = (folioId: number) => {
    navigate(ROUTES.FRONTDESK.FOLIO_MANAGEMENT(folioId.toString()));
  };

  // Navegar a checkout
  const handleCheckout = (estadia: EstadiaListItem) => {
    navigate(ROUTES.FRONTDESK.CHECKOUT, {
      state: {
        codigo: estadia.codigo_referencia,
        folioId: estadia.folio_id,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Home className="w-8 h-8 text-blue-600" />
              Estadías Activas
            </h1>
            <p className="text-gray-600 mt-1">
              Gestión y seguimiento de estadías en el hotel
            </p>
          </div>
          
          <button
            onClick={refresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Home className="w-4 h-4" />
              <span className="text-xs font-medium">Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <Home className="w-4 h-4" />
              <span className="text-xs font-medium">In-House</span>
            </div>
            <p className="text-2xl font-bold text-green-700">{stats.inHouse}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <DoorOpen className="w-4 h-4" />
              <span className="text-xs font-medium">Arribos</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">{stats.arribos}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-orange-600 mb-1">
              <DoorClosed className="w-4 h-4" />
              <span className="text-xs font-medium">Salidas</span>
            </div>
            <p className="text-2xl font-bold text-orange-700">{stats.salidas}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs font-medium">Walk-Ins</span>
            </div>
            <p className="text-2xl font-bold text-purple-700">{stats.walkins}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-medium">Reservas</span>
            </div>
            <p className="text-2xl font-bold text-gray-700">{stats.reservas}</p>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Buscar por código, nombre, email o habitación..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtro de Fecha */}
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={filters.fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtro de Estado */}
          <div className="flex gap-2">
            <button
              onClick={() => setEstado('in_house')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filters.estado === 'in_house'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              In-House
            </button>
            <button
              onClick={() => setEstado('arribos')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filters.estado === 'arribos'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Arribos
            </button>
            <button
              onClick={() => setEstado('salidas')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filters.estado === 'salidas'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Salidas
            </button>
          </div>

          {/* Filtro de Origen */}
          <div className="flex gap-2">
            <button
              onClick={() => { setOrigenFilter('todos'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                origenFilter === 'todos'
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => { setOrigenFilter('walkin'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                origenFilter === 'walkin'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Walk-In
            </button>
            <button
              onClick={() => { setOrigenFilter('reserva'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                origenFilter === 'reserva'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Reservas
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Estadías */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-3 text-gray-600">Cargando estadías...</span>
          </div>
        ) : estadiasFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Home className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">No hay estadías registradas</p>
            <p className="text-sm">Intenta cambiar los filtros o la fecha</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Huésped
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Habitación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fechas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ocupación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Origen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedEstadias.map((estadia) => (
                  <tr
                    key={estadia.id_estadia}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Código */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span 
                            className="text-sm font-mono font-semibold text-blue-600 cursor-pointer hover:text-blue-800 transition-colors"
                            onClick={() => {
                              navigator.clipboard.writeText(estadia.codigo_referencia);
                              toast.success('Código copiado al portapapeles');
                            }}
                            title="Click para copiar"
                          >
                            {estadia.codigo_referencia}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 ml-6">
                          {estadia.origen === 'walkin' ? 'Walk-In' : 'Reserva'}
                        </span>
                      </div>
                    </td>

                    {/* Huésped */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {estadia.cliente.nombre_completo}
                        </p>
                        {estadia.cliente.email && (
                          <p className="text-xs text-gray-500">
                            {estadia.cliente.email}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Habitación */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Home className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {estadia.habitacion.numero}
                        </span>
                      </div>
                    </td>

                    {/* Fechas */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="flex items-center text-gray-900">
                          <DoorOpen className="w-3 h-3 mr-1 text-green-600" />
                          {formatFecha(estadia.fechas.llegada)}
                        </div>
                        <div className="flex items-center text-gray-500 mt-1">
                          <DoorClosed className="w-3 h-3 mr-1 text-orange-600" />
                          {formatFecha(estadia.fechas.salida)}
                        </div>
                      </div>
                    </td>

                    {/* Ocupación */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-xs">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {estadia.ocupacion.total}
                        </span>
                        <span className="text-gray-500">
                          ({estadia.ocupacion.adultos}A
                          {estadia.ocupacion.ninos > 0 && `, ${estadia.ocupacion.ninos}N`}
                          {estadia.ocupacion.bebes > 0 && `, ${estadia.ocupacion.bebes}B`})
                        </span>
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getEstadoBadge(estadia.tipo_estadia)}
                    </td>

                    {/* Origen */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getOrigenBadge(estadia.origen)}
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVerDetalles(estadia)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {estadia.folio_id && (
                          <button
                            onClick={() => handleVerFolio(estadia.folio_id!)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Ver folio"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                        )}

                        {estadia.tipo_estadia === 'salida' && (
                          <button
                            onClick={() => handleCheckout(estadia)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Check-out"
                          >
                            <LogOut className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {estadiasFiltradas.length > 0 && (
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

      {/* Modal de Detalles */}
      {selectedEstadia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Detalles de Estadía
              </h2>
              <button
                onClick={() => setSelectedEstadia(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Información General */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Información General
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Código</p>
                    <p className="text-base font-medium text-gray-900">
                      {selectedEstadia.codigo_referencia}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Origen</p>
                    <div className="mt-1">{getOrigenBadge(selectedEstadia.origen)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Habitación</p>
                    <p className="text-base font-medium text-gray-900">
                      {selectedEstadia.habitacion.numero}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estado</p>
                    <div className="mt-1">{getEstadoBadge(selectedEstadia.tipo_estadia)}</div>
                  </div>
                </div>
              </div>

              {/* Huésped */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Huésped Titular
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-base font-medium text-gray-900 mb-2">
                    {selectedEstadia.cliente.nombre_completo}
                  </p>
                  {selectedEstadia.cliente.email && (
                    <p className="text-sm text-gray-600">
                      Email: {selectedEstadia.cliente.email}
                    </p>
                  )}
                  {selectedEstadia.cliente.telefono && (
                    <p className="text-sm text-gray-600">
                      Teléfono: {selectedEstadia.cliente.telefono}
                    </p>
                  )}
                </div>
              </div>

              {/* Fechas */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Fechas de Estadía
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-700 font-medium mb-1">
                      Check-In
                    </p>
                    <p className="text-base font-semibold text-green-900">
                      {formatFecha(selectedEstadia.fechas.llegada)}
                    </p>
                    {selectedEstadia.fechas.checkin_at && (
                      <p className="text-xs text-green-600 mt-1">
                        {formatHora(selectedEstadia.fechas.checkin_at)}
                      </p>
                    )}
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-sm text-orange-700 font-medium mb-1">
                      Check-Out Previsto
                    </p>
                    <p className="text-base font-semibold text-orange-900">
                      {formatFecha(selectedEstadia.fechas.salida)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ocupación */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Ocupación
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-blue-900">
                      {selectedEstadia.ocupacion.adultos}
                    </p>
                    <p className="text-xs text-blue-700">Adultos</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-purple-900">
                      {selectedEstadia.ocupacion.ninos}
                    </p>
                    <p className="text-xs text-purple-700">Niños</p>
                  </div>
                  <div className="bg-pink-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-pink-900">
                      {selectedEstadia.ocupacion.bebes}
                    </p>
                    <p className="text-xs text-pink-700">Bebés</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedEstadia.ocupacion.total}
                    </p>
                    <p className="text-xs text-gray-700">Total</p>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                {selectedEstadia.folio_id && (
                  <button
                    onClick={() => {
                      handleVerFolio(selectedEstadia.folio_id!);
                      setSelectedEstadia(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Receipt className="w-5 h-5" />
                    Ver Folio
                  </button>
                )}
                {selectedEstadia.tipo_estadia === 'salida' && (
                  <button
                    onClick={() => {
                      handleCheckout(selectedEstadia);
                      setSelectedEstadia(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Check-Out
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
