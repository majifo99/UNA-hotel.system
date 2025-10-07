import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, ArrowLeft } from 'lucide-react';

interface FolioManagerPageProps {
  // Si se pasa por props, usar esos valores; si no, obtener de la URL
  folioId?: number;
  guestName?: string;
  roomNumber?: string;
}

export const FolioManagerPage: React.FC<FolioManagerPageProps> = ({
  folioId: propFolioId,
  guestName: propGuestName,
  roomNumber: propRoomNumber
}) => {
  const navigate = useNavigate();
  
  // Obtener folioId de la URL si no se pasa por props
  const urlFolioId = window.location.pathname.split('/').pop();
  
  const folioId = propFolioId || (urlFolioId ? parseInt(urlFolioId, 10) : null);
  
  if (!folioId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <Coffee className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Folio no encontrado
          </h1>
          <p className="text-gray-600 mb-6">
            No se pudo identificar el folio a gestionar.
          </p>
          <button
            onClick={() => navigate('/frontdesk')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center mx-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/frontdesk')}
                className="mr-4 p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title="Volver al Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center">
                <Coffee className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Gestión de Folio #{folioId}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    {propGuestName && (
                      <span>Huésped: {propGuestName}</span>
                    )}
                    {propRoomNumber && (
                      <span>Habitación: {propRoomNumber}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Acciones rápidas */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(`/frontdesk/folio/${folioId}?tab=historial`)}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Ver Historial
              </button>
              <button
                onClick={() => window.print()}
                className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Imprimir Resumen
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Información contextual si viene del check-in */}
        {propGuestName && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Coffee className="w-5 h-5 text-green-600 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-green-900">
                  Check-In Completado - Configuración de Servicios
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  Configure la distribución de cargos y servicios adicionales para esta estancia.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* FolioManager */}
        <FolioManagerIntegrated
          folioId={folioId}
          onComplete={(data) => {
            console.log('Gestión de folio completada:', data);
            // Mostrar notificación de éxito
            if (propGuestName) {
              // Si viene del check-in, mostrar mensaje específico
              alert('Configuración de servicios completada. ¡Check-in finalizado!');
            }
          }}
        />

        {/* Enlaces útiles */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Relacionadas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/frontdesk/checkout')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
            >
              <h4 className="font-medium text-gray-900">Realizar Check-Out</h4>
              <p className="text-sm text-gray-600 mt-1">
                Finalizar la estancia y procesar pagos finales
              </p>
            </button>
            
            <button
              onClick={() => navigate('/reservations')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
            >
              <h4 className="font-medium text-gray-900">Ver Reservaciones</h4>
              <p className="text-sm text-gray-600 mt-1">
                Gestionar otras reservaciones
              </p>
            </button>
            
            <button
              onClick={() => navigate('/guests')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
            >
              <h4 className="font-medium text-gray-900">Gestión de Huéspedes</h4>
              <p className="text-sm text-gray-600 mt-1">
                Administrar información de huéspedes
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente FolioManager con configuración específica para esta página
const FolioManagerIntegrated: React.FC<{
  folioId: number;
  onComplete: (data: any) => void;
}> = ({ folioId, onComplete }) => {
  // Importación dinámica para evitar dependencias circulares
  const [FolioManager, setFolioManager] = React.useState<React.ComponentType<any> | null>(null);

  React.useEffect(() => {
    import('./FolioManager').then((module) => {
      setFolioManager(() => module.FolioManager);
    });
  }, []);

  if (!FolioManager) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
          <span className="ml-3">Cargando gestión de folio...</span>
        </div>
      </div>
    );
  }

  return (
    <FolioManager
      folioId={folioId}
      onComplete={onComplete}
      className="shadow-xl"
    />
  );
};