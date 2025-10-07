/**
 * 💰 Componente: DepositoResumen
 * ==============================
 * Muestra el resumen del depósito previo (primera noche).
 * Visualiza estado, montos y permite registrar pagos.
 */

import React from 'react';
import { DollarSign, CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react';
import type { Deposito, EstadoDeposito } from '../types/folioTypes';

interface DepositoResumenProps {
  deposito: Deposito | null;
  loading?: boolean;
  onRegistrarPago?: () => void;
  className?: string;
}

/**
 * Configuración de estilos por estado
 */
const ESTADO_CONFIG: Record<EstadoDeposito, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  pendiente: {
    label: 'Pendiente',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
    icon: <Clock className="w-5 h-5" />
  },
  parcial: {
    label: 'Pago Parcial',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    icon: <AlertCircle className="w-5 h-5" />
  },
  completo: {
    label: 'Pagado',
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    icon: <CheckCircle className="w-5 h-5" />
  },
  reembolsado: {
    label: 'Reembolsado',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-200',
    icon: <XCircle className="w-5 h-5" />
  },
  no_aplica: {
    label: 'No Aplica',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50 border-gray-200',
    icon: <DollarSign className="w-5 h-5" />
  }
};

export const DepositoResumen: React.FC<DepositoResumenProps> = ({
  deposito,
  loading,
  onRegistrarPago,
  className = ''
}) => {
  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-100 rounded-lg p-4 ${className}`}>
        <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
        <div className="h-6 bg-gray-300 rounded w-1/2"></div>
      </div>
    );
  }

  if (!deposito || deposito.estado === 'no_aplica') {
    return null;
  }

  const config = ESTADO_CONFIG[deposito.estado];
  const porcentajePagado = deposito.monto_requerido > 0
    ? (deposito.monto_pagado / deposito.monto_requerido) * 100
    : 0;

  return (
    <div className={`border rounded-lg p-4 ${config.bgColor} ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <div className={config.color}>
            {config.icon}
          </div>
          <div className="ml-3">
            <h4 className="font-medium text-gray-900">Depósito de Reserva</h4>
            <p className="text-sm text-gray-600">Primera noche / Garantía</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color} bg-white border`}>
          {config.label}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
        <div>
          <span className="block text-xs text-gray-600 mb-1">Requerido</span>
          <span className="text-lg font-bold text-gray-900">
            ${deposito.monto_requerido.toFixed(2)}
          </span>
        </div>
        <div>
          <span className="block text-xs text-gray-600 mb-1">Pagado</span>
          <span className={`text-lg font-bold ${deposito.monto_pagado > 0 ? 'text-green-600' : 'text-gray-400'}`}>
            ${deposito.monto_pagado.toFixed(2)}
          </span>
        </div>
        <div>
          <span className="block text-xs text-gray-600 mb-1">Pendiente</span>
          <span className={`text-lg font-bold ${deposito.monto_pagado < deposito.monto_requerido ? 'text-amber-600' : 'text-gray-400'}`}>
            ${(deposito.monto_requerido - deposito.monto_pagado).toFixed(2)}
          </span>
        </div>
        <div>
          <span className="block text-xs text-gray-600 mb-1">Completado</span>
          <span className="text-lg font-bold text-gray-900">
            {porcentajePagado.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Barra de progreso */}
      {deposito.estado !== 'completo' && deposito.estado !== 'reembolsado' && (
        <div className="mb-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(porcentajePagado, 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Información adicional */}
      {deposito.fecha_pago && (
        <div className="text-xs text-gray-600 mb-2">
          <span className="font-medium">Fecha de pago:</span>{' '}
          {new Date(deposito.fecha_pago).toLocaleDateString()}
          {deposito.metodo_pago && (
            <>
              {' • '}
              <span className="font-medium">Método:</span> {deposito.metodo_pago}
            </>
          )}
          {deposito.referencia && (
            <>
              {' • '}
              <span className="font-medium">Ref:</span> {deposito.referencia}
            </>
          )}
        </div>
      )}

      {deposito.notas && (
        <div className="text-xs text-gray-600 italic">
          {deposito.notas}
        </div>
      )}

      {/* Botón de acción */}
      {deposito.estado === 'pendiente' && onRegistrarPago && (
        <button
          onClick={onRegistrarPago}
          className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          Registrar Pago de Depósito
        </button>
      )}

      {deposito.estado === 'parcial' && onRegistrarPago && (
        <button
          onClick={onRegistrarPago}
          className="mt-3 w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium text-sm"
        >
          Completar Pago de Depósito
        </button>
      )}
    </div>
  );
};
