import type { ValidationState } from '../components/shared/ValidatedInputs';

export const getValidationState = (
  value: any, 
  errors: Record<string, string | undefined>, 
  fieldName: string
): ValidationState => {
  if (errors[fieldName]) {
    return 'error';
  }
  
  if (value && !errors[fieldName]) {
    return 'success';
  }
  
  return 'default';
};