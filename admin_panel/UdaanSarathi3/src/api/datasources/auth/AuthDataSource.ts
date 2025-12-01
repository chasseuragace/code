/**
 * Auth DataSource
 * 
 * Handles all authentication-related API calls:
 * - Owner registration and verification
 * - Owner login (OTP flow)
 * - Member login (OTP and password flows)
 * 
 * @module api/datasources/auth
 */

import { BaseDataSource } from '../base/BaseDataSource';
import { httpClient } from '../../client/httpClient';
import type { RequestBody, Response } from '../../types/helpers';

/**
 * Auth DataSource class
 * 
 * Provides typed methods for all authentication operations.
 * All methods use generated types from the OpenAPI specification.
 */
export class AuthDataSource extends BaseDataSource {
  constructor() {
    super(httpClient);
  }

  // ============================================================================
  // Owner Registration
  // ============================================================================

  /**
   * Register a new agency owner
   * 
   * Initiates the owner registration process by sending an OTP to the phone number.
   * 
   * @param data - Registration data (phone, full_name)
   * @returns Promise with registration response including dev OTP
   */
  async registerOwner(
    data: RequestBody<'/agency/register-owner', 'post'>
  ): Promise<Response<'/agency/register-owner', 'post'>> {
    return this.post('/agency/register-owner', data);
  }

  /**
   * Verify owner registration with OTP
   * 
   * Completes the owner registration by verifying the OTP sent to the phone.
   * 
   * @param data - Verification data (phone, otp)
   * @returns Promise with auth token and user data
   */
  async verifyOwner(
    data: RequestBody<'/agency/verify-owner', 'post'>
  ): Promise<Response<'/agency/verify-owner', 'post'>> {
    return this.post('/agency/verify-owner', data);
  }

  // ============================================================================
  // Owner Login
  // ============================================================================

  /**
   * Start owner login process
   * 
   * Initiates the owner login by sending an OTP to the registered phone number.
   * 
   * @param data - Login start data (phone)
   * @returns Promise with login start response including dev OTP
   */
  async loginStartOwner(
    data: RequestBody<'/agency/login/start-owner', 'post'>
  ): Promise<Response<'/agency/login/start-owner', 'post'>> {
    return this.post('/agency/login/start-owner', data);
  }

  /**
   * Verify owner login with OTP
   * 
   * Completes the owner login by verifying the OTP.
   * 
   * @param data - Login verification data (phone, otp)
   * @returns Promise with auth token and user data
   */
  async loginVerifyOwner(
    data: RequestBody<'/agency/login/verify-owner', 'post'>
  ): Promise<Response<'/agency/login/verify-owner', 'post'>> {
    return this.post('/agency/login/verify-owner', data);
  }

  // ============================================================================
  // Member Login
  // ============================================================================

  /**
   * Start member login process
   * 
   * Initiates the member login by sending an OTP to the registered phone number.
   * 
   * @param data - Login start data (phone)
   * @returns Promise with login start response including dev OTP
   */
  async memberLoginStart(
    data: RequestBody<'/member/login/start', 'post'>
  ): Promise<Response<'/member/login/start', 'post'>> {
    return this.post('/member/login/start', data);
  }

  /**
   * Verify member login with OTP
   * 
   * Completes the member login by verifying the OTP.
   * 
   * @param data - Login verification data (phone, otp)
   * @returns Promise with auth token and user data
   */
  async memberLoginVerify(
    data: RequestBody<'/member/login/verify', 'post'>
  ): Promise<Response<'/member/login/verify', 'post'>> {
    return this.post('/member/login/verify', data);
  }
}

/**
 * Singleton instance of AuthDataSource
 * 
 * Use this instance throughout the application for all auth operations.
 * 
 * @example
 * ```typescript
 * import { authDataSource } from '@/api/datasources/auth';
 * 
 * // Register owner
 * const response = await authDataSource.registerOwner({
 *   phone: '+971501234567',
 *   full_name: 'John Doe'
 * });
 * ```
 */
export const authDataSource = new AuthDataSource();
