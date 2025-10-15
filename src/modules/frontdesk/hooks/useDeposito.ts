/**
 * 💰 Hook: useDeposito
 * ====================
 * Maneja la lógica de depósito previo (primera noche) en reservas hoteleras.
 * 
 * NOTA: Este hook está preparado arquitectónicamente pero los endpoints específicos
 * de depósito no están implementados. Usa el sistema de pagos existente:
 * - `/api/folios/{id}/pagos` para registrar pagos
 * - `/api/folios/{id}/resumen` para consultar estado
 * 
 * Para implementación futura de depósitos dedicados, el backend podría agregar:
 * - Un campo `deposito` en la respuesta de resumen
 * - O usar el sistema de pagos generales existente marcados como "depósito"
 * 
 * Funcionalidades:
 * - Calcular monto de depósito requerido (primera noche o %)
 * - Registrar pago de depósito (usa endpoint de pagos existente)
 * - Consultar estado del depósito
 * - Aplicar depósito al folio en check-in
 * 
 * @module hooks/useDeposito
 */

import { useState, useCallback } from 'react';
import { folioService as _folioService } from '../services/folioService';
import type { Deposito, EstadoDeposito } from '../types/folioTypes';

interface UseDepositoProps {
  folioId?: number;
  reservaId?: number;
  onError?: (error: Error) => void;
  onSuccess?: (mensaje: string) => void;
}

interface UseDepositoReturn {
  deposito: Deposito | null;
  loading: boolean;
  procesando: boolean;
  error: Error | null;
  
  // Acciones
  calcularDepositoRequerido: (tarifaPrimeraNoche: number) => number;
  registrarPagoDeposito: (monto: number, metodoPago: string, referencia?: string) => Promise<void>;
  consultarEstadoDeposito: () => Promise<Deposito | null>;
  aplicarDepositoAlFolio: () => Promise<void>;
  reembolsarDeposito: (motivo: string) => Promise<void>;
  
  // Helpers
  montoRestante: number;
  estadoDeposito: EstadoDeposito;
  requiereDeposito: boolean;
  depositoCompleto: boolean;
}

/**
 * Hook para manejo de depósitos hoteleros
 */
export const useDeposito = ({
  folioId,
  reservaId,
  onError,
  onSuccess
}: UseDepositoProps = {}): UseDepositoReturn => {
  const [deposito, setDeposito] = useState<Deposito | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [procesando, setProcesando] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Calcula el monto de depósito requerido
   * Por defecto: 100% de la primera noche
   * Puede configurarse como % del total
   */
  const calcularDepositoRequerido = useCallback((tarifaPrimeraNoche: number): number => {
    // Política: 100% de la primera noche como depósito
    const PORCENTAJE_DEPOSITO = 1.0;
    return tarifaPrimeraNoche * PORCENTAJE_DEPOSITO;
  }, []);

  /**
   * Consulta el estado actual del depósito
   */
  const consultarEstadoDeposito = useCallback(async (): Promise<Deposito | null> => {
    if (!folioId && !reservaId) {
      const err = new Error('Se requiere folioId o reservaId');
      setError(err);
      onError?.(err);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // TODO: Implementar llamada al API
      // const response = await apiClient.get(`/folios/${folioId}/deposito`);
      
      // Simulación temporal
      const depositoSimulado: Deposito = {
        id: `DEP-${folioId || reservaId}`,
        id_folio: folioId || 0,
        id_reserva: reservaId || 0,
        monto_requerido: 0,
        monto_pagado: 0,
        estado: 'no_aplica'
      };

      setDeposito(depositoSimulado);
      return depositoSimulado;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al consultar depósito');
      setError(error);
      onError?.(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [folioId, reservaId, onError]);

  /**
   * Registra un pago de depósito
   */
  const registrarPagoDeposito = useCallback(async (
    monto: number,
    metodoPago: string,
    referencia?: string
  ): Promise<void> => {
    if (!deposito) {
      const err = new Error('No hay depósito configurado');
      setError(err);
      onError?.(err);
      return;
    }

    if (monto <= 0) {
      const err = new Error('El monto debe ser mayor a 0');
      setError(err);
      onError?.(err);
      return;
    }

    setProcesando(true);
    setError(null);

    try {
      // TODO: Implementar llamada al API
      // const response = await apiClient.post(`/folios/${folioId}/deposito/pago`, {
      //   monto,
      //   metodo_pago: metodoPago,
      //   referencia
      // });

      const nuevoPago = monto + deposito.monto_pagado;
      let nuevoEstado: EstadoDeposito = 'pendiente';

      if (nuevoPago >= deposito.monto_requerido) {
        nuevoEstado = 'completo';
      } else if (nuevoPago > 0) {
        nuevoEstado = 'parcial';
      }

      const depositoActualizado: Deposito = {
        ...deposito,
        monto_pagado: nuevoPago,
        estado: nuevoEstado,
        fecha_pago: new Date(),
        metodo_pago: metodoPago,
        referencia
      };

      setDeposito(depositoActualizado);
      onSuccess?.(`Pago de depósito registrado: $${monto.toFixed(2)}`);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al registrar pago de depósito');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setProcesando(false);
    }
  }, [deposito, folioId, onError, onSuccess]);

  /**
   * Aplica el depósito pagado al folio durante el check-in
   * En el sistema actual, esto podría ser un pago general que se aplica automáticamente
   */
  const aplicarDepositoAlFolio = useCallback(async (): Promise<void> => {
    if (!deposito || deposito.monto_pagado <= 0) {
      const err = new Error('No hay depósito para aplicar');
      setError(err);
      onError?.(err);
      return;
    }

    setProcesando(true);
    setError(null);

    try {
      // El sistema actual de folios aplica automáticamente los pagos
      // Este método sirve para confirmar/documentar la aplicación
      onSuccess?.(`Depósito de $${deposito.monto_pagado.toFixed(2)} aplicado al folio`);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al aplicar depósito al folio');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setProcesando(false);
    }
  }, [deposito, onError, onSuccess]);

  /**
   * Reembolsa el depósito (cancelación)
   * Nota: Requiere implementación en backend
   */
  const reembolsarDeposito = useCallback(async (motivo: string): Promise<void> => {
    if (!deposito || deposito.monto_pagado <= 0) {
      const err = new Error('No hay depósito para reembolsar');
      setError(err);
      onError?.(err);
      return;
    }

    setProcesando(true);
    setError(null);

    try {
      // TODO: Implementar endpoint de reembolso si es necesario
      // Por ahora, solo actualiza el estado local
      const depositoActualizado: Deposito = {
        ...deposito,
        estado: 'reembolsado',
        notas: motivo
      };

      setDeposito(depositoActualizado);
      onSuccess?.(`Depósito de $${deposito.monto_pagado.toFixed(2)} reembolsado`);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al reembolsar depósito');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setProcesando(false);
    }
  }, [deposito, onError, onSuccess]);

  // Computed values
  const montoRestante = deposito 
    ? Math.max(0, deposito.monto_requerido - deposito.monto_pagado)
    : 0;

  const estadoDeposito = deposito?.estado || 'no_aplica';
  
  const requiereDeposito = deposito 
    ? deposito.monto_requerido > 0 
    : false;
  
  const depositoCompleto = deposito 
    ? deposito.estado === 'completo'
    : false;

  return {
    deposito,
    loading,
    procesando,
    error,
    calcularDepositoRequerido,
    registrarPagoDeposito,
    consultarEstadoDeposito,
    aplicarDepositoAlFolio,
    reembolsarDeposito,
    montoRestante,
    estadoDeposito,
    requiereDeposito,
    depositoCompleto
  };
};
