/**
 * Auth Store
 * 
 * Zustand store for authentication state management.
 * Handles user authentication, token management, and permissions.
 * 
 * @module stores/auth
 */

import { create } from 'zustand';
import { tokenManager } from '../../utils/tokenManager';
import { httpClient } from '../../api/client/httpClient';
import type { AuthState } from './types';

/**
 * Auth Store
 * 
 * Manages authentication state including user, token, and permissions.
 * Integrates with TokenManager for persistence and HttpClient for API calls.
 * 
 * @example
 * ```typescript
 * import { useAuthStore } from '@/stores/auth';
 * 
 * function MyComponent() {
 *   const { user, isAuthenticated, login, logout } = useAuthStore();
 *   
 *   // Use auth state and actions
 * }
 * ```
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  // ============================================================================
  // State
  // ============================================================================
  
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  tokenExpiration: null,
  permissions: [],

  // ============================================================================
  // Basic Actions (Setters)
  // ============================================================================

  setUser: (user) => {
    set({ user });
    if (user) {
      tokenManager.setUser(user);
    } else {
      tokenManager.clearUser();
    }
  },

  setToken: (token) => {
    set({ token });
    if (token) {
      httpClient.setAuthToken(token);
    } else {
      httpClient.clearAuthToken();
    }
  },

  setAuthenticated: (isAuthenticated) => {
    set({ isAuthenticated });
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  setTokenExpiration: (tokenExpiration) => {
    set({ tokenExpiration });
  },

  setPermissions: (permissions) => {
    set({ permissions });
  },

  // ============================================================================
  // Complex Actions
  // ============================================================================

  /**
   * Login action
   * 
   * Sets user, token, and authentication state.
   * Persists data to localStorage and updates HTTP client.
   * 
   * @param user - User data
   * @param token - JWT token
   * @param expiration - Token expiration date (optional)
   */
  login: (user, token, expiration) => {
    // Set token in token manager (will decode expiration if not provided)
    tokenManager.setToken(token, expiration);
    
    // Get expiration from token manager (either provided or decoded)
    const tokenExpiration = tokenManager.getTokenExpiration();
    
    // Update store state
    set({
      user,
      token,
      isAuthenticated: true,
      tokenExpiration,
      permissions: [], // TODO: Extract from user role
    });
    
    // Set token in HTTP client
    httpClient.setAuthToken(token);
    
    // Set user in token manager
    tokenManager.setUser(user);
  },

  /**
   * Logout action
   * 
   * Clears all authentication state and persisted data.
   */
  logout: () => {
    // Clear token manager
    tokenManager.clearAll();
    
    // Clear HTTP client token
    httpClient.clearAuthToken();
    
    // Reset store state
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      tokenExpiration: null,
      permissions: [],
    });
  },

  /**
   * Check token expiration
   * 
   * Validates token and automatically logs out if expired.
   * 
   * @returns true if token is valid, false if expired
   */
  checkTokenExpiration: () => {
    const isValid = tokenManager.isTokenValid();
    
    if (!isValid && get().isAuthenticated) {
      // Token expired, logout
      get().logout();
      
      // Dispatch event for UI to handle
      window.dispatchEvent(new CustomEvent('auth:token-expired'));
    }
    
    return isValid;
  },

  /**
   * Initialize authentication
   * 
   * Restores authentication state from localStorage on app startup.
   * Validates token and logs out if expired.
   */
  initializeAuth: async () => {
    set({ isLoading: true });
    
    try {
      // Get token and user from storage
      const token = tokenManager.getToken();
      const user = tokenManager.getUser();
      const tokenExpiration = tokenManager.getTokenExpiration();
      
      // Check if we have both token and user
      if (token && user) {
        // Validate token
        if (tokenManager.isTokenValid()) {
          // Token is valid, restore auth state
          set({
            user,
            token,
            isAuthenticated: true,
            tokenExpiration,
            permissions: [], // TODO: Extract from user role
          });
          
          // Set token in HTTP client
          httpClient.setAuthToken(token);
        } else {
          // Token expired, clear everything
          tokenManager.clearAll();
        }
      }
    } catch (error) {
      console.error('[AuthStore] Failed to initialize auth:', error);
      // Clear everything on error
      tokenManager.clearAll();
    } finally {
      set({ isLoading: false });
    }
  },
}));

// ============================================================================
// Setup event listeners
// ============================================================================

// Listen for unauthorized events from HTTP client
window.addEventListener('auth:unauthorized', () => {
  const store = useAuthStore.getState();
  store.logout();
});

// Listen for forbidden events from HTTP client
window.addEventListener('auth:forbidden', () => {
  // Could show a permission denied message
  console.warn('[AuthStore] Permission denied');
});
