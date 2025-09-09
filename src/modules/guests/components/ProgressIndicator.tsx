import React from 'react';
import { CheckCircle } from 'lucide-react';

interface StepConfig {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  fields: string[];
}

interface ProgressIndicatorProps {
  steps: StepConfig[];
  currentStep: number;
  goToStep: (stepNumber: number) => void;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  goToStep
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Progreso</h2>
        <span className="text-sm text-gray-500">
          Paso {currentStep} de {steps.length}
        </span>
      </div>
      
      {/* Desktop progress indicator */}
      <div className="hidden lg:grid lg:grid-cols-6 gap-2">
        {steps.map((step) => (
          <button
            key={step.id}
            onClick={() => goToStep(step.id)}
            className={`flex items-center gap-2 p-3 rounded-lg transition-all duration-200 h-16 ${
              currentStep === step.id
                ? 'bg-blue-50 border-2 border-blue-200 text-blue-700'
                : currentStep > step.id
                ? 'bg-green-50 border-2 border-green-200 text-green-700 hover:bg-green-100'
                : 'bg-gray-50 border-2 border-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            disabled={currentStep < step.id}
            title={step.description}
          >
            <div className={`p-1.5 rounded-lg flex-shrink-0 ${
              currentStep === step.id
                ? 'bg-blue-100'
                : currentStep > step.id
                ? 'bg-green-100'
                : 'bg-gray-100'
            }`}>
              {currentStep > step.id ? <CheckCircle size={18} /> : step.icon}
            </div>
            <div className="text-left min-w-0 flex-1 flex flex-col justify-center">
              <div className="font-medium text-sm leading-tight line-clamp-1">{step.title}</div>
              <div className="text-xs opacity-75 leading-tight line-clamp-2">{step.description}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Mobile progress indicator */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              currentStep === steps.find(s => s.id === currentStep)?.id
                ? 'bg-blue-100'
                : 'bg-gray-100'
            }`}>
              {steps.find(s => s.id === currentStep)?.icon}
            </div>
            <div>
              <div className="font-medium text-blue-700">
                {steps.find(s => s.id === currentStep)?.title}
              </div>
              <div className="text-sm text-gray-600">
                {steps.find(s => s.id === currentStep)?.description}
              </div>
            </div>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
