import type { ValidationRule, ValidationResult, FormValidationResult, FormSchema } from '../types';

export class ValidationEngine {
  /**
   * Validate a single field value against its validation rules
   */
  static validateField(value: any, rules: ValidationRule[] = []): ValidationResult {
    const errors: string[] = [];

    for (const rule of rules) {
      const error = this.validateSingleRule(value, rule);
      if (error) {
        errors.push(error);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate an entire form against its schema
   */
  static validateForm(values: Record<string, any>, schema: FormSchema): FormValidationResult {
    const fieldErrors: Record<string, string[]> = {};
    let isValid = true;

    for (const field of schema.fields) {
      const fieldValue = values[field.id];
      const rules = field.validation || [];
      
      // Add required validation if field is marked as required
      if (field.required) {
        // Check if there's already a notEmpty rule to avoid duplicates
        const hasNotEmptyRule = rules.some(rule => rule.type === 'notEmpty');
        if (!hasNotEmptyRule) {
          const requiredRule: ValidationRule = {
            type: 'notEmpty',
            message: `${field.label} is required`
          };
          rules.unshift(requiredRule);
        }
      }

      const result = this.validateField(fieldValue, rules);
      
      if (!result.isValid) {
        fieldErrors[field.id] = result.errors;
        isValid = false;
      }
    }

    return {
      isValid,
      fieldErrors
    };
  }

  /**
   * Validate a single value against a single rule
   */
  private static validateSingleRule(value: any, rule: ValidationRule): string | null {
    switch (rule.type) {
      case 'notEmpty':
        return this.validateNotEmpty(value, rule.message);
      
      case 'minLength':
        return this.validateMinLength(value, rule.value as number, rule.message);
      
      case 'maxLength':
        return this.validateMaxLength(value, rule.value as number, rule.message);
      
      case 'email':
        return this.validateEmail(value, rule.message);
      
      case 'customPassword':
        return this.validateCustomPassword(value, rule.message);
      
      default:
        return null;
    }
  }

  /**
   * Validate that a value is not empty
   */
  private static validateNotEmpty(value: any, message: string): string | null {
    if (value === null || value === undefined) {
      return message;
    }

    if (typeof value === 'string' && value.trim() === '') {
      return message;
    }

    if (Array.isArray(value) && value.length === 0) {
      return message;
    }

    if (typeof value === 'object' && Object.keys(value).length === 0) {
      return message;
    }

    return null;
  }

  /**
   * Validate minimum length requirement
   */
  private static validateMinLength(value: any, minLength: number, message: string): string | null {
    if (value === null || value === undefined) {
      return null; // Let notEmpty handle null/undefined values
    }

    const stringValue = String(value);
    if (stringValue.length < minLength) {
      return message;
    }

    return null;
  }

  /**
   * Validate maximum length requirement
   */
  private static validateMaxLength(value: any, maxLength: number, message: string): string | null {
    if (value === null || value === undefined) {
      return null; // Let notEmpty handle null/undefined values
    }

    const stringValue = String(value);
    if (stringValue.length > maxLength) {
      return message;
    }

    return null;
  }

  /**
   * Validate email format
   */
  private static validateEmail(value: any, message: string): string | null {
    if (value === null || value === undefined || value === '') {
      return null; // Let notEmpty handle empty values
    }

    const stringValue = String(value);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(stringValue)) {
      return message;
    }

    return null;
  }

  /**
   * Validate custom password requirements
   * Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character
   */
  private static validateCustomPassword(value: any, message: string): string | null {
    if (value === null || value === undefined || value === '') {
      return null; // Let notEmpty handle empty values
    }

    const stringValue = String(value);
    
    // Check minimum length
    if (stringValue.length < 8) {
      return message;
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(stringValue)) {
      return message;
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(stringValue)) {
      return message;
    }

    // Check for at least one number
    if (!/\d/.test(stringValue)) {
      return message;
    }

    // Check for at least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(stringValue)) {
      return message;
    }

    return null;
  }

  /**
   * Get default error message for a validation rule type
   */
  static getDefaultErrorMessage(ruleType: ValidationRule['type'], fieldLabel: string, value?: number | string): string {
    switch (ruleType) {
      case 'notEmpty':
        return `${fieldLabel} is required`;
      
      case 'minLength':
        return `${fieldLabel} must be at least ${value} characters long`;
      
      case 'maxLength':
        return `${fieldLabel} must not exceed ${value} characters`;
      
      case 'email':
        return `${fieldLabel} must be a valid email address`;
      
      case 'customPassword':
        return `${fieldLabel} must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character`;
      
      default:
        return `${fieldLabel} is invalid`;
    }
  }

  /**
   * Get contextual help text for validation rules
   */
  static getValidationHelpText(ruleType: ValidationRule['type'], value?: number | string): string {
    switch (ruleType) {
      case 'notEmpty':
        return 'This field cannot be left empty';
      
      case 'minLength':
        return `Enter at least ${value} characters`;
      
      case 'maxLength':
        return `Keep it under ${value} characters`;
      
      case 'email':
        return 'Use format: example@domain.com';
      
      case 'customPassword':
        return 'Include: 8+ chars, uppercase, lowercase, number, and special character (!@#$%^&*)';
      
      default:
        return 'Please check your input';
    }
  }

  /**
   * Get enhanced error message with context and suggestions
   */
  static getEnhancedErrorMessage(
    ruleType: ValidationRule['type'], 
    fieldLabel: string, 
    currentValue: any, 
    ruleValue?: number | string
  ): { message: string; suggestion: string; severity: 'error' | 'warning' | 'info' } {
    const currentLength = currentValue ? String(currentValue).length : 0;
    
    switch (ruleType) {
      case 'notEmpty':
        return {
          message: `${fieldLabel} is required`,
          suggestion: 'Please enter a value for this field',
          severity: 'error'
        };
      
      case 'minLength':
        const minLength = ruleValue as number;
        const remaining = minLength - currentLength;
        return {
          message: `${fieldLabel} must be at least ${minLength} characters long`,
          suggestion: remaining > 0 
            ? `Add ${remaining} more character${remaining > 1 ? 's' : ''} (currently ${currentLength})`
            : 'Length requirement met',
          severity: remaining > 0 ? 'error' : 'info'
        };
      
      case 'maxLength':
        const maxLength = ruleValue as number;
        const excess = currentLength - maxLength;
        return {
          message: `${fieldLabel} must not exceed ${maxLength} characters`,
          suggestion: excess > 0 
            ? `Remove ${excess} character${excess > 1 ? 's' : ''} (currently ${currentLength})`
            : 'Length is within limit',
          severity: excess > 0 ? 'error' : 'info'
        };
      
      case 'email':
        return {
          message: `${fieldLabel} must be a valid email address`,
          suggestion: 'Use format: example@domain.com',
          severity: 'error'
        };
      
      case 'customPassword':
        const password = String(currentValue || '');
        const issues = [];
        
        if (password.length < 8) issues.push('at least 8 characters');
        if (!/[A-Z]/.test(password)) issues.push('one uppercase letter');
        if (!/[a-z]/.test(password)) issues.push('one lowercase letter');
        if (!/\d/.test(password)) issues.push('one number');
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) issues.push('one special character');
        
        return {
          message: `${fieldLabel} must meet security requirements`,
          suggestion: issues.length > 0 
            ? `Missing: ${issues.join(', ')}`
            : 'Password meets all requirements',
          severity: issues.length > 0 ? 'error' : 'info'
        };
      
      default:
        return {
          message: `${fieldLabel} is invalid`,
          suggestion: 'Please check your input',
          severity: 'error'
        };
    }
  }
}