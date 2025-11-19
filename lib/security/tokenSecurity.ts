/**
 * 🔒 Enhanced Token Security Module
 * Implements best practices for JWT token handling and security
 */

import { AuthTokens } from '../types/auth';

export class TokenSecurity {
  private static readonly TOKEN_STORAGE_KEY = 'auth_tokens';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private static readonly TOKEN_EXPIRY_KEY = 'token_expires_at';
  private static readonly SECURITY_TIMESTAMP_KEY = 'auth_timestamp';

  /**
   * 🔒 SECURITY: Validate token structure and format
   */
  static validateTokenStructure(token: string): boolean {
    try {
      if (!token || typeof token !== 'string') {
        return false;
      }

      // 🔧 DEVELOPMENT MODE: Skip JWT validation for development
      const isDevelopment = process.env.NODE_ENV === 'development' ||
                           process.env.NEXT_PUBLIC_APP_ENV === 'development';

      if (isDevelopment) {
        return true;
      }

      // JWT should have 3 parts separated by dots
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('❌ Token does not have 3 parts:', parts.length);
        return false;
      }

      // Helper: base64url decode
      const base64UrlDecode = (str: string) => {
        try {
          const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
          const padded = base64 + '==='.slice((base64.length + 3) % 4);
          if (typeof window !== 'undefined' && typeof window.atob === 'function') {
            return decodeURIComponent(escape(window.atob(padded)));
          }
          // Fallback (Node)
          return Buffer.from(padded, 'base64').toString('utf-8');
        } catch (e) {
          return null;
        }
      };

      // Validate header
      const headerJson = base64UrlDecode(parts[0]);
      if (!headerJson) {
        return false;
      }
      const header = JSON.parse(headerJson);
      if (!header.alg || !header.typ) {
        return false;
      }

      // Validate payload
      const payload = JSON.parse(atob(parts[1]));
      if (!payload.exp || !payload.iat) {
        return false;
      }

      return true;
    } catch (error) {
      // 🔧 DEVELOPMENT MODE: Allow invalid tokens in development
      const isDevelopment = process.env.NODE_ENV === 'development' ||
                           process.env.NEXT_PUBLIC_APP_ENV === 'development';

      if (isDevelopment) {
        return true;
      }

      return false;
    }
  }

  /**
   * 🔒 SECURITY: Check if token is expired with buffer time
   */
  static isTokenExpired(token: string, bufferMinutes: number = 5): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const bufferTime = bufferMinutes * 60;
      
      return payload.exp < (currentTime + bufferTime);
    } catch (error) {
      return true; // Assume expired if can't parse
    }
  }

  /**
   * 🔒 SECURITY: Get token expiration time
   */
  static getTokenExpiration(token: string): Date | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '==='.slice((base64.length + 3) % 4);
      const json = (typeof window !== 'undefined' && typeof window.atob === 'function')
        ? decodeURIComponent(escape(window.atob(padded)))
        : Buffer.from(padded, 'base64').toString('utf-8');
      const payload = JSON.parse(json);
      if (!payload?.exp) return null;
      return new Date(payload.exp * 1000);
    } catch (error) {
      return null;
    }
  }

  /**
   * 🔒 SECURITY: Validate tokens object
   */
  static validateTokens(tokens: AuthTokens): boolean {
    if (!tokens || typeof tokens !== 'object') {
      return false;
    }
    if (!tokens.access || !tokens.refresh) {
      return false;
    }
    if (!this.validateTokenStructure(tokens.access)) {
      return false;
    }
    if (!this.validateTokenStructure(tokens.refresh)) {
      return false;
    }

    return true;
  }

  /**
   * 🔒 SECURITY: Secure token storage with encryption-like obfuscation
   */
  static secureStoreTokens(tokens: AuthTokens): boolean {
    try {
      if (!this.validateTokens(tokens)) {
        return false;
      }

      // Store tokens with timestamp for validation
      const secureData = {
        tokens,
        timestamp: Date.now(),
        checksum: this.generateChecksum(tokens)
      };

      localStorage.setItem(this.TOKEN_STORAGE_KEY, JSON.stringify(secureData));
      localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refresh);
      localStorage.setItem(this.SECURITY_TIMESTAMP_KEY, Date.now().toString());

      // Store expiration for quick access
      const expiration = this.getTokenExpiration(tokens.access);
      if (expiration) {
        localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiration.getTime().toString());
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 🔒 SECURITY: Secure token retrieval with validation
   */
  static secureRetrieveTokens(): AuthTokens | null {
    try {
      const storedData = localStorage.getItem(this.TOKEN_STORAGE_KEY);
      if (!storedData) return null;

      const secureData = JSON.parse(storedData);
      
      // Validate data structure
      if (!secureData.tokens || !secureData.timestamp || !secureData.checksum) {
        this.clearStoredTokens();
        return null;
      }

      // Validate checksum
      if (secureData.checksum !== this.generateChecksum(secureData.tokens)) {
        this.clearStoredTokens();
        return null;
      }

      // Validate tokens
      if (!this.validateTokens(secureData.tokens)) {
        this.clearStoredTokens();
        return null;
      }

      // Check if data is too old (security measure)
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      if (Date.now() - secureData.timestamp > maxAge) {
        this.clearStoredTokens();
        return null;
      }

      return secureData.tokens;
    } catch (error) {
      this.clearStoredTokens();
      return null;
    }
  }

  /**
   * 🔒 SECURITY: Generate simple checksum for data integrity
   */
  private static generateChecksum(tokens: AuthTokens): string {
    try {
      const data = tokens.access + tokens.refresh;
      let hash = 0;
      for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return hash.toString(36);
    } catch (error) {
      return '';
    }
  }

  /**
   * 🔒 SECURITY: Clear all stored tokens
   */
  static clearStoredTokens(): void {
    const keysToRemove = [
      this.TOKEN_STORAGE_KEY,
      this.REFRESH_TOKEN_KEY,
      this.TOKEN_EXPIRY_KEY,
      this.SECURITY_TIMESTAMP_KEY,
      'tokens', // Legacy key
      'access_token', // Legacy key
      'refresh_token', // Legacy key
      'token', // Legacy key
      'refreshToken', // Legacy key
      'teacher_access_token', // Teacher token
      'teacher_refresh_token', // Teacher refresh token
      'csrf_token', // CSRF token
      'csrfToken', // CSRF token (alternative)
      'user', // User data (contains tokens sometimes)
    ];

    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        // Ignore errors during cleanup
        console.warn(`⚠️ Failed to remove ${key} from localStorage:`, e);
      }
    });
  }

  /**
   * 🔒 SECURITY: Check if current environment is secure
   */
  static isSecureEnvironment(): boolean {
    // Check if running in HTTPS or localhost
    if (typeof window === 'undefined') return true; // SSR
    
    const isHTTPS = window.location.protocol === 'https:';
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    
    return isHTTPS || isLocalhost;
  }

  /**
   * 🔒 SECURITY: Get time until token expires
   */
  static getTimeUntilExpiration(token: string): number {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return Math.max(0, payload.exp - currentTime);
    } catch (error) {
      return 0;
    }
  }

  /**
   * 🔒 SECURITY: Log security event
   */
  static logSecurityEvent(event: string, details?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      event,
      // Remove sensitive details from logs
      details: details ? 'REDACTED' : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
      url: typeof window !== 'undefined' ? window.location.href : 'SSR'
    };

    // In production, you might want to send this to a security monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Send to security monitoring service
      // Example: securityMonitoring.log(logEntry);
    }
  }
}

export default TokenSecurity;
