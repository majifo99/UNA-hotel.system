// src/modules/habitaciones/pages/DisponibilidadPage.tsx
/**
 * Página para consultar disponibilidad de habitaciones por fechas
 */

import { useState } from 'react';
import { useCatalogos, useDisponibilidad } from '../hooks/useHabitaciones';
import { RoomsTable } from '../components/RoomsTable';

export default function DisponibilidadPage() {
  // Cargar catálogos automáticamente en esta página (con TanStack Query cache)
  const { tipos, loading: catalogosLoading } = useCatalogos();

  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [buscarEnabled, setBuscarEnabled] = useState(false);

  // Hook para consultar disponibilidad
  const {
    habitaciones,
    loading: disponibilidadLoading,
    error: disponibilidadError,
    total,
  } = useDisponibilidad({
    desde: fechaDesde,
    hasta: fechaHasta,
    tipo: tipoSeleccionado ? Number(tipoSeleccionado) : undefined,
    enabled: buscarEnabled,
  });

  const handleBuscar = () => {
    setBuscarEnabled(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Consultar Disponibilidad
              </h1>
              <p className="text-slate-600 mt-1">
                Verifica la disponibilidad de habitaciones por rango de fechas
              </p>
            </div>
          </div>
        </div>

        {/* Formulario de búsqueda */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Parámetros de Búsqueda
          </h2>

          {catalogosLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#304D3C]"></div>
              <span className="ml-3 text-slate-600">Cargando catálogos...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Fecha Desde */}
              <div>
                <label htmlFor="fecha-desde" className="block text-sm font-medium text-slate-700 mb-2">
                  Fecha Desde
                </label>
                <input
                  id="fecha-desde"
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#304D3C] focus:border-transparent"
                />
              </div>

              {/* Fecha Hasta */}
              <div>
                <label htmlFor="fecha-hasta" className="block text-sm font-medium text-slate-700 mb-2">
                  Fecha Hasta
                </label>
                <input
                  id="fecha-hasta"
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#304D3C] focus:border-transparent"
                />
              </div>

              {/* Tipo de Habitación */}
              <div>
                <label htmlFor="tipo-habitacion" className="block text-sm font-medium text-slate-700 mb-2">
                  Tipo de Habitación (Opcional)
                </label>
                <select
                  id="tipo-habitacion"
                  value={tipoSeleccionado}
                  onChange={(e) => setTipoSeleccionado(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#304D3C] focus:border-transparent"
                >
                  <option value="">Todos los tipos</option>
                  {tipos.map((tipo) => (
                    <option key={tipo.id_tipo_hab} value={tipo.id_tipo_hab}>
                      {tipo.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botón de búsqueda */}
              <div className="md:col-span-3">
                <button
                  onClick={handleBuscar}
                  disabled={!fechaDesde || !fechaHasta}
                  className="w-full md:w-auto px-6 py-3 bg-[#304D3C] text-white rounded-lg hover:bg-[#253d2f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  🔍 Buscar Disponibilidad
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info de catálogos cargados */}
        {tipos.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-blue-800 text-sm">
              ✅ Catálogos cargados: {tipos.length} tipos de habitación disponibles
            </p>
          </div>
        )}

        {/* Error de disponibilidad */}
        {disponibilidadError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-800 text-sm font-medium">⚠️ {disponibilidadError}</p>
          </div>
        )}

        {/* Resultados de disponibilidad */}
        {buscarEnabled ? (
          <div className="space-y-4">
            {/* Contador de resultados */}
            {!disponibilidadLoading && habitaciones.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-green-800 text-sm font-medium">
                  ✅ Se encontraron {total} habitaciones disponibles para las fechas seleccionadas
                </p>
              </div>
            )}

            {/* Tabla de resultados */}
            <RoomsTable habitaciones={habitaciones} loading={disponibilidadLoading} />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-8">
            <div className="text-center text-slate-500">
              <svg
                className="mx-auto h-12 w-12 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-slate-900">
                Selecciona las fechas para buscar
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Los resultados de disponibilidad aparecerán aquí
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
