/**
 * Tab de Pagos del Folio
 * 
 * Muestra la lista de pagos registrados y permite agregar nuevos pagos.
 */

import React, { useState } from 'react';
import { z } from 'zod';
import { 
  CreditCard, 
  Plus, 
  DollarSign, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  User 
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { folioService } from '../services/folioService';
import type { ClienteFolio, Pago, MetodoPago, ResultadoPago } from '../types/folio.types';

// ============================================================================
// VALIDACIÓN
// ============================================================================

const pagoSchema = z.object({
  monto: z.number().positive('El monto debe ser mayor a 0'),
  metodo: z.enum(['efectivo', 'tarjeta', 'transferencia', 'cheque', 'otro']),
  resultado: z.enum(['aprobado', 'rechazado', 'pendiente']),
  id_cliente: z.number().nullable(),
  nota: z.string().optional()
});

type PagoFormData = z.infer<typeof pagoSchema>;

// ============================================================================
// PROPS
// ============================================================================

interface FolioPagosTabProps {
  folioId: number;
  clientes: ClienteFolio[];
  pagos?: Pago[];
  isLoading?: boolean;
  totalCargos?: number;
  totalPagado?: number;
  personas?: Array<{
    id_cliente: number;
    nombre: string;
    asignado: number;
    pagos: number;
    saldo: number;
  }>;
}

// ============================================================================
// COMPONENTE
// ============================================================================

export const FolioPagosTab: React.FC<FolioPagosTabProps> = ({
  folioId,
  clientes,
  pagos = [],
  isLoading = false,
  totalCargos = 0,
  totalPagado = 0,
  personas = []
}) => {
  const queryClient = useQueryClient();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formData, setFormData] = useState<PagoFormData>({
    monto: 0,
    metodo: 'efectivo',
    resultado: 'aprobado',
    id_cliente: null,
    nota: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mutación para agregar pago
  const mutation = useMutation({
    mutationFn: async (data: PagoFormData) => {
      const operacion_uid = folioService.generarOperacionUID('pay');
      return await folioService.registrarPago(folioId, {
        operacion_uid,
        monto: data.monto,
        metodo: data.metodo,
        resultado: data.resultado,
        id_cliente: data.id_cliente ?? undefined,
        nota: data.nota
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folio', 'resumen', folioId] });
      queryClient.invalidateQueries({ queryKey: ['folio', 'historial', folioId] });
      setMostrarFormulario(false);
      resetForm();
    }
  });

  const resetForm = () => {
    setFormData({
      monto: 0,
      metodo: 'efectivo',
      resultado: 'aprobado',
      id_cliente: null,
      nota: ''
    });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación adicional: verificar que no exceda el saldo del cliente
    if (clienteSeleccionado && formData.monto > clienteSeleccionado.saldo) {
      setErrors({
        monto: `El monto excede el saldo del cliente ($${clienteSeleccionado.saldo.toFixed(2)})`
      });
      return;
    }

    // Validación adicional: verificar que no exceda el saldo general
    if (!formData.id_cliente && formData.monto > saldoPendiente) {
      setErrors({
        monto: `El monto excede el saldo pendiente del folio ($${saldoPendiente.toFixed(2)})`
      });
      return;
    }
    
    try {
      pagoSchema.parse(formData);
      setErrors({});
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

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-CR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const saldoPendiente = totalCargos - totalPagado;

  // Obtener saldo del cliente seleccionado
  const clienteSeleccionado = formData.id_cliente 
    ? personas.find(p => p.id_cliente === formData.id_cliente)
    : null;

  const saldoMaximo = clienteSeleccionado ? clienteSeleccionado.saldo : saldoPendiente;

  // Función para llenar el saldo completo
  const llenarSaldoCompleto = () => {
    if (saldoMaximo > 0) {
      setFormData(prev => ({ ...prev, monto: saldoMaximo }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Resumen financiero */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-600 font-medium uppercase mb-1">Total Cargos</p>
          <p className="text-2xl font-bold text-blue-900">${totalCargos.toFixed(2)}</p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-xs text-green-600 font-medium uppercase mb-1">Total Pagado</p>
          <p className="text-2xl font-bold text-green-900">${totalPagado.toFixed(2)}</p>
        </div>
        
        <div className={`border rounded-lg p-4 ${
          saldoPendiente > 0 
            ? 'bg-red-50 border-red-200' 
            : saldoPendiente < 0 
            ? 'bg-yellow-50 border-yellow-200'
            : 'bg-gray-50 border-gray-200'
        }`}>
          <p className={`text-xs font-medium uppercase mb-1 ${
            saldoPendiente > 0 
              ? 'text-red-600' 
              : saldoPendiente < 0 
              ? 'text-yellow-600'
              : 'text-gray-600'
          }`}>
            Saldo Pendiente
          </p>
          <p className={`text-2xl font-bold ${
            saldoPendiente > 0 
              ? 'text-red-900' 
              : saldoPendiente < 0 
              ? 'text-yellow-900'
              : 'text-gray-900'
          }`}>
            ${Math.abs(saldoPendiente).toFixed(2)}
          </p>
          {saldoPendiente < 0 && (
            <p className="text-xs text-yellow-700 mt-1">A favor del cliente</p>
          )}
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-xs text-purple-600 font-medium uppercase mb-1">Pagos Registrados</p>
          <p className="text-2xl font-bold text-purple-900">{pagos.length}</p>
        </div>
      </div>

      {/* Distribución por persona */}
      {personas.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Distribución por Huésped</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {personas.map(persona => (
              <div 
                key={persona.id_cliente} 
                className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{persona.nombre}</p>
                      <p className="text-xs text-gray-500">ID: {persona.id_cliente}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-gray-600">Cargos asignados:</span>
                    <span className="font-semibold text-blue-600">
                      ${persona.asignado.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-gray-600">Pagos realizados:</span>
                    <span className="font-semibold text-green-600">
                      ${persona.pagos.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-gray-700 font-medium">Saldo:</span>
                    <span className={`font-bold text-lg ${
                      persona.saldo > 0 
                        ? 'text-red-600' 
                        : persona.saldo < 0 
                        ? 'text-yellow-600' 
                        : 'text-green-600'
                    }`}>
                      ${Math.abs(persona.saldo).toFixed(2)}
                    </span>
                  </div>
                  
                  {persona.saldo === 0 && (
                    <div className="mt-2 bg-green-50 border border-green-200 rounded px-2 py-1 text-xs text-green-700 text-center">
                      ✓ Liquidado
                    </div>
                  )}
                  
                  {persona.saldo > 0 && (
                    <div className="mt-2 bg-red-50 border border-red-200 rounded px-2 py-1 text-xs text-red-700 text-center">
                      Pendiente de pago
                    </div>
                  )}
                  
                  {persona.saldo < 0 && (
                    <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded px-2 py-1 text-xs text-yellow-700 text-center">
                      A favor del huésped
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Historial de Pagos</h3>
          <p className="text-sm text-gray-600 mt-1">
            {pagos.length} {pagos.length === 1 ? 'pago registrado' : 'pagos registrados'}
          </p>
        </div>
        
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Registrar Pago
        </button>
      </div>

      {/* Formulario */}
      {mostrarFormulario && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Nuevo Pago</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mutation.isError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">Error al registrar el pago</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Monto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto
                  {saldoMaximo > 0 && (
                    <span className="ml-2 text-xs font-normal text-gray-500">
                      (Máximo: ${saldoMaximo.toFixed(2)})
                    </span>
                  )}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.monto || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, monto: parseFloat(e.target.value) || 0 }))}
                    className={`w-full pl-8 pr-4 py-2 border rounded-lg ${errors.monto ? 'border-red-300' : 'border-gray-300'}`}
                    disabled={mutation.isPending}
                  />
                  {saldoMaximo > 0 && (
                    <button
                      type="button"
                      onClick={llenarSaldoCompleto}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      disabled={mutation.isPending}
                    >
                      Saldo completo
                    </button>
                  )}
                </div>
                {errors.monto && <p className="text-red-600 text-xs mt-1">{errors.monto}</p>}
                {clienteSeleccionado && (
                  <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-2">
                    <p className="text-xs text-blue-700">
                      <span className="font-semibold">{clienteSeleccionado.nombre}</span>
                      {' '}debe: ${clienteSeleccionado.saldo.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              {/* Método */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de Pago
                </label>
                <select
                  value={formData.metodo}
                  onChange={(e) => setFormData(prev => ({ ...prev, metodo: e.target.value as MetodoPago }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  disabled={mutation.isPending}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="cheque">Cheque</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              {/* Cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asignar a
                </label>
                <select
                  value={formData.id_cliente?.toString() || 'general'}
                  onChange={(e) => {
                    const value = e.target.value === 'general' ? null : parseInt(e.target.value);
                    setFormData(prev => ({ ...prev, id_cliente: value }));
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  disabled={mutation.isPending}
                >
                  <option value="general">Pago General (Cubre todo el folio)</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id_cliente} value={cliente.id_cliente}>
                      {cliente.nombre} {cliente.es_titular ? '(Titular)' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.id_cliente 
                    ? '💡 Pago individual: solo cubre los cargos de este cliente'
                    : '💡 Pago general: cubre todos los cargos del folio sin importar quién los hizo'
                  }
                </p>
              </div>

              {/* Resultado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={formData.resultado}
                  onChange={(e) => setFormData(prev => ({ ...prev, resultado: e.target.value as ResultadoPago }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  disabled={mutation.isPending}
                >
                  <option value="aprobado">Aprobado</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="rechazado">Rechazado</option>
                </select>
              </div>
            </div>

            {/* Nota */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nota (Opcional)
              </label>
              <textarea
                value={formData.nota || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, nota: e.target.value }))}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none"
                placeholder="Información adicional sobre el pago..."
                disabled={mutation.isPending}
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => { setMostrarFormulario(false); resetForm(); }}
                disabled={mutation.isPending}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4" />
                    Registrar Pago
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de pagos */}
      {isLoading && (
        <div className="flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Cargando pagos...</p>
          </div>
        </div>
      )}

      {!isLoading && pagos.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No hay pagos registrados</p>
          <p className="text-sm text-gray-500 mt-1">
            Registra el primer pago usando el botón de arriba
          </p>
        </div>
      )}

      {!isLoading && pagos.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pagos.map((pago) => (
                  <tr key={pago.id_pago} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {pago.metodo}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {pago.id_cliente ? (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {pago.cliente?.nombre || `Cliente #${pago.id_cliente}`}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 italic">Pago General</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-semibold text-green-600">
                        ${pago.monto.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        const getBadgeClass = () => {
                          if (pago.resultado === 'aprobado') return 'bg-green-100 text-green-800';
                          if (pago.resultado === 'pendiente') return 'bg-yellow-100 text-yellow-800';
                          return 'bg-red-100 text-red-800';
                        };
                        
                        return (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getBadgeClass()}`}>
                            {pago.resultado === 'aprobado' && <CheckCircle className="w-3 h-3" />}
                            {pago.resultado === 'pendiente' && <AlertCircle className="w-3 h-3" />}
                            <span className="capitalize">{pago.resultado}</span>
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFecha(pago.created_at)}
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

export default FolioPagosTab;
