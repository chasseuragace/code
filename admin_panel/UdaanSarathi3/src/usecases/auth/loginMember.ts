/**
 * Login Member Use Case
 * 
 * Orchestrates the member login flow:
 * 1. Call memberLoginStart API to send OTP
 * 2. Call memberLoginVerify API with OTP
 * 3. Update auth store with user and token
 * 
 * @module usecases/auth/loginMember
 */

import { authDataSource } from '../../api/datasources/auth';
import { useAuthStore } from '../../stores/auth';
import type { User } from '../../utils/tokenManager';

/**
 * Login member input
 */
export interface LoginMemberInput {
  phone: string;
  otp: string;
}

/**
 * Login member result
 */
export interface LoginMemberResult {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

/**
 * Start member login
 * 
 * Initiates member login by sending OTP to phone number.
 * 
 * @param phone - Phone number
 * @returns Promise with dev OTP
 */
export async function startMemberLogin(phone: string): Promise<{
  success: boolean;
  devOtp?: string;
  error?: string;
}> {
  try {
    const response = await authDataSource.memberLoginStart({ phone });

    return {
      success: true,
      devOtp: response.dev_otp,
    };
  } catch (error) {
    console.error('[startMemberLogin] Failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login start failed',
    };
  }
}

/**
 * Login member use case
 * 
 * Completes member login by verifying OTP.
 * 
 * @param input - Login data
 * @returns Promise with result including user and token
 * 
 * @example
 * ```typescript
 * // Start login
 * const startResult = await startMemberLogin('+971501234567');
 * 
 * // Verify OTP
 * const result = await loginMember({
 *   phone: '+971501234567',
 *   otp: '123456'
 * });
 * 
 * if (result.success) {
 *   console.log('Logged in! User:', result.user);
 * }
 * ```
 */
export async function loginMember(
  input: LoginMemberInput
): Promise<LoginMemberResult> {
  try {
    const response = await authDataSource.memberLoginVerify({
      phone: input.phone,
      otp: input.otp,
    });

    // Map response to User type
    const user: User = {
      id: response.user_id || '',
      phone: response.phone || '',
      fullName: response.full_name || '',
      role: 'MEMBER',
      agencyId: response.agency_id,
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
    console.error('[loginMember] Failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed',
    };
  }
}
