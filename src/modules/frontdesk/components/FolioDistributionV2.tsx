/**
 * 🔄 Componente de Distribución de Cargos - Versión 2.0
 * ===================================================
 * 
 * Componente moderno para distribución inteligente de cargos en folios.
 * Soporte para múltiples estrategias y validación en tiempo real.
 */

import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Users, 
  Percent, 
  DollarSign, 
  CheckCircle, 
  AlertTriangle,
  Plus,
  Trash2,
  RefreshCw
} from 'lucide-react';

interface DistributionProps {
  folioId: number;
  folio: any;
  onDistribute: (request: any) => Promise<boolean>;
  isLoading: boolean;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

type DistributionStrategy = 'single' | 'equal' | 'percent' | 'fixed';

interface Responsible {
  id: number;
  name: string;
  percentage?: number;
  amount?: number;
  isValid?: boolean;
}

export const FolioDistribution: React.FC<DistributionProps> = ({
  folioId: _folioId,
  folio,
  onDistribute,
  isLoading,
  onSuccess,
  onError
}) => {
  const [strategy, setStrategy] = useState<DistributionStrategy>('equal');
  const [responsibles, setResponsibles] = useState<Responsible[]>([]);
  const [newResponsibleId, setNewResponsibleId] = useState<string>('');
  const [newResponsibleName, setNewResponsibleName] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Available amount to distribute
  const availableAmount = folio?.unassignedCharges || 0;

  // Initialize with existing responsibles
  useEffect(() => {
    if (folio?.responsibles && folio.responsibles.length > 0) {
      setResponsibles(folio.responsibles.map((r: any) => ({
        id: r.id,
        name: r.name,
        percentage: strategy === 'percent' ? 0 : undefined,
        amount: strategy === 'fixed' ? 0 : undefined
      })));
    }
  }, [folio, strategy]);

  // Strategy configurations
  const strategies = [
    {
      id: 'single' as DistributionStrategy,
      label: 'Todo a una persona',
      description: 'Asigna todo el monto a un responsable',
      icon: Users,
      color: 'blue'
    },
    {
      id: 'equal' as DistributionStrategy,
      label: 'Partes iguales',
      description: 'Divide equitativamente entre responsables',
      icon: Calculator,
      color: 'green'
    },
    {
      id: 'percent' as DistributionStrategy,
      label: 'Por porcentajes',
      description: 'Distribución por porcentajes personalizados',
      icon: Percent,
      color: 'purple'
    },
    {
      id: 'fixed' as DistributionStrategy,
      label: 'Montos fijos',
      description: 'Asigna montos específicos a cada responsable',
      icon: DollarSign,
      color: 'orange'
    }
  ];

  // Add new responsible
  const handleAddResponsible = () => {
    if (!newResponsibleId || !newResponsibleName) return;

    const newResponsible: Responsible = {
      id: parseInt(newResponsibleId),
      name: newResponsibleName,
      percentage: strategy === 'percent' ? 0 : undefined,
      amount: strategy === 'fixed' ? 0 : undefined
    };

    setResponsibles([...responsibles, newResponsible]);
    setNewResponsibleId('');
    setNewResponsibleName('');
  };

  // Remove responsible
  const handleRemoveResponsible = (id: number) => {
    setResponsibles(responsibles.filter(r => r.id !== id));
  };

  // Update responsible data
  const handleUpdateResponsible = (id: number, field: 'percentage' | 'amount', value: number) => {
    setResponsibles(responsibles.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ));
  };

