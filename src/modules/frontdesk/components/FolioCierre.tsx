import React, { useState } from 'react';
import { FileX, AlertTriangle, CheckCircle, Coffee } from 'lucide-react';
import { folioService } from '../services/folioService';

interface FolioCierreProps {
  folioId: number;
  folioData: any;
  onCierreCompleto?: (data: any) => void;
}

export const FolioCierre: React.FC<FolioCierreProps> = ({
  folioId,
  folioData,
  onCierreCompleto
}) => {
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  const [confirmacion, setConfirmacion] = useState(false);

  const hayCargosPendientes = folioData?.resumen?.cargos_sin_persona 
    ? parseFloat(folioData.resumen.cargos_sin_persona) > 0 
    : false;

  const haySaldosPendientes = folioData?.personas?.some((p: any) => p.saldo > 0) || false;

  const cerrarFolio = async () => {
    try {
      setProcesando(true);
      setError(null);
      setExito(null);

      const resultado = await folioService.cerrarFolio(folioId, {
        operacion_uid: `cierre-${Date.now()}`,
        id_cliente_titular: 1
      });
      
      setExito('Folio cerrado exitosamente. Todos los cargos y saldos pendientes han sido reclasificados al titular.');
      setConfirmacion(false);
      
      if (onCierreCompleto) {
        onCierreCompleto(resultado);
      }
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al cerrar el folio';
      setError(errorMessage);
    } finally {
      setProcesando(false);
    }
  };

  if (!hayCargosPendientes && !haySaldosPendientes) {
    return (
      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
        <div className="flex items-center">
          <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-green-900">Folio Listo para Cierre</h3>
            <p className="text-sm text-green-700 mt-1">
              No hay cargos pendientes de distribución ni saldos por cobrar. El folio está balanceado y listo.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Información sobre el cierre */}
      <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
        <div className="flex items-start">
          <AlertTriangle className="w-6 h-6 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-medium text-amber-900">Cierre de Folio</h3>
            <p className="text-sm text-amber-700 mt-1">
              Al cerrar el folio, todos los cargos pendientes y saldos de clientes se reclasificarán al titular principal.
              Esta acción facilitará el cobro final y la facturación.
            </p>
          </div>
        </div>
      </div>

      {/* Detalle de lo que se va a reclasificar */}
      <div className="bg-white p-6 rounded-lg border">
        <h4 className="font-medium text-gray-900 mb-4 flex items-center">
          <Coffee className="w-5 h-5 mr-2 text-blue-600" />
          Elementos a Reclasificar
        </h4>
        
        <div className="space-y-3">
          {hayCargosPendientes && (
            <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Cargos sin Asignar</div>
                <div className="text-sm text-gray-600">Se asignarán al titular principal</div>
              </div>
              <div className="text-lg font-bold text-amber-600">
                ${folioData.resumen.cargos_sin_persona}
              </div>
            </div>
          )}

          {haySaldosPendientes && folioData.personas && (
            <div>
              <div className="font-medium text-gray-900 mb-2">Saldos por Cliente</div>
              {folioData.personas
                .filter((p: any) => p.saldo > 0)
                .map((persona: any) => (
                <div key={persona.id_cliente} className="flex justify-between items-center p-3 bg-red-50 rounded-lg mb-2">
                  <div>
                    <div className="font-medium text-gray-900">Cliente #{persona.id_cliente}</div>
                    <div className="text-sm text-gray-600">Saldo pendiente se transferirá al titular</div>
                  </div>
                  <div className="text-lg font-bold text-red-600">
                    ${persona.saldo.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmación */}
      {!confirmacion ? (
        <div className="flex justify-center">
          <button
            onClick={() => setConfirmacion(true)}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center font-medium shadow-lg hover:shadow-xl transition-all"
            disabled={procesando}
          >
            <FileX className="w-5 h-5 mr-2" />
            Cerrar Folio y Reclasificar
          </button>
        </div>
      ) : (
        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">¿Confirmar Cierre de Folio?</h3>
            <p className="text-sm text-red-700 mb-6">
              Esta acción reclasificará todos los cargos y saldos pendientes al titular principal.
              Una vez cerrado, podrás proceder con el cobro final y la facturación.
            </p>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setConfirmacion(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                disabled={procesando}
              >
                Cancelar
              </button>
              <button
                onClick={cerrarFolio}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                disabled={procesando}
              >
                {procesando ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Cerrando...
                  </>
                ) : (
                  <>
                    <FileX className="w-4 h-4 mr-2" />
                    Confirmar Cierre
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mensajes */}
      {(error || exito) && (
        <div className={`p-4 rounded-lg border-l-4 ${
          error 
            ? 'bg-red-50 border-red-400 text-red-800' 
            : 'bg-green-50 border-green-400 text-green-800'
        }`}>
          <div className="flex items-center">
            {error ? (
              <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
            ) : (
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            )}
            <div>
              <p className="font-medium">
                {error ? 'Error en el cierre' : 'Cierre exitoso'}
              </p>
              <p className="text-sm mt-1">
                {error || exito}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};