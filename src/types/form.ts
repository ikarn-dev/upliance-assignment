export interface ValidationRule {
  type: 'notEmpty' | 'minLength' | 'maxLength' | 'email' | 'customPassword';
  value?: number | string;
  message: string;
}

export interface DerivedFieldConfig {
  parentFields: string[];
  computationLogic: string; // JavaScript expression
}

export interface FormField {
  id: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date';
  label: string;
  required: boolean;
  defaultValue?: any;
  validation?: ValidationRule[];
  options?: string[]; // for select/radio
  derivedFrom?: DerivedFieldConfig;
}

export interface FormSchema {
  id: string;
  name: string;
  createdAt: Date;
  fields: FormField[];
}

export interface FormState {
  values: Record<string, any>;
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;
  isValid: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FormValidationResult {
  isValid: boolean;
  fieldErrors: Record<string, string[]>;
}