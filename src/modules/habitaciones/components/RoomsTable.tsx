// src/modules/habitaciones/components/RoomsTable.tsx
/**
 * Tabla para mostrar habitaciones
 */

import type { Habitacion } from '../types/habitacion';

interface RoomsTableProps {
  readonly habitaciones: Habitacion[];
  readonly loading: boolean;
  readonly onEdit?: (habitacion: Habitacion) => void;
  readonly onChangeEstado?: (habitacion: Habitacion) => void;
}

export function RoomsTable({ habitaciones, loading, onEdit, onChangeEstado }: Readonly<RoomsTableProps>) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#304D3C]"></div>
          <span className="ml-3 text-slate-600">Cargando habitaciones...</span>
        </div>
      </div>
    );
  }

  if (habitaciones.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-8">
        <div className="text-center text-slate-500">
          <p className="text-lg font-medium">No se encontraron habitaciones</p>
          <p className="text-sm mt-2">Intenta ajustar los filtros de búsqueda</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Número
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Piso
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Capacidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Precio Base
              </th>
              {(onEdit || onChangeEstado) && (
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {habitaciones.map((habitacion) => (
              <tr
                key={habitacion.id_habitacion}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900">
                    {habitacion.numero}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900">{habitacion.nombre}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-600">
                    {habitacion.tipo.nombre}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-600">Piso {habitacion.piso}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-600">
                    {habitacion.capacidad} personas
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <EstadoBadge estado={habitacion.estado.nombre} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900">
                    {habitacion.moneda} {Number.parseFloat(habitacion.precio_base).toFixed(2)}
                  </div>
                </td>
                {(onEdit || onChangeEstado) && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(habitacion)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Editar habitación"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                      {onChangeEstado && (
                        <button
                          onClick={() => onChangeEstado(habitacion)}
                          className="text-green-600 hover:text-green-800 transition-colors"
                          title="Cambiar estado"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Badge de estado
function EstadoBadge({ estado }: Readonly<{ estado: string }>) {
  const getEstadoStyles = () => {
    const estadoLower = estado.toLowerCase();

    if (estadoLower.includes('disponible')) {
      return 'bg-green-100 text-green-800';
    }
    if (estadoLower.includes('ocupada')) {
      return 'bg-red-100 text-red-800';
    }
    if (estadoLower.includes('limpia')) {
      return 'bg-blue-100 text-blue-800';
    }
    if (estadoLower.includes('sucia')) {
      return 'bg-yellow-100 text-yellow-800';
    }
    if (estadoLower.includes('mantenimiento')) {
      return 'bg-orange-100 text-orange-800';
    }

    return 'bg-slate-100 text-slate-800';
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoStyles()}`}
    >
      {estado}
    </span>
  );
}
