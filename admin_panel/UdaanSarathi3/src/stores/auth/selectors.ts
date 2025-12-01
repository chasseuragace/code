/**
 * Auth Store Selectors
 * 
 * Memoized selectors for common auth state queries.
 * Use these for optimized component re-renders.
 * 
 * @module stores/auth/selectors
 */

import { useAuthStore } from './authStore';
import type { User } from '../../utils/tokenManager';

/**
 * Select user
 */
export const selectUser = (): User | null => {
  return useAuthStore((state) => state.user);
};

/**
 * Select authentication status
 */
export const selectIsAuthenticated = (): boolean => {
  return useAuthStore((state) => state.isAuthenticated);
};

/**
 * Select loading status
 */
export const selectIsLoading = (): boolean => {
  return useAuthStore((state) => state.isLoading);
};

/**
 * Select token
 */
export const selectToken = (): string | null => {
  return useAuthStore((state) => state.token);
};

/**
 * Select token expiration
 */
export const selectTokenExpiration = (): Date | null => {
  return useAuthStore((state) => state.tokenExpiration);
};

/**
 * Select permissions
 */
export const selectPermissions = (): string[] => {
  return useAuthStore((state) => state.permissions);
};

/**
 * Select user role
 */
export const selectUserRole = (): 'OWNER' | 'MEMBER' | 'ADMIN' | null => {
  return useAuthStore((state) => state.user?.role ?? null);
};

/**
 * Select user ID
 */
export const selectUserId = (): string | null => {
  return useAuthStore((state) => state.user?.id ?? null);
};

/**
 * Select agency ID
 */
export const selectAgencyId = (): string | null => {
  return useAuthStore((state) => state.user?.agencyId ?? null);
};

/**
 * Check if user has specific permission
 */
export const selectHasPermission = (permission: string): boolean => {
  return useAuthStore((state) => state.permissions.includes(permission));
};

/**
 * Check if user has specific role
 */
export const selectHasRole = (role: 'OWNER' | 'MEMBER' | 'ADMIN'): boolean => {
  return useAuthStore((state) => state.user?.role === role);
};
