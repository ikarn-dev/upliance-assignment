import type { FormSchema } from '../types';

export interface LocalStorageError {
  type: 'unavailable' | 'quota_exceeded' | 'corrupted_data' | 'unknown';
  message: string;
  originalError?: Error;
}

export class LocalStorageService {
  private static readonly STORAGE_KEY = 'dynamic-form-builder-forms';
  private static readonly STORAGE_VERSION = '1.0';
  private static readonly VERSION_KEY = 'dynamic-form-builder-version';

  /**
   * Check if localStorage is available and functional
   */
  private static isLocalStorageAvailable(): boolean {
    try {
      if (typeof localStorage === 'undefined') {
        return false;
      }
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get all forms from localStorage with error handling
   */
  private static getStorageData(): { forms: Record<string, FormSchema> } {
    if (!this.isLocalStorageAvailable()) {
      throw new Error('localStorage is not available');
    }

    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) {
        return { forms: {} };
      }

      const parsed = JSON.parse(data);
      
      // Validate the structure
      if (!parsed || typeof parsed !== 'object' || !parsed.forms) {
        throw new Error('Invalid data structure');
      }

      // Convert date strings back to Date objects
      Object.values(parsed.forms).forEach((form: any) => {
        if (form.createdAt && typeof form.createdAt === 'string') {
          form.createdAt = new Date(form.createdAt);
        }
      });

      return parsed;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Corrupted data in localStorage');
      }
      throw error;
    }
  }

  /**
   * Save data to localStorage with error handling
   */
  private static setStorageData(data: { forms: Record<string, FormSchema> }): void {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(this.STORAGE_KEY, serialized);
      localStorage.setItem(this.VERSION_KEY, this.STORAGE_VERSION);
    } catch (error: any) {
      if (error.name === 'QuotaExceededError' || error.code === 22 || error.message.includes('quota exceeded')) {
        throw new Error('Storage quota exceeded');
      }
      if (!this.isLocalStorageAvailable()) {
        throw new Error('localStorage is not available');
      }
      throw error;
    }
  }

  /**
   * Save a form schema to localStorage
   */
  static saveForm(schema: FormSchema): void {
    try {
      const data = this.getStorageData();
      data.forms[schema.id] = {
        ...schema,
        createdAt: schema.createdAt instanceof Date ? schema.createdAt : new Date(schema.createdAt)
      };
      this.setStorageData(data);
    } catch (error: any) {
      const localStorageError: LocalStorageError = {
        type: this.getErrorType(error.message),
        message: error.message,
        originalError: error
      };
      throw localStorageError;
    }
  }

  /**
   * Retrieve all forms from localStorage
   */
  static getForms(): FormSchema[] {
    try {
      const data = this.getStorageData();
      return Object.values(data.forms).sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error: any) {
      const localStorageError: LocalStorageError = {
        type: this.getErrorType(error.message),
        message: error.message,
        originalError: error
      };
      throw localStorageError;
    }
  }

  /**
   * Retrieve a specific form by ID
   */
  static getForm(id: string): FormSchema | null {
    try {
      const data = this.getStorageData();
      return data.forms[id] || null;
    } catch (error: any) {
      const localStorageError: LocalStorageError = {
        type: this.getErrorType(error.message),
        message: error.message,
        originalError: error
      };
      throw localStorageError;
    }
  }

  /**
   * Delete a form by ID
   */
  static deleteForm(id: string): void {
    try {
      const data = this.getStorageData();
      if (data.forms[id]) {
        delete data.forms[id];
        this.setStorageData(data);
      }
    } catch (error: any) {
      const localStorageError: LocalStorageError = {
        type: this.getErrorType(error.message),
        message: error.message,
        originalError: error
      };
      throw localStorageError;
    }
  }

  /**
   * Clear all forms from localStorage
   */
  static clearAllForms(): void {
    try {
      if (!this.isLocalStorageAvailable()) {
        throw new Error('localStorage is not available');
      }
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.VERSION_KEY);
    } catch (error: any) {
      const localStorageError: LocalStorageError = {
        type: this.getErrorType(error.message),
        message: error.message,
        originalError: error
      };
      throw localStorageError;
    }
  }

  /**
   * Get storage usage information
   */
  static getStorageInfo(): { used: number; available: boolean } {
    if (!this.isLocalStorageAvailable()) {
      return { used: 0, available: false };
    }

    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      const used = data ? new Blob([data]).size : 0;
      return { used, available: true };
    } catch {
      return { used: 0, available: false };
    }
  }

  /**
   * Determine error type from error message
   */
  private static getErrorType(message: string): LocalStorageError['type'] {
    if (message.includes('not available')) {
      return 'unavailable';
    }
    if (message.includes('quota exceeded')) {
      return 'quota_exceeded';
    }
    if (message.includes('Corrupted data')) {
      return 'corrupted_data';
    }
    return 'unknown';
  }
}