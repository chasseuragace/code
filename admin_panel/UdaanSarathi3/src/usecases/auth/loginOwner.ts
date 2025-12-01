/**
 * Login Owner Use Case
 * 
 * Orchestrates the owner login flow:
 * 1. Call loginStartOwner API to send OTP
 * 2. Call loginVerifyOwner API with OTP
 * 3. Update auth store with user and token
 * 
 * @module usecases/auth/loginOwner
 */

import { authDataSource } from '../../api/datasources/auth';
import { useAuthStore } from '../../stores/auth';
import type { User } from '../../utils/tokenManager';

/**
 * Login owner input
 */
export interface LoginOwnerInput {
  phone: string;
  otp: string;
}

/**
 * Login owner result
 */
export interface LoginOwnerResult {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

/**
 * Start owner login
 * 
 * Initiates owner login by sending OTP to phone number.
 * 
 * @param phone - Phone number
 * @returns Promise with dev OTP
 */
export async function startOwnerLogin(phone: string): Promise<{
  success: boolean;
  devOtp?: string;
  error?: string;
}> {
  try {
    const response = await authDataSource.loginStartOwner({ phone });

    return {
      success: true,
      devOtp: response.dev_otp,
    };
  } catch (error) {
    console.error('[startOwnerLogin] Failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login start failed',
    };
  }
}

/**
 * Login owner use case
 * 
 * Completes owner login by verifying OTP.
 * 
 * @param input - Login data
 * @returns Promise with result including user and token
 * 
 * @example
 * ```typescript
 * // Start login
 * const startResult = await startOwnerLogin('+971501234567');
 * 
 * // Verify OTP
 * const result = await loginOwner({
 *   phone: '+971501234567',
 *   otp: '123456'
 * });
 * 
 * if (result.success) {
 *   console.log('Logged in! User:', result.user);
 * }
 * ```
 */
export async function loginOwner(
  input: LoginOwnerInput
): Promise<LoginOwnerResult> {
  try {
    const response = await authDataSource.loginVerifyOwner({
      phone: input.phone,
      otp: input.otp,
    });

    // Map response to User type
    const user: User = {
      id: response.user_id || '',
      phone: '',  // Not returned in login response
      fullName: '', // Not returned in login response
      role: 'OWNER',
      agencyId: undefined, // Not returned in login response
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
    console.error('[loginOwner] Failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed',
    };
  }
}
