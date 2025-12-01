/**
 * Reservation Flow Mode Toggle
 * 
 * Permite alternar entre dos flujos de reserva:
 * - Modo Rápido: Habitación → Fechas → Cliente (mejor para walk-ins)
 * - Modo Cliente Conocido: Cliente → Fechas → Habitación (clientes recurrentes)
 */

import React from 'react';
import { Hotel, UserCircle, Zap } from 'lucide-react';

export type ReservationFlowMode = 'quick' | 'client-first';

interface ReservationFlowToggleProps {
  currentMode: ReservationFlowMode;
  onModeChange: (mode: ReservationFlowMode) => void;
  className?: string;
}

export const ReservationFlowToggle: React.FC<ReservationFlowToggleProps> = ({
  currentMode,
  onModeChange,
  className = '',
}) => {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">Modo de Reserva</h3>
        <div className="text-xs text-gray-500">Seleccione el flujo de trabajo</div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {/* Modo Rápido */}
        <button
          type="button"
          onClick={() => onModeChange('quick')}
          className={`relative p-4 rounded-lg border-2 transition-all ${
            currentMode === 'quick'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`p-2 rounded-full mb-2 ${
              currentMode === 'quick' ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <Zap size={20} className={currentMode === 'quick' ? 'text-blue-600' : 'text-gray-600'} />
            </div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">Modo Rápido</h4>
            <p className="text-xs text-gray-600">
              Habitación → Fechas → Cliente
            </p>
            {currentMode === 'quick' && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
            )}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              💡 Ideal para walk-ins y reservas rápidas
            </p>
          </div>
        </button>

        {/* Modo Cliente Conocido */}
        <button
          type="button"
          onClick={() => onModeChange('client-first')}
          className={`relative p-4 rounded-lg border-2 transition-all ${
            currentMode === 'client-first'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/50'
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`p-2 rounded-full mb-2 ${
              currentMode === 'client-first' ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <UserCircle size={20} className={currentMode === 'client-first' ? 'text-green-600' : 'text-gray-600'} />
            </div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">Cliente Conocido</h4>
            <p className="text-xs text-gray-600">
              Cliente → Fechas → Habitación
            </p>
            {currentMode === 'client-first' && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            )}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              💡 Ideal para clientes recurrentes
            </p>
          </div>
        </button>
      </div>

      {/* Info adicional */}
      <div className="mt-3 p-2 bg-gray-50 rounded-md">
        <p className="text-xs text-gray-600">
          {currentMode === 'quick' ? (
            <>
              <Hotel className="inline w-3 h-3 mr-1" />
              Verá primero las habitaciones disponibles con su calendario visual
            </>
          ) : (
            <>
              <UserCircle className="inline w-3 h-3 mr-1" />
              Seleccionará el cliente antes de ver disponibilidad
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default ReservationFlowToggle;
