/**
 * Agency DataSource
 * 
 * Handles all agency profile management API calls:
 * - Create agency
 * - Get agency profile
 * - Update basic information
 * - Update contact information
 * - Update location
 * - Update social media
 * - Update services
 * - Update settings
 * - Upload/remove logo and banner
 * - Search agencies (public)
 * 
 * @module api/datasources/agency
 */

import { BaseDataSource } from '../base/BaseDataSource';
import { httpClient } from '../../client/httpClient';
import type { RequestBody, Response } from '../../types/helpers';

/**
 * Agency DataSource class
 * 
 * Provides typed methods for all agency management operations.
 * All methods use generated types from the OpenAPI specification.
 */
export class AgencyDataSource extends BaseDataSource {
  constructor() {
    super(httpClient);
  }

  // ============================================================================
  // Agency Creation
  // ============================================================================

  /**
   * Create a new agency
   * 
   * Creates an agency for the authenticated owner.
   * Can only be called once per owner.
   * 
   * @param data - Agency creation data (name, license_number)
   * @returns Promise with agency ID and license number
   */
  async createAgency(
    data: RequestBody<'/agencies/owner/agency', 'post'>
  ): Promise<Response<'/agencies/owner/agency', 'post'>> {
    return httpClient.post('/agencies/owner/agency', data);
  }

  // ============================================================================
  // Agency Profile
  // ============================================================================

  /**
   * Get my agency profile
   * 
   * Retrieves the complete profile for the authenticated owner's agency.
   * 
   * @returns Promise with full agency profile
   */
  async getMyAgency(): Promise<Response<'/agencies/owner/agency', 'get'>> {
    return httpClient.get('/agencies/owner/agency');
  }

  /**
   * Get agency by ID (public)
   * 
   * Retrieves agency profile by ID. No authentication required.
   * 
   * @param id - Agency ID
   * @returns Promise with agency profile
   */
  async getAgencyById(id: string): Promise<Response<'/agencies/{id}', 'get'>> {
    return httpClient.get(`/agencies/${id}`);
  }

  /**
   * Get agency by license number (public)
   * 
   * Retrieves agency profile by license number. No authentication required.
   * 
   * @param license - License number
   * @returns Promise with agency profile
   */
  async getAgencyByLicense(
    license: string
  ): Promise<Response<'/agencies/license/{license}', 'get'>> {
    return httpClient.get(`/agencies/license/${license}`);
  }

  // ============================================================================
  // Profile Updates
  // ============================================================================

  /**
   * Update basic information
   * 
   * Updates name, description, established_year, license_number, etc.
   * 
   * @param data - Basic information updates
   * @returns Promise with updated agency profile
   */
  async updateBasicInfo(
    data: RequestBody<'/agencies/owner/agency/basic', 'patch'>
  ): Promise<Response<'/agencies/owner/agency/basic', 'patch'>> {
    return httpClient.patch('/agencies/owner/agency/basic', data);
  }

  /**
   * Update contact information
   * 
   * Updates phones (array), emails (array), website, contact_persons.
   * Arrays replace existing data completely.
   * 
   * @param data - Contact information updates
   * @returns Promise with updated agency profile
   */
  async updateContactInfo(
    data: RequestBody<'/agencies/owner/agency/contact', 'patch'>
  ): Promise<Response<'/agencies/owner/agency/contact', 'patch'>> {
    return httpClient.patch('/agencies/owner/agency/contact', data);
  }

  /**
   * Update location
   * 
   * Updates address, latitude, longitude.
   * 
   * @param data - Location updates
   * @returns Promise with updated agency profile
   */
  async updateLocation(
    data: RequestBody<'/agencies/owner/agency/location', 'patch'>
  ): Promise<Response<'/agencies/owner/agency/location', 'patch'>> {
    return httpClient.patch('/agencies/owner/agency/location', data);
  }

  /**
   * Update social media links
   * 
   * Updates facebook, instagram, linkedin, twitter URLs.
   * All URLs must include protocol (https://).
   * 
   * @param data - Social media updates
   * @returns Promise with updated agency profile
   */
  async updateSocialMedia(
    data: RequestBody<'/agencies/owner/agency/social-media', 'patch'>
  ): Promise<Response<'/agencies/owner/agency/social-media', 'patch'>> {
    return httpClient.patch('/agencies/owner/agency/social-media', data);
  }

  /**
   * Update services
   * 
   * Updates services, specializations, target_countries arrays.
   * 
   * @param data - Services updates
   * @returns Promise with updated agency profile
   */
  async updateServices(
    data: RequestBody<'/agencies/owner/agency/services', 'patch'>
  ): Promise<Response<'/agencies/owner/agency/services', 'patch'>> {
    return httpClient.patch('/agencies/owner/agency/services', data);
  }

  /**
   * Update settings
   * 
   * Updates currency, timezone, language, date_format, notifications, features.
   * 
   * @param data - Settings updates
   * @returns Promise with updated agency profile
   */
  async updateSettings(
    data: RequestBody<'/agencies/owner/agency/settings', 'patch'>
  ): Promise<Response<'/agencies/owner/agency/settings', 'patch'>> {
    return httpClient.patch('/agencies/owner/agency/settings', data);
  }

  // ============================================================================
  // Media Management
  // ============================================================================

  /**
   * Upload agency logo
   * 
   * Uploads a logo image file. Automatically updates logo_url.
   * 
   * @param license - Agency license number
   * @param file - Image file
   * @returns Promise with upload result and URL
   */
  async uploadLogo(
    license: string,
    file: File
  ): Promise<{ success: boolean; url: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await httpClient.post<{
      success: boolean;
      url: string;
      message: string;
    }>(`/agencies/${license}/logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response;
  }

  /**
   * Remove agency logo
   * 
   * Removes the logo and sets logo_url to null.
   * 
   * @param license - Agency license number
   * @returns Promise with success result
   */
  async removeLogo(
    license: string
  ): Promise<{ success: boolean; message: string }> {
    return httpClient.delete<{ success: boolean; message: string }>(
      `/agencies/${license}/logo`
    );
  }

  /**
   * Upload agency banner
   * 
   * Uploads a banner image file. Automatically updates banner_url.
   * 
   * @param license - Agency license number
   * @param file - Image file
   * @returns Promise with upload result and URL
   */
  async uploadBanner(
    license: string,
    file: File
  ): Promise<{ success: boolean; url: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await httpClient.post<{
      success: boolean;
      url: string;
      message: string;
    }>(`/agencies/${license}/banner`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response;
  }

  /**
   * Remove agency banner
   * 
   * Removes the banner and sets banner_url to null.
   * 
   * @param license - Agency license number
   * @returns Promise with success result
   */
  async removeBanner(
    license: string
  ): Promise<{ success: boolean; message: string }> {
    return httpClient.delete<{ success: boolean; message: string }>(
      `/agencies/${license}/banner`
    );
  }

  // ============================================================================
  // Search (Public)
  // ============================================================================

  /**
   * Search agencies
   * 
   * Public endpoint to search agencies with pagination and sorting.
   * No authentication required.
   * 
   * @param params - Search parameters (keyword, page, limit, sortBy, sortOrder)
   * @returns Promise with paginated search results
   */
  async searchAgencies(params?: {
    keyword?: string;
    page?: number;
    limit?: number;
    sortBy?: 'name' | 'country' | 'city' | 'created_at';
    sortOrder?: 'asc' | 'desc';
  }): Promise<Response<'/agencies/search', 'get'>> {
    const queryParams = new URLSearchParams();
    
    if (params?.keyword) queryParams.append('keyword', params.keyword);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const queryString = queryParams.toString();
    const url = queryString ? `/agencies/search?${queryString}` : '/agencies/search';

    return httpClient.get(url);
  }
}

/**
 * Singleton instance of AgencyDataSource
 * 
 * Use this instance throughout the application for all agency operations.
 * 
 * @example
 * ```typescript
 * import { agencyDataSource } from '@/api/datasources/agency';
 * 
 * // Get my agency
 * const agency = await agencyDataSource.getMyAgency();
 * 
 * // Update contact info
 * await agencyDataSource.updateContactInfo({
 *   phones: ['+977-1-4123456', '+977-9841234567'],
 *   emails: ['contact@agency.com'],
 *   website: 'https://agency.com'
 * });
 * 
 * // Upload logo
 * const result = await agencyDataSource.uploadLogo(license, logoFile);
 * console.log('Logo URL:', result.url);
 * ```
 */
export const agencyDataSource = new AgencyDataSource();
