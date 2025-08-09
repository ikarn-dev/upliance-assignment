import type { DerivedFieldConfig, FormSchema } from '../types';

export interface DerivedFieldError {
  type: 'invalid_expression' | 'missing_parent' | 'evaluation_error' | 'circular_dependency';
  message: string;
  fieldId?: string;
  originalError?: Error;
}

export class DerivedFieldCalculator {
  /**
   * Compute the value of a derived field based on its configuration and form values
   */
  static computeValue(
    config: DerivedFieldConfig,
    formValues: Record<string, any>
  ): { value: any; error?: DerivedFieldError } {
    try {
      // Validate that all parent fields exist in form values
      const missingParents = config.parentFields.filter(
        parentId => !(parentId in formValues)
      );

      if (missingParents.length > 0) {
        return {
          value: null,
          error: {
            type: 'missing_parent',
            message: `Missing parent field values: ${missingParents.join(', ')}`
          }
        };
      }

      // Validate the computation logic
      if (!config.computationLogic || typeof config.computationLogic !== 'string') {
        return {
          value: null,
          error: {
            type: 'invalid_expression',
            message: 'Computation logic must be a non-empty string'
          }
        };
      }

      // Create a safe evaluation context with parent field values
      const context = this.createSafeContext(config.parentFields, formValues);
      
      // Evaluate the expression safely
      const result = this.safeEvaluate(config.computationLogic, context);
      
      return { value: result };
    } catch (error: any) {
      return {
        value: null,
        error: {
          type: 'evaluation_error',
          message: error.message || 'Failed to evaluate derived field expression',
          originalError: error
        }
      };
    }
  }

  /**
   * Update all derived fields in a form based on current form values
   */
  static updateDerivedFields(
    formValues: Record<string, any>,
    schema: FormSchema
  ): { values: Record<string, any>; errors: Record<string, DerivedFieldError> } {
    const updatedValues = { ...formValues };
    const errors: Record<string, DerivedFieldError> = {};

    // Get all derived fields from the schema
    const derivedFields = schema.fields.filter(field => field.derivedFrom);

    // Check for circular dependencies
    const circularDependencyError = this.detectCircularDependencies(derivedFields);
    if (circularDependencyError) {
      // Mark all derived fields as having circular dependency errors
      derivedFields.forEach(field => {
        errors[field.id] = circularDependencyError;
      });
      return { values: updatedValues, errors };
    }

    // Sort derived fields by dependency order to ensure parent fields are computed first
    const sortedDerivedFields = this.sortFieldsByDependencies(derivedFields);

    // Compute each derived field value
    for (const field of sortedDerivedFields) {
      if (!field.derivedFrom) continue;

      const result = this.computeValue(field.derivedFrom, updatedValues);
      
      if (result.error) {
        errors[field.id] = { ...result.error, fieldId: field.id };
      } else {
        updatedValues[field.id] = result.value;
      }
    }

    return { values: updatedValues, errors };
  }

  /**
   * Create a safe evaluation context with only the necessary variables
   */
  private static createSafeContext(
    parentFields: string[],
    formValues: Record<string, any>
  ): Record<string, any> {
    const context: Record<string, any> = {};

    // Add parent field values to context
    parentFields.forEach(fieldId => {
      context[fieldId] = formValues[fieldId];
    });

    // Add safe utility functions
    context.Math = {
      abs: Math.abs,
      ceil: Math.ceil,
      floor: Math.floor,
      max: Math.max,
      min: Math.min,
      round: Math.round,
      pow: Math.pow,
      sqrt: Math.sqrt
    };

    context.String = {
      concat: (...args: any[]) => String.prototype.concat.apply('', args),
      toLowerCase: (str: any) => String(str).toLowerCase(),
      toUpperCase: (str: any) => String(str).toUpperCase(),
      trim: (str: any) => String(str).trim(),
      substring: (str: any, start: number, end?: number) => String(str).substring(start, end)
    };

    context.Number = {
      parseFloat: (value: any) => parseFloat(String(value)),
      parseInt: (value: any, radix?: number) => parseInt(String(value), radix),
      isNaN: (value: any) => isNaN(Number(value))
    };

    return context;
  }

  /**
   * Safely evaluate a JavaScript expression with a restricted context
   */
  private static safeEvaluate(expression: string, context: Record<string, any>): any {
    // Validate expression doesn't contain dangerous patterns
    this.validateExpression(expression);

    try {
      // Create a function with the context variables as parameters
      const contextKeys = Object.keys(context);
      const contextValues = contextKeys.map(key => context[key]);
      
      // Create the function body that returns the expression result
      const functionBody = `
        "use strict";
        try {
          return (${expression});
        } catch (error) {
          throw new Error('Expression evaluation failed: ' + error.message);
        }
      `;

      // Create and execute the function
      const func = new Function(...contextKeys, functionBody);
      const result = func(...contextValues);

      // Validate the result
      return this.validateResult(result);
    } catch (error: any) {
      throw new Error(`Expression evaluation error: ${error.message}`);
    }
  }

