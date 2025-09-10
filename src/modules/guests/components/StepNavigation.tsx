import React from 'react';
import { ChevronRight, ChevronLeft, Save } from 'lucide-react';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  isLoading: boolean;
  onPrevStep: () => void;
  onNextStep: () => void;
  onCancel: () => void;
  onSubmit: () => void;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  totalSteps,
  isLoading,
  onPrevStep,
  onNextStep,
  onCancel,
  onSubmit
}) => {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex justify-between items-center pt-6">
      <button
        type="button"
        onClick={onPrevStep}
        disabled={isFirstStep}
        className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={16} />
        Anterior
      </button>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>

        {isLastStep ? (
          <button
            type="button"
            onClick={onSubmit}
            disabled={isLoading}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save size={16} />
                Crear Huésped
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={onNextStep}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Siguiente
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
