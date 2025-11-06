import React, { useState } from 'react';
import { CreditCard, FileText, Coffee, FileX, Clock } from 'lucide-react';
import { FolioDistribucion } from './FolioDistribucion';
import { FolioPagos } from './FolioPagos';
import { FolioCierre } from './FolioCierre';
import { FolioHistorial } from './FolioHistorial';
import { FolioResumen } from './FolioResumen';

interface FolioManagerProps {
  folioId: number;
  onComplete?: (data: any) => void;
  className?: string;
}

type TabType = 'resumen' | 'distribucion' | 'pagos' | 'cierre' | 'historial';

export const FolioManager: React.FC<FolioManagerProps> = ({
  folioId,
  onComplete,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('resumen');
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
      id: 'resumen' as TabType,
      label: 'Resumen',
      icon: FileText,
      description: 'Ver resumen del folio'
    },
    {
      id: 'distribucion' as TabType,
      label: 'Distribuir Servicios',
      icon: Coffee,
      description: 'Asignar cargos por servicios a clientes'
    },
    {
      id: 'pagos' as TabType,
      label: 'Registrar Pagos',
      icon: CreditCard,
      description: 'Procesar pagos'
    },
    {
      id: 'cierre' as TabType,
      label: 'Cerrar Folio',
      icon: FileX,
      description: 'Reclasificar al titular'
    },
    {
      id: 'historial' as TabType,
      label: 'Historial',
      icon: Clock,
      description: 'Ver línea de tiempo'
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
        {activeTab === 'resumen' && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Resumen del Folio</h2>
              <p className="text-sm text-gray-600 mt-1">
                Estado actual del folio y distribución de cargos
              </p>
            </div>
            
            {/* Contenido del resumen */}
            <div className="space-y-6">
              {/* Aquí irá el componente de resumen */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <p className="text-gray-500">Cargando resumen del folio...</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'distribucion' && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Distribución de Servicios</h2>
              <p className="text-sm text-gray-600 mt-1">
                Asigna los cargos por servicios pendientes entre los clientes responsables
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
              <h2 className="text-xl font-semibold text-gray-900">Pagos por Servicios</h2>
              <p className="text-sm text-gray-600 mt-1">
                Registra pagos por servicios generales o específicos por cliente
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
                <p>Primero debes distribuir los cargos por servicios</p>
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

        {activeTab === 'cierre' && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Cierre de Folio</h2>
              <p className="text-sm text-gray-600 mt-1">
                Reclasifica todos los cargos y saldos pendientes al titular principal
              </p>
            </div>
            {folioData ? (
              <FolioCierre
                folioId={folioId}
                folioData={folioData}
                onCierreCompleto={handlePaymentComplete}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileX className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Primero debes cargar los datos del folio</p>
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

        {activeTab === 'historial' && (
          <div>
            <FolioHistorial folioId={folioId} />
          </div>
        )}

        {activeTab === 'resumen' && (
          <FolioResumen 
            folioId={folioId}
            autoLoad={true}
            showActions={true}
          />
        )}
      </div>
    </div>
  );
};