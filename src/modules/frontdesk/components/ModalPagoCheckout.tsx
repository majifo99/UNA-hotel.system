/**
 * Modal de Pago para Checkout
 * 
 * Permite registrar pagos individuales o generales desde la página de checkout
 * con soporte para pagos separados por cliente.
 */

import React, { useState, useEffect } from 'react';
import { X, CreditCard, User, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Cliente {
  id_cliente: number;
  nombre: string;
  saldo: number;
  asignado: number;
  pagos: number;
}

interface ModalPagoCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  folioId: number;
  saldoTotal: number;
  clientes: Cliente[];
  onPagoRegistrado: () => Promise<void>;
  registrarPagoFn: (monto: number, metodo: string, idCliente?: number, nota?: string) => Promise<boolean>;
}

type MetodoPago = 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Cheque' | 'Otro';

const METODOS_PAGO: MetodoPago[] = ['Efectivo', 'Tarjeta', 'Transferencia', 'Cheque', 'Otro'];

export const ModalPagoCheckout: React.FC<ModalPagoCheckoutProps> = ({
  isOpen,
  onClose,
  folioId,
  saldoTotal,
  clientes,
  onPagoRegistrado,
  registrarPagoFn
}) => {
  const [monto, setMonto] = useState<number>(0);
  const [metodo, setMetodo] = useState<MetodoPago>('Efectivo');
  const [idCliente, setIdCliente] = useState<number | null>(null);
  const [nota, setNota] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cliente seleccionado
  const clienteSeleccionado = idCliente 
    ? clientes.find(c => c.id_cliente === idCliente)
    : null;

  const saldoMaximo = clienteSeleccionado ? clienteSeleccionado.saldo : saldoTotal;

  // Reset al abrir/cerrar
  useEffect(() => {
    if (isOpen) {
      setMonto(0);
      setMetodo('Efectivo');
      setIdCliente(null);
      setNota('');
      setError(null);
    }
  }, [isOpen]);

  // Llenar saldo completo
  const llenarSaldoCompleto = () => {
    if (saldoMaximo > 0) {
      setMonto(saldoMaximo);
      setError(null);
    }
  };

  // Validar y registrar pago
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (monto <= 0) {
      setError('El monto debe ser mayor a 0');
      return;
    }

    if (clienteSeleccionado && monto > clienteSeleccionado.saldo) {
      setError(`El monto excede el saldo del cliente ($${clienteSeleccionado.saldo.toFixed(2)})`);
      return;
    }

    if (!idCliente && monto > saldoTotal) {
      setError(`El monto excede el saldo total del folio ($${saldoTotal.toFixed(2)})`);
      return;
    }

    setIsProcessing(true);

    try {
      const notaFinal = nota || (clienteSeleccionado 
        ? `Pago individual - ${clienteSeleccionado.nombre}`
        : 'Pago general del folio');

      const exito = await registrarPagoFn(monto, metodo, idCliente ?? undefined, notaFinal);

      if (exito) {
        toast.success('Pago registrado exitosamente', {
          description: `$${monto.toFixed(2)} - ${metodo}${clienteSeleccionado ? ` (${clienteSeleccionado.nombre})` : ''}`
        });

        // Refresh de datos
        await onPagoRegistrado();

        // Cerrar modal
        onClose();
      } else {
        setError('No se pudo registrar el pago. Intenta nuevamente.');
      }
    } catch (err) {
      console.error('Error al registrar pago:', err);
      setError('Error al procesar el pago');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Registrar Pago</h2>
              <p className="text-sm text-gray-500">Folio #{folioId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Resumen de saldos */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-blue-600 font-medium uppercase mb-1">Saldo Total</p>
              <p className="text-2xl font-bold text-blue-900">${saldoTotal.toFixed(2)}</p>
            </div>
            {clienteSeleccionado && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-xs text-purple-600 font-medium uppercase mb-1">Saldo {clienteSeleccionado.nombre}</p>
                <p className="text-2xl font-bold text-purple-900">${clienteSeleccionado.saldo.toFixed(2)}</p>
              </div>
            )}
          </div>

          {/* Asignar a */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Asignar pago a
            </label>
            <select
              value={idCliente?.toString() || 'general'}
              onChange={(e) => {
                const value = e.target.value === 'general' ? null : parseInt(e.target.value);
                setIdCliente(value);
                setMonto(0); // Reset monto al cambiar cliente
                setError(null);
              }}
              disabled={isProcessing}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="general">💳 Pago General (Cubre todo el folio)</option>
              {clientes.map(cliente => (
                <option key={cliente.id_cliente} value={cliente.id_cliente}>
                  👤 {cliente.nombre} - Saldo: ${cliente.saldo.toFixed(2)}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">
              {idCliente 
                ? '💡 El pago se asignará solo a los cargos de este cliente'
                : '💡 El pago general cubre todos los cargos sin importar el responsable'
              }
            </p>
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto a pagar
              {saldoMaximo > 0 && (
                <span className="ml-2 text-xs font-normal text-gray-500">
                  (Máximo: ${saldoMaximo.toFixed(2)})
                </span>
              )}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                max={saldoMaximo}
                value={monto || ''}
                onChange={(e) => {
                  setMonto(parseFloat(e.target.value) || 0);
                  setError(null);
                }}
                disabled={isProcessing}
                className="w-full pl-10 pr-32 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg font-semibold"
                placeholder="0.00"
              />
              {saldoMaximo > 0 && (
                <button
                  type="button"
                  onClick={llenarSaldoCompleto}
                  disabled={isProcessing}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors font-medium"
                >
                  Saldo completo
                </button>
              )}
            </div>
          </div>

          {/* Método de Pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Pago
            </label>
            <div className="grid grid-cols-5 gap-2">
              {METODOS_PAGO.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMetodo(m)}
                  disabled={isProcessing}
                  className={`px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                    metodo === m
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Nota (opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nota (Opcional)
            </label>
            <textarea
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              disabled={isProcessing}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
              placeholder="Información adicional sobre el pago..."
            />
          </div>

          {/* Resumen del cliente seleccionado */}
          {clienteSeleccionado && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-gray-500" />
                <p className="font-semibold text-gray-900">{clienteSeleccionado.nombre}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Cargos</p>
                  <p className="font-semibold text-blue-600">${clienteSeleccionado.asignado.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Pagado</p>
                  <p className="font-semibold text-green-600">${clienteSeleccionado.pagos.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Saldo</p>
                  <p className="font-semibold text-red-600">${clienteSeleccionado.saldo.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isProcessing || monto <= 0}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Registrar Pago ${monto.toFixed(2)}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
