/**
 * Página Principal de Gestión de Folio
 * 
 * Pantalla completa para gestionar un folio con tabs:
 * - Resumen
 * - Cargos
 * - Pagos
 * - Distribución
 * - Historial
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FileText, 
  DollarSign, 
  CreditCard, 
  Divide, 
  Clock,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { FolioResumen } from '../components/FolioResumen';
import { FolioHistorial } from '../components/FolioHistorial';
import { FolioCargosTab } from '../components/FolioCargosTab';
import { FolioPagosTab } from '../components/FolioPagosTab';
import { FolioDistribucionTab } from '../components/FolioDistribucionTab';
import { useFolioFlow } from '../hooks/useFolioFlow';
import { folioService } from '../services/folioService';
import type { FolioLinea } from '../types/folio.types';

// ============================================================================
// TIPOS
// ============================================================================

type TabType = 'resumen' | 'cargos' | 'pagos' | 'distribucion' | 'historial';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ReactNode;
}

// ============================================================================
// CONFIGURACIÓN DE TABS
// ============================================================================

const TABS: Tab[] = [
  {
    id: 'resumen',
    label: 'Resumen',
    icon: <FileText className="w-5 h-5" />
  },
  {
    id: 'cargos',
    label: 'Cargos',
    icon: <DollarSign className="w-5 h-5" />
  },
  {
    id: 'pagos',
    label: 'Pagos',
    icon: <CreditCard className="w-5 h-5" />
  },
  {
    id: 'distribucion',
    label: 'Distribución',
    icon: <Divide className="w-5 h-5" />
  },
  {
    id: 'historial',
    label: 'Historial',
    icon: <Clock className="w-5 h-5" />
  }
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Página de gestión de folio
 * 
 * Ruta: /frontdesk/folio/:folioId
 * Query params opcionales: ?tab=cargos (o resumen, pagos, distribucion, historial)
 */
