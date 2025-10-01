import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Calculator, Divide, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { useFolioDistribucion } from '../hooks/useFolioDistribucion';

interface FolioDistribucionProps {
  folioId?: number;
  onDistributionComplete?: (data: any) => void;
  className?: string;
}

const STRATEGY_LABELS = {
  single: 'Todo a una persona',
  equal: 'Partes iguales',
  percent: 'Por porcentajes',
  fixed: 'Montos fijos'
} as const;

const STRATEGY_DESCRIPTIONS = {
  single: 'Asigna todo el monto pendiente a un solo cliente.',
  equal: 'Divide el monto pendiente en partes iguales entre los clientes seleccionados.',
  percent: 'Distribuye el monto según los porcentajes definidos (deben sumar 100%).',
  fixed: 'Asigna montos específicos a cada cliente (deben sumar el monto pendiente).'
} as const;

export const FolioDistribucion: React.FC<FolioDistribucionProps> = ({
  folioId,
  onDistributionComplete,
  className = ''
}) => {
  // Estados locales
  const [strategy, setStrategy] = useState<'single' | 'equal' | 'percent' | 'fixed'>('equal');
  const [selectedClientes, setSelectedClientes] = useState<number[]>([]);
  const [porcentajes, setPorcentajes] = useState<Record<number, number>>({});
  const [montos, setMontos] = useState<Record<number, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Usar el hook de distribución de folios
  const {
    folioData,
    personas,
    loading,
    distribuyendo,
    error: apiError,
    obtenerResumen,
    distribuirUnico,
    distribuirEquitativo,
    distribuirPorcentual,
    distribuirMontosFijos,
    cargosSinPersona,
    hayPendiente
  } = useFolioDistribucion({
    folioId,
    onError: (err) => setError(err.message || 'Error en la operación')
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

      if (!hayPendiente) {
        setError('No hay montos pendientes para distribuir');
        return;
      }

      if (selectedClientes.length === 0) {
        setError('Debe seleccionar al menos un cliente');
        return;
      }

      let resultado;

      switch (strategy) {
        case 'single':
          if (selectedClientes.length !== 1) {
            setError('Debe seleccionar exactamente un cliente para esta estrategia');
            return;
          }
          resultado = await distribuirUnico(selectedClientes[0]);
          break;

        case 'equal':
          if (selectedClientes.length < 1) {
            setError('Debe seleccionar al menos un cliente');
            return;
          }
          resultado = await distribuirEquitativo(selectedClientes);
          break;

        case 'percent':
          const validacionPorcentajes = validarPorcentajes();
          if (!validacionPorcentajes.valido) {
            setError(validacionPorcentajes.mensaje || 'Error en validación de porcentajes');
            return;
          }
          
          const responsablesPercent = selectedClientes.map(idCliente => ({
            id_cliente: idCliente,
            percent: porcentajes[idCliente] || 0
          }));
          
          resultado = await distribuirPorcentual(responsablesPercent);
          break;

        case 'fixed':
          const validacionMontos = validarMontos();
          if (!validacionMontos.valido) {
            setError(validacionMontos.mensaje || 'Error en validación de montos');
            return;
          }
          
          const responsablesFixed = selectedClientes.map(idCliente => ({
            id_cliente: idCliente,
            amount: montos[idCliente] || 0
          }));
          
          resultado = await distribuirMontosFijos(responsablesFixed);
          break;
      }

      if (resultado) {
        setSuccessMessage('Distribución completada exitosamente');
        if (onDistributionComplete) {
          onDistributionComplete(resultado);
        }
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
    
    selectedClientes.forEach(id => {
      nuevosPocentajes[id] = porcentajePorPersona;
    });
    
    setPorcentajes(nuevosPocentajes);
  };

  // Inicializar montos equitativos
  const inicializarMontosEquitativos = () => {
    if (selectedClientes.length === 0 || !cargosSinPersona) return;
    
    const montoPorPersona = cargosSinPersona / selectedClientes.length;
    const nuevosMontos: Record<number, number> = {};
    
    selectedClientes.forEach(id => {
      nuevosMontos[id] = Number(montoPorPersona.toFixed(2));
    });
    
    setMontos(nuevosMontos);
  };

  // Reiniciar la distribución
  const reiniciarDistribucion = () => {
    obtenerResumen();
    setError(null);
    setSuccessMessage(null);
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
      {/* Resumen del folio */}
      {folioData && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
              Resumen del Folio #{folioData.folio}
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
              <span className="block text-xs text-gray-500 uppercase font-medium">Total a Distribuir</span>
              <span className="text-lg font-bold text-gray-900">${folioData.resumen.a_distribuir}</span>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <span className="block text-xs text-gray-500 uppercase font-medium">Ya Distribuido</span>
              <span className="text-lg font-bold text-blue-600">${folioData.resumen.distribuido}</span>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <span className="block text-xs text-gray-500 uppercase font-medium">Sin Asignar</span>
              <span className={`text-lg font-bold ${parseFloat(folioData.resumen.cargos_sin_persona) > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                ${folioData.resumen.cargos_sin_persona}
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <span className="block text-xs text-gray-500 uppercase font-medium">Saldo Global</span>
              <span className={`text-lg font-bold ${folioData.totales.saldo_global > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ${folioData.totales.saldo_global.toFixed(2)}
              </span>
            </div>
          </div>
          
          {/* Información adicional */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Pagos por Persona:</span>
                <span className="ml-2 font-medium">${folioData.totales.pagos_por_persona_total.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-500">Pagos Generales:</span>
                <span className="ml-2 font-medium">${folioData.totales.pagos_generales.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-500">Total Pagos:</span>
                <span className="ml-2 font-medium">${folioData.totales.pagos_totales.toFixed(2)}</span>
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
                {error || apiError || successMessage}
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
                setStrategy(e.target.value as any);
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
            
            {/* Indicadores de validación en tiempo real */}
            {strategy === 'percent' && selectedClientes.length > 0 && (
              <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                <span className="text-blue-700">
                  Total porcentajes: {Object.values(porcentajes).reduce((sum, p) => sum + (p || 0), 0).toFixed(1)}% 
                  {Math.abs(Object.values(porcentajes).reduce((sum, p) => sum + (p || 0), 0) - 100) < 0.01 ? 
                    <CheckCircle className="inline w-4 h-4 ml-1 text-green-600" /> : 
                    <AlertCircle className="inline w-4 h-4 ml-1 text-amber-600" />
                  }
                </span>
              </div>
            )}
            
            {strategy === 'fixed' && selectedClientes.length > 0 && (
              <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                <span className="text-blue-700">
                  Total montos: ${Object.values(montos).reduce((sum, m) => sum + (m || 0), 0).toFixed(2)} 
                  / ${cargosSinPersona.toFixed(2)}
                  {Math.abs(Object.values(montos).reduce((sum, m) => sum + (m || 0), 0) - cargosSinPersona) < 0.01 ? 
                    <CheckCircle className="inline w-4 h-4 ml-1 text-green-600" /> : 
                    <AlertCircle className="inline w-4 h-4 ml-1 text-amber-600" />
                  }
                </span>
              </div>
            )}
          </div>

          {/* Lista de clientes */}
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
                        {folioData.personas.find(p => p.id_cliente === persona.id_cliente) && (
                          <>
                            <div>
                              <span className="block">Ya asignado:</span>
                              <span className="font-medium">${folioData.personas.find(p => p.id_cliente === persona.id_cliente)?.asignado.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="block">Pagos:</span>
                              <span className="font-medium">${folioData.personas.find(p => p.id_cliente === persona.id_cliente)?.pagos.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="block">Saldo:</span>
                              <span className="font-medium">${folioData.personas.find(p => p.id_cliente === persona.id_cliente)?.saldo.toFixed(2)}</span>
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

          {/* Botón de acción */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {selectedClientes.length === 0 && 'Selecciona al menos un cliente para continuar'}
              {selectedClientes.length === 1 && strategy === 'single' && '✓ Listo para distribuir a 1 cliente'}
              {selectedClientes.length > 1 && strategy === 'equal' && `✓ Listo para dividir entre ${selectedClientes.length} clientes`}
              {selectedClientes.length > 0 && strategy === 'percent' && 
                (Math.abs(Object.values(porcentajes).reduce((sum, p) => sum + (p || 0), 0) - 100) < 0.01 ?
                  '✓ Porcentajes válidos' : 
                  '⚠ Ajusta los porcentajes para sumar 100%'
                )
              }
              {selectedClientes.length > 0 && strategy === 'fixed' && 
                (Math.abs(Object.values(montos).reduce((sum, m) => sum + (m || 0), 0) - cargosSinPersona) < 0.01 ?
                  '✓ Montos válidos' : 
                  `⚠ Ajusta los montos para sumar $${cargosSinPersona.toFixed(2)}`
                )
              }
            </div>
            
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
                  Distribuir ${cargosSinPersona.toFixed(2)}
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <DollarSign className="h-12 w-12 mx-auto mb-3 text-green-500 opacity-50" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No hay cargos pendientes</h3>
          <p className="text-gray-500">
            Todos los cargos han sido distribuidos entre los clientes.
          </p>
        </div>
      )}
    </div>
  );
};