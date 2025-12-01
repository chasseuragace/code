/**
 * HTTP Client
 * 
 * Typed Axios wrapper that provides:
 * - Request/response type safety
 * - Auth token injection
 * - Request/response interceptors
 * - Error handling
 * 
 * @module api/client
 */

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';

/**
 * Configuration for HTTP client
 */
export interface HttpClientConfig {
  baseURL: string;
  timeout?: number;
}

/**
 * Extended request configuration with auth flag
 */
export interface RequestConfig extends AxiosRequestConfig {
  requireAuth?: boolean;
}

/**
 * HTTP Client class
 * 
 * Provides typed HTTP methods with automatic auth token injection
 * and error handling.
 */
export class HttpClient {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor(config: HttpClientConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000, // 30 second default timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Set up request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Inject auth token if available
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }

        // Log request in development mode
        if (import.meta.env.DEV) {
          console.log(`[HTTP] ${config.method?.toUpperCase()} ${config.url}`, {
            params: config.params,
            data: config.data,
          });
        }

        return config;
      },
      (error) => {
        console.error('[HTTP] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Log response in development mode
        if (import.meta.env.DEV) {
          console.log(`[HTTP] ${response.status} ${response.config.url}`, {
            data: response.data,
          });
        }

        return response;
      },
      (error: AxiosError) => {
        // Handle different error types
        if (error.response) {
          // Server responded with error status
          const status = error.response.status;
          const url = error.config?.url;

          console.error(`[HTTP] ${status} ${url}`, {
            data: error.response.data,
          });

          // Handle specific status codes
          if (status === 401) {
            // Unauthorized - trigger logout
            this.handleUnauthorized();
          } else if (status === 403) {
            // Forbidden - permission denied
            this.handleForbidden();
          }
        } else if (error.request) {
          // Request made but no response received
          console.error('[HTTP] Network error:', error.message);
        } else {
          // Error setting up request
          console.error('[HTTP] Request setup error:', error.message);
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Handle 401 Unauthorized errors
   */
  private handleUnauthorized(): void {
    // Clear auth token
    this.authToken = null;

    // Dispatch custom event for auth store to handle
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
  }

  /**
   * Handle 403 Forbidden errors
   */
  private handleForbidden(): void {
    // Dispatch custom event for permission denied
    window.dispatchEvent(new CustomEvent('auth:forbidden'));
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Clear authentication token
   */
  clearAuthToken(): void {
    this.authToken = null;
  }

  /**
   * GET request
   */
  async get<T = unknown>(url: string, config?: RequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  /**
   * POST request
   */
  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  /**
   * PATCH request
   */
  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data, config);
    return response.data;
  }

  /**
   * PUT request
   */
  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(url: string, config?: RequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }

  /**
   * Get the underlying Axios instance (for advanced usage)
   */
  getAxiosInstance(): AxiosInstance {
    return this.client;
  }
}

/**
 * Create and export singleton HTTP client instance
 */
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const httpClient = new HttpClient({
  baseURL,
  timeout: 30000,
});
