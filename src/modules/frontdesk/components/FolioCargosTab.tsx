/**
 * Tab de Cargos del Folio
 * 
 * Muestra la lista de cargos del folio y permite agregar nuevos cargos.
 */

import React, { useState } from 'react';
import { Plus, FileText, User, DollarSign } from 'lucide-react';
import { AgregarCargoForm } from './AgregarCargoForm';
import type { ClienteFolio, FolioLinea } from '../types/folio.types';

interface FolioCargosTabProps {
  folioId: number;
  clientes: ClienteFolio[];
  cargos?: FolioLinea[];
  isLoading?: boolean;
  onCargoAgregado?: () => void;
}

/**
 * Componente para el tab de Cargos
 */
export const FolioCargosTab: React.FC<FolioCargosTabProps> = ({
  folioId,
  clientes,
  cargos = [],
  isLoading = false,
  onCargoAgregado
}) => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Debug: verificar clientes recibidos
  React.useEffect(() => {
    console.log('🎯 FolioCargosTab - Clientes recibidos:', clientes);
    console.log('🎯 FolioCargosTab - Cantidad:', clientes?.length ?? 0);
  }, [clientes]);

  const handleCargoSuccess = () => {
    setMostrarFormulario(false);
    onCargoAgregado?.();
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-CR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header con botón para agregar cargo */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Cargos del Folio</h3>
          <p className="text-sm text-gray-600 mt-1">
            {cargos.length} {cargos.length === 1 ? 'cargo registrado' : 'cargos registrados'}
          </p>
        </div>
        
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="
            flex items-center gap-2 px-4 py-2
            bg-blue-600 text-white rounded-lg
            hover:bg-blue-700 transition-colors
          "
        >
          <Plus className="w-4 h-4" />
          Agregar Cargo
        </button>
      </div>

      {/* Formulario de agregar cargo (colapsable) */}
      {mostrarFormulario && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Nuevo Cargo</h4>
          <AgregarCargoForm
            folioId={folioId}
            clientes={clientes}
            onSuccess={handleCargoSuccess}
            onCancel={() => setMostrarFormulario(false)}
          />
        </div>
      )}

      {/* Lista de cargos */}
      {isLoading && (
        <div className="flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Cargando cargos...</p>
          </div>
        </div>
      )}
      
      {!isLoading && cargos.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No hay cargos registrados</p>
          <p className="text-sm text-gray-500 mt-1">
            Agrega el primer cargo usando el botón de arriba
          </p>
        </div>
      )}
      
      {!isLoading && cargos.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cargos.map((cargo) => (
                  <tr key={cargo.id_folio_linea} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {cargo.descripcion}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {cargo.id_folio_linea}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`
                        inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
                        ${cargo.tipo === 'general' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-blue-100 text-blue-800'
                        }
                      `}>
                        {cargo.tipo === 'general' ? (
                          <>
                            <FileText className="w-3 h-3" />
                            General
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3" />
                            Individual
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {cargo.id_cliente ? (
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">
                            {cargo.cliente?.nombre || `Cliente #${cargo.id_cliente}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {cargo.id_cliente}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 italic">
                          Sin asignar
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-semibold text-gray-900 flex items-center justify-end gap-1">
                        <DollarSign className="w-4 h-4" />
                        {cargo.monto.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFecha(cargo.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FolioCargosTab;
