import { useState, useCallback } from 'react';
import type { CreateGuestData, UpdateGuestData } from '../types';
import { DEFAULT_GUEST_DATA } from '../constants';

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
    const newErrors: Partial<T> = {};

    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'Nombre es requerido' as any;
    }
    if (!formData.firstLastName?.trim()) {
      newErrors.firstLastName = 'Primer apellido es requerido' as any;
    }
    if (!formData.email?.trim()) {
      newErrors.email = 'Email es requerido' as any;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email no válido' as any;
    }
    if (!formData.phone?.trim()) {
      newErrors.phone = 'Teléfono es requerido' as any;
    }
    if (!formData.documentNumber?.trim()) {
      newErrors.documentNumber = 'Número de documento es requerido' as any;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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