/**
 * Auth Store Types
 * 
 * Type definitions for the authentication store.
 * 
 * @module stores/auth/types
 */

import type { User } from '../../utils/tokenManager';

/**
 * Authentication state interface
 */
export interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tokenExpiration: Date | null;
  permissions: string[];

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setTokenExpiration: (expiration: Date | null) => void;
  setPermissions: (permissions: string[]) => void;

  // Complex actions
  login: (user: User, token: string, expiration?: Date) => void;
  logout: () => void;
  checkTokenExpiration: () => boolean;
  initializeAuth: () => Promise<void>;
}
