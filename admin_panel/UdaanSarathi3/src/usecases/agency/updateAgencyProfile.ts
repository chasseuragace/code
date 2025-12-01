/**
 * Update Agency Profile Use Cases
 * 
 * Orchestrates all agency profile update operations.
 * 
 * @module usecases/agency/updateAgencyProfile
 */

import { agencyDataSource } from '../../api/datasources/agency';
import type { RequestBody, Response } from '../../api/types/helpers';

/**
 * Update result type
 */
export interface UpdateResult {
  success: boolean;
  agency?: Response<'/agencies/owner/agency/basic', 'patch'>;
  error?: string;
}

// ============================================================================
// Basic Information
// ============================================================================

/**
 * Update basic information use case
 * 
 * Updates name, description, established_year, license_number.
 * 
 * @param data - Basic information updates
 * @returns Promise with updated profile
 * 
 * @example
 * ```typescript
 * const result = await updateBasicInfo({
 *   name: 'Updated Agency Name',
 *   description: 'Leading recruitment agency...',
 *   established_year: 2015
 * });
 * ```
 */
export async function updateBasicInfo(
  data: RequestBody<'/agencies/owner/agency/basic', 'patch'>
): Promise<UpdateResult> {
  try {
    const agency = await agencyDataSource.updateBasicInfo(data);

    return {
      success: true,
      agency,
    };
  } catch (error) {
    console.error('[updateBasicInfo] Failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Update failed',
    };
  }
}

// ============================================================================
// Contact Information
// ============================================================================

/**
 * Update contact information use case
 * 
 * Updates phones (array), emails (array), website, contact_persons.
 * Arrays replace existing data completely.
 * 
 * @param data - Contact information updates
 * @returns Promise with updated profile
 * 
 * @example
 * ```typescript
 * const result = await updateContactInfo({
 *   phones: ['+977-1-4123456', '+977-9841234567'],
 *   emails: ['contact@agency.com', 'info@agency.com'],
 *   website: 'https://agency.com'
 * });
 * ```
 */
export async function updateContactInfo(
  data: RequestBody<'/agencies/owner/agency/contact', 'patch'>
): Promise<UpdateResult> {
  try {
    const agency = await agencyDataSource.updateContactInfo(data);

    return {
      success: true,
      agency,
    };
  } catch (error) {
    console.error('[updateContactInfo] Failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Update failed',
    };
  }
}

// ============================================================================
// Location
// ============================================================================

/**
 * Update location use case
 * 
 * Updates address, latitude, longitude.
 * 
 * @param data - Location updates
 * @returns Promise with updated profile
 * 
 * @example
 * ```typescript
 * const result = await updateLocation({
 *   address: '123 Main Street, Kathmandu, Nepal',
 *   latitude: 27.7172,
 *   longitude: 85.3240
 * });
 * ```
 */
export async function updateLocation(
  data: RequestBody<'/agencies/owner/agency/location', 'patch'>
): Promise<UpdateResult> {
  try {
    const agency = await agencyDataSource.updateLocation(data);

    return {
      success: true,
      agency,
    };
  } catch (error) {
    console.error('[updateLocation] Failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Update failed',
    };
  }
}

// ============================================================================
// Social Media
// ============================================================================

/**
 * Update social media use case
 * 
 * Updates facebook, instagram, linkedin, twitter URLs.
 * All URLs must include protocol (https://).
 * 
 * @param data - Social media updates
 * @returns Promise with updated profile
 * 
 * @example
 * ```typescript
 * const result = await updateSocialMedia({
 *   facebook: 'https://facebook.com/agency',
 *   instagram: 'https://instagram.com/agency'
 * });
 * ```
 */
export async function updateSocialMedia(
  data: RequestBody<'/agencies/owner/agency/social-media', 'patch'>
): Promise<UpdateResult> {
  try {
    const agency = await agencyDataSource.updateSocialMedia(data);

    return {
      success: true,
      agency,
    };
  } catch (error) {
    console.error('[updateSocialMedia] Failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Update failed',
    };
  }
}

// ============================================================================
// Services
// ============================================================================

/**
 * Update services use case
 * 
 * Updates services, specializations, target_countries arrays.
 * 
 * @param data - Services updates
 * @returns Promise with updated profile
 * 
 * @example
 * ```typescript
 * const result = await updateServices({
 *   services: ['Recruitment', 'Visa Processing'],
 *   specializations: ['Healthcare', 'IT'],
 *   target_countries: ['UAE', 'Saudi Arabia']
 * });
 * ```
 */
export async function updateServices(
  data: RequestBody<'/agencies/owner/agency/services', 'patch'>
): Promise<UpdateResult> {
  try {
    const agency = await agencyDataSource.updateServices(data);

    return {
      success: true,
      agency,
    };
  } catch (error) {
    console.error('[updateServices] Failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Update failed',
    };
  }
}

// ============================================================================
// Settings
// ============================================================================

/**
 * Update settings use case
 * 
 * Updates currency, timezone, language, date_format, notifications, features.
 * 
 * @param data - Settings updates
 * @returns Promise with updated profile
 * 
 * @example
 * ```typescript
 * const result = await updateSettings({
 *   currency: 'USD',
 *   timezone: 'Asia/Kathmandu',
 *   features: {
 *     darkMode: true,
 *     autoSave: true
 *   }
 * });
 * ```
 */
export async function updateSettings(
  data: RequestBody<'/agencies/owner/agency/settings', 'patch'>
): Promise<UpdateResult> {
  try {
    const agency = await agencyDataSource.updateSettings(data);

    return {
      success: true,
      agency,
    };
  } catch (error) {
    console.error('[updateSettings] Failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Update failed',
    };
  }
}
