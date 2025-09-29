import { useState, useCallback } from 'react';
import { INPUT_LIMITS, INPUT_PATTERNS, VALIDATION_MESSAGES } from '../utils/inputValidation';

export interface ValidationRule {
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  customValidator?: (value: string) => string | null;
}

export interface FieldValidation {
  isValid: boolean;
  error: string | null;
}

export const useInputValidation = () => {
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  // Validar un campo individual
  const validateField = useCallback((
    fieldName: string,
    value: string | number,
    rules: ValidationRule
  ): FieldValidation => {
    const stringValue = String(value);
    
    // Campo requerido
    if (rules.required && !stringValue.trim()) {
      return { isValid: false, error: VALIDATION_MESSAGES.REQUIRED };
    }
    
    // Si está vacío y no es requerido, es válido
    if (!stringValue.trim() && !rules.required) {
      return { isValid: true, error: null };
    }
    
    // Longitud máxima
    if (rules.maxLength && stringValue.length > rules.maxLength) {
      return { isValid: false, error: VALIDATION_MESSAGES.MAX_LENGTH(rules.maxLength) };
    }
    
    // Longitud mínima
    if (rules.minLength && stringValue.length < rules.minLength) {
      return { isValid: false, error: VALIDATION_MESSAGES.MIN_LENGTH(rules.minLength) };
    }
    
    // Patrón
    if (rules.pattern && !rules.pattern.test(stringValue)) {
      // Determinar mensaje según el patrón
      if (rules.pattern === INPUT_PATTERNS.LETTERS_ONLY) {
        return { isValid: false, error: VALIDATION_MESSAGES.LETTERS_ONLY };
      }
      if (rules.pattern === INPUT_PATTERNS.NUMBERS_ONLY) {
        return { isValid: false, error: VALIDATION_MESSAGES.NUMBERS_ONLY };
      }
      if (rules.pattern === INPUT_PATTERNS.EMAIL) {
        return { isValid: false, error: VALIDATION_MESSAGES.INVALID_EMAIL };
      }
      if (rules.pattern === INPUT_PATTERNS.PHONE) {
        return { isValid: false, error: VALIDATION_MESSAGES.INVALID_PHONE };
      }
      if (rules.pattern === INPUT_PATTERNS.ROOM_NUMBER) {
        return { isValid: false, error: VALIDATION_MESSAGES.INVALID_ROOM };
      }
      if (rules.pattern === INPUT_PATTERNS.CURRENCY) {
        return { isValid: false, error: VALIDATION_MESSAGES.INVALID_CURRENCY };
      }
      return { isValid: false, error: VALIDATION_MESSAGES.ALPHANUMERIC_ONLY };
    }
    
    // Valor mínimo (para números)
    if (rules.min !== undefined && Number(stringValue) < rules.min) {
      if (fieldName.includes('guest') || fieldName.includes('adulto')) {
        return { isValid: false, error: VALIDATION_MESSAGES.MIN_GUESTS };
      }
      return { isValid: false, error: `Valor mínimo: ${rules.min}` };
    }
    
    // Valor máximo (para números)
    if (rules.max !== undefined && Number(stringValue) > rules.max) {
      if (fieldName.includes('guest') || fieldName.includes('adulto')) {
        return { isValid: false, error: VALIDATION_MESSAGES.MAX_GUESTS(rules.max) };
      }
      return { isValid: false, error: `Valor máximo: ${rules.max}` };
    }
    
    // Validador personalizado
    if (rules.customValidator) {
      const customError = rules.customValidator(stringValue);
      if (customError) {
        return { isValid: false, error: customError };
      }
    }
    
    return { isValid: true, error: null };
  }, []);

  // Validar y actualizar errores
  const validate = useCallback((
    fieldName: string,
    value: string | number,
    rules: ValidationRule
  ) => {
    const validation = validateField(fieldName, value, rules);
    
    setErrors(prev => ({
      ...prev,
      [fieldName]: validation.error
    }));
    
    return validation.isValid;
  }, [validateField]);

  // Limpiar error de un campo
  const clearError = useCallback((fieldName: string) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: null
    }));
  }, []);

  // Limpiar todos los errores
  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Obtener reglas predefinidas para campos comunes
  const getCommonRules = useCallback((fieldType: string): ValidationRule => {
    switch (fieldType) {
      case 'firstName':
        return {
          required: true,
          maxLength: INPUT_LIMITS.FIRST_NAME,
          pattern: INPUT_PATTERNS.LETTERS_ONLY
        };
      case 'lastName':
        return {
          required: true,
          maxLength: INPUT_LIMITS.LAST_NAME,
          pattern: INPUT_PATTERNS.LETTERS_ONLY
        };
      case 'email':
        return {
          required: true,
          maxLength: INPUT_LIMITS.EMAIL,
          pattern: INPUT_PATTERNS.EMAIL
        };
      case 'phone':
        return {
          maxLength: INPUT_LIMITS.PHONE,
          pattern: INPUT_PATTERNS.PHONE
        };
      case 'identification':
        return {
          required: true,
          maxLength: INPUT_LIMITS.IDENTIFICATION,
          pattern: INPUT_PATTERNS.DOCUMENT_ID
        };
      case 'roomNumber':
        return {
          required: true,
          maxLength: INPUT_LIMITS.ROOM_NUMBER,
          pattern: INPUT_PATTERNS.ROOM_NUMBER
        };
      case 'adults':
        return {
          required: true,
          min: 1,
          max: INPUT_LIMITS.GUESTS_MAX
        };
      case 'children':
        return {
          min: 0,
          max: INPUT_LIMITS.CHILDREN_MAX
        };
      case 'babies':
        return {
          min: 0,
          max: INPUT_LIMITS.BABIES_MAX
        };
      case 'observations':
        return {
          maxLength: INPUT_LIMITS.OBSERVATIONS,
          pattern: INPUT_PATTERNS.TEXT_WITH_PUNCTUATION
        };
      case 'currency':
        return {
          pattern: INPUT_PATTERNS.CURRENCY
        };
      default:
        return {};
    }
  }, []);

  // Validar múltiples campos
  const validateMultiple = useCallback((
    fields: Record<string, { value: string | number; rules: ValidationRule }>
  ) => {
    const results: Record<string, boolean> = {};
    
    Object.entries(fields).forEach(([fieldName, { value, rules }]) => {
      results[fieldName] = validate(fieldName, value, rules);
    });
    
    return {
      isValid: Object.values(results).every(Boolean),
      results
    };
  }, [validate]);

  return {
    errors,
    validate,
    validateField,
    clearError,
    clearAllErrors,
    getCommonRules,
    validateMultiple
  };
};