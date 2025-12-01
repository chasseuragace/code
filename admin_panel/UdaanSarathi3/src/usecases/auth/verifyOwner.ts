/**
 * Verify Owner Use Case
 * 
 * Orchestrates the owner verification flow:
 * 1. Call verifyOwner API with OTP
 * 2. Update auth store with user and token
 * 
 * @module usecases/auth/verifyOwner
 */

import { authDataSource } from '../../api/datasources/auth';
import { useAuthStore } from '../../stores/auth';
import type { User } from '../../utils/tokenManager';

/**
 * Verify owner input
 */
export interface VerifyOwnerInput {
  phone: string;
  otp: string;
}

/**
 * Verify owner result
 */
export interface VerifyOwnerResult {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

/**
 * Verify owner use case
 * 
 * Completes owner registration by verifying OTP and logging in.
 * 
 * @param input - Verification data
 * @returns Promise with result including user and token
 * 
 * @example
 * ```typescript
 * const result = await verifyOwner({
 *   phone: '+971501234567',
 *   otp: '123456'
 * });
 * 
 * if (result.success) {
 *   console.log('Verified! User:', result.user);
 * }
 * ```
 */
export async function verifyOwner(
  input: VerifyOwnerInput
): Promise<VerifyOwnerResult> {
  try {
    const response = await authDataSource.verifyOwner({
      phone: input.phone,
      otp: input.otp,
    });

    // Map response to User type
    const user: User = {
      id: response.user_id || '',
      phone: '', // Not returned in verify response
      fullName: '', // Not returned in verify response
      role: 'OWNER',
      agencyId: undefined, // Not returned in verify response
    };

    // Update auth store
    const authStore = useAuthStore.getState();
    authStore.login(user, response.token || '');

    return {
      success: true,
      user,
      token: response.token,
    };
  } catch (error) {
    console.error('[verifyOwner] Failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}
