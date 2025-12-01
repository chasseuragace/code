/**
 * Manage Agency Media Use Cases
 * 
 * Orchestrates logo and banner upload/removal operations.
 * 
 * @module usecases/agency/manageAgencyMedia
 */

import { agencyDataSource } from '../../api/datasources/agency';

/**
 * Media upload result
 */
export interface MediaUploadResult {
  success: boolean;
  url?: string;
  message?: string;
  error?: string;
}

/**
 * Media removal result
 */
export interface MediaRemovalResult {
  success: boolean;
  message?: string;
  error?: string;
}

// ============================================================================
// Logo Management
// ============================================================================

/**
 * Upload logo use case
 * 
 * Uploads agency logo image. Automatically updates logo_url in profile.
 * 
 * @param license - Agency license number
 * @param file - Image file
 * @returns Promise with upload result and URL
 * 
 * @example
 * ```typescript
 * const result = await uploadLogo('LIC-AG-12345', logoFile);
 * 
 * if (result.success) {
 *   console.log('Logo uploaded! URL:', result.url);
 * }
 * ```
 */
export async function uploadLogo(
  license: string,
  file: File
): Promise<MediaUploadResult> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'File must be an image',
      };
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size must be less than 5MB',
      };
    }

    const response = await agencyDataSource.uploadLogo(license, file);

    return {
      success: response.success,
      url: response.url,
      message: response.message,
    };
  } catch (error) {
    console.error('[uploadLogo] Failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Logo upload failed',
    };
  }
}

/**
 * Remove logo use case
 * 
 * Removes agency logo and sets logo_url to null.
 * 
 * @param license - Agency license number
 * @returns Promise with removal result
 * 
 * @example
 * ```typescript
 * const result = await removeLogo('LIC-AG-12345');
 * 
 * if (result.success) {
 *   console.log('Logo removed!');
 * }
 * ```
 */
export async function removeLogo(license: string): Promise<MediaRemovalResult> {
  try {
    const response = await agencyDataSource.removeLogo(license);

    return {
      success: response.success,
      message: response.message,
    };
  } catch (error) {
    console.error('[removeLogo] Failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Logo removal failed',
    };
  }
}

// ============================================================================
// Banner Management
// ============================================================================

/**
 * Upload banner use case
 * 
 * Uploads agency banner image. Automatically updates banner_url in profile.
 * 
 * @param license - Agency license number
 * @param file - Image file
 * @returns Promise with upload result and URL
 * 
 * @example
 * ```typescript
 * const result = await uploadBanner('LIC-AG-12345', bannerFile);
 * 
 * if (result.success) {
 *   console.log('Banner uploaded! URL:', result.url);
 * }
 * ```
 */
export async function uploadBanner(
  license: string,
  file: File
): Promise<MediaUploadResult> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'File must be an image',
      };
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size must be less than 5MB',
      };
    }

    const response = await agencyDataSource.uploadBanner(license, file);

    return {
      success: response.success,
      url: response.url,
      message: response.message,
    };
  } catch (error) {
    console.error('[uploadBanner] Failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Banner upload failed',
    };
  }
}

/**
 * Remove banner use case
 * 
 * Removes agency banner and sets banner_url to null.
 * 
 * @param license - Agency license number
 * @returns Promise with removal result
 * 
 * @example
 * ```typescript
 * const result = await removeBanner('LIC-AG-12345');
 * 
 * if (result.success) {
 *   console.log('Banner removed!');
 * }
 * ```
 */
export async function removeBanner(license: string): Promise<MediaRemovalResult> {
  try {
    const response = await agencyDataSource.removeBanner(license);

    return {
      success: response.success,
      message: response.message,
    };
  } catch (error) {
    console.error('[removeBanner] Failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Banner removal failed',
    };
  }
}
