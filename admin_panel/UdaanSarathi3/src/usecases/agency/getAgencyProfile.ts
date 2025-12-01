/**
 * Get Agency Profile Use Case
 * 
 * Orchestrates fetching agency profile data.
 * 
 * @module usecases/agency/getAgencyProfile
 */

import { agencyDataSource } from '../../api/datasources/agency';
import type { Response } from '../../api/types/helpers';

/**
 * Agency profile type
 */
export type AgencyProfile = Response<'/agencies/owner/agency', 'get'>;

/**
 * Get agency profile result
 */
export interface GetAgencyProfileResult {
  success: boolean;
  agency?: AgencyProfile;
  error?: string;
}

/**
 * Get my agency profile use case
 * 
 * Retrieves the complete profile for the authenticated owner's agency.
 * 
 * @returns Promise with agency profile
 * 
 * @example
 * ```typescript
 * const result = await getMyAgencyProfile();
 * 
 * if (result.success && result.agency) {
 *   console.log('Agency:', result.agency.name);
 *   console.log('Phones:', result.agency.phones);
 *   console.log('Emails:', result.agency.emails);
 * }
 * ```
 */
export async function getMyAgencyProfile(): Promise<GetAgencyProfileResult> {
  try {
    const agency = await agencyDataSource.getMyAgency();

    return {
      success: true,
      agency,
    };
  } catch (error) {
    console.error('[getMyAgencyProfile] Failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch agency profile',
    };
  }
}

/**
 * Get agency by ID use case
 * 
 * Retrieves agency profile by ID (public endpoint).
 * 
 * @param id - Agency ID
 * @returns Promise with agency profile
 */
export async function getAgencyById(id: string): Promise<GetAgencyProfileResult> {
  try {
    const agency = await agencyDataSource.getAgencyById(id);

    return {
      success: true,
      agency,
    };
  } catch (error) {
    console.error('[getAgencyById] Failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch agency',
    };
  }
}

/**
 * Get agency by license use case
 * 
 * Retrieves agency profile by license number (public endpoint).
 * 
 * @param license - License number
 * @returns Promise with agency profile
 */
export async function getAgencyByLicense(
  license: string
): Promise<GetAgencyProfileResult> {
  try {
    const agency = await agencyDataSource.getAgencyByLicense(license);

    return {
      success: true,
      agency,
    };
  } catch (error) {
    console.error('[getAgencyByLicense] Failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch agency',
    };
  }
}
