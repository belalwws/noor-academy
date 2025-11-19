/**
 * Logger Utility - Dev-only logging
 * Logs only in development mode to avoid console noise in production
 */

const isDevelopment = process.env.NODE_ENV === 'development';

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private shouldLog(level: LogLevel): boolean {
    if (!isDevelopment) return false;
    
    // In development, log everything except debug (unless explicitly enabled)
    if (level === 'debug') {
      return process.env.NEXT_PUBLIC_DEBUG === 'true';
    }
    
    return true;
  }

  log(...args: any[]): void {
    if (this.shouldLog('log')) {
      console.log('[API]', ...args);
    }
  }

  info(...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info('[API]', ...args);
    }
  }

  warn(...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn('[API]', ...args);
    }
  }

  error(...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error('[API]', ...args);
    }
  }

  debug(...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug('[API]', ...args);
    }
  }

  /**
   * Log API request
   */
  request(method: string, url: string, data?: any): void {
    if (this.shouldLog('debug')) {
      this.debug(`→ ${method} ${url}`, data ? { data } : '');
    }
  }

  /**
   * Log API response
   */
  response(method: string, url: string, status: number, data?: any): void {
    if (this.shouldLog('debug')) {
      this.debug(`← ${method} ${url} [${status}]`, data ? { data } : '');
    }
  }

  /**
   * Log API error
   */
  apiError(method: string, url: string, error: any): void {
    this.error(`✗ ${method} ${url}`, error);
  }
}

export const logger = new Logger();
export default logger;

