/**
 * 💳 Componente de Procesamiento de Pagexport const FolioPayments: React.FC<PaymentsProps> = ({
  folioId: _folioId,
  folio,
  onProcessPayment,
  isLoading,
  onSuccess,
  onError
}) => {sión 2.0
 * ===================================================
 * 
 * Componente moderno para procesamiento de pagos por responsable.
 * Soporte para múltiples métodos de pago y validación de saldos.
 */

import React, { useState } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  CheckCircle, 
  AlertTriangle,
  User,
  Building,
  Receipt,
  RefreshCw
} from 'lucide-react';

interface PaymentProps {
  folioId: number;
  folio: any;
  onPayment: (request: any) => Promise<boolean>;
  isLoading: boolean;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

interface PaymentForm {
  responsibleId: number | null;
  amount: number;
  method: string;
  reference: string;
  notes: string;
}

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Efectivo', icon: DollarSign },
  { id: 'credit_card', label: 'Tarjeta de Crédito', icon: CreditCard },
  { id: 'debit_card', label: 'Tarjeta de Débito', icon: CreditCard },
  { id: 'transfer', label: 'Transferencia', icon: Building },
  { id: 'check', label: 'Cheque', icon: Receipt }
];

export const FolioPayments: React.FC<PaymentProps> = ({
  folioId: _folioId2,
  folio,
  onPayment,
  isLoading,
  onSuccess,
  onError
}) => {
  const [form, setForm] = useState<PaymentForm>({
    responsibleId: null,
    amount: 0,
    method: '',
    reference: '',
    notes: ''
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Get responsible with pending amount
  const responsiblesWithDebt = folio?.responsibles?.filter((r: any) => r.pendingAmount > 0) || [];
  
  // Get selected responsible
  const selectedResponsible = form.responsibleId 
    ? folio?.responsibles?.find((r: any) => r.id === form.responsibleId)
    : null;

  // Validation
  const validatePayment = (): boolean => {
    const errors: string[] = [];

    if (form.amount <= 0) {
      errors.push('El monto debe ser mayor a cero');
    }

    if (!form.method) {
      errors.push('Debe seleccionar un método de pago');
    }

    if (form.responsibleId && selectedResponsible) {
      if (form.amount > selectedResponsible.pendingAmount) {
        errors.push(`El monto no puede ser mayor al saldo pendiente ($${selectedResponsible.pendingAmount.toFixed(2)})`);
      }
    } else {
      // General payment validation
      if (form.amount > folio?.pendingAmount) {
        errors.push(`El monto no puede ser mayor al saldo total pendiente ($${folio?.pendingAmount.toFixed(2)})`);
      }
    }

    if (form.method === 'check' && !form.reference) {
      errors.push('Debe proporcionar el número de cheque');
    }

    if (form.method === 'transfer' && !form.reference) {
      errors.push('Debe proporcionar la referencia de transferencia');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Handle payment submission
  const handleSubmitPayment = async () => {
    if (!validatePayment()) return;

    try {
      const request = {
        amount: form.amount,
        method: form.method,
        responsibleId: form.responsibleId,
        reference: form.reference || undefined,
        notes: form.notes || undefined
      };

      const success = await onPayment(request);
      if (success) {
        onSuccess(`Pago de $${form.amount.toFixed(2)} procesado exitosamente`);
        // Reset form
        setForm({
          responsibleId: null,
          amount: 0,
          method: '',
          reference: '',
          notes: ''
        });
      }
    } catch (error) {
      onError('Error al procesar el pago');
    }
  };

  // Set max amount for selected responsible
  const handleSetMaxAmount = () => {
    if (selectedResponsible) {
      setForm({ ...form, amount: selectedResponsible.pendingAmount });
    } else if (folio?.pendingAmount) {
      setForm({ ...form, amount: folio.pendingAmount });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Procesamiento de Pagos
        </h3>
        <p className="text-sm text-gray-600">
          Saldo total pendiente: <span className="font-semibold text-green-600">${folio?.pendingAmount?.toFixed(2) || '0.00'}</span>
        </p>
      </div>

      {/* Payment Type Selection */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">Tipo de Pago</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setForm({ ...form, responsibleId: null })}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              form.responsibleId === null
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <DollarSign className={`w-6 h-6 mt-1 ${form.responsibleId === null ? 'text-blue-600' : 'text-gray-400'}`} />
              <div>
                <div className={`font-medium ${form.responsibleId === null ? 'text-blue-900' : 'text-gray-900'}`}>
                  Pago General
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Aplicar al saldo general del folio
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              if (responsiblesWithDebt.length > 0) {
                setForm({ ...form, responsibleId: responsiblesWithDebt[0].id });
              }
            }}
            disabled={responsiblesWithDebt.length === 0}
            className={`p-4 rounded-lg border-2 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              form.responsibleId !== null
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <User className={`w-6 h-6 mt-1 ${form.responsibleId !== null ? 'text-purple-600' : 'text-gray-400'}`} />
              <div>
                <div className={`font-medium ${form.responsibleId !== null ? 'text-purple-900' : 'text-gray-900'}`}>
                  Pago por Responsable
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Aplicar a un responsable específico
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Responsible Selection */}
      {form.responsibleId !== null && responsiblesWithDebt.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Seleccionar Responsable</h4>
          <div className="space-y-2">
            {responsiblesWithDebt.map((responsible: any) => (
              <button
                key={responsible.id}
                onClick={() => setForm({ ...form, responsibleId: responsible.id })}
                className={`w-full p-3 rounded-lg border text-left transition-all ${
                  form.responsibleId === responsible.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900">{responsible.name}</div>
                    <div className="text-sm text-gray-600">{responsible.type}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-red-600">
                      ${responsible.pendingAmount.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">Pendiente</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Payment Form */}
      <div className="bg-gray-50 p-6 rounded-lg border">
        <h4 className="text-md font-medium text-gray-900 mb-4">Detalles del Pago</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto a Pagar <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount || ''}
                  onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              <button
                onClick={handleSetMaxAmount}
                className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Máximo
              </button>
            </div>
            {selectedResponsible && (
              <p className="text-xs text-gray-500 mt-1">
                Máximo: ${selectedResponsible.pendingAmount.toFixed(2)}
              </p>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Pago <span className="text-red-500">*</span>
            </label>
            <select
              value={form.method}
              onChange={(e) => setForm({ ...form, method: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar método</option>
              {PAYMENT_METHODS.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Referencia {(form.method === 'check' || form.method === 'transfer') && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={form.reference}
              onChange={(e) => setForm({ ...form, reference: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={
                form.method === 'check' ? 'Número de cheque' :
                form.method === 'transfer' ? 'Referencia de transferencia' :
                'Referencia opcional'
              }
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas
            </label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Notas adicionales..."
            />
          </div>
        </div>
      </div>

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

      {/* Payment Summary */}
      {form.amount > 0 && validationErrors.length === 0 && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-800 mb-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Resumen del Pago</span>
          </div>
          <div className="text-sm text-green-700">
            <p>Monto: ${form.amount.toFixed(2)}</p>
            <p>Método: {PAYMENT_METHODS.find(m => m.id === form.method)?.label}</p>
            {form.responsibleId ? (
              <p>Responsable: {selectedResponsible?.name}</p>
            ) : (
              <p>Aplicar a: Saldo general</p>
            )}
            {form.reference && <p>Referencia: {form.reference}</p>}
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
          onClick={handleSubmitPayment}
          disabled={isLoading || validationErrors.length > 0 || form.amount <= 0 || !form.method}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              Procesar Pago
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FolioPayments;