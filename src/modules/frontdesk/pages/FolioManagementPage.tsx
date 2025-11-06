import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, AlertTriangle } from 'lucide-react';
import { FolioManager } from '../components/FolioManager';

export const FolioManagementPage: React.FC = () => {
  const { folioId } = useParams<{ folioId: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!folioId || isNaN(Number(folioId))) {
      setError('ID de folio inválido');
    }
  }, [folioId]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleComplete = (data: any) => {
    console.log('Folio updated:', data);
    // Aquí puedes manejar actualizaciones del estado del folio
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Volver
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
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center">
                <FileText className="h-6 w-6 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Gestión de Folio #{folioId}
                  </h1>
                  <p className="text-sm text-gray-600">
                    Distribución de cargos y registro de pagos
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-medium text-blue-900 mb-2">
              🎯 Sistema Completo de Distribución
            </h2>
            <p className="text-sm text-blue-800">
              Utiliza las pestañas a continuación para distribuir los cargos entre clientes, 
              registrar pagos y monitorear el estado del folio en tiempo real.
            </p>
          </div>
        </div>

        {folioId && (
          <FolioManager
            folioId={Number(folioId)}
            onComplete={handleComplete}
            className="max-w-4xl mx-auto"
          />
        )}
      </div>
    </div>
  );
};