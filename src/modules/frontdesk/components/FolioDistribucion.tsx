
import React, { useState, useEffect } from 'react';
import { Users, Calculator, Divide, RefreshCw, AlertCircle, CheckCircle, Coffee } from 'lucide-react';
import { useDivisionCargos } from '../hooks/useDivisionCargos';
import { useDeposito } from '../hooks/useDeposito';
import { useFacturacion } from '../hooks/useFacturacion';
import { DepositoResumen } from './DepositoResumen';
import { FacturacionResumen } from './FacturacionResumen';
import type { TipoCargo, EstrategiaDistribucion } from '../types/folioTypes';

// Interfaz para las propiedades del componente de distribución de servicios
interface FolioDistribucionProps {
  folioId?: number;
  onDistributionComplete?: (data: any) => void;
  className?: string;
  showDeposito?: boolean;        // Mostrar sección de depósito
  showFacturacion?: boolean;     // Mostrar sección de facturación
  tiposCargo?: TipoCargo[];      // Filtrar por tipos de cargo específicos
}

const STRATEGY_LABELS: Record<EstrategiaDistribucion, string> = {
  single: 'Todo a una persona',
  equal: 'Partes iguales',
  percent: 'Por porcentajes',
  fixed: 'Montos fijos'
} as const;

const STRATEGY_DESCRIPTIONS: Record<EstrategiaDistribucion, string> = {
  single: 'Asigna todo el monto pendiente a un solo cliente.',
  equal: 'Divide el monto pendiente en partes iguales entre los clientes seleccionados.',
  percent: 'Distribuye el monto según los porcentajes definidos (deben sumar 100%).',
  fixed: 'Asigna montos específicos a cada cliente (deben sumar el monto pendiente).'
} as const;

export const FolioDistribucion: React.FC<FolioDistribucionProps> = ({
  folioId,
  onDistributionComplete,
  className = '',
  showDeposito = false,
  showFacturacion = false,
  tiposCargo
}) => {
  // ========================================
  // 🔧 UTILIDADES
  // ========================================
  
  /**
   * Convierte un valor a número de forma segura
   */
  const toNumber = (value: unknown): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // ========================================
  // 🎯 Estados Locales del Componente
  // ========================================
  const [strategy, setStrategy] = useState<EstrategiaDistribucion>('equal');
  const [selectedClientes, setSelectedClientes] = useState<number[]>([]);
  const [porcentajes, setPorcentajes] = useState<Record<number, number>>({});
  const [montos, setMontos] = useState<Record<number, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ========================================
  // 🪝 Hooks de Negocio Hotelero
  // ========================================
  
  // Hook principal de división de cargos (wrapper del sistema existente)
  const {
    folioData,
    personas,
    loading,
    procesando: distribuyendo,
    error: apiError,
    cargarDatos: obtenerResumen,
    distribuirUnico,
    distribuirEquitativo,
    distribuirPorcentual,
    distribuirMontosFijos,
    cargosSinPersona,
    hayPendiente
  } = useDivisionCargos({
    folioId,
    tiposCargo,
    autoLoad: true,
    onError: (err: Error) => setError(err.message || 'Error en la operación'),
    onSuccess: (msg: string) => setSuccessMessage(msg)
  });

  // 💰 Hook de Depósito Previo
  const depositoHook = useDeposito({
    folioId,
    onError: (err) => console.error('Error en depósito:', err),
    onSuccess: (msg) => setSuccessMessage(msg)
  });

  // 🧾 Hook de Facturación
  const facturacionHook = useFacturacion({
    folioId,
    autoLoad: showFacturacion,
    onError: (err) => console.error('Error en facturación:', err),
    onSuccess: (msg) => setSuccessMessage(msg)
  });

  // Limpiar valores cuando cambia la estrategia
  useEffect(() => {
    if (strategy === 'single') {
      // Para estrategia single, solo permitir un cliente
      if (selectedClientes.length > 1) {
        setSelectedClientes([selectedClientes[0]]);
      }
    }
    // Limpiar valores específicos de cada estrategia
    setPorcentajes({});
    setMontos({});
    setError(null);
    setSuccessMessage(null);
  }, [strategy]);

  // Resetear los mensajes cuando cambia la estrategia
  useEffect(() => {
    setError(null);
    setSuccessMessage(null);
  }, [strategy]);

  // Actualizar la lista de clientes seleccionados cuando cambian las personas
  useEffect(() => {
    if (personas.length > 0 && selectedClientes.length === 0) {
      // Por defecto, seleccionamos el primer cliente
      setSelectedClientes([personas[0].id_cliente]);
    }
  }, [personas, selectedClientes]);

  // Validar que los porcentajes sumen 100%
  const validarPorcentajes = (): { valido: boolean; mensaje?: string } => {
    const porcentajesSeleccionados = selectedClientes.map(id => porcentajes[id] || 0);
    const total = porcentajesSeleccionados.reduce((sum, p) => sum + p, 0);
    
    if (Math.abs(total - 100) > 0.01) {
      return { 
        valido: false, 
        mensaje: `Los porcentajes suman ${total.toFixed(2)}%. Deben sumar exactamente 100%.` 
      };
    }
    
    if (porcentajesSeleccionados.some(p => p <= 0)) {
      return { 
        valido: false, 
        mensaje: 'Todos los porcentajes deben ser mayores a 0%.' 
      };
    }
    
    return { valido: true };
  };

  // Validar que los montos sumen el monto pendiente
  const validarMontos = (): { valido: boolean; mensaje?: string } => {
    const montosSeleccionados = selectedClientes.map(id => montos[id] || 0);
    const total = montosSeleccionados.reduce((sum, m) => sum + m, 0);
    
    if (Math.abs(total - cargosSinPersona) > 0.01) {
      return { 
        valido: false, 
        mensaje: `Los montos suman $${total.toFixed(2)}. Deben sumar exactamente $${cargosSinPersona.toFixed(2)}.` 
      };
    }
    
    if (montosSeleccionados.some(m => m <= 0)) {
      return { 
        valido: false, 
        mensaje: 'Todos los montos deben ser mayores a $0.' 
      };
    }
    
    return { valido: true };
  };

  // Manejar la selección/deselección de clientes
  const toggleClienteSeleccion = (idCliente: number) => {
    if (selectedClientes.includes(idCliente)) {
      setSelectedClientes(prev => prev.filter(id => id !== idCliente));
    } else {
      setSelectedClientes(prev => [...prev, idCliente]);
    }
  };

  // Actualizar un porcentaje para un cliente
  const actualizarPorcentaje = (idCliente: number, value: number) => {
    setPorcentajes(prev => ({
      ...prev,
      [idCliente]: value
    }));
  };

  // Actualizar un monto para un cliente
  const actualizarMonto = (idCliente: number, value: number) => {
    setMontos(prev => ({
      ...prev,
      [idCliente]: value
    }));
  };

  // Ejecutar la distribución según la estrategia seleccionada
  const ejecutarDistribucion = async () => {
    try {
      setError(null);
      setSuccessMessage(null);
      if (!hayPendiente) return setError('No hay montos pendientes para distribuir');
      if (!selectedClientes.length) return setError('Debe seleccionar al menos un cliente');

      let resultado;
      if (strategy === 'single') {
        if (selectedClientes.length !== 1) return setError('Debe seleccionar exactamente un cliente para esta estrategia');
        resultado = await distribuirUnico(selectedClientes[0]);
      } else if (strategy === 'equal') {
        resultado = await distribuirEquitativo(selectedClientes);
      } else if (strategy === 'percent') {
        const validacionPorcentajes = validarPorcentajes();
        if (!validacionPorcentajes.valido) return setError(validacionPorcentajes.mensaje || 'Error en validación de porcentajes');
        const responsablesPercent = selectedClientes.map(idCliente => ({ id_cliente: idCliente, percent: porcentajes[idCliente] || 0 }));
        resultado = await distribuirPorcentual(responsablesPercent);
      } else if (strategy === 'fixed') {
        const validacionMontos = validarMontos();
        if (!validacionMontos.valido) return setError(validacionMontos.mensaje || 'Error en validación de montos');
        const responsablesFixed = selectedClientes.map(idCliente => ({ id_cliente: idCliente, amount: montos[idCliente] || 0 }));
        resultado = await distribuirMontosFijos(responsablesFixed);
      }

      if (resultado) {
        setSuccessMessage('Distribución completada exitosamente');
        onDistributionComplete?.(resultado);
      }
    } catch (err: any) {
      setError(err.message || 'Error al ejecutar la distribución');
    }
  };

  // Inicializar porcentajes equitativos
  const inicializarPorcentajesEquitativos = () => {
    if (selectedClientes.length === 0) return;
    
    const porcentajePorPersona = 100 / selectedClientes.length;
    const nuevosPocentajes: Record<number, number> = {};
    
    for (const id of selectedClientes) {
      nuevosPocentajes[id] = porcentajePorPersona;
    }
    
    setPorcentajes(nuevosPocentajes);
  };

  // Inicializar montos equitativos
  const inicializarMontosEquitativos = () => {
    if (selectedClientes.length === 0 || !cargosSinPersona) return;
    
    const montoPorPersona = cargosSinPersona / selectedClientes.length;
    const nuevosMontos: Record<number, number> = {};
    
    for (const id of selectedClientes) {
      nuevosMontos[id] = Number(montoPorPersona.toFixed(2));
    }
    
    setMontos(nuevosMontos);
  };

  // Reiniciar la distribución
  const reiniciarDistribucion = () => {
    obtenerResumen();
    setError(null);
    setSuccessMessage(null);
  };

  // Render helpers to reduce complexity
  const renderValidationIndicator = () => {
    if (strategy === 'percent' && selectedClientes.length > 0) {
      const total = Object.values(porcentajes).reduce((sum, p) => sum + (p || 0), 0);
      const valid = Math.abs(total - 100) < 0.01;
      return (
        <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
          <span className="text-blue-700">
            Total porcentajes: {total.toFixed(1)}% {valid ? <CheckCircle className="inline w-4 h-4 ml-1 text-green-600" /> : <AlertCircle className="inline w-4 h-4 ml-1 text-amber-600" />}
          </span>
        </div>
      );
    }
    if (strategy === 'fixed' && selectedClientes.length > 0) {
      const total = Object.values(montos).reduce((sum, m) => sum + (m || 0), 0);
      const valid = Math.abs(total - cargosSinPersona) < 0.01;
      return (
        <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
          <span className="text-blue-700">
            Total montos: ${total.toFixed(2)} / ${cargosSinPersona.toFixed(2)} {valid ? <CheckCircle className="inline w-4 h-4 ml-1 text-green-600" /> : <AlertCircle className="inline w-4 h-4 ml-1 text-amber-600" />}
          </span>
        </div>
      );
    }
    return null;
  };

  const renderClientesList = () => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-900">Clientes Disponibles</h4>
        {(strategy === 'percent' || strategy === 'fixed') && selectedClientes.length > 1 && (
          <button
            onClick={strategy === 'percent' ? inicializarPorcentajesEquitativos : inicializarMontosEquitativos}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            disabled={distribuyendo}
          >
            <Divide className="w-3 h-3 mr-1 inline" />
            Distribuir Equitativamente
          </button>
        )}
      </div>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {personas.length > 0 ? (
          personas.map((persona) => (
            <div
              key={persona.id_cliente}
              className={`p-3 border rounded-lg ${
                selectedClientes.includes(persona.id_cliente)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`cliente-${persona.id_cliente}`}
                    checked={selectedClientes.includes(persona.id_cliente)}
                    onChange={() => toggleClienteSeleccion(persona.id_cliente)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={distribuyendo || (strategy === 'single' && selectedClientes.length === 1 && !selectedClientes.includes(persona.id_cliente))}
                  />
                  <label htmlFor={`cliente-${persona.id_cliente}`} className="ml-2 text-sm font-medium text-gray-900">
                    {persona.nombre || `Cliente #${persona.id_cliente}`}
                  </label>
                </div>
                {selectedClientes.includes(persona.id_cliente) && (
                  <div className="flex items-center">
                    {strategy === 'percent' && (
                      <div className="flex items-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={porcentajes[persona.id_cliente] || ''}
                          onChange={(e) => actualizarPorcentaje(persona.id_cliente, Number(e.target.value))}
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="%"
                          disabled={distribuyendo}
                        />
                        <span className="ml-1 text-sm">%</span>
                      </div>
                    )}
                    {strategy === 'fixed' && (
                      <div className="flex items-center">
                        <span className="mr-1 text-sm">$</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          max={cargosSinPersona}
                          value={montos[persona.id_cliente] || ''}
                          onChange={(e) => actualizarMonto(persona.id_cliente, Number(e.target.value))}
                          className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Monto"
                          disabled={distribuyendo}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
              {folioData?.personas && selectedClientes.includes(persona.id_cliente) && (
                <div className="mt-2 pl-6 text-xs text-gray-500 grid grid-cols-3 gap-2">
                  {folioData.personas.find((p: any) => p.id_cliente === persona.id_cliente) && (
                    <>
                      <div>
                        <span className="block">Ya asignado:</span>
                        <span className="font-medium">${toNumber(folioData.personas.find((p: any) => p.id_cliente === persona.id_cliente)?.asignado).toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="block">Pagos:</span>
                        <span className="font-medium">${toNumber(folioData.personas.find((p: any) => p.id_cliente === persona.id_cliente)?.pagos).toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="block">Saldo:</span>
                        <span className="font-medium">${toNumber(folioData.personas.find((p: any) => p.id_cliente === persona.id_cliente)?.saldo).toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No hay clientes disponibles</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderActionButton = () => {
    let label = '';
    if (selectedClientes.length === 0) label = 'Selecciona al menos un cliente para continuar';
    else if (selectedClientes.length === 1 && strategy === 'single') label = '✓ Listo para distribuir a 1 cliente';
    else if (selectedClientes.length > 1 && strategy === 'equal') label = `✓ Listo para dividir entre ${selectedClientes.length} clientes`;
    else if (selectedClientes.length > 0 && strategy === 'percent') {
      const total = Object.values(porcentajes).reduce((sum, p) => sum + (p || 0), 0);
      label = Math.abs(total - 100) < 0.01 ? '✓ Porcentajes válidos' : '⚠ Ajusta los porcentajes para sumar 100%';
    }
    else if (selectedClientes.length > 0 && strategy === 'fixed') {
      const total = Object.values(montos).reduce((sum, m) => sum + (m || 0), 0);
      label = Math.abs(total - cargosSinPersona) < 0.01 ? '✓ Montos válidos' : `⚠ Ajusta los montos para sumar $${cargosSinPersona.toFixed(2)}`;
    }
    return (
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">{label}</div>
        <button
          onClick={ejecutarDistribucion}
          disabled={distribuyendo || selectedClientes.length === 0 || !hayPendiente}
          className={`px-6 py-3 rounded-lg flex items-center font-medium transition-all duration-200 ${
            distribuyendo || selectedClientes.length === 0 || !hayPendiente
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
          }`}
        >
          {distribuyendo ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Procesando...
            </>
          ) : (
            <>
              <Calculator className="h-4 w-4 mr-2" />
              Distribuir Servicios ${cargosSinPersona.toFixed(2)}
            </>
          )}
        </button>
      </div>
    );
  };

  if (loading && !folioData) {
    return (
      <div className="flex justify-center items-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
        <span className="ml-3">Cargando información del folio...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 p-4 ${className}`}>
      {/* 💰 Sección de Depósito (si está habilitada) */}
      {showDeposito && (
        <DepositoResumen
          deposito={depositoHook.deposito}
          loading={depositoHook.loading}
          onRegistrarPago={() => {
            // Implementar modal de registro de pago de depósito
            // Por ahora, mostrar un mensaje informativo
            alert('Funcionalidad de registro de pago de depósito próximamente disponible. Use el sistema de pagos principal.');
          }}
        />
      )}

      {/* Resumen del folio de servicios */}
      {folioData && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Coffee className="w-5 h-5 mr-2 text-blue-600" />
              Distribución de Cargos por Servicios - Folio #{folioData.folio}
            </h3>
            <button
              onClick={reiniciarDistribucion}
              className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
              title="Actualizar datos"
              disabled={loading || distribuyendo}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded-lg border">
              <span className="block text-xs text-gray-500 uppercase font-medium">Total Servicios a Distribuir</span>
              <span className="text-lg font-bold text-gray-900">${folioData.resumen.a_distribuir}</span>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <span className="block text-xs text-gray-500 uppercase font-medium">Servicios Ya Distribuidos</span>
              <span className="text-lg font-bold text-blue-600">${folioData.resumen.distribuido}</span>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <span className="block text-xs text-gray-500 uppercase font-medium">Servicios Sin Asignar</span>
              <span className={`text-lg font-bold ${Number.parseFloat(folioData.resumen.cargos_sin_persona) > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                ${folioData.resumen.cargos_sin_persona}
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <span className="block text-xs text-gray-500 uppercase font-medium">Saldo Global</span>
              <span className={`text-lg font-bold ${toNumber(folioData.totales.saldo_global) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ${toNumber(folioData.totales.saldo_global).toFixed(2)}
              </span>
            </div>
          </div>
          
          {/* Información adicional */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
              {/* Información adicional */}
                <span className="ml-2 font-medium">${toNumber(folioData.totales.pagos_por_persona_total).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-500">Pagos Generales:</span>
                <span className="ml-2 font-medium">${toNumber(folioData.totales.pagos_generales).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-500">Total Pagos:</span>
                <span className="ml-2 font-medium">${toNumber(folioData.totales.pagos_totales).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensajes de error o éxito */}
      {(error || apiError || successMessage) && (
        <div className={`p-4 rounded-lg border-l-4 ${
          error || apiError 
            ? 'bg-red-50 border-red-400 text-red-800' 
            : 'bg-green-50 border-green-400 text-green-800'
        }`}>
          <div className="flex items-center">
            {error || apiError ? (
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            ) : (
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            )}
            <div>
              <p className="font-medium">
                {error || apiError ? 'Error en la operación' : 'Operación exitosa'}
              </p>
              <p className="text-sm mt-1">
                {error || (apiError ? apiError.message : '') || successMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mostrar solo si hay montos pendientes de distribuir */}
      {hayPendiente ? (
        <>
          {/* Selección de estrategia */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Estrategia de Distribución</h4>
            <select
              value={strategy}
              onChange={(e) => {
                setStrategy(e.target.value as EstrategiaDistribucion);
                setError(null); // Limpiar errores al cambiar estrategia
                setSuccessMessage(null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={distribuyendo}
            >
              {Object.entries(STRATEGY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            
            <p className="mt-2 text-sm text-gray-500">
              {strategy === 'single' && STRATEGY_DESCRIPTIONS.single}
              {strategy === 'equal' && STRATEGY_DESCRIPTIONS.equal}
              {strategy === 'percent' && STRATEGY_DESCRIPTIONS.percent}
              {strategy === 'fixed' && STRATEGY_DESCRIPTIONS.fixed}
            </p>
            
            {renderValidationIndicator()}
          </div>

          {renderClientesList()}

          {renderActionButton()}
        </>
      ) : (
        <div className="text-center py-8">
          <Coffee className="h-12 w-12 mx-auto mb-3 text-green-500 opacity-50" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No hay servicios pendientes de distribuir</h3>
          <p className="text-gray-500">
            Todos los cargos por servicios han sido distribuidos entre los clientes.
          </p>
        </div>
      )}

      {/* 🧾 Sección de Facturación (si está habilitada) */}
      {showFacturacion && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Coffee className="w-5 h-5 mr-2 text-green-600" />
            Facturas Generadas
          </h3>
          <FacturacionResumen
            facturas={facturacionHook.facturas}
            loading={facturacionHook.loading}
            onDescargarPDF={(idFactura) => {
              facturacionHook.descargarPDF(idFactura);
            }}
            onVerDetalle={(factura) => {
              // Implementar modal de detalle de factura
              // Por ahora, mostrar información básica en un alert
              alert(`Detalle de Factura #${factura.numero_factura}\nCliente: ${factura.nombre_responsable}\nMonto: $${factura.total}\nEstado: ${factura.estado}\n\nFuncionalidad completa próximamente disponible.`);
            }}
          />
        </div>
      )}
    </div>
  );
};