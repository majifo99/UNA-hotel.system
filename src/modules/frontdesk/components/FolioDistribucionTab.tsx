/**
 * Tab de Distribución del Folio
 * 
 * Permite distribuir los cargos entre los huéspedes según diferentes estrategias.
 */

import React, { useState } from 'react';
import { z } from 'zod';
import { 
  Divide, 
  Users, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Info 
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { folioService } from '../services/folioService';
import type { ClienteFolio, DistributionStrategy, ResponsableDistribucion } from '../types/folio.types';

// ============================================================================
// VALIDACIÓN
// ============================================================================

const distribucionSchema = z.object({
  strategy: z.enum(['single', 'equal', 'percent', 'fixed']),
  responsables: z.array(z.object({
    id_cliente: z.number(),
    percent: z.number().optional(),
    amount: z.number().optional()
  })).min(1, 'Debe seleccionar al menos un responsable')
});

type DistribucionFormData = z.infer<typeof distribucionSchema>;

// ============================================================================
// PROPS
// ============================================================================

interface FolioDistribucionTabProps {
  folioId: number;
  clientes: ClienteFolio[];
  montoADistribuir?: number;
}

// ============================================================================
// COMPONENTE
// ============================================================================

export const FolioDistribucionTab: React.FC<FolioDistribucionTabProps> = ({
  folioId,
  clientes,
  montoADistribuir = 0
}) => {
  const queryClient = useQueryClient();
  
  const [strategy, setStrategy] = useState<DistributionStrategy>('equal');
  const [selectedClientes, setSelectedClientes] = useState<Set<number>>(new Set());
  const [percentages, setPercentages] = useState<Record<number, number>>({});
  const [amounts, setAmounts] = useState<Record<number, number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mutación para distribuir
  const mutation = useMutation({
    mutationFn: async (data: DistribucionFormData) => {
      const operacion_uid = folioService.generarOperacionUID('dist');
      return await folioService.distribuirCargos(folioId, {
        operacion_uid,
        ...data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folio', 'resumen', folioId] });
      queryClient.invalidateQueries({ queryKey: ['folio', 'historial', folioId] });
      resetForm();
    }
  });

  const resetForm = () => {
    setSelectedClientes(new Set());
    setPercentages({});
    setAmounts({});
    setErrors({});
  };

  const handleToggleCliente = (idCliente: number) => {
    setSelectedClientes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(idCliente)) {
        newSet.delete(idCliente);
      } else {
        newSet.add(idCliente);
      }
      return newSet;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construir responsables según estrategia
    const responsables: ResponsableDistribucion[] = Array.from(selectedClientes).map(id => {
      const base = { id_cliente: id };
      
      if (strategy === 'percent') {
        return { ...base, percent: percentages[id] || 0 };
      } else if (strategy === 'fixed') {
        return { ...base, amount: amounts[id] || 0 };
      }
      
      return base;
    });

    const formData: DistribucionFormData = {
      strategy,
      responsables
    };

    try {
      distribucionSchema.parse(formData);
      setErrors({});
      
      // Validaciones adicionales según estrategia
      if (strategy === 'percent') {
        const totalPercent = Object.values(percentages).reduce((sum, p) => sum + (p || 0), 0);
        if (Math.abs(totalPercent - 100) > 0.01) {
          setErrors({ percent: 'Los porcentajes deben sumar 100%' });
          return;
        }
      }
      
      await mutation.mutateAsync(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  const totalPercent = Object.values(percentages).reduce((sum, p) => sum + (p || 0), 0);
  const totalAmount = Object.values(amounts).reduce((sum, a) => sum + (a || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Distribución de Cargos</h3>
        <p className="text-sm text-gray-600 mt-1">
          Monto a distribuir: <span className="font-semibold">${montoADistribuir.toFixed(2)}</span>
        </p>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">¿Cómo funciona la distribución?</p>
          <p className="mt-1">
            Distribuye los cargos entre los huéspedes según tu preferencia: 
            asignar todo a uno, dividir equitativamente, o personalizar con porcentajes/montos fijos.
          </p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {mutation.isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Error al distribuir</p>
              <p className="text-red-700 text-sm mt-1">{mutation.error?.message}</p>
            </div>
          </div>
        )}

        {mutation.isSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800">Distribución realizada exitosamente</p>
          </div>
        )}

        {/* Estrategia */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Estrategia de Distribución
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { value: 'single', label: 'Asignar a uno solo', desc: 'Todo a una persona' },
              { value: 'equal', label: 'Dividir equitativamente', desc: 'Partes iguales' },
              { value: 'percent', label: 'Por porcentajes', desc: 'Asignar % específicos' },
              { value: 'fixed', label: 'Montos fijos', desc: 'Asignar $ específicos' }
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStrategy(opt.value as DistributionStrategy)}
                className={`
                  p-4 border rounded-lg text-left transition-colors
                  ${strategy === opt.value 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}
              >
                <p className="font-medium text-gray-900">{opt.label}</p>
                <p className="text-xs text-gray-600 mt-1">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Selección de clientes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Seleccionar Responsables
          </label>
          <div className="space-y-2">
            {clientes.map(cliente => (
              <div
                key={cliente.id_cliente}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedClientes.has(cliente.id_cliente)}
                    onChange={() => handleToggleCliente(cliente.id_cliente)}
                    className="mt-1 w-4 h-4 text-blue-600 rounded"
                    disabled={mutation.isPending}
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {cliente.nombre}
                      </span>
                      {cliente.es_titular && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          Titular
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">ID: {cliente.id_cliente}</p>

                    {/* Inputs para percent o fixed */}
                    {selectedClientes.has(cliente.id_cliente) && strategy === 'percent' && (
                      <div className="mt-3">
                        <label className="text-xs text-gray-600">Porcentaje (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={percentages[cliente.id_cliente] || ''}
                          onChange={(e) => setPercentages(prev => ({
                            ...prev,
                            [cliente.id_cliente]: parseFloat(e.target.value) || 0
                          }))}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="0.00"
                          disabled={mutation.isPending}
                        />
                      </div>
                    )}

                    {selectedClientes.has(cliente.id_cliente) && strategy === 'fixed' && (
                      <div className="mt-3">
                        <label className="text-xs text-gray-600">Monto ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={amounts[cliente.id_cliente] || ''}
                          onChange={(e) => setAmounts(prev => ({
                            ...prev,
                            [cliente.id_cliente]: parseFloat(e.target.value) || 0
                          }))}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="0.00"
                          disabled={mutation.isPending}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {errors.responsables && (
            <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.responsables}
            </p>
          )}
        </div>

        {/* Resumen */}
        {strategy === 'percent' && selectedClientes.size > 0 && (
          <div className={`
            p-4 rounded-lg border
            ${Math.abs(totalPercent - 100) < 0.01 
              ? 'bg-green-50 border-green-200' 
              : 'bg-amber-50 border-amber-200'
            }
          `}>
            <p className="text-sm font-medium">
              Total: {totalPercent.toFixed(2)}% 
              {Math.abs(totalPercent - 100) < 0.01 ? ' ✓' : ' (debe ser 100%)'}
            </p>
          </div>
        )}

        {strategy === 'fixed' && selectedClientes.size > 0 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium">
              Total asignado: ${totalAmount.toFixed(2)} de ${montoADistribuir.toFixed(2)}
            </p>
          </div>
        )}

        {errors.percent && (
          <p className="text-red-600 text-sm flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.percent}
          </p>
        )}

        {/* Botón de acción */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={resetForm}
            disabled={mutation.isPending}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            Limpiar
          </button>
          <button
            type="submit"
            disabled={mutation.isPending || selectedClientes.size === 0}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Distribuyendo...
              </>
            ) : (
              <>
                <Divide className="w-4 h-4" />
                Distribuir Cargos
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FolioDistribucionTab;