export const FolioPage: React.FC = () => {
  const { folioId } = useParams<{ folioId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Detectar si viene desde checkout
  const returnTo = searchParams.get('returnTo');
  
  // Obtener tab inicial desde query params o usar 'resumen' por defecto
  const tabFromUrl = searchParams.get('tab') as TabType | null;
  const initialTab = tabFromUrl && ['resumen', 'cargos', 'pagos', 'distribucion', 'historial'].includes(tabFromUrl) 
    ? tabFromUrl 
    : 'resumen';
  
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [cargos, setCargos] = useState<FolioLinea[]>([]);
  const [loadingCargos, setLoadingCargos] = useState(false);

  // Hook para obtener datos del folio
  const {
    resumen,
    isLoading,
    error,
    obtenerResumen
  } = useFolioFlow();

  // Convertir folioId a número
  const folioIdNumber = folioId ? parseInt(folioId) : 0;

  // Cargar resumen al montar el componente
  React.useEffect(() => {
    if (folioIdNumber > 0) {
      obtenerResumen(folioIdNumber);
    }
  }, [folioIdNumber]); // Removido obtenerResumen de dependencias

  // Cargar cargos cuando se accede al tab de cargos
  useEffect(() => {
    const cargarCargos = async () => {
      if (activeTab === 'cargos' && folioIdNumber > 0) {
        setLoadingCargos(true);
        try {
          const cargosData = await folioService.getCargos(folioIdNumber);
          setCargos(cargosData);
        } catch (error) {
          console.error('Error al cargar cargos:', error);
        } finally {
          setLoadingCargos(false);
        }
      }
    };

    cargarCargos();
  }, [activeTab, folioIdNumber]);

  // Validación de folioId
  if (!folioId || isNaN(folioIdNumber) || folioIdNumber <= 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">ID de Folio Inválido</h2>
              <p className="text-gray-600 mt-2">
                El ID del folio proporcionado no es válido. Por favor, verifica la URL.
              </p>
              <button
                onClick={() => navigate('/frontdesk')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Volver a Front Desk
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Extraer datos del resumen (si están disponibles)
  // Usar useMemo para evitar recalcular en cada render
  const clientes = useMemo(() => {
    if (!resumen?.personas) return [];
    
    return resumen.personas.map(persona => ({
      id_cliente: persona.id_cliente,
      nombre: persona.nombre || `Cliente #${persona.id_cliente}`,
      email: persona.email,
      documento: persona.documento,
      es_titular: false // TODO: determinar titular desde backend
    }));
  }, [resumen?.personas]);

  // Debug: Log para verificar clientes
  React.useEffect(() => {
    console.log('📊 Resumen del folio:', resumen);
    console.log('👥 Clientes extraídos:', clientes);
    console.log('👥 Número de clientes:', clientes.length);
  }, [resumen, clientes]);

  // Monto pendiente a distribuir (solo cargos sin asignar a persona)
  const montoADistribuir = typeof resumen?.resumen?.cargos_sin_persona === 'string' 
    ? parseFloat(resumen.resumen.cargos_sin_persona) 
    : (resumen?.resumen?.cargos_sin_persona || 0);

  // Totales financieros
  const totalCargos = typeof resumen?.resumen?.a_distribuir === 'string'
    ? parseFloat(resumen.resumen.a_distribuir)
    : (resumen?.resumen?.a_distribuir || 0);

  const totalPagado = typeof resumen?.totales?.pagos_totales === 'string'
    ? parseFloat(resumen.totales.pagos_totales)
    : (resumen?.totales?.pagos_totales || 0);

  // Función para recargar cargos después de agregar uno nuevo
  const handleCargoAgregado = async () => {
    if (folioIdNumber > 0) {
      setLoadingCargos(true);
      try {
        const cargosData = await folioService.getCargos(folioIdNumber);
        setCargos(cargosData);
        // También recargar el resumen para actualizar totales
        obtenerResumen(folioIdNumber);
      } catch (error) {
        console.error('Error al recargar cargos:', error);
      } finally {
        setLoadingCargos(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            {/* Breadcrumb y título */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => {
                  if (returnTo === 'checkout') {
                    navigate('/frontdesk/checkout');
                  } else {
                    navigate('/frontdesk');
                  }
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={returnTo === 'checkout' ? 'Volver a Check-Out' : 'Volver a Front Desk'}
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <span>Front Desk</span>
                  <span>/</span>
                  <span>Folio</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Gestión de Folio #{folioIdNumber}
                </h1>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg font-medium
                    whitespace-nowrap transition-colors
                    ${activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mensaje de error global */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Error al cargar el folio</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <button
                onClick={() => obtenerResumen(folioIdNumber)}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Contenido de cada tab */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {activeTab === 'resumen' && (
            <FolioResumen 
              folioId={folioIdNumber}
              autoLoad={false}
              showActions={true}
            />
          )}

          {activeTab === 'cargos' && (
            <FolioCargosTab
              folioId={folioIdNumber}
              clientes={clientes}
              cargos={cargos}
              isLoading={loadingCargos}
              onCargoAgregado={handleCargoAgregado}
            />
          )}

          {activeTab === 'pagos' && (
            <FolioPagosTab
              folioId={folioIdNumber}
              clientes={clientes}
              pagos={[]} // TODO: obtener pagos desde API
              isLoading={isLoading}
              totalCargos={totalCargos}
              totalPagado={totalPagado}
              personas={(resumen?.personas || []).map(p => ({
                ...p,
                nombre: p.nombre || 'Sin nombre'
              }))}
            />
          )}

          {activeTab === 'distribucion' && (
            <FolioDistribucionTab
              folioId={folioIdNumber}
              clientes={clientes}
              montoADistribuir={montoADistribuir}
            />
          )}

          {activeTab === 'historial' && (
            <FolioHistorial folioId={folioIdNumber} />
          )}
        </div>
      </div>
    </div>
  );
};

export default FolioPage;
