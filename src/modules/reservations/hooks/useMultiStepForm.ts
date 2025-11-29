/**
 * Multi-Step Form Hook
 * 
 * Maneja la navegación y estado de formularios multi-paso
 */

import { useState, useCallback } from 'react';

export interface Step {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

interface UseMultiStepFormOptions {
  steps: Step[];
  initialStep?: number;
  onStepChange?: (step: number) => void;
}

export const useMultiStepForm = ({
  steps,
  initialStep = 0,
  onStepChange,
}: UseMultiStepFormOptions) => {
  const [currentStep, setCurrentStep] = useState(initialStep);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      onStepChange?.(newStep);
    }
  }, [currentStep, steps.length, onStepChange]);

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      onStepChange?.(newStep);
    }
  }, [currentStep, onStepChange]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
      onStepChange?.(step);
    }
  }, [steps.length, onStepChange]);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return {
    currentStep,
    currentStepData: steps[currentStep],
    isFirstStep,
    isLastStep,
    progress,
    nextStep,
    previousStep,
    goToStep,
    totalSteps: steps.length,
  };
};
