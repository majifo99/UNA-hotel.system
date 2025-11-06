import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, CheckCircle, ArrowRight, User, Calendar } from 'lucide-react';
import CheckIn from './CheckIn';
import { FolioManager } from './FolioManager';
import type { CheckInData } from '../types/checkin';

type FlowStep = 'checkin' | 'folio_setup' | 'completed';

interface CheckInResult {
  folioId: number;
  guestName: string;
  roomNumber: string;
  requiresChargeDistribution: boolean;
  checkInData: CheckInData;
}

export const CheckInFlow: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<FlowStep>('checkin');
  const [checkInResult, setCheckInResult] = useState<CheckInResult | null>(null);

  const handleCheckInComplete = (result: CheckInResult) => {
    setCheckInResult(result);
    
    if (result.requiresChargeDistribution) {
      // Si requiere división de cargos, ir al setup del folio
      setCurrentStep('folio_setup');
    } else {
      // Si no requiere división, completar directamente
      setCurrentStep('completed');
      setTimeout(() => {
        navigate('/frontdesk');
      }, 3000);
    }
  };

  const handleFolioSetupComplete = () => {
    setCurrentStep('completed');
    setTimeout(() => {
      navigate('/frontdesk');
    }, 3000);
  };

  const handleSkipFolioSetup = () => {
    setCurrentStep('completed');
    setTimeout(() => {
      navigate('/frontdesk');
    }, 3000);
  };

  const renderStepIndicator = () => {
    const steps = [
      { id: 'checkin', label: 'Check-In', icon: User },
      { id: 'folio_setup', label: 'Configurar Servicios', icon: Coffee },
      { id: 'completed', label: 'Completado', icon: CheckCircle }
    ];

    return (
      <div className="mb-8">
        <div className="flex items-center justify-center">
          {steps.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
            const Icon = step.icon;
            
            return (
              <React.Fragment key={step.id}>
                <div className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                    ${isActive 
                      ? 'border-blue-500 bg-blue-500 text-white' 
                      : isCompleted 
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-gray-300 bg-white text-gray-400'
                    }
                  `}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`
                    ml-2 text-sm font-medium
                    ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}
                  `}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className={`
                    w-5 h-5 mx-4
                    ${isCompleted ? 'text-green-500' : 'text-gray-300'}
                  `} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  if (currentStep === 'checkin') {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderStepIndicator()}
        <CheckInEnhanced onComplete={handleCheckInComplete} />
      </div>
    );
  }

  if (currentStep === 'folio_setup') {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderStepIndicator()}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header del setup de folio */}
          <div className="bg-white rounded-lg shadow-lg border mb-8 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Coffee className="w-7 h-7 text-green-600 mr-3" />
                  Configuración de Servicios - Check-In Completado
                </h1>
                <p className="text-gray-600 mt-2">
                  Configure la distribución de cargos y servicios para la estancia
                </p>
              </div>
              <div className="text-right">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-sm text-green-800">
                    <strong>Huésped:</strong> {checkInResult?.guestName}
                  </div>
                  <div className="text-sm text-green-800">
                    <strong>Habitación:</strong> {checkInResult?.roomNumber}
                  </div>
                  <div className="text-sm text-green-800">
                    <strong>Folio:</strong> #{checkInResult?.folioId}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Opciones del usuario */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-blue-900 mb-3">
              ⚖️ División de Cargos Requerida
            </h3>
            <p className="text-blue-800 mb-4">
              Durante el check-in se marcó que se requiere división de cargos. 
              ¿Desea configurar esto ahora o más tarde?
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => {/* El FolioManager se muestra abajo */}}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center font-medium"
              >
                <Coffee className="w-5 h-5 mr-2" />
                Configurar Ahora
              </button>
              <button
                onClick={handleSkipFolioSetup}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Configurar Más Tarde
              </button>
            </div>
          </div>

          {/* FolioManager integrado */}
          {checkInResult && (
            <FolioManager
              folioId={checkInResult.folioId}
              onComplete={handleFolioSetupComplete}
              className="shadow-xl"
            />
          )}
        </div>
      </div>
    );
  }

  if (currentStep === 'completed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Check-In Completado!
          </h1>
          <p className="text-gray-600 mb-6">
            El proceso se ha completado exitosamente.
            {checkInResult && (
              <>
                <br />
                <strong>Huésped:</strong> {checkInResult.guestName}
                <br />
                <strong>Habitación:</strong> {checkInResult.roomNumber}
                <br />
                <strong>Folio:</strong> #{checkInResult.folioId}
              </>
            )}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/frontdesk')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Ir al Dashboard
            </button>
            {checkInResult && (
              <button
                onClick={() => navigate(`/frontdesk/folio/${checkInResult.folioId}`)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center"
              >
                <Coffee className="w-4 h-4 mr-2" />
                Gestionar Folio
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Redirigiendo automáticamente en unos segundos...
          </p>
        </div>
      </div>
    );
  }

  return null;
};

// Componente CheckIn mejorado que integra con el flujo
const CheckInEnhanced: React.FC<{ onComplete: (result: CheckInResult) => void }> = ({ onComplete }) => {
  // Este componente envuelve el CheckIn original y maneja el resultado
  return (
    <CheckInWrapper onComplete={onComplete} />
  );
};

// Wrapper del componente CheckIn original
const CheckInWrapper: React.FC<{ onComplete: (result: CheckInResult) => void }> = ({ onComplete }) => {
  // Aquí necesitaríamos modificar el CheckIn original para que retorne los datos
  // Por ahora, simulamos el comportamiento
  
  React.useEffect(() => {
    // Escuchar eventos del CheckIn original
    const handleCheckInSuccess = (event: CustomEvent) => {
      const { folioId, guestName, roomNumber, requiresChargeDistribution, checkInData } = event.detail;
      onComplete({
        folioId,
        guestName,
        roomNumber,
        requiresChargeDistribution,
        checkInData
      });
    };

    window.addEventListener('checkInSuccess', handleCheckInSuccess as EventListener);
    
    return () => {
      window.removeEventListener('checkInSuccess', handleCheckInSuccess as EventListener);
    };
  }, [onComplete]);

  return <CheckIn />;
};