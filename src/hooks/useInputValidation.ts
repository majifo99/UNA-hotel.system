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

// Helper functions to reduce cognitive complexity

const validateRequired = (value: string, isRequired: boolean): FieldValidation | null => {
  if (isRequired && !value.trim()) {
    return { isValid: false, error: VALIDATION_MESSAGES.REQUIRED };
  }
  return null;
};

const validateEmptyOptional = (value: string, isRequired: boolean): FieldValidation | null => {
  if (!value.trim() && !isRequired) {
    return { isValid: true, error: null };
  }
  return null;
};

const validateLength = (value: string, minLength?: number, maxLength?: number): FieldValidation | null => {
  if (maxLength && value.length > maxLength) {
    return { isValid: false, error: VALIDATION_MESSAGES.MAX_LENGTH(maxLength) };
  }
  
  if (minLength && value.length < minLength) {
    return { isValid: false, error: VALIDATION_MESSAGES.MIN_LENGTH(minLength) };
  }
  
  return null;
};

const getPatternErrorMessage = (pattern: RegExp): string => {
  const patternMap = new Map([
    [INPUT_PATTERNS.LETTERS_ONLY, VALIDATION_MESSAGES.LETTERS_ONLY],
    [INPUT_PATTERNS.NUMBERS_ONLY, VALIDATION_MESSAGES.NUMBERS_ONLY],
    [INPUT_PATTERNS.EMAIL, VALIDATION_MESSAGES.INVALID_EMAIL],
    [INPUT_PATTERNS.PHONE, VALIDATION_MESSAGES.INVALID_PHONE],
    [INPUT_PATTERNS.ROOM_NUMBER, VALIDATION_MESSAGES.INVALID_ROOM],
    [INPUT_PATTERNS.CURRENCY, VALIDATION_MESSAGES.INVALID_CURRENCY]
  ]);
  
  return patternMap.get(pattern) || VALIDATION_MESSAGES.ALPHANUMERIC_ONLY;
};

const validatePattern = (value: string, pattern?: RegExp): FieldValidation | null => {
  if (pattern && !pattern.test(value)) {
    return { isValid: false, error: getPatternErrorMessage(pattern) };
  }
  return null;
};

const getNumericErrorMessage = (fieldName: string, limit: number, isMin: boolean): string => {
  const isGuestField = fieldName.includes('guest') || fieldName.includes('adulto');
  
  if (isGuestField) {
    return isMin ? VALIDATION_MESSAGES.MIN_GUESTS : VALIDATION_MESSAGES.MAX_GUESTS(limit);
  }
  
  return `Valor ${isMin ? 'mínimo' : 'máximo'}: ${limit}`;
};

const validateNumericRange = (value: string, fieldName: string, min?: number, max?: number): FieldValidation | null => {
  const numericValue = Number(value);
  
  if (min !== undefined && numericValue < min) {
    return { isValid: false, error: getNumericErrorMessage(fieldName, min, true) };
  }
  
  if (max !== undefined && numericValue > max) {
    return { isValid: false, error: getNumericErrorMessage(fieldName, max, false) };
  }
  
  return null;
};

const validateCustom = (value: string, customValidator?: (value: string) => string | null): FieldValidation | null => {
  if (customValidator) {
    const customError = customValidator(value);
    if (customError) {
      return { isValid: false, error: customError };
    }
  }
  return null;
};

export const useInputValidation = () => {
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  // Validar un campo individual - Refactored to reduce cognitive complexity
  const validateField = useCallback((
    fieldName: string,
    value: string | number,
    rules: ValidationRule
  ): FieldValidation => {
    const stringValue = String(value);
    
    // Run validation checks in sequence
    const validationChecks = [
      () => validateRequired(stringValue, rules.required || false),
      () => validateEmptyOptional(stringValue, rules.required || false),
      () => validateLength(stringValue, rules.minLength, rules.maxLength),
      () => validatePattern(stringValue, rules.pattern),
      () => validateNumericRange(stringValue, fieldName, rules.min, rules.max),
      () => validateCustom(stringValue, rules.customValidator)
    ];
    
    for (const check of validationChecks) {
      const result = check();
      if (result) {
        return result;
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
    
    for (const [fieldName, { value, rules }] of Object.entries(fields)) {
      results[fieldName] = validate(fieldName, value, rules);
    }
    
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