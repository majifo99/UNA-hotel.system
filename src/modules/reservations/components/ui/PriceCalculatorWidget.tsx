/**
 * Price Calculator Widget
 * 
 * Muestra el desglose de precios en tiempo real mientras se crea una reserva
 * Con opción de colapsar/expandir para mejor UX
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { usePriceCalculation, formatCurrency, formatPercentage } from '../../hooks/usePriceCalculation';
import type { Room, AdditionalService } from '../../../../types/core';

interface PriceCalculatorWidgetProps {
  selectedRooms: Room[];
  checkInDate: string | null;
  checkOutDate: string | null;
  additionalServices?: AdditionalService[];
  className?: string;
  defaultCollapsed?: boolean;
}

export const PriceCalculatorWidget: React.FC<PriceCalculatorWidgetProps> = ({
  selectedRooms,
  checkInDate,
  checkOutDate,
  additionalServices = [],
  className = '',
  defaultCollapsed = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  
  const breakdown = usePriceCalculation(
    selectedRooms,
    checkInDate,
    checkOutDate,
    additionalServices
  );

  if (!breakdown) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <h3 className="text-base font-semibold text-gray-700 mb-2">
          💰 Resumen de Costos
        </h3>
        <p className="text-xs text-gray-500">
          Selecciona habitaciones y fechas
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-300 rounded-lg shadow-sm ${className}`}>
      {/* Header - Siempre visible con resumen y botón de colapsar */}
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-t-lg"
      >
        <div className="flex-1 text-left">
          <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            💰 Resumen de Costos
          </h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm font-bold text-blue-600">
              {formatCurrency(breakdown.total)} {breakdown.currency}
            </span>
            <span className="text-xs text-gray-500">
              • {breakdown.nights} noche{breakdown.nights > 1 ? 's' : ''} • {breakdown.rooms.length} hab.
            </span>
          </div>
        </div>
        <div className="ml-2 text-gray-500">
          {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </div>
      </button>

      {/* Contenido detallado - Colapsable */}
      {!isCollapsed && (
        <div className="px-4 pb-4 border-t border-gray-200">
          {/* Habitaciones */}
          <div className="mb-3 mt-3">
            <h4 className="text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">Habitaciones</h4>
            <div className="space-y-0.5">
              {breakdown.rooms.map((room) => (
                <div key={room.label} className="flex justify-between text-xs">
                  <span className="text-gray-600 truncate mr-2">
                    {room.label} × {room.quantity}n
                  </span>
                  <span className="font-medium text-gray-800 whitespace-nowrap">
                    {formatCurrency(room.amount)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between text-xs font-medium pt-1.5 mt-1.5 border-t border-gray-200">
                <span className="text-gray-700">Subtotal Habitaciones</span>
                <span className="text-gray-800">
                  {formatCurrency(breakdown.roomsSubtotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Servicios Adicionales */}
          {breakdown.services.length > 0 && (
            <div className="mb-3">
              <h4 className="text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">Servicios</h4>
              <div className="space-y-0.5">
                {breakdown.services.map((service) => (
                  <div key={service.label} className="flex justify-between text-xs">
                    <span className="text-gray-600 truncate mr-2">{service.label}</span>
                    <span className="font-medium text-gray-800 whitespace-nowrap">
                      {formatCurrency(service.amount)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between text-xs font-medium pt-1.5 mt-1.5 border-t border-gray-200">
                  <span className="text-gray-700">Subtotal Servicios</span>
                  <span className="text-gray-800">
                    {formatCurrency(breakdown.servicesSubtotal)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Totales */}
          <div className="border-t-2 border-gray-300 pt-3 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-800">
                {formatCurrency(breakdown.subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">
                IVA ({formatPercentage(breakdown.taxRate)})
              </span>
              <span className="font-medium text-gray-800">
                {formatCurrency(breakdown.taxes)}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold pt-1.5">
              <span className="text-gray-800">Total</span>
              <span className="text-blue-600">
                {formatCurrency(breakdown.total)} {breakdown.currency}
              </span>
            </div>
          </div>

          {/* Depósito Mínimo */}
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex justify-between items-center">
              <span className="text-xs text-blue-800">
                Depósito ({formatPercentage(breakdown.depositPercentage)})
              </span>
              <span className="text-xs font-semibold text-blue-900">
                {formatCurrency(breakdown.minimumDeposit)} {breakdown.currency}
              </span>
            </div>
            <p className="text-[10px] text-blue-700 mt-0.5 leading-tight">
              Monto mínimo requerido
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceCalculatorWidget;
