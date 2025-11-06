/**
 * ⚖️ Hook: useDivisionCargos
 * ==========================
 * Wrapper mejorado de useFolioDistribucion con funcionalidades adicionales.
 * Usa los endpoints existentes del backend (/api/folios/{id}/distribuir).
 * 
 * Este hook es un alias mejorado del hook original useFolioDistribucion,
 * agregando validaciones locales y preparado para extensiones futuras.
 * 
 * @module hooks/useDivisionCargos
 * @uses useFolioDistribucion - Hook original que conecta con backend existente
 */

import { useCallback } from 'react';
import { useFolioDistribucion } from './useFolioDistribucion';
import type { TipoCargo } from '../types/folioTypes';

interface UseDivisionCargosProps {
  folioId?: number;
  tiposCargo?: TipoCargo[];      // Para futuras extensiones (filtrado por tipo)
  autoLoad?: boolean;             // Cargar automáticamente al montar
  onError?: (error: Error) => void;
  onSuccess?: (mensaje: string) => void;
}

interface UseDivisionCargosReturn {
  // Estado (del hook original useFolioDistribucion)
  folioData: any;
  personas: any[];
  loading: boolean;
  procesando: boolean;
  error: Error | null;
  hayPendiente: boolean;
  cargosSinPersona: number;
  
  // Acciones principales (del hook original)
  cargarDatos: () => Promise<void>;
  distribuirUnico: (idCliente: number) => Promise<any>;
  distribuirEquitativo: (idsClientes: number[]) => Promise<any>;
  distribuirPorcentual: (responsables: Array<{ id_cliente: number; percent: number }>) => Promise<any>;
  distribuirMontosFijos: (responsables: Array<{ id_cliente: number; amount: number }>) => Promise<any>;
  
  // Validaciones (locales, no requieren backend)
  validarPorcentajes: (porcentajes: Record<number, number>) => { valido: boolean; mensaje?: string };
  validarMontos: (montos: Record<number, number>, montoTotal: number) => { valido: boolean; mensaje?: string };
  
  // Helpers
  calcularTotalPendiente: () => number;
}

/**
 * Hook para división de cargos hoteleros
 * Wrapper de useFolioDistribucion que agrega validaciones y helpers adicionales
 */
export const useDivisionCargos = ({
  folioId,
  tiposCargo: _tiposCargo, // Preparado para futuro (filtrado por tipo de cargo)
  autoLoad: _autoLoad = true,
  onError,
  onSuccess: _onSuccess
}: UseDivisionCargosProps = {}): UseDivisionCargosReturn => {
  
  // Delegar todo al hook original que ya conecta con /api/folios/{id}/distribuir
  const {
    folioData,
    personas,
    loading,
    distribuyendo: procesando,
    error,
    obtenerResumen,
    distribuirUnico,
    distribuirEquitativo,
    distribuirPorcentual,
    distribuirMontosFijos,
    cargosSinPersona,
    hayPendiente
  } = useFolioDistribucion({
    folioId,
    onError
  });

  /**
   * Valida que los porcentajes sumen 100%
   * Esta validación es local, no requiere llamada al backend
   */
  const validarPorcentajes = useCallback((
    porcentajes: Record<number, number>
  ): { valido: boolean; mensaje?: string } => {
    const valores = Object.values(porcentajes);
    
    if (valores.length === 0) {
      return { valido: false, mensaje: 'Debe asignar porcentajes' };
    }

    const total = valores.reduce((sum, p) => sum + p, 0);

    if (Math.abs(total - 100) > 0.01) {
      return {
        valido: false,
        mensaje: `Los porcentajes suman ${total.toFixed(2)}%. Deben sumar exactamente 100%.`
      };
    }

    if (valores.some(p => p <= 0)) {
      return {
        valido: false,
        mensaje: 'Todos los porcentajes deben ser mayores a 0%.'
      };
    }

    return { valido: true };
  }, []);

  /**
   * Valida que los montos sumen el total esperado
   * Esta validación es local, no requiere llamada al backend
   */
  const validarMontos = useCallback((
    montos: Record<number, number>,
    montoTotal: number
  ): { valido: boolean; mensaje?: string } => {
    const valores = Object.values(montos);
    
    if (valores.length === 0) {
      return { valido: false, mensaje: 'Debe asignar montos' };
    }

    const total = valores.reduce((sum, m) => sum + m, 0);

    if (Math.abs(total - montoTotal) > 0.01) {
      return {
        valido: false,
        mensaje: `Los montos suman $${total.toFixed(2)}. Deben sumar exactamente $${montoTotal.toFixed(2)}.`
      };
    }

    if (valores.some(m => m <= 0)) {
      return {
        valido: false,
        mensaje: 'Todos los montos deben ser mayores a $0.'
      };
    }

    return { valido: true };
  }, []);

  /**
   * Calcula el total pendiente de distribución
   */
  const calcularTotalPendiente = useCallback((): number => {
    return cargosSinPersona;
  }, [cargosSinPersona]);

  // Retornar la interfaz completa
  return {
    // Estado
    folioData,
    personas,
    loading,
    procesando,
    error: error ? new Error(error) : null,
    hayPendiente,
    cargosSinPersona,
    
    // Acciones (delegadas al hook original)
    cargarDatos: obtenerResumen,
    distribuirUnico,
    distribuirEquitativo,
    distribuirPorcentual,
    distribuirMontosFijos,
    
    // Validaciones locales
    validarPorcentajes,
    validarMontos,
    
    // Helpers
    calcularTotalPendiente
  };
};
