import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  FileText, 
  Calculator,
  CheckCircle,
  AlertTriangle,
  Eye,
  RefreshCw,
  DollarSign,
  Users,
  Clock
} from 'lucide-react';
import { useFolioManager } from '../hooks';
import { LoadingSpinner } from '../../../components/ui';
import { FolioDistribution } from './FolioDistributionV2';
import { FolioPayments } from './FolioPaymentsV2';

interface FolioManagerV2Props {
  folioId: number;
  onComplete?: (data: any) => void;
  onClose?: () => void;
  className?: string;
  showHeader?: boolean;
}

type TabType = 'overview' | 'distribution' | 'payments' | 'billing' | 'history';

interface TabConfig {
  id: TabType;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  badge?: string;
  badgeColor: string;
}

// Configuración de pestañas extraída para reducir complejidad
const getTabConfigs = (folio: any): TabConfig[] => [
  {
    id: 'overview',
    label: 'Resumen',
    icon: Eye,
    description: 'Vista general del folio',
    badge: folio?.status === 'active' ? 'Activo' : undefined,
    badgeColor: folio?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  },
  {
    id: 'distribution',
    label: 'Distribución',
    icon: Calculator,
    description: 'Asignar cargos a responsables',
    badge: folio && folio.unassignedCharges && folio.unassignedCharges > 0 ? String(folio.unassignedCharges) : undefined,
    badgeColor: 'bg-red-100 text-red-800'
  },
  {
    id: 'payments',
    label: 'Pagos',
    icon: CreditCard,
    description: 'Procesar pagos',
    badge: folio && folio.pendingAmount && folio.pendingAmount > 0 ? `$${folio.pendingAmount.toFixed(2)}` : undefined,
    badgeColor: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'billing',
    label: 'Facturación',
    icon: FileText,
    description: 'Generar facturas',
    badge: folio && folio.pendingBills && folio.pendingBills > 0 ? String(folio.pendingBills) : undefined,
    badgeColor: 'bg-purple-100 text-purple-800'
  },
  {
    id: 'history',
    label: 'Historial',
    icon: Clock,
    description: 'Ver transacciones',
    badgeColor: 'bg-gray-100 text-gray-800'
  }
];

// Función auxiliar para calcular métricas del folio
const calculateFolioMetrics = (folio: any) => {
  const completionPercentage = folio ? Math.round(((folio.totalAmount - folio.pendingAmount) / folio.totalAmount) * 100) : 0;
  const isFullyProcessed = folio && folio.pendingAmount === 0 && folio.unassignedCharges === 0;
  
  return { completionPercentage, isFullyProcessed };
};

