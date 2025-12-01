/**
 * Logout Use Case
 * 
 * Orchestrates the logout flow:
 * 1. Clear auth store
 * 2. Clear token manager
 * 3. Clear HTTP client token
 * 
 * @module usecases/auth/logout
 */

import { useAuthStore } from '../../stores/auth';

/**
 * Logout use case
 * 
 * Logs out the current user by clearing all authentication state.
 * 
 * @example
 * ```typescript
 * logout();
 * // User is now logged out
 * ```
 */
export function logout(): void {
  const authStore = useAuthStore.getState();
  authStore.logout();
}
