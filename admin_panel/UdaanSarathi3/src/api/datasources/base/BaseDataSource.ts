/**
 * Base DataSource
 * 
 * Abstract base class for all DataSource classes.
 * Provides typed HTTP methods and common functionality.
 * 
 * @module api/datasources/base
 */

import { HttpClient, type RequestConfig } from '../../client/httpClient';
import type { paths } from '../../generated';

/**
 * Base DataSource class
 * 
 * All DataSource classes should extend this base class to inherit:
 * - Typed HTTP methods (get, post, patch, delete)
 * - Automatic auth token injection
 * - Consistent error handling
 * - Request/response transformation helpers
 */
export abstract class BaseDataSource {
  protected client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * Typed GET request
   * 
   * @template Path - API path from OpenAPI spec
   * @template Method - HTTP method (should be 'get')
   * @param path - API endpoint path
   * @param config - Request configuration
   * @returns Promise with typed response
   */
  protected async get<
    Path extends keyof paths,
    Method extends 'get' = 'get'
  >(
    path: Path,
    config?: RequestConfig
  ): Promise<
    paths[Path][Method] extends { responses: { 200: { content: { 'application/json': infer T } } } }
      ? T
      : never
  > {
    return this.client.get(path as string, config);
  }

  /**
   * Typed POST request
   * 
   * @template Path - API path from OpenAPI spec
   * @template Method - HTTP method (should be 'post')
   * @param path - API endpoint path
   * @param data - Request body data
   * @param config - Request configuration
   * @returns Promise with typed response
   */
  protected async post<
    Path extends keyof paths,
    Method extends 'post' = 'post'
  >(
    path: Path,
    data?: paths[Path][Method] extends { requestBody: { content: { 'application/json': infer T } } }
      ? T
      : never,
    config?: RequestConfig
  ): Promise<
    paths[Path][Method] extends { responses: { 200: { content: { 'application/json': infer T } } } }
      ? T
      : paths[Path][Method] extends { responses: { 201: { content: { 'application/json': infer T } } } }
      ? T
      : never
  > {
    return this.client.post(path as string, data, config);
  }

  /**
   * Typed PATCH request
   * 
   * @template Path - API path from OpenAPI spec
   * @template Method - HTTP method (should be 'patch')
   * @param path - API endpoint path
   * @param data - Request body data
   * @param config - Request configuration
   * @returns Promise with typed response
   */
  protected async patch<
    Path extends keyof paths,
    Method extends 'patch' = 'patch'
  >(
    path: Path,
    data?: paths[Path][Method] extends { requestBody: { content: { 'application/json': infer T } } }
      ? T
      : never,
    config?: RequestConfig
  ): Promise<
    paths[Path][Method] extends { responses: { 200: { content: { 'application/json': infer T } } } }
      ? T
      : never
  > {
    return this.client.patch(path as string, data, config);
  }

  /**
   * Typed PUT request
   * 
   * @template Path - API path from OpenAPI spec
   * @template Method - HTTP method (should be 'put')
   * @param path - API endpoint path
   * @param data - Request body data
   * @param config - Request configuration
   * @returns Promise with typed response
   */
  protected async put<
    Path extends keyof paths,
    Method extends 'put' = 'put'
  >(
    path: Path,
    data?: paths[Path][Method] extends { requestBody: { content: { 'application/json': infer T } } }
      ? T
      : never,
    config?: RequestConfig
  ): Promise<
    paths[Path][Method] extends { responses: { 200: { content: { 'application/json': infer T } } } }
      ? T
      : never
  > {
    return this.client.put(path as string, data, config);
  }

  /**
   * Typed DELETE request
   * 
   * @template Path - API path from OpenAPI spec
   * @template Method - HTTP method (should be 'delete')
   * @param path - API endpoint path
   * @param config - Request configuration
   * @returns Promise with typed response
   */
  protected async delete<
    Path extends keyof paths,
    Method extends 'delete' = 'delete'
  >(
    path: Path,
    config?: RequestConfig
  ): Promise<
    paths[Path][Method] extends { responses: { 200: { content: { 'application/json': infer T } } } }
      ? T
      : void
  > {
    return this.client.delete(path as string, config);
  }

  /**
   * Transform request data before sending
   * 
   * Override this method in subclasses to add custom request transformations
   */
  protected transformRequest<T>(data: T): T {
    return data;
  }

  /**
   * Transform response data after receiving
   * 
   * Override this method in subclasses to add custom response transformations
   */
  protected transformResponse<T>(data: T): T {
    return data;
  }

  /**
   * Handle errors consistently
   * 
   * Override this method in subclasses to add custom error handling
   */
  protected handleError(error: unknown): never {
    // Re-throw the error to be handled by the caller
    throw error;
  }
}