// Función auxiliar para generar acciones rápidas
const getQuickActions = (folio: any, onNavigate: (tab: TabType) => void) => [
  {
    id: 'distribute',
    label: 'Distribuir Cargos',
    description: 'Asignar cargos pendientes',
    icon: Calculator,
    action: () => onNavigate('distribution'),
    enabled: folio.unassignedCharges > 0,
    color: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  {
    id: 'payment',
    label: 'Procesar Pago',
    description: 'Registrar nuevo pago',
    icon: CreditCard,
    action: () => onNavigate('payments'),
    enabled: folio.pendingAmount > 0,
    color: 'bg-green-50 text-green-700 border-green-200'
  },
  {
    id: 'bill',
    label: 'Generar Factura',
    description: 'Crear factura pendiente',
    icon: FileText,
    action: () => onNavigate('billing'),
    enabled: folio.pendingBills > 0,
    color: 'bg-purple-50 text-purple-700 border-purple-200'
  }
];

interface FolioManagerV2Props {
  folioId: number;
  onComplete?: (data: any) => void;
  onClose?: () => void;
  className?: string;
  showHeader?: boolean;
}

export const FolioManagerV2: React.FC<FolioManagerV2Props> = ({
  folioId,
  onComplete: _onComplete,
  onClose,
  className = '',
  showHeader = true
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  // Hook principal para gestión del folio
  const {
    folio,
    loading,
    error,
    refreshFolio,
    distributeCargos,
    processPayment,
    generateBill,
    closeFolio: _closeFolio,
    isDistributing,
    isProcessingPayment,
    isGeneratingBill
  } = useFolioManager(folioId);

  // Estados locales para gestión de UI
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null);
  const [showErrorMessage, setShowErrorMessage] = useState<string | null>(null);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !isDistributing && !isProcessingPayment) {
        refreshFolio();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loading, isDistributing, isProcessingPayment, refreshFolio]);

  // Mostrar mensajes de éxito/error temporalmente
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => setShowSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  useEffect(() => {
    if (showErrorMessage) {
      const timer = setTimeout(() => setShowErrorMessage(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [showErrorMessage]);

  // Configuración de pestañas usando la función helper
  const tabs = getTabConfigs(folio);

  // Calculaciones para el dashboard usando la función helper
  const { completionPercentage, isFullyProcessed } = calculateFolioMetrics(folio);

  if (loading && !folio) {
    return (
      <div className={`bg-white rounded-lg shadow-lg border ${className}`}>
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" message="Cargando datos del folio..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-lg border ${className}`}>
        <div className="p-6">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertTriangle className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Error al cargar el folio</h3>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshFolio}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg border ${className}`}>
      {/* Header del Folio */}
      {showHeader && (
        <div className="border-b border-gray-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Folio #{folioId}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {folio?.guestName} • Habitación {folio?.roomNumber}
              </p>
              <p className="text-xs text-gray-500">
                Check-in: {folio?.checkInDate} • Check-out: {folio?.checkOutDate}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Indicador de estado */}
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                isFullyProcessed 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {isFullyProcessed ? 'Completado' : 'Pendiente'}
              </div>
              
              {/* Progreso */}
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {completionPercentage}% Procesado
                </div>
                <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2">
                <button
                  onClick={refreshFolio}
                  disabled={loading}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Actualizar"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                
                {onClose && (
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cerrar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {showSuccessMessage && (
        <div className="mx-6 mt-6 mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{showSuccessMessage}</span>
          </div>
        </div>
      )}

      {showErrorMessage && (
        <div className="mx-6 mt-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">{showErrorMessage}</span>
          </div>
        </div>
      )}

      {/* Pestañas de navegación */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors relative ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${tab.badgeColor}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenido de las pestañas */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <FolioOverview 
            folio={folio}
            onRefresh={refreshFolio}
            onNavigate={setActiveTab}
          />
        )}
        
        {activeTab === 'distribution' && (
          <FolioDistribution
            folioId={folioId}
            folio={folio}
            onDistribute={distributeCargos}
            isLoading={isDistributing}
            onSuccess={(msg: string) => {
              setShowSuccessMessage(msg);
              refreshFolio();
            }}
            onError={(msg: string) => setShowErrorMessage(msg)}
          />
        )}
        
        {activeTab === 'payments' && (
          <FolioPayments
            folioId={folioId}
            folio={folio}
            onPayment={processPayment}
            isLoading={isProcessingPayment}
            onSuccess={(msg: string) => {
              setShowSuccessMessage(msg);
              refreshFolio();
            }}
            onError={(msg: string) => setShowErrorMessage(msg)}
          />
        )}
        
        {activeTab === 'billing' && (
          <FolioBillingV2
            folioId={folioId}
            folio={folio}
            onGenerateBill={() => generateBill({ 
              responsibleId: 1, 
              chargeIds: [], 
              billingData: { name: 'Cliente Default' } 
            })}
            isLoading={isGeneratingBill}
            onSuccess={(msg: string) => {
              setShowSuccessMessage(msg);
              refreshFolio();
            }}
            onError={(msg: string) => setShowErrorMessage(msg)}
          />
        )}
        
        {activeTab === 'history' && (
          <FolioHistoryV2
            folioId={folioId}
            folio={folio}
            onRefresh={refreshFolio}
          />
        )}
      </div>
    </div>
  );
};

// Componente de Resumen del Folio
const FolioOverview: React.FC<{
  folio: any;
  onRefresh: () => void;
  onNavigate: (tab: TabType) => void;
}> = ({ folio, onRefresh: _onRefresh, onNavigate }) => {
  if (!folio) return null;

  const quickActions = getQuickActions(folio, onNavigate);

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Folio</p>
              <p className="text-2xl font-bold text-blue-900">${folio.totalAmount?.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Pagado</p>
              <p className="text-2xl font-bold text-green-900">${(folio.totalAmount - folio.pendingAmount)?.toFixed(2)}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Pendiente</p>
              <p className="text-2xl font-bold text-yellow-900">${folio.pendingAmount?.toFixed(2)}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Responsables</p>
              <p className="text-2xl font-bold text-purple-900">{folio.responsibles?.length || 0}</p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.action}
                disabled={!action.enabled}
                className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${action.color}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-6 h-6" />
                  <div>
                    <div className="font-medium">{action.label}</div>
                    <div className="text-sm opacity-75">{action.description}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detalle de responsables */}
      {folio.responsibles && folio.responsibles.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Responsables de Pago</h3>
          <div className="space-y-3">
            {folio.responsibles.map((responsible: any) => (
              <div key={responsible.id} className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900">{responsible.name}</div>
                    <div className="text-sm text-gray-600">{responsible.type}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      ${responsible.assignedAmount?.toFixed(2)}
                    </div>
                    <div className={`text-sm ${responsible.pendingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      Pendiente: ${responsible.pendingAmount?.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Placeholder components for billing and history
const FolioBillingV2: React.FC<{
  folioId: number;
  folio: any;
  onGenerateBill: () => void;
  isLoading: boolean;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}> = ({ folioId, folio, onGenerateBill, isLoading }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Generación de Factura
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Folio ID
              </label>
              <input
                type="text"
                value={folioId}
                readOnly
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado del Folio
              </label>
              <input
                type="text"
                value={folio?.estado || 'N/A'}
                readOnly
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={onGenerateBill}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generando...
                </>
              ) : (
                'Generar Factura'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FolioHistoryV2: React.FC<{
  folioId: number;
  folio: any;
  onRefresh: () => void;
}> = ({ folioId }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Historial del Folio
          </h3>
        </div>
        <div className="space-y-4">
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">Historial del Folio #{folioId}</p>
            <p className="text-sm mt-2">
              Esta funcionalidad está en desarrollo.
            </p>
            <p className="text-sm">
              Aquí se mostrará el historial completo de transacciones, pagos y modificaciones.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FolioManagerV2;