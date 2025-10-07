import React from 'react';
import { Users, CreditCard, DollarSign, Calculator, Trash2, Plus } from 'lucide-react';
import { useChargeDistribution } from '../hooks/useChargeDistribution';
import type { PaymentMethod } from '../types/checkin';
import type { ChargeDistributionType, DistributionTemplate } from '../types/chargeDistribution';

interface ChargeDistributionComponentProps {
  totalAmount: number;
  guestCount: number;
  onDistributionChange: (distribution: any) => void;
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Efectivo',
  credit_card: 'Tarjeta de Crédito',
  debit_card: 'Tarjeta de Débito',
  bank_transfer: 'Transferencia Bancaria',
  agency_voucher: 'Voucher de Agencia',
  courtesy: 'Cortesía',
  corporate_account: 'Cuenta Corporativa',
  points_miles: 'Puntos/Millas'
};

const DISTRIBUTION_TYPE_LABELS: Record<ChargeDistributionType, string> = {
  full: 'Pago completo por un responsable',
  equal: 'División equitativa',
  percentage: 'División por porcentajes',
  fixed_amount: 'Montos fijos específicos',
  custom: 'Distribución personalizada'
};

export const ChargeDistributionComponent: React.FC<ChargeDistributionComponentProps> = ({
  totalAmount,
  guestCount,
  onDistributionChange
}) => {
  const {
    isEnabled,
    distributionType,
    distributions,
    isDistributionValid,
    setIsEnabled,
    setDistributionType,
    applyTemplate,
    addDistribution,
    updateDistribution,
    removeDistribution,
    redistributeEqually,
    redistributeByPercentages,
    getDistributionSummary,
    getChargeDistribution,
    templates
  } = useChargeDistribution(guestCount, totalAmount);

  // Notificar cambios al componente padre
  React.useEffect(() => {
    if (isEnabled) {
      onDistributionChange(getChargeDistribution());
    } else {
      onDistributionChange(null);
    }
  }, [isEnabled, distributions, distributionType, onDistributionChange, getChargeDistribution]);

  const summary = getDistributionSummary;

  return (
    <div className="space-y-6">
      {/* Switch para habilitar división de cargos */}
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <Calculator className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="font-medium text-gray-900">División de Cargos</h3>
            <p className="text-sm text-gray-500">
              Dividir los costos entre múltiples responsables de pago
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <input
            id="charge-distribution-toggle"
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="charge-distribution-toggle" className="sr-only">
            Habilitar división de cargos
          </label>
        </div>
      </div>

      {isEnabled && (
        <>
          {/* Resumen de montos */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Resumen de Distribución
              </h4>
              <span className={`text-sm font-medium ${
                isDistributionValid ? 'text-green-600' : 'text-red-600'
              }`}>
                {isDistributionValid ? '✓ Válido' : '⚠ Requiere ajuste'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Total a distribuir:</span>
                <p className="font-semibold">${totalAmount.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-gray-500">Total distribuido:</span>
                <p className="font-semibold">${summary.totalDistributed.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-gray-500">Restante:</span>
                <p className={`font-semibold ${
                  summary.remaining === 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${summary.remaining.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Plantillas rápidas */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Plantillas de Distribución
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {templates.map((template) => (
                <button
                  key={template.template}
                  onClick={() => applyTemplate(template.template as DistributionTemplate)}
                  className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-sm text-gray-900">
                    {template.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {template.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tipo de distribución */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Tipo de Distribución</h4>
            <select
              value={distributionType}
              onChange={(e) => setDistributionType(e.target.value as ChargeDistributionType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {Object.entries(DISTRIBUTION_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Lista de distribuciones */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Responsables de Pago</h4>
              <div className="space-x-2">
                {distributionType === 'equal' && distributions.length > 0 && (
                  <button
                    onClick={redistributeEqually}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Redistribuir Equitativamente
                  </button>
                )}
                {distributionType === 'percentage' && distributions.length > 0 && (
                  <button
                    onClick={redistributeByPercentages}
                    className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                    Aplicar Porcentajes
                  </button>
                )}
                <button
                  onClick={addDistribution}
                  className="flex items-center px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Agregar
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {distributions.map((distribution) => (
                <div key={distribution.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Nombre del responsable */}
                    <div>
                      <label htmlFor={`guest-name-${distribution.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                        Responsable
                      </label>
                      <input
                        id={`guest-name-${distribution.id}`}
                        type="text"
                        value={distribution.guestName}
                        onChange={(e) => updateDistribution(distribution.id, { guestName: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Nombre del responsable"
                      />
                    </div>

                    {/* Método de pago */}
                    <div>
                      <label htmlFor={`payment-method-${distribution.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                        Método de Pago
                      </label>
                      <select
                        id={`payment-method-${distribution.id}`}
                        value={distribution.paymentMethod}
                        onChange={(e) => updateDistribution(distribution.id, { paymentMethod: e.target.value as PaymentMethod })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Monto/Porcentaje */}
                    <div>
                      <label htmlFor={`amount-${distribution.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                        {distributionType === 'percentage' ? 'Porcentaje (%)' : 'Monto ($)'}
                      </label>
                      <input
                        id={`amount-${distribution.id}`}
                        type="number"
                        min="0"
                        step={distributionType === 'percentage' ? '0.1' : '0.01'}
                        max={distributionType === 'percentage' ? '100' : totalAmount}
                        value={distributionType === 'percentage' ? (distribution.percentage || 0) : distribution.amount}
                        onChange={(e) => {
                          const value = Number.parseFloat(e.target.value) || 0;
                          if (distributionType === 'percentage') {
                            updateDistribution(distribution.id, { 
                              percentage: value,
                              amount: totalAmount * value / 100
                            });
                          } else {
                            updateDistribution(distribution.id, { 
                              amount: value,
                              percentage: (value / totalAmount) * 100
                            });
                          }
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    {/* Acciones */}
                    <div className="flex items-end">
                      <button
                        onClick={() => removeDistribution(distribution.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Eliminar responsable"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Descripción */}
                  <div className="mt-3">
                    <input
                      type="text"
                      value={distribution.description || ''}
                      onChange={(e) => updateDistribution(distribution.id, { description: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Descripción del cargo (opcional)"
                    />
                  </div>

                  {/* Mostrar información calculada */}
                  <div className="mt-2 text-xs text-gray-500 flex justify-between">
                    <span>
                      Monto: ${distribution.amount.toFixed(2)}
                    </span>
                    <span>
                      Porcentaje: {((distribution.amount / totalAmount) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {distributions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No hay responsables de pago definidos</p>
                <p className="text-sm">Usa las plantillas o agrega manualmente</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};