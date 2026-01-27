/**
 * Production-ready logging utility
 * Environment-aware logging with structured output
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'performance';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment: boolean;
  private isProduction: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  private shouldLog(level: LogLevel): boolean {
    // In development, log everything
    if (this.isDevelopment) return true;

    // In production, only log warn, error, and performance
    if (this.isProduction) {
      return ['warn', 'error', 'performance'].includes(level);
    }

    return true;
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog('debug')) return;
    const formatted = this.formatMessage('debug', message, context);
    console.debug(formatted);
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog('info')) return;
    const formatted = this.formatMessage('info', message, context);
    console.info(formatted);
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog('warn')) return;
    const formatted = this.formatMessage('warn', message, context);
    console.warn(formatted);
  }

  error(message: string, error?: unknown, context?: LogContext): void {
    if (!this.shouldLog('error')) return;
    const formatted = this.formatMessage('error', message, context);
    
    if (error instanceof Error) {
      console.error(formatted, {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    } else {
      console.error(formatted, error);
    }

    // In production, send to error tracking service
    if (this.isProduction && typeof window !== 'undefined') {
      // Ready for Sentry integration
      // Sentry.captureException(error, { extra: context });
    }
  }

  performance(metric: string, value: number, context?: LogContext): void {
    if (!this.shouldLog('performance')) return;
    const formatted = this.formatMessage('performance', `${metric}: ${value}ms`, context);
    console.log(formatted);

    // In production, send to analytics
    if (this.isProduction && typeof window !== 'undefined' && 'performance' in window) {
      // Ready for analytics integration
      // analytics.track('performance', { metric, value, ...context });
    }
  }

  // API-specific logging
  apiRequest(method: string, url: string, context?: LogContext): void {
    this.debug(`API Request: ${method} ${url}`, context);
  }

  apiResponse(method: string, url: string, status: number, duration: number, context?: LogContext): void {
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
    this[level](`API Response: ${method} ${url} - ${status} (${duration}ms)`, context);
  }

  // Database-specific logging
  dbQuery(query: string, duration: number, context?: LogContext): void {
    if (duration > 1000) {
      this.warn(`Slow DB Query: ${query} (${duration}ms)`, context);
    } else {
      this.debug(`DB Query: ${query} (${duration}ms)`, context);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export class for testing
export { Logger };
