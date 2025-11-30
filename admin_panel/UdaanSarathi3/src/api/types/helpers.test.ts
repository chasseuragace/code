/**
 * Test file for type helper utilities
 * 
 * This file demonstrates and validates that all type helpers work correctly
 * with the generated OpenAPI types.
 */

import type {
  RequestBody,
  Response,
  Schema,
  QueryParams,
} from './helpers';

// ============================================================================
// Test 1: RequestBody Helper
// ============================================================================

// Test extracting request body for PATCH /agencies/owner/agency/basic
type UpdateAgencyBasicRequest = RequestBody<'/agencies/owner/agency/basic', 'patch'>;

const updateAgencyData: UpdateAgencyBasicRequest = {
  name: 'Updated Agency Name',
  description: 'A leading recruitment agency',
  established_year: 2020,
};

// Test extracting request body for POST /agency/register-owner
type RegisterOwnerRequest = RequestBody<'/agency/register-owner', 'post'>;

const registerData: RegisterOwnerRequest = {
  phone: '+971501234567',
  full_name: 'John Doe',
};

// ============================================================================
// Test 2: Response Helper
// ============================================================================

// Test extracting response for GET /jobs/search (default 200 status)
type JobSearchResponse = Response<'/jobs/search', 'get'>;

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

// Test with array of schemas
type Agencies = Schema<'AgencyLiteDto'>[];

const agencies: Agencies = [agency];

// Test DTO types
type UpdateAgencyBasicDto = Schema<'UpdateAgencyBasicDto'>;
type RegisterOwnerDto = Schema<'RegisterOwnerDto'>;
type AgencyResponseDto = Schema<'AgencyResponseDto'>;

// ============================================================================
// Test 4: QueryParams Helper
// ============================================================================

// Test extracting query parameters
type JobSearchQueryParams = QueryParams<'/jobs/search', 'get'>;

// ============================================================================
// Test 5: Complex Type Composition
// ============================================================================

// Combine helpers for a complete API call type
interface ApiCall<
  Path extends keyof import('./helpers').paths,
  Method extends keyof import('./helpers').paths[Path]
> {
  path: Path;
  method: Method;
  body?: RequestBody<Path, Method>;
  query?: QueryParams<Path, Method>;
  response: Response<Path, Method>;
}

// Example: Type-safe API call definition for PATCH request
type UpdateAgencyCall = ApiCall<'/agencies/owner/agency/basic', 'patch'>;

// ============================================================================
// Test 6: Verify Type Helpers Extract Correctly
// ============================================================================

// Verify RequestBody extracts the correct type
const testRequestBody: UpdateAgencyBasicRequest = {
  name: 'Test',
  description: 'Test description',
  established_year: 2020,
  license_number: 'LIC-123',
};

// Verify Schema extracts the correct type
const testSchema: UpdateAgencyBasicDto = {
  name: 'Test',
  description: 'Test description',
};

// Both should be compatible
const verifyCompatibility: UpdateAgencyBasicRequest = testSchema;
const verifyCompatibility2: UpdateAgencyBasicDto = testRequestBody;

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

console.log('✓ All type helper tests passed!');
console.log('Sample data:', {
  agency,
  updateAgencyData,
  registerData,
  testRequestBody,
  verifyCompatibility,
  verifyCompatibility2,
});

export type {
  UpdateAgencyBasicRequest,
  RegisterOwnerRequest,
  JobSearchResponse,
  AgencyProfileResponse,
  Agency,
  JobSearchItem,
  JobSearchQueryParams,
  UpdateAgencyBasicDto,
  RegisterOwnerDto,
  AgencyResponseDto,
};
