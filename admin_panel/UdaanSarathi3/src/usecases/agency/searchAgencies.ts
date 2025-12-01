/**
 * Search Agencies Use Case
 * 
 * Orchestrates agency search operations.
 * 
 * @module usecases/agency/searchAgencies
 */

import { agencyDataSource } from '../../api/datasources/agency';
import type { Response } from '../../api/types/helpers';

/**
 * Search result type
 */
export type SearchResult = Response<'/agencies/search', 'get'>;

/**
 * Search parameters
 */
export interface SearchParams {
  keyword?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'country' | 'city' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Search agencies result
 */
export interface SearchAgenciesResult {
  success: boolean;
  data?: SearchResult;
  error?: string;
}

/**
 * Search agencies use case
 * 
 * Searches agencies with pagination and sorting (public endpoint).
 * 
 * @param params - Search parameters
 * @returns Promise with paginated search results
 * 
 * @example
 * ```typescript
 * const result = await searchAgencies({
 *   keyword: 'healthcare',
 *   page: 1,
 *   limit: 10,
 *   sortBy: 'name',
 *   sortOrder: 'asc'
 * });
 * 
 * if (result.success && result.data) {
 *   console.log('Found:', result.data.meta.total, 'agencies');
 *   result.data.data.forEach(agency => {
 *     console.log(agency.name);
 *   });
 * }
 * ```
 */
export async function searchAgencies(
  params?: SearchParams
): Promise<SearchAgenciesResult> {
  try {
    const data = await agencyDataSource.searchAgencies(params);

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('[searchAgencies] Failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Search failed',
    };
  }
}
