// Form validation utilities for the application

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  phone?: boolean;
  age?: { min?: number; max?: number };
  custom?: (value: any) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface FormField {
  name: string;
  value: any;
  rules?: ValidationRule;
}

// Arabic validation messages
const VALIDATION_MESSAGES = {
  required: 'هذا الحقل مطلوب',
  minLength: (min: number) => `يجب أن يحتوي على ${min} أحرف على الأقل`,
  maxLength: (max: number) => `يجب ألا يتجاوز ${max} حرف`,
  email: 'يرجى إدخال بريد إلكتروني صحيح',
  phone: 'يرجى إدخال رقم هاتف صحيح',
  age: (min?: number, max?: number) => {
    if (min && max) return `العمر يجب أن يكون بين ${min} و ${max} سنة`;
    if (min) return `العمر يجب أن يكون ${min} سنة أو أكثر`;
    if (max) return `العمر يجب أن يكون ${max} سنة أو أقل`;
    return 'العمر غير صحيح';
  },
  pattern: 'تنسيق البيانات غير صحيح'
};

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Arabic phone number regex (supports various formats)
const PHONE_REGEX = /^(\+966|966|0)?[5][0-9]{8}$/;

/**
 * Validate a single field
 */
export function validateField(value: any, rules: ValidationRule): string | null {
  if (!rules) return null;

  // Required validation
  if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return VALIDATION_MESSAGES.required;
  }

  // Skip other validations if field is empty and not required
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return null;
  }

  const stringValue = String(value).trim();

  // Min length validation
  if (rules.minLength && stringValue.length < rules.minLength) {
    return VALIDATION_MESSAGES.minLength(rules.minLength);
  }

  // Max length validation
  if (rules.maxLength && stringValue.length > rules.maxLength) {
    return VALIDATION_MESSAGES.maxLength(rules.maxLength);
  }

  // Email validation
  if (rules.email && !EMAIL_REGEX.test(stringValue)) {
    return VALIDATION_MESSAGES.email;
  }

  // Phone validation
  if (rules.phone && !PHONE_REGEX.test(stringValue)) {
    return VALIDATION_MESSAGES.phone;
  }

  // Age validation
  if (rules.age) {
    const ageValue = Number(value);
    if (isNaN(ageValue)) {
      return VALIDATION_MESSAGES.age();
    }
    if (rules.age.min && ageValue < rules.age.min) {
      return VALIDATION_MESSAGES.age(rules.age.min, rules.age.max);
    }
    if (rules.age.max && ageValue > rules.age.max) {
      return VALIDATION_MESSAGES.age(rules.age.min, rules.age.max);
    }
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    return VALIDATION_MESSAGES.pattern;
  }

  // Custom validation
  if (rules.custom) {
    const customError = rules.custom(value);
    if (customError) return customError;
  }

  return null;
}

/**
 * Validate multiple fields
 */
export function validateForm(fields: FormField[]): ValidationResult {
  const errors: Record<string, string> = {};

  fields.forEach(field => {
    const error = validateField(field.value, field.rules);
    if (error) {
      errors[field.name] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Profile-specific validation rules
 */
export const PROFILE_VALIDATION_RULES = {
  full_name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\w]+$/
  } as ValidationRule,
  
  username: {
    required: true,
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_]+$/
  } as ValidationRule,
  
  email: {
    required: true,
    email: true,
    maxLength: 254
  } as ValidationRule,
  
  phone: {
    phone: true
  } as ValidationRule,
  
  age: {
    age: { min: 13, max: 120 }
  } as ValidationRule,
  
  bio: {
    maxLength: 500
  } as ValidationRule
};

/**
 * Custom hook for form validation
 */
export function useFormValidation(initialFields: FormField[]) {
  const [fields, setFields] = React.useState(initialFields);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isValid, setIsValid] = React.useState(false);

  const validateAll = React.useCallback(() => {
    const result = validateForm(fields);
    setErrors(result.errors);
    setIsValid(result.isValid);
    return result;
  }, [fields]);

  const validateSingle = React.useCallback((fieldName: string) => {
    const field = fields.find(f => f.name === fieldName);
    if (!field) return;

    const error = validateField(field.value, field.rules);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error || ''
    }));
  }, [fields]);

  const updateField = React.useCallback((fieldName: string, value: any) => {
    setFields(prev => prev.map(field => 
      field.name === fieldName ? { ...field, value } : field
    ));
  }, []);

  React.useEffect(() => {
    validateAll();
  }, [validateAll]);

  return {
    fields,
    errors,
    isValid,
    validateAll,
    validateSingle,
    updateField
  };
}

// Re-export React for the custom hook
import React from 'react';
