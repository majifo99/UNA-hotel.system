import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FolioManagerV2 } from '../components/FolioManagerV2';

export const FolioPage: React.FC = () => {
  const { folioId } = useParams<{ folioId: string }>();
  const navigate = useNavigate();
  
  const folioIdNumber = folioId ? parseInt(folioId, 10) : undefined;

  if (!folioIdNumber || isNaN(folioIdNumber)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ID de Folio Inválido
            </h2>
            <p className="text-gray-600 mb-6">
              El ID de folio proporcionado no es válido.
            </p>
            <button
              onClick={() => navigate('/frontdesk/dashboard')}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Ir al Front Desk
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/frontdesk/dashboard')}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Gestión de Folio #{folioId}
                </h1>
                <p className="text-gray-600">
                  Sistema V2 - Administrar cargos, pagos y facturación
                </p>
              </div>
            </div>
          </div>
        </div>

        <FolioManagerV2
          folioId={folioIdNumber}
          onComplete={() => navigate('/frontdesk/dashboard')}
          onClose={() => navigate('/frontdesk/dashboard')}
          className="bg-white rounded-lg shadow-sm"
          showHeader={false}
        />
      </div>
    </div>
  );
};