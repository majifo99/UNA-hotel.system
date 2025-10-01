import React, { useState } from 'react';
import { CreditCard, DollarSign, User, Globe, AlertCircle, CheckCircle } from 'lucide-react';
import { folioService, type PagoRequest } from '../services/folioService';

interface FolioPagosProps {
  folioId: number;
  personas: Array<{
    id_cliente: number;
    nombre?: string;
    saldo: number;
  }>;
  saldoGlobal: number;
  onPagoCompleto?: (data: any) => void;
}

const METODOS_PAGO = [
  'Efectivo',
  'Tarjeta',
  'Transferencia',
  'Cheque',
  'Voucher',
  'Cortesía'
] as const;

export const FolioPagos: React.FC<FolioPagosProps> = ({
  folioId,
  personas,
  saldoGlobal,
  onPagoCompleto
}) => {
  const [tipoPago, setTipoPago] = useState<'general' | 'persona'>('general');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<number | null>(null);
  const [monto, setMonto] = useState<string>('');
  const [metodo, setMetodo] = useState<string>('Efectivo');
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  const resetearFormulario = () => {
    setMonto('');
    setError(null);
    setExito(null);
  };

  const registrarPago = async () => {
    try {
      setProcesando(true);
      setError(null);
      setExito(null);

      const montoNumerico = parseFloat(monto);
      
      if (!montoNumerico || montoNumerico <= 0) {
        setError('El monto debe ser mayor a 0');
        return;
      }

      // Validar límites según el tipo de pago
      if (tipoPago === 'general') {
        if (montoNumerico > saldoGlobal) {
          setError(`El monto no puede exceder el saldo global ($${saldoGlobal.toFixed(2)})`);
          return;
        }
      } else {
        if (!clienteSeleccionado) {
          setError('Debe seleccionar un cliente');
          return;
        }
        
        const persona = personas.find(p => p.id_cliente === clienteSeleccionado);
        if (!persona) {
          setError('Cliente no encontrado');
          return;
        }
        
        if (montoNumerico > persona.saldo) {
          setError(`El monto no puede exceder el saldo del cliente ($${persona.saldo.toFixed(2)})`);
          return;
        }
      }

      // Generar ID único para la operación
      const operacion_uid = `pay-${Date.now()}-${Math.random().toString(36).substring(2, 12)}`;

      const pagoData: PagoRequest = {
        operacion_uid,
        monto: montoNumerico,
        metodo,
        resultado: 'OK',
        ...(tipoPago === 'persona' && clienteSeleccionado ? { id_cliente: clienteSeleccionado } : {})
      };

      const resultado = await folioService.registrarPago(folioId, pagoData);
      
      setExito(`Pago de $${montoNumerico.toFixed(2)} registrado exitosamente`);
      resetearFormulario();
      
      if (onPagoCompleto) {
        onPagoCompleto(resultado);
      }
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al registrar el pago';
      setError(errorMessage);
    } finally {
      setProcesando(false);
    }
  };

  const montoMaximo = tipoPago === 'general' 
    ? saldoGlobal 
    : personas.find(p => p.id_cliente === clienteSeleccionado)?.saldo || 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center mb-4">
        <CreditCard className="w-5 h-5 mr-2 text-green-600" />
        <h3 className="text-lg font-medium text-gray-900">Registrar Pago</h3>
      </div>

      {/* Tipo de pago */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Pago
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              setTipoPago('general');
              setClienteSeleccionado(null);
              resetearFormulario();
            }}
            className={`p-3 rounded-lg border-2 transition-colors ${
              tipoPago === 'general'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Globe className="w-5 h-5 mx-auto mb-1" />
            <div className="text-sm font-medium">Pago General</div>
            <div className="text-xs text-gray-500">Sin asignar a cliente</div>
          </button>
          
          <button
            onClick={() => {
              setTipoPago('persona');
              resetearFormulario();
            }}
            className={`p-3 rounded-lg border-2 transition-colors ${
              tipoPago === 'persona'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <User className="w-5 h-5 mx-auto mb-1" />
            <div className="text-sm font-medium">Pago por Cliente</div>
            <div className="text-xs text-gray-500">Asignado a cliente específico</div>
          </button>
        </div>
      </div>

      {/* Selección de cliente (solo para pago por persona) */}
      {tipoPago === 'persona' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Cliente
          </label>
          <select
            value={clienteSeleccionado || ''}
            onChange={(e) => {
              setClienteSeleccionado(e.target.value ? parseInt(e.target.value) : null);
              resetearFormulario();
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar cliente...</option>
            {personas.map(persona => (
              <option key={persona.id_cliente} value={persona.id_cliente}>
                {persona.nombre || `Cliente ${persona.id_cliente}`} - Saldo: ${persona.saldo.toFixed(2)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Monto */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Monto del Pago
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <DollarSign className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="number"
            min="0"
            max={montoMaximo}
            step="0.01"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
          />
        </div>
        <div className="mt-1 text-xs text-gray-500">
          Máximo disponible: ${montoMaximo.toFixed(2)}
        </div>
      </div>

      {/* Método de pago */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Método de Pago
        </label>
        <select
          value={metodo}
          onChange={(e) => setMetodo(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {METODOS_PAGO.map(método => (
            <option key={método} value={método}>
              {método}
            </option>
          ))}
        </select>
      </div>

      {/* Mensajes */}
      {(error || exito) && (
        <div className={`mb-4 p-3 rounded-lg border-l-4 ${
          error 
            ? 'bg-red-50 border-red-400 text-red-800' 
            : 'bg-green-50 border-green-400 text-green-800'
        }`}>
          <div className="flex items-center">
            {error ? (
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            )}
            <p className="text-sm">{error || exito}</p>
          </div>
        </div>
      )}

      {/* Botón de acción */}
      <button
        onClick={registrarPago}
        disabled={
          procesando || 
          !monto || 
          parseFloat(monto) <= 0 || 
          parseFloat(monto) > montoMaximo ||
          (tipoPago === 'persona' && !clienteSeleccionado)
        }
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
          procesando || 
          !monto || 
          parseFloat(monto) <= 0 || 
          parseFloat(monto) > montoMaximo ||
          (tipoPago === 'persona' && !clienteSeleccionado)
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl'
        }`}
      >
        {procesando ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            Procesando Pago...
          </div>
        ) : (
          `Registrar Pago de $${monto || '0.00'}`
        )}
      </button>
    </div>
  );
};