import { useState, useCallback } from 'react';
import type { CreateGuestData, UpdateGuestData } from '../types';
import { DEFAULT_GUEST_DATA } from '../constants';
import { guestFormSchema, updateGuestFormSchema, formatZodErrors } from '../schemas';

type GuestFormData = CreateGuestData | UpdateGuestData;

interface UseGuestFormOptions<T extends GuestFormData> {
  initialData?: Partial<T>;
  onSuccess?: (data: T) => void;
}

export const useGuestForm = <T extends GuestFormData>(
  options: UseGuestFormOptions<T> = {}
) => {
  const { initialData } = options;

  const [formData, setFormData] = useState<T>(() => ({
    ...DEFAULT_GUEST_DATA,
    ...initialData
  } as T));

  const [errors, setErrors] = useState<Partial<T>>({});

  const handleInputChange = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const validateForm = useCallback((): boolean => {
    try {
      // Determinar si es una actualización (tiene id) o creación
      const hasId = 'id' in formData && formData.id;
      const schema = hasId ? updateGuestFormSchema : guestFormSchema;
      
      // Validar con Zod
      schema.parse(formData);
      
      // Si llegamos aquí, no hay errores
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof Error && 'issues' in error) {
        // Es un ZodError
        const zodError = error as any; // Temporalmente como any para evitar problemas de tipo
        const formattedErrors = formatZodErrors<T>(zodError);
        setErrors(formattedErrors);
      } else {
        // Error inesperado
        console.error('Error de validación inesperado:', error);
        setErrors({ general: 'Error de validación' } as any);
      }
      return false;
    }
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({
      ...DEFAULT_GUEST_DATA,
      ...initialData
    } as T);
    setErrors({});
  }, [initialData]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const updateFormData = useCallback((data: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  return {
    formData,
    errors,
    handleInputChange,
    validateForm,
    resetForm,
    clearErrors,
    updateFormData,
    setFormData
  };
};