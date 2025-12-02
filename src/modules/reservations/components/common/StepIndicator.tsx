/**
 * Step Indicator Component
 * 
 * Muestra el progreso del formulario multi-paso
 * Patrón basado en CreateGuestPage ProgressIndicator
 */

import React from 'react';
import { CheckCircle, User, Calendar, Hotel, Plus, CheckSquare } from 'lucide-react';
import type { Step } from '../../hooks/useMultiStepForm';

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

// Map icon strings to React components
const iconMap: Record<string, React.ReactNode> = {
  '👤': <User size={18} />,
  '📅': <Calendar size={18} />,
  '🏨': <Hotel size={18} />,
  '➕': <Plus size={18} />,
  '✅': <CheckSquare size={18} />,
};

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Progreso</h2>
        <span className="text-sm text-gray-500">
          Paso {currentStep + 1} de {steps.length}
        </span>
      </div>
      
      {/* Desktop progress indicator */}
      <div className="hidden lg:grid lg:grid-cols-5 gap-2">
        {steps.map((step, index) => {
          const isCurrentStep = currentStep === index;
          const isCompletedStep = currentStep > index;
          const isFutureStep = currentStep < index;
          
          let containerClasses = 'bg-gray-50 border-2 border-gray-200 text-gray-400 cursor-not-allowed';
          if (isCurrentStep) {
            containerClasses = 'bg-blue-50 border-2 border-blue-200 text-blue-700';
          } else if (isCompletedStep) {
            containerClasses = 'bg-green-50 border-2 border-green-200 text-green-700 hover:bg-green-100';
          }
          
          let iconClasses = 'bg-gray-100';
          if (isCurrentStep) {
            iconClasses = 'bg-blue-100';
          } else if (isCompletedStep) {
            iconClasses = 'bg-green-100';
          }

          return (
            <button
              key={step.id}
              onClick={() => onStepClick?.(index)}
              className={`flex items-center gap-2 p-3 rounded-lg transition-all duration-200 h-16 ${containerClasses}`}
              disabled={isFutureStep}
              title={step.description}
            >
              <div className={`p-1.5 rounded-lg flex-shrink-0 ${iconClasses}`}>
                {isCompletedStep ? <CheckCircle size={18} /> : iconMap[step.icon || ''] || step.icon}
              </div>
              <div className="text-left min-w-0 flex-1 flex flex-col justify-center">
                <div className="font-medium text-sm leading-tight line-clamp-1">{step.title}</div>
                <div className="text-xs opacity-75 leading-tight line-clamp-2">{step.description}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Mobile progress indicator */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              currentStep === steps.findIndex(s => s.id === steps[currentStep]?.id)
                ? 'bg-blue-100'
                : 'bg-gray-100'
            }`}>
              {iconMap[steps[currentStep]?.icon || ''] || steps[currentStep]?.icon}
            </div>
            <div>
              <div className="font-medium text-blue-700">
                {steps[currentStep]?.title}
              </div>
              <div className="text-sm text-gray-600">
                {steps[currentStep]?.description}
              </div>
            </div>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
