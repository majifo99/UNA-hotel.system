import React, { useState } from 'react';
import { Calculator, CreditCard, FileText, RotateCcw } from 'lucide-react';
import { FolioDistribucion } from './FolioDistribucion';
import { FolioPagos } from './FolioPagos';

interface FolioManagerProps {
  folioId: number;
  onComplete?: (data: any) => void;
  className?: string;
}

type TabType = 'distribucion' | 'pagos' | 'resumen';

export const FolioManager: React.FC<FolioManagerProps> = ({
  folioId,
  onComplete,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('distribucion');
  const [folioData, setFolioData] = useState<any>(null);

  const handleDistributionComplete = (data: any) => {
    setFolioData(data);
    if (onComplete) {
      onComplete(data);
    }
    // Cambiar automáticamente a la pestaña de pagos después de distribuir
    setActiveTab('pagos');
  };

  const handlePaymentComplete = (data: any) => {
    setFolioData(data);
    if (onComplete) {
      onComplete(data);
    }
  };

  const tabs = [
    {
      id: 'distribucion' as TabType,
      label: 'Distribuir Cargos',
      icon: Calculator,
      description: 'Asignar cargos a clientes'
    },
    {
      id: 'pagos' as TabType,
      label: 'Registrar Pagos',
      icon: CreditCard,
      description: 'Procesar pagos'
    },
    {
      id: 'resumen' as TabType,
      label: 'Resumen',
      icon: FileText,
      description: 'Ver estado actual'
    }
  ];

  return (
    <div className={`bg-white rounded-lg shadow-lg border ${className}`}>
      {/* Pestañas */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenido de pestañas */}
      <div className="p-6">
        {activeTab === 'distribucion' && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Distribución de Cargos</h2>
              <p className="text-sm text-gray-600 mt-1">
                Asigna los cargos pendientes entre los clientes responsables
              </p>
            </div>
            <FolioDistribucion
              folioId={folioId}
              onDistributionComplete={handleDistributionComplete}
            />
          </div>
        )}

        {activeTab === 'pagos' && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Registro de Pagos</h2>
              <p className="text-sm text-gray-600 mt-1">
                Registra pagos generales o específicos por cliente
              </p>
            </div>
            {folioData ? (
              <FolioPagos
                folioId={folioId}
                personas={folioData.personas || []}
                saldoGlobal={folioData.totales?.saldo_global || 0}
                onPagoCompleto={handlePaymentComplete}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Primero debes distribuir los cargos</p>
                <button
                  onClick={() => setActiveTab('distribucion')}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  Ir a Distribución
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'resumen' && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Resumen del Folio</h2>
              <p className="text-sm text-gray-600 mt-1">
                Estado actual de la distribución y pagos
              </p>
            </div>
            {folioData ? (
              <div className="space-y-6">
                {/* Resumen general */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Estado General</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        ${folioData.resumen?.a_distribuir || '0.00'}
                      </div>
                      <div className="text-sm text-gray-600">Total a Distribuir</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        ${folioData.resumen?.distribuido || '0.00'}
                      </div>
                      <div className="text-sm text-gray-600">Distribuido</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-600">
                        ${folioData.resumen?.cargos_sin_persona || '0.00'}
                      </div>
                      <div className="text-sm text-gray-600">Pendiente</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        (folioData.totales?.saldo_global || 0) > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        ${folioData.totales?.saldo_global?.toFixed(2) || '0.00'}
                      </div>
                      <div className="text-sm text-gray-600">Saldo Global</div>
                    </div>
                  </div>
                </div>

                {/* Detalle por cliente */}
                {folioData.personas && folioData.personas.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Detalle por Cliente</h3>
                    <div className="space-y-3">
                      {folioData.personas.map((persona: any) => (
                        <div key={persona.id_cliente} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-gray-900">
                                Cliente #{persona.id_cliente}
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div className="text-center">
                                <div className="font-medium">${persona.asignado?.toFixed(2) || '0.00'}</div>
                                <div className="text-gray-500">Asignado</div>
                              </div>
                              <div className="text-center">
                                <div className="font-medium">${persona.pagos?.toFixed(2) || '0.00'}</div>
                                <div className="text-gray-500">Pagado</div>
                              </div>
                              <div className="text-center">
                                <div className={`font-medium ${persona.saldo > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  ${persona.saldo?.toFixed(2) || '0.00'}
                                </div>
                                <div className="text-gray-500">Saldo</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Botón para actualizar */}
                <div className="flex justify-center">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Actualizar Datos
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No hay datos de folio disponibles</p>
                <button
                  onClick={() => setActiveTab('distribucion')}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  Comenzar con Distribución
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};