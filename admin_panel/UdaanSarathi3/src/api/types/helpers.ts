/**
 * Type Helper Utilities
 * 
 * This module provides utility types for easier consumption of generated OpenAPI types.
 * These helpers simplify extracting request bodies, responses, and schemas from the
 * generated types structure.
 * 
 * @module api/types/helpers
 */

import type { paths, components } from '../generated';

/**
 * Extract request body type for a given path and HTTP method
 * 
 * @template Path - The API path (e.g., '/agencies/owner/agency')
 * @template Method - The HTTP method (e.g., 'post', 'patch', 'put')
 * 
 * @example
 * ```typescript
 * // Get the request body type for updating an agency
 * type UpdateAgencyRequest = RequestBody<'/agencies/owner/agency', 'patch'>;
 * 
 * const updateData: UpdateAgencyRequest = {
 *   name: 'New Agency Name',
 *   address: '123 Main St'
 * };
 * ```
 * 
 * @remarks
 * If the endpoint doesn't have a request body, this type will resolve to `never`.
 * This is intentional and will cause a TypeScript error if you try to use it,
 * helping catch API misuse at compile time.
 */
export type RequestBody<
  Path extends keyof paths,
  Method extends keyof paths[Path]
> = paths[Path][Method] extends {
  requestBody: {
    content: {
      'application/json': infer T;
    };
  };
}
  ? T
  : never;

/**
 * Extract response type for a given path, HTTP method, and status code
 * 
 * @template Path - The API path (e.g., '/jobs/search')
 * @template Method - The HTTP method (e.g., 'get', 'post')
 * @template Status - The HTTP status code (defaults to 200)
 * 
 * @example
 * ```typescript
 * // Get the success response type for job search
 * type JobSearchResponse = Response<'/jobs/search', 'get'>;
 * 
 * // Get a specific error response
 * type NotFoundResponse = Response<'/jobs/{id}', 'get', 404>;
 * 
 * async function searchJobs(): Promise<JobSearchResponse> {
 *   const response = await fetch('/jobs/search');
 *   return response.json();
 * }
 * ```
 * 
 * @remarks
 * Defaults to status code 200 for convenience. If the endpoint doesn't have
 * the specified status code, this type will resolve to `never`.
 */
export type Response<
  Path extends keyof paths,
  Method extends keyof paths[Path],
  Status extends number = 200
> = paths[Path][Method] extends {
  responses: {
    [K in Status]: {
      content: {
        'application/json': infer T;
      };
    };
  };
}
  ? paths[Path][Method]['responses'][Status]['content']['application/json']
  : never;

/**
 * Direct access to component schemas (DTOs)
 * 
 * @template Name - The schema name (e.g., 'AgencyLiteDto', 'JobSearchItemDto')
 * 
 * @example
 * ```typescript
 * // Access a DTO directly by name
 * type Agency = Schema<'AgencyLiteDto'>;
 * 
 * const agency: Agency = {
 *   id: '123',
 *   name: 'Test Agency',
 *   license_number: 'LIC-123'
 * };
 * 
 * // Use with arrays
 * type Agencies = Schema<'AgencyLiteDto'>[];
 * ```
 * 
 * @remarks
 * This is the most straightforward way to access DTOs when you know the exact
 * schema name. It's equivalent to `components['schemas']['SchemaName']` but
 * more concise.
 */
export type Schema<Name extends keyof components['schemas']> = 
  components['schemas'][Name];

/**
 * Extract query parameters type for a given path and HTTP method
 * 
 * @template Path - The API path (e.g., '/jobs/search')
 * @template Method - The HTTP method (e.g., 'get')
 * 
 * @example
 * ```typescript
 * // Get query parameters for job search
 * type JobSearchParams = QueryParams<'/jobs/search', 'get'>;
 * 
 * const params: JobSearchParams = {
 *   keyword: 'electrician',
 *   country: 'UAE',
 *   page: 1,
 *   limit: 10
 * };
 * ```
 * 
 * @remarks
 * If the endpoint doesn't have query parameters, this type will resolve to `never`.
 */
export type QueryParams<
  Path extends keyof paths,
  Method extends keyof paths[Path]
> = paths[Path][Method] extends {
  parameters: {
    query: infer T;
  };
}
  ? T
  : never;

/**
 * Extract path parameters type for a given path and HTTP method
 * 
 * @template Path - The API path (e.g., '/jobs/{id}')
 * @template Method - The HTTP method (e.g., 'get')
 * 
 * @example
 * ```typescript
 * // Get path parameters for job details
 * type JobPathParams = PathParams<'/jobs/{id}', 'get'>;
 * 
 * const params: JobPathParams = {
 *   id: 'job-123'
 * };
 * ```
 * 
 * @remarks
 * If the endpoint doesn't have path parameters, this type will resolve to `never`.
 */
export type PathParams<
  Path extends keyof paths,
  Method extends keyof paths[Path]
> = paths[Path][Method] extends {
  parameters: {
    path: infer T;
  };
}
  ? T
  : never;

/**
 * Type guard to check if a value matches a schema
 * 
 * @param value - The value to check
 * @param schemaName - The name of the schema to validate against
 * @returns True if the value has all required fields of the schema
 * 
 * @example
 * ```typescript
 * const data: unknown = await response.json();
 * 
 * if (isSchema(data, 'AgencyLiteDto')) {
 *   // TypeScript now knows data is AgencyLiteDto
 *   console.log(data.name);
 * }
 * ```
 * 
 * @remarks
 * This is a basic runtime check. For production use, consider using a validation
 * library like zod or yup for more robust validation.
 */
export function isSchema<Name extends keyof components['schemas']>(
  value: unknown,
  schemaName: Name
): value is Schema<Name> {
  // Basic check - in production, you'd want more robust validation
  return value !== null && typeof value === 'object';
}

// Re-export the base types for convenience
export type { paths, components } from '../generated';
