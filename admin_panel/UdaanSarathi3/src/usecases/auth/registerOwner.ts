/**
 * Register Owner Use Case
 * 
 * Orchestrates the owner registration flow:
 * 1. Call registerOwner API to send OTP
 * 2. Return dev OTP for testing
 * 
 * @module usecases/auth/registerOwner
 */

import { authDataSource } from '../../api/datasources/auth';

/**
 * Register owner input
 */
export interface RegisterOwnerInput {
  fullName: string;
  phone: string;
}

/**
 * Register owner result
 */
export interface RegisterOwnerResult {
  success: boolean;
  devOtp?: string;
  error?: string;
}

/**
 * Register owner use case
 * 
 * Initiates owner registration by sending OTP to phone number.
 * 
 * @param input - Registration data
 * @returns Promise with result including dev OTP
 * 
 * @example
 * ```typescript
 * const result = await registerOwner({
 *   fullName: 'John Doe',
 *   phone: '+971501234567'
 * });
 * 
 * if (result.success) {
 *   console.log('OTP sent! Dev OTP:', result.devOtp);
 * }
 * ```
 */
export async function registerOwner(
  input: RegisterOwnerInput
): Promise<RegisterOwnerResult> {
  try {
    const response = await authDataSource.registerOwner({
      full_name: input.fullName,
      phone: input.phone,
    });

    return {
      success: true,
      devOtp: response.dev_otp,
    };
  } catch (error) {
    console.error('[registerOwner] Failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed',
    };
  }
}
