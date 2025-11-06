import { useState, useCallback } from 'react';
import { folioService, type PagoRequest } from '../services/folioService';

interface UseFolioPagosParams {
  folioId: number;
  onError?: (error: any) => void;
  onSuccess?: (mensaje: string, data: any) => void;
}

export function useFolioPagos({ folioId, onError, onSuccess }: UseFolioPagosParams) {
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registrarPago = useCallback(async (
    monto: number,
    metodo: string,
    idCliente?: number
  ) => {
    try {
      setProcesando(true);
      setError(null);

      if (!monto || monto <= 0) {
        throw new Error('El monto debe ser mayor a 0');
      }

      // Generar ID único para la operación
      const operacion_uid = `pay-${Date.now()}-${Math.random().toString(36).substring(2, 12)}`;

      const pagoData: PagoRequest = {
        operacion_uid,
        monto,
        metodo,
        resultado: 'OK',
        ...(idCliente ? { id_cliente: idCliente } : {})
      };

      const resultado = await folioService.registrarPago(folioId, pagoData);
      
      const mensaje = `Pago de $${monto.toFixed(2)} registrado exitosamente${idCliente ? ` para cliente #${idCliente}` : ' como pago general'}`;
      
      if (onSuccess) {
        onSuccess(mensaje, resultado);
      }

      return resultado;
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al registrar el pago';
      setError(errorMessage);
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setProcesando(false);
    }
  }, [folioId, onError, onSuccess]);

  const registrarPagoGeneral = useCallback(async (monto: number, metodo: string) => {
    return registrarPago(monto, metodo);
  }, [registrarPago]);

  const registrarPagoCliente = useCallback(async (monto: number, metodo: string, idCliente: number) => {
    return registrarPago(monto, metodo, idCliente);
  }, [registrarPago]);

  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  return {
    procesando,
    error,
    registrarPago,
    registrarPagoGeneral,
    registrarPagoCliente,
    limpiarError
  };
}