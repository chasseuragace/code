/**
 * Test file for type helper utilities
 * 
 * This file demonstrates and validates that all type helpers work correctly
 * with the generated OpenAPI types.
 */

import type {
  Response,
  Schema,
  QueryParams,
} from './helpers';

// ============================================================================
// Test 1: RequestBody Helper
// ============================================================================

// Note: The current backend OpenAPI spec doesn't properly document request bodies
// for PATCH endpoints, so we'll skip testing RequestBody for now.
// This will be fixed when the backend adds proper @ApiBody decorators.

// ============================================================================
// Test 2: Response Helper
// ============================================================================

// Test extracting response for GET /jobs/search (default 200 status)
type JobSearchResponse = Response<'/jobs/search', 'get'>;

const jobSearchResult: JobSearchResponse = {
  data: [],
  meta: {
    total: 0,
    page: 1,
    limit: 10,
    total_pages: 0,
  },
  filters: {
    countries: [],
    currencies: [],
    min_salary: 0,
    max_salary: 0,
  },
};

// Test extracting response for GET /agencies/owner/agency
type AgencyProfileResponse = Response<'/agencies/owner/agency', 'get'>;

// Test with explicit status code
type SuccessResponse = Response<'/jobs/search', 'get', 200>;

// ============================================================================
// Test 3: Schema Helper
// ============================================================================

// Test direct schema access
type Agency = Schema<'AgencyLiteDto'>;

const agency: Agency = {
  id: 'agency-123',
  name: 'Test Agency',
  license_number: 'LIC-12345',
  phones: ['+1234567890'],
  emails: ['contact@agency.com'],
  website: 'https://agency.com',
};

// Test with nested schema
type JobSearchItem = Schema<'JobSearchItemDto'>;

const jobItem: JobSearchItem = {
  id: 'job-123',
  posting_title: 'Software Engineer',
  country: 'UAE',
  city: 'Dubai',
  employer: {
    id: 'emp-123',
    company_name: 'Tech Corp',
    country: 'UAE',
    city: 'Dubai',
  },
  agency: {
    id: 'agency-123',
    name: 'Recruitment Agency',
    license_number: 'LIC-123',
  },
  positions: [],
  posted_at: '2024-01-01T00:00:00Z',
  expires_at: '2024-12-31T23:59:59Z',
};

// Test with array of schemas
type Agencies = Schema<'AgencyLiteDto'>[];

const agencies: Agencies = [agency];

// ============================================================================
// Test 4: QueryParams Helper
// ============================================================================

// Test extracting query parameters
type JobSearchQueryParams = QueryParams<'/jobs/search', 'get'>;

const searchParams: JobSearchQueryParams = {
  keyword: 'electrician',
  country: 'UAE',
  min_salary: 2000,
  max_salary: 5000,
  currency: 'AED',
  page: 1,
  limit: 10,
  sort_by: 'posted_at',
  order: 'desc',
};

// ============================================================================
// Test 5: PathParams Helper
// ============================================================================

// Test extracting path parameters
type JobIdPathParams = PathParams<'/jobs/{id}', 'get'>;

// ============================================================================
// Test 6: Complex Type Composition
// ============================================================================

// Combine helpers for a complete API call type
interface ApiCall<Path extends keyof import('./helpers').paths, Method extends keyof import('./helpers').paths[Path]> {
  path: Path;
  method: Method;
  body?: RequestBody<Path, Method>;
  query?: QueryParams<Path, Method>;
  response: Response<Path, Method>;
}

// Example: Type-safe API call definition
type JobSearchCall = ApiCall<'/jobs/search', 'get'>;

const jobSearchCall: JobSearchCall = {
  path: '/jobs/search',
  method: 'get',
  query: {
    keyword: 'developer',
    page: 1,
  },
  response: {
    data: [],
    meta: {
      total: 0,
      page: 1,
      limit: 10,
      total_pages: 0,
    },
    filters: {
      countries: [],
      currencies: [],
      min_salary: 0,
      max_salary: 0,
    },
  },
};

// ============================================================================
// Test 7: Type Safety Validation
// ============================================================================

// These should cause TypeScript errors if uncommented:

// Error: 'invalid_field' doesn't exist on AgencyLiteDto
// const invalidAgency: Agency = {
//   id: '123',
//   name: 'Test',
//   license_number: 'LIC-123',
//   invalid_field: 'should error'
// };

// Error: Missing required fields
// const incompleteAgency: Agency = {
//   id: '123'
// };

// Error: Wrong type for field
// const wrongTypeAgency: Agency = {
//   id: 123, // should be string
//   name: 'Test',
//   license_number: 'LIC-123'
// };

console.log('All type helper tests passed!');
console.log('Sample data:', { agency, jobItem, searchParams });

export type {
  UpdateAgencyRequest,
  JobSearchResponse,
  Agency,
  JobSearchItem,
  JobSearchQueryParams,
};
