import { type LocalStorageError } from '../services';

export interface ErrorDetails {
  message: string;
  type: 'validation' | 'storage' | 'network' | 'runtime' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userMessage: string;
  technicalMessage?: string;
  suggestions?: string[];
  recoverable: boolean;
}

export class ErrorHandler {
  /**
   * Process and categorize errors to provide better user messaging
   */
  static processError(error: unknown): ErrorDetails {
    // Handle LocalStorage errors
    if (error && typeof error === 'object' && 'type' in error) {
      const storageError = error as LocalStorageError;
      return this.handleStorageError(storageError);
    }

    // Handle validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return this.handleValidationError(error);
    }

    // Handle network errors
    if (error instanceof Error && (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('NetworkError')
    )) {
      return this.handleNetworkError(error);
    }

    // Handle generic JavaScript errors
    if (error instanceof Error) {
      return this.handleRuntimeError(error);
    }

    // Handle unknown errors
    return this.handleUnknownError(error);
  }

  private static handleStorageError(error: LocalStorageError): ErrorDetails {
    switch (error.type) {
      case 'unavailable':
        return {
          message: error.message,
          type: 'storage',
          severity: 'high',
          userMessage: 'Local storage is not available in your browser',
          technicalMessage: 'localStorage API is not accessible',
          suggestions: [
            'Check if your browser supports local storage',
            'Ensure you\'re not in private/incognito mode',
            'Check browser settings for storage permissions',
            'Try refreshing the page'
          ],
          recoverable: true
        };

      case 'quota_exceeded':
        return {
          message: error.message,
          type: 'storage',
          severity: 'medium',
          userMessage: 'Storage space is full',
          technicalMessage: 'localStorage quota exceeded',
          suggestions: [
            'Delete some saved forms to free up space',
            'Clear browser data for this site',
            'Use browser developer tools to inspect storage usage',
            'Export important forms before clearing data'
          ],
          recoverable: true
        };

      case 'corrupted_data':
        return {
          message: error.message,
          type: 'storage',
          severity: 'high',
          userMessage: 'Saved data appears to be corrupted',
          technicalMessage: 'localStorage data is malformed or corrupted',
          suggestions: [
            'Clear browser data for this site',
            'Try refreshing the page',
            'Export any working forms before clearing data',
            'Contact support if the issue persists'
          ],
          recoverable: true
        };

      default:
        return {
          message: error.message || 'Storage error occurred',
          type: 'storage',
          severity: 'medium',
          userMessage: 'A storage error occurred',
          technicalMessage: error.message,
          suggestions: [
            'Try refreshing the page',
            'Check browser console for more details'
          ],
          recoverable: true
        };
    }
  }

  private static handleValidationError(error: Error): ErrorDetails {
    return {
      message: error.message,
      type: 'validation',
      severity: 'low',
      userMessage: 'Please check your input and try again',
      technicalMessage: error.message,
      suggestions: [
        'Review the highlighted fields',
        'Ensure all required fields are filled',
        'Check that values match the expected format'
      ],
      recoverable: true
    };
  }

  private static handleNetworkError(error: Error): ErrorDetails {
    return {
      message: error.message,
      type: 'network',
      severity: 'medium',
      userMessage: 'Network connection issue',
      technicalMessage: error.message,
      suggestions: [
        'Check your internet connection',
        'Try refreshing the page',
        'Wait a moment and try again',
        'Contact support if the issue persists'
      ],
      recoverable: true
    };
  }

  private static handleRuntimeError(error: Error): ErrorDetails {
    const isRecoverable = !error.message.includes('Cannot read property') &&
                         !error.message.includes('is not a function') &&
                         !error.message.includes('undefined');

    return {
      message: error.message,
      type: 'runtime',
      severity: isRecoverable ? 'medium' : 'high',
      userMessage: isRecoverable 
        ? 'A temporary error occurred' 
        : 'An unexpected error occurred',
      technicalMessage: `${error.name}: ${error.message}`,
      suggestions: isRecoverable ? [
        'Try the action again',
        'Refresh the page if the issue persists'
      ] : [
        'Refresh the page',
        'Clear browser cache',
        'Try again in a few minutes',
        'Contact support if the issue persists'
      ],
      recoverable: isRecoverable
    };
  }

  private static handleUnknownError(error: unknown): ErrorDetails {
    const errorMessage = typeof error === 'string' 
      ? error 
      : error && typeof error === 'object' && 'toString' in error
        ? error.toString()
        : 'An unknown error occurred';

    return {
      message: errorMessage,
      type: 'unknown',
      severity: 'medium',
      userMessage: 'An unexpected error occurred',
      technicalMessage: errorMessage,
      suggestions: [
        'Try refreshing the page',
        'Clear browser cache',
        'Contact support if the issue persists'
      ],
      recoverable: true
    };
  }

  /**
   * Get user-friendly error message with suggestions
   */
  static getUserMessage(error: unknown): string {
    const details = this.processError(error);
    return details.userMessage;
  }

  /**
   * Get detailed error information for debugging
   */
  static getDetailedMessage(error: unknown): string {
    const details = this.processError(error);
    let message = details.userMessage;
    
    if (details.suggestions && details.suggestions.length > 0) {
      message += '\n\nSuggestions:\n• ' + details.suggestions.join('\n• ');
    }
    
    return message;
  }

  /**
   * Check if an error is recoverable
   */
  static isRecoverable(error: unknown): boolean {
    const details = this.processError(error);
    return details.recoverable;
  }

  /**
   * Get error severity level
   */
  static getSeverity(error: unknown): 'low' | 'medium' | 'high' | 'critical' {
    const details = this.processError(error);
    return details.severity;
  }
}

export default ErrorHandler;