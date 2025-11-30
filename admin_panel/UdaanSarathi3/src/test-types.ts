/**
 * Test file to verify generated types work correctly
 */
import type { components, paths } from './api/generated';

// Test 1: Access a schema type
type AgencyDto = components['schemas']['AgencyLiteDto'];

const agency: AgencyDto = {
  id: '123',
  name: 'Test Agency',
  license_number: 'LIC-123',
  phones: ['+1234567890'],
  emails: ['test@agency.com'],
  website: 'https://agency.com',
};

// Test 2: Access a path operation
type JobSearchResponse = paths['/jobs/search']['get']['responses']['200']['content']['application/json'];

// Test 3: Access request parameters
type JobSearchParams = paths['/jobs/search']['get']['parameters']['query'];

console.log('Type tests passed!', agency);
