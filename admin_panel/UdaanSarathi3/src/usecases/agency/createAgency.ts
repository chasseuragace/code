/**
 * Create Agency Use Case
 * 
 * Orchestrates the agency creation flow:
 * 1. Call createAgency API
 * 2. Return agency ID and license
 * 
 * @module usecases/agency/createAgency
 */

import { agencyDataSource } from '../../api/datasources/agency';

/**
 * Create agency input
 */
export interface CreateAgencyInput {
  name: string;
  licenseNumber: string;
}

/**
 * Create agency result
 */
export interface CreateAgencyResult {
  success: boolean;
  agencyId?: string;
  licenseNumber?: string;
  error?: string;
}

/**
 * Create agency use case
 * 
 * Creates a new agency for the authenticated owner.
 * Can only be called once per owner.
 * 
 * @param input - Agency creation data
 * @returns Promise with result including agency ID
 * 
 * @example
 * ```typescript
 * const result = await createAgency({
 *   name: 'Global Recruitment Agency',
 *   licenseNumber: 'LIC-AG-12345'
 * });
 * 
 * if (result.success) {
 *   console.log('Agency created! ID:', result.agencyId);
 * }
 * ```
 */
export async function createAgency(
  input: CreateAgencyInput
): Promise<CreateAgencyResult> {
  try {
    const response = await agencyDataSource.createAgency({
      name: input.name,
      license_number: input.licenseNumber,
    });

    return {
      success: true,
      agencyId: (response as any).id,
      licenseNumber: (response as any).license_number,
    };
  } catch (error) {
    console.error('[createAgency] Failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Agency creation failed',
    };
  }
}