  /**
   * Validate that an expression doesn't contain dangerous patterns
   */
  private static validateExpression(expression: string): void {
    // List of dangerous patterns to block
    const dangerousPatterns = [
      /\beval\b/,
      /\bFunction\b/,
      /\bsetTimeout\b/,
      /\bsetInterval\b/,
      /\bsetImmediate\b/,
      /\brequire\b/,
      /\bimport\b/,
      /\bexport\b/,
      /\bprocess\b/,
      /\bglobal\b/,
      /\bwindow\b/,
      /\bdocument\b/,
      /\blocalStorage\b/,
      /\bsessionStorage\b/,
      /\bfetch\b/,
      /\bXMLHttpRequest\b/,
      /\b__proto__\b/,
      /\bconstructor\b/,
      /\bprototype\b/,
      /\bthis\b/,
      /\bdelete\b/,
      /\bvoid\b/,
      /\btypeof\b/,
      /\binstanceof\b/,
      /\bin\b/,
      /\bwith\b/,
      /\btry\b/,
      /\bcatch\b/,
      /\bfinally\b/,
      /\bthrow\b/,
      /\bfor\b/,
      /\bwhile\b/,
      /\bdo\b/,
      /\bswitch\b/,
      /\bcase\b/,
      /\bbreak\b/,
      /\bcontinue\b/,
      /\breturn\b/,
      /\bvar\b/,
      /\blet\b/,
      /\bconst\b/,
      /\bclass\b/,
      /\bextends\b/,
      /\bstatic\b/,
      /\byield\b/,
      /\basync\b/,
      /\bawait\b/,
      /\bnew\b/,
      /\[\s*['"`]/,  // Property access with strings
      /\.\s*constructor/,
      /\.\s*__proto__/,
      /\.\s*prototype/
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(expression)) {
        throw new Error(`Expression contains forbidden pattern: ${pattern.source}`);
      }
    }

    // Check for excessive complexity
    if (expression.length > 500) {
      throw new Error('Expression is too long (maximum 500 characters)');
    }

    // Check for balanced parentheses
    let parenCount = 0;
    for (const char of expression) {
      if (char === '(') parenCount++;
      if (char === ')') parenCount--;
      if (parenCount < 0) {
        throw new Error('Unbalanced parentheses in expression');
      }
    }
    if (parenCount !== 0) {
      throw new Error('Unbalanced parentheses in expression');
    }
  }

  /**
   * Validate and sanitize the result of expression evaluation
   */
  private static validateResult(result: any): any {
    // Handle null and undefined
    if (result === null || result === undefined) {
      return result;
    }

    // Handle primitive types
    if (typeof result === 'string' || typeof result === 'number' || typeof result === 'boolean') {
      return result;
    }

    // Handle dates
    if (result instanceof Date) {
      return result;
    }

    // Handle arrays (shallow validation)
    if (Array.isArray(result)) {
      return result.map(item => {
        if (typeof item === 'object' && item !== null) {
          throw new Error('Complex objects not allowed in derived field results');
        }
        return item;
      });
    }

    // Reject complex objects
    if (typeof result === 'object') {
      throw new Error('Complex objects not allowed in derived field results');
    }

    // Reject functions
    if (typeof result === 'function') {
      throw new Error('Functions not allowed in derived field results');
    }

    return result;
  }

  /**
   * Detect circular dependencies in derived fields
   */
  private static detectCircularDependencies(derivedFields: any[]): DerivedFieldError | null {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (fieldId: string): boolean => {
      if (recursionStack.has(fieldId)) {
        return true; // Found a cycle
      }

      if (visited.has(fieldId)) {
        return false; // Already processed this field
      }

      visited.add(fieldId);
      recursionStack.add(fieldId);

      // Find the field configuration
      const field = derivedFields.find(f => f.id === fieldId);
      if (field && field.derivedFrom) {
        // Check all parent fields
        for (const parentId of field.derivedFrom.parentFields) {
          // Only check if parent is also a derived field
          const parentField = derivedFields.find(f => f.id === parentId);
          if (parentField && parentField.derivedFrom && hasCycle(parentId)) {
            return true;
          }
        }
      }

      recursionStack.delete(fieldId);
      return false;
    };

    // Check each derived field for cycles
    for (const field of derivedFields) {
      if (!visited.has(field.id) && hasCycle(field.id)) {
        return {
          type: 'circular_dependency',
          message: 'Circular dependency detected in derived fields'
        };
      }
    }

    return null;
  }

  /**
   * Sort derived fields by their dependencies to ensure proper evaluation order
   */
  private static sortFieldsByDependencies(derivedFields: any[]): any[] {
    const sorted: any[] = [];
    const visited = new Set<string>();
    const temp = new Set<string>();

    const visit = (field: any): void => {
      if (temp.has(field.id)) {
        // This should not happen if circular dependency detection works correctly
        return;
      }

      if (visited.has(field.id)) {
        return;
      }

      temp.add(field.id);

      // Visit all parent fields that are also derived fields
      if (field.derivedFrom) {
        for (const parentId of field.derivedFrom.parentFields) {
          const parentField = derivedFields.find(f => f.id === parentId);
          if (parentField && parentField.derivedFrom) {
            visit(parentField);
          }
        }
      }

      temp.delete(field.id);
      visited.add(field.id);
      sorted.push(field);
    };

    // Visit all derived fields
    for (const field of derivedFields) {
      if (!visited.has(field.id)) {
        visit(field);
      }
    }

    return sorted;
  }

  /**
   * Get a list of available functions and variables for expression building
   */
  static getAvailableFunctions(): Record<string, string[]> {
    return {
      Math: ['abs', 'ceil', 'floor', 'max', 'min', 'round', 'pow', 'sqrt'],
      String: ['concat', 'toLowerCase', 'toUpperCase', 'trim', 'substring'],
      Number: ['parseFloat', 'parseInt', 'isNaN']
    };
  }

  /**
   * Validate an expression without evaluating it
   */
  static validateExpressionSyntax(expression: string): { isValid: boolean; error?: string } {
    try {
      this.validateExpression(expression);
      
      // Try to parse as a function to check syntax
      new Function('return (' + expression + ')');
      
      return { isValid: true };
    } catch (error: any) {
      return { 
        isValid: false, 
        error: error.message 
      };
    }
  }
}