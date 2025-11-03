import { useEffect } from 'react';
import { FileText, DollarSign, Users, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { useFolioFlow } from '../hooks/useFolioFlow';

interface FolioResumenProps {
  folioId: number;
  autoLoad?: boolean;
  showActions?: boolean;
}

/**
 * Componente para visualizar el resumen completo de un folio
 * Muestra saldos, distribución y pagos de todos los huéspedes
 */
export const FolioResumen = ({ 
  folioId, 
  autoLoad = true,
  showActions = true 
}: FolioResumenProps) => {
  const { 
    resumen, 
    isLoading, 
    error,
    obtenerResumen,
    exportarHistorial 
  } = useFolioFlow();

  useEffect(() => {
    if (autoLoad && folioId) {
      obtenerResumen(folioId);
    }
  }, [folioId, autoLoad, obtenerResumen]);

  const handleExportHistorial = async () => {
    await exportarHistorial(folioId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Cargando resumen del folio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error al cargar el resumen</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!resumen) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-gray-400" />
          <p className="text-gray-600">No hay información del folio disponible</p>
        </div>
      </div>
    );
  }

  const { folio, resumen: resumenData, personas, totales } = resumen;
  const saldoCero = totales.saldo_global === 0;

  return (
    <div className="space-y-6">
      {/* Header del Folio */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Folio #{folio}</h2>
            </div>
            <p className="text-blue-100 text-sm">
              Resumen de cargos y pagos
            </p>
          </div>
          
          {showActions && (
            <button
              onClick={handleExportHistorial}
              className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar Historial
            </button>
          )}
        </div>
      </div>

      {/* Estado General */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* A Distribuir */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="font-semibold text-gray-700">A Distribuir</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${parseFloat(resumenData.a_distribuir).toFixed(2)}
          </p>
        </div>

        {/* Distribuido */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-700">Distribuido</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${parseFloat(resumenData.distribuido).toFixed(2)}
          </p>
        </div>

        {/* Saldo Global */}
        <div className={`border rounded-lg p-5 shadow-sm ${
          saldoCero 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${
              saldoCero ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {saldoCero ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
            <h3 className="font-semibold text-gray-700">Saldo Global</h3>
          </div>
          <p className={`text-2xl font-bold ${
            saldoCero ? 'text-green-700' : 'text-red-700'
          }`}>
            ${totales.saldo_global.toFixed(2)}
          </p>
          {saldoCero && (
            <p className="text-xs text-green-600 mt-2">✓ Saldo liquidado</p>
          )}
        </div>
      </div>

      {/* Detalle por Persona */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Detalle por Huésped
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asignado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pagos
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Saldo
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {personas.map((persona) => {
                const saldoPersona = persona.saldo;
                const pagado = saldoPersona === 0;

                return (
                  <tr key={persona.id_cliente} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {persona.nombre ? persona.nombre.charAt(0).toUpperCase() : persona.id_cliente}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {persona.nombre || `Cliente #${persona.id_cliente}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {persona.id_cliente}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-gray-900 font-medium">
                        ${persona.asignado.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-green-600 font-medium">
                        ${persona.pagos.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`font-semibold ${
                        pagado ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${saldoPersona.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {pagado ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <CheckCircle className="w-3 h-3" />
                          Pagado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          <AlertCircle className="w-3 h-3" />
                          Pendiente
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totales Finales */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Totales Globales</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Pagos por Persona:</span>
            <span className="font-semibold text-gray-900">
              ${totales.pagos_por_persona_total.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Pagos Generales:</span>
            <span className="font-semibold text-gray-900">
              ${totales.pagos_generales.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-t border-gray-300 pt-3">
            <span className="text-gray-700 font-medium">Total Pagado:</span>
            <span className="font-bold text-lg text-green-600">
              ${totales.pagos_totales.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-t border-gray-300 pt-3">
            <span className="text-gray-700 font-medium">Saldo Pendiente:</span>
            <span className={`font-bold text-lg ${
              saldoCero ? 'text-green-600' : 'text-red-600'
            }`}>
              ${totales.saldo_global.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Control Diff - Para debugging */}
        {totales.control_diff !== 0 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-xs text-amber-700">
              ⚠️ Diferencia de control: ${totales.control_diff.toFixed(2)}
            </p>
          </div>
        )}
      </div>

      {/* Estado Final */}
      {saldoCero ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-900">Folio Saldado</h3>
              <p className="text-sm text-green-700 mt-1">
                Todos los cargos han sido pagados. El folio está listo para ser cerrado.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-amber-600" />
            <div>
              <h3 className="font-semibold text-amber-900">Saldo Pendiente</h3>
              <p className="text-sm text-amber-700 mt-1">
                Aún hay ${totales.saldo_global.toFixed(2)} pendientes de pago. 
                Complete los pagos antes de cerrar el folio.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FolioResumen;
