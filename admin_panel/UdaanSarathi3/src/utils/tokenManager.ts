/**
 * Token Manager
 * 
 * Manages JWT token storage, validation, and expiration checking.
 * Handles token and user data persistence in localStorage.
 * 
 * @module utils/tokenManager
 */

/**
 * User data structure
 */
export interface User {
  id: string;
  phone: string;
  fullName: string;
  role: 'OWNER' | 'MEMBER' | 'ADMIN';
  agencyId?: string;
}

/**
 * Token data structure
 */
export interface TokenData {
  token: string;
  expiresAt: Date;
}

/**
 * Storage keys
 */
const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
  TOKEN_EXPIRATION: 'auth_token_expiration',
} as const;

/**
 * Token expiration warning threshold (in milliseconds)
 * Default: 5 minutes before expiration
 */
const EXPIRATION_WARNING_THRESHOLD = 5 * 60 * 1000;

/**
 * Token Manager class
 * 
 * Provides methods for managing authentication tokens and user data.
 */
export class TokenManager {
  /**
   * Set authentication token
   * 
   * @param token - JWT token string
   * @param expiresAt - Token expiration date (optional, will be decoded from JWT if not provided)
   */
  setToken(token: string, expiresAt?: Date): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      
      // If expiration not provided, decode from JWT
      const expiration = expiresAt || this.decodeTokenExpiration(token);
      if (expiration) {
        localStorage.setItem(
          STORAGE_KEYS.TOKEN_EXPIRATION,
          expiration.toISOString()
        );
      }
    } catch (error) {
      console.error('[TokenManager] Failed to set token:', error);
    }
  }

  /**
   * Get authentication token
   * 
   * @returns Token string or null if not found
   */
  getToken(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.TOKEN);
    } catch (error) {
      console.error('[TokenManager] Failed to get token:', error);
      return null;
    }
  }

  /**
   * Clear authentication token
   */
  clearToken(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRATION);
    } catch (error) {
      console.error('[TokenManager] Failed to clear token:', error);
    }
  }

  /**
   * Get token expiration date
   * 
   * @returns Expiration date or null if not found
   */
  getTokenExpiration(): Date | null {
    try {
      const expirationStr = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRATION);
      if (!expirationStr) return null;
      
      return new Date(expirationStr);
    } catch (error) {
      console.error('[TokenManager] Failed to get token expiration:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   * 
   * @returns true if token is expired, false otherwise
   */
  isTokenExpired(): boolean {
    const expiration = this.getTokenExpiration();
    if (!expiration) return true;
    
    return new Date() >= expiration;
  }

  /**
   * Check if token is valid (exists and not expired)
   * 
   * @returns true if token is valid, false otherwise
   */
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    return !this.isTokenExpired();
  }

  /**
   * Get time until token expiration (in milliseconds)
   * 
   * @returns Time in milliseconds, or 0 if expired/not found
   */
  getTimeUntilExpiration(): number {
    const expiration = this.getTokenExpiration();
    if (!expiration) return 0;
    
    const timeRemaining = expiration.getTime() - new Date().getTime();
    return Math.max(0, timeRemaining);
  }

  /**
   * Check if expiration warning should be shown
   * 
   * @param thresholdMs - Warning threshold in milliseconds (default: 5 minutes)
   * @returns true if warning should be shown, false otherwise
   */
  shouldShowExpirationWarning(
    thresholdMs: number = EXPIRATION_WARNING_THRESHOLD
  ): boolean {
    if (this.isTokenExpired()) return false;
    
    const timeRemaining = this.getTimeUntilExpiration();
    return timeRemaining > 0 && timeRemaining <= thresholdMs;
  }

  /**
   * Decode token expiration from JWT
   * 
   * @param token - JWT token string
   * @returns Expiration date or null if cannot decode
   */
  private decodeTokenExpiration(token: string): Date | null {
    try {
      // JWT format: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      // Decode payload (base64url)
      const payload = JSON.parse(atob(parts[1]));
      
      // JWT exp claim is in seconds, convert to milliseconds
      if (payload.exp) {
        return new Date(payload.exp * 1000);
      }
      
      return null;
    } catch (error) {
      console.error('[TokenManager] Failed to decode token expiration:', error);
      return null;
    }
  }

  // ============================================================================
  // User Data Management
  // ============================================================================

  /**
   * Set user data
   * 
   * @param user - User data object
   */
  setUser(user: User): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('[TokenManager] Failed to set user:', error);
    }
  }

  /**
   * Get user data
   * 
   * @returns User object or null if not found
   */
  getUser(): User | null {
    try {
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);
      if (!userStr) return null;
      
      return JSON.parse(userStr) as User;
    } catch (error) {
      console.error('[TokenManager] Failed to get user:', error);
      return null;
    }
  }

  /**
   * Clear user data
   */
  clearUser(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch (error) {
      console.error('[TokenManager] Failed to clear user:', error);
    }
  }

  /**
   * Clear all auth data (token and user)
   */
  clearAll(): void {
    this.clearToken();
    this.clearUser();
  }
}

/**
 * Singleton instance of TokenManager
 * 
 * Use this instance throughout the application for token management.
 * 
 * @example
 * ```typescript
 * import { tokenManager } from '@/utils/tokenManager';
 * 
 * // Set token
 * tokenManager.setToken(token);
 * 
 * // Check if valid
 * if (tokenManager.isTokenValid()) {
 *   // Token is valid
 * }
 * 
 * // Check expiration warning
 * if (tokenManager.shouldShowExpirationWarning()) {
 *   // Show warning to user
 * }
 * ```
 */
export const tokenManager = new TokenManager();