  // Validation
  const validateDistribution = (): boolean => {
    const errors: string[] = [];

    if (responsibles.length === 0) {
      errors.push('Debe agregar al menos un responsable');
    }

    if (strategy === 'single' && responsibles.length > 1) {
      errors.push('Para estrategia "Todo a una persona" solo puede haber un responsable');
    }

    if (strategy === 'percent') {
      const totalPercentage = responsibles.reduce((sum, r) => sum + (r.percentage || 0), 0);
      if (Math.abs(totalPercentage - 100) > 0.01) {
        errors.push(`Los porcentajes deben sumar exactamente 100% (actual: ${totalPercentage.toFixed(2)}%)`);
      }
    }

    if (strategy === 'fixed') {
      const totalAmount = responsibles.reduce((sum, r) => sum + (r.amount || 0), 0);
      if (Math.abs(totalAmount - availableAmount) > 0.01) {
        errors.push(`Los montos deben sumar exactamente $${availableAmount.toFixed(2)} (actual: $${totalAmount.toFixed(2)})`);
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Execute distribution
  const handleDistribute = async () => {
    if (!validateDistribution()) return;

    try {
      const request = {
        strategy,
        responsibles: responsibles.map(r => ({
          id: r.id,
          percentage: r.percentage,
          amount: r.amount
        }))
      };

      const success = await onDistribute(request);
      if (success) {
        onSuccess('Cargos distribuidos exitosamente');
      }
    } catch (error) {
      onError('Error al distribuir los cargos');
    }
  };

  // Calculate amounts for display
  const getCalculatedAmount = (responsible: Responsible): number => {
    if (strategy === 'fixed') return responsible.amount || 0;
    if (strategy === 'percent') return (availableAmount * (responsible.percentage || 0)) / 100;
    if (strategy === 'equal') return availableAmount / responsibles.length;
    if (strategy === 'single') return availableAmount;
    return 0;
  };

  // Auto-calculate equal distribution
  useEffect(() => {
    if (strategy === 'equal' && responsibles.length > 0) {
      validateDistribution();
    }
  }, [strategy, responsibles.length]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Distribución de Cargos
        </h3>
        <p className="text-sm text-gray-600">
          Monto disponible para distribuir: <span className="font-semibold text-blue-600">${availableAmount.toFixed(2)}</span>
        </p>
      </div>

      {/* Strategy Selection */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">Estrategia de Distribución</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {strategies.map((strat) => {
            const Icon = strat.icon;
            const isSelected = strategy === strat.id;
            return (
              <button
                key={strat.id}
                onClick={() => setStrategy(strat.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  isSelected 
                    ? `border-${strat.color}-500 bg-${strat.color}-50` 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-6 h-6 mt-1 ${isSelected ? `text-${strat.color}-600` : 'text-gray-400'}`} />
                  <div>
                    <div className={`font-medium ${isSelected ? `text-${strat.color}-900` : 'text-gray-900'}`}>
                      {strat.label}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {strat.description}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Add Responsible */}
      <div className="bg-gray-50 p-4 rounded-lg border">
        <h4 className="text-md font-medium text-gray-900 mb-3">Agregar Responsable</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="number"
            placeholder="ID Cliente"
            value={newResponsibleId}
            onChange={(e) => setNewResponsibleId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Nombre"
            value={newResponsibleName}
            onChange={(e) => setNewResponsibleName(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddResponsible}
            disabled={!newResponsibleId || !newResponsibleName}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </button>
        </div>
      </div>

      {/* Responsibles List */}
      {responsibles.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Responsables de Pago</h4>
          <div className="space-y-3">
            {responsibles.map((responsible) => (
              <div key={responsible.id} className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{responsible.name}</div>
                    <div className="text-sm text-gray-600">ID: {responsible.id}</div>
                  </div>

                  {/* Strategy-specific inputs */}
                  <div className="flex items-center gap-4">
                    {strategy === 'percent' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={responsible.percentage || ''}
                          onChange={(e) => handleUpdateResponsible(responsible.id, 'percentage', parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                        />
                        <span className="text-sm text-gray-600">%</span>
                      </div>
                    )}

                    {strategy === 'fixed' && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">$</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={responsible.amount || ''}
                          onChange={(e) => handleUpdateResponsible(responsible.id, 'amount', parseFloat(e.target.value) || 0)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-center"
                        />
                      </div>
                    )}

                    {/* Calculated amount display */}
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        ${getCalculatedAmount(responsible).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">Asignado</div>
                    </div>

                    <button
                      onClick={() => handleRemoveResponsible(responsible.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Errores de Validación</span>
          </div>
          <ul className="space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index} className="text-sm text-red-700">• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Distribution Summary */}
      {responsibles.length > 0 && validationErrors.length === 0 && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-800 mb-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Distribución Válida</span>
          </div>
          <div className="text-sm text-green-700">
            Total a distribuir: ${responsibles.reduce((sum, r) => sum + getCalculatedAmount(r), 0).toFixed(2)} 
            de ${availableAmount.toFixed(2)}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
        
        <button
          onClick={handleDistribute}
          disabled={isLoading || validationErrors.length > 0 || responsibles.length === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Distribuyendo...
            </>
          ) : (
            <>
              <Calculator className="w-4 h-4" />
              Distribuir Cargos
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FolioDistribution;