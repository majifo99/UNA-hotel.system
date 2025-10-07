import { useCallback } from 'react';
import type { CreateGuestData, UpdateGuestData } from '../types';

interface UseGuestModalOptions<T extends CreateGuestData | UpdateGuestData> {
  onClose: () => void;
  validateForm: () => boolean;
  clearErrors: () => void;
  resetForm?: () => void;
  formData: T;
}

export const useGuestModal = <T extends CreateGuestData | UpdateGuestData>({
  onClose,
  validateForm,
  clearErrors,
  resetForm,
  formData
}: UseGuestModalOptions<T>) => {
  
  const handleClose = useCallback(() => {
    onClose();
    clearErrors();
  }, [onClose, clearErrors]);

  const createSubmitHandler = useCallback((
    submitAction: (data: T) => Promise<any>,
    onSuccess?: (result: any) => void,
    additionalValidation?: () => boolean
  ) => {
    return async (e: React.FormEvent) => {
      e.preventDefault();
      
      const isValid = additionalValidation ? 
        validateForm() && additionalValidation() : 
        validateForm();
        
      if (!isValid) return;

      try {
        const result = await submitAction(formData);
        onSuccess?.(result);
        onClose();
        resetForm?.();
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    };
  }, [validateForm, formData, onClose, resetForm]);

  return {
    handleClose,
    createSubmitHandler
  };
};