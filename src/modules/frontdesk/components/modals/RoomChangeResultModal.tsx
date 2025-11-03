import React from 'react';
import { X, CheckCircle, TrendingUp, TrendingDown, DollarSign, Home } from 'lucide-react';
import type { CambiarHabitacionResponse } from '../../services/ModificacionReservaService';

interface RoomChangeResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: CambiarHabitacionResponse;
}

export const RoomChangeResultModal: React.FC<RoomChangeResultModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  if (!isOpen) return null;

  const getTipoAjusteInfo = () => {
    switch (result.tipo_ajuste) {
      case 'cargo_adicional':
        return {
          icon: <TrendingUp className="w-6 h-6" />,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          text: 'Cargo Adicional',
        };
      case 'reembolso':
        return {
          icon: <TrendingDown className="w-6 h-6" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          text: 'Reembolso',
        };
      default:
        return {
          icon: <DollarSign className="w-6 h-6" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          text: 'Sin Cambio en Precio',
        };
    }
  };

  const ajusteInfo = getTipoAjusteInfo();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Cambio de Habitación Exitoso</h2>
                <p className="text-green-100 text-sm">El cambio se procesó correctamente</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Habitaciones Comparación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Habitación Anterior */}
            <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-3">
                <Home className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Habitación Anterior</h3>
              </div>
              <p className="text-xl font-bold text-gray-800 mb-2">
                {result.habitacion_antigua?.nombre || 'N/A'}
              </p>
              <p className="text-gray-600">
                ID: {result.habitacion_antigua?.id || 'N/A'}
              </p>
              <p className="text-lg font-semibold text-gray-700 mt-2">
                ${(result.habitacion_antigua?.precio ?? 0).toFixed(2)}
              </p>
            </div>

            {/* Habitación Nueva */}
            <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
              <div className="flex items-center gap-2 mb-3">
                <Home className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Habitación Nueva</h3>
              </div>
              <p className="text-xl font-bold text-blue-800 mb-2">
                {result.habitacion_nueva?.nombre || 'N/A'}
              </p>
              <p className="text-blue-600">
                ID: {result.habitacion_nueva?.id || 'N/A'}
              </p>
              <p className="text-lg font-semibold text-blue-700 mt-2">
                ${(result.habitacion_nueva?.precio ?? 0).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Diferencia de Precio */}
          <div className={`border-2 ${ajusteInfo.borderColor} ${ajusteInfo.bgColor} rounded-lg p-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`${ajusteInfo.color}`}>
                  {ajusteInfo.icon}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tipo de Ajuste</p>
                  <p className={`text-lg font-bold ${ajusteInfo.color}`}>
                    {ajusteInfo.text}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Diferencia</p>
                <p className={`text-2xl font-bold ${ajusteInfo.color}`}>
                  {(result.diferencia_precio ?? 0) >= 0 ? '+' : ''}
                  ${(result.diferencia_precio ?? 0).toFixed(2)}
                </p>
              </div>
            </div>
            
            {(result.monto_ajuste ?? 0) !== 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">Monto del Ajuste</p>
                <p className={`text-xl font-bold ${ajusteInfo.color}`}>
                  ${Math.abs(result.monto_ajuste ?? 0).toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* Resumen Financiero */}
          <div className="border-2 border-gray-200 rounded-lg p-4 bg-gradient-to-br from-gray-50 to-white">
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">Resumen de la Reserva</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-600">Total Nuevo:</span>
                <span className="text-xl font-bold text-gray-900">
                  ${(result.reserva?.total_nuevo ?? 0).toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Monto Pagado:</span>
                <span className="text-lg font-semibold text-green-600">
                  ${(result.reserva?.monto_pagado ?? 0).toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between items-center pb-3 border-b-2 border-gray-300">
                <span className="text-gray-600">Monto Pendiente:</span>
                <span className="text-lg font-semibold text-orange-600">
                  ${(result.reserva?.monto_pendiente ?? 0).toFixed(2)}
                </span>
              </div>

              {(result.reserva?.monto_pendiente ?? 0) > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-md p-3 mt-3">
                  <p className="text-sm text-orange-800">
                    <strong>Nota:</strong> El huésped debe pagar ${(result.reserva?.monto_pendiente ?? 0).toFixed(2)} para completar la reserva.
                  </p>
                </div>
              )}

              {(result.reserva?.monto_pendiente ?? 0) < 0 && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3 mt-3">
                  <p className="text-sm text-green-800">
                    <strong>Reembolso:</strong> Se debe reembolsar ${Math.abs(result.reserva?.monto_pendiente ?? 0).toFixed(2)} al huésped.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Cerrar y Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomChangeResultModal;
