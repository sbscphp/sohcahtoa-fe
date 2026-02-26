import { performLogout } from './auth-logout';

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequestConfig extends RequestInit {
  method?: HttpMethod;
  params?: Record<string, string | number | boolean | null | undefined>;
  skipAuth?: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  error?: {
    code: string;
    message: string;
  };
  metadata: Record<string, unknown> | null;
}

export interface ApiError {
  message: string;
  status: number;
  data?: unknown;
}

class ApiClient {
  private baseUrl: string;
  private getAuthToken?: () => string | null;

  constructor() {
    // Use environment variable or default to production API
    this.baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "https://sohcahtoa-dev.clocksurewise.com";
  }

  /**
   * Set auth token getter function (called dynamically to get latest token)
   */
  setAuthTokenGetter(getter: () => string | null) {
    this.getAuthToken = getter;
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(url: string, params?: Record<string, string | number | boolean | null | undefined>): string {
    const fullUrl = url.startsWith("http") ? url : `${this.baseUrl}${url}`;

    if (!params || Object.keys(params).length === 0) {
      return fullUrl;
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `${fullUrl}?${queryString}` : fullUrl;
  }

  /**
   * Build headers with auth
   */
  private buildHeaders(config: ApiRequestConfig): HeadersInit {
    const headers = new Headers(config.headers);

    if (!headers.has("Content-Type")) {
      const contentType = config.body instanceof FormData
        ? "multipart/form-data"
        : "application/json";
      if (contentType !== "multipart/form-data") {
        headers.set("Content-Type", contentType);
      }
    }

    // Add auth token (only when skipAuth is false)
    if (!config.skipAuth && this.getAuthToken) {
      const token = this.getAuthToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }
    return headers;
  }

  /**
   * Handle API errors
   */
  private async handleError(response: Response): Promise<ApiError> {
    let errorData: unknown;
    try {
      errorData = await response.json();
    } catch {
      errorData = await response.text();
    }

    let errorMessage = `HTTP ${response.status}`;

    if (errorData && typeof errorData === "object") {
      const data = errorData as { error?: { message?: string }; message?: string };
      errorMessage = data.error?.message || data.message || errorMessage;
    }

    const error: ApiError = {
      message: errorMessage,
      status: response.status,
      data: errorData,
    };

    return error;
  }

  /**
   * Main request method
   */
  async request<T>(url: string, config: ApiRequestConfig = {}): Promise<T> {
    const { params, skipAuth, ...fetchConfig } = config;

    const fullUrl = this.buildUrl(url, params);
    const headers = this.buildHeaders({ ...config, skipAuth });

    // Prepare body
    let body = config.body;
    // Don't send body for GET/HEAD requests
    if (config.method && !["GET", "HEAD"].includes(config.method) && body) {
      if (!(body instanceof FormData) && typeof body === "object") {
        body = JSON.stringify(body);
      }
    } else {
      body = undefined;
    }

    try {
      const response = await fetch(fullUrl, {
        ...fetchConfig,
        method: config.method || "GET",
        headers,
        body,
      });

      // Handle non-OK responses
      if (!response.ok) {
        const error = await this.handleError(response);

        // Handle 401 Unauthorized - log user out
        if (response.status === 401 && !skipAuth && typeof window !== "undefined") {
          performLogout();
        }

        throw error;
      }

      // Handle empty responses
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        // For blob responses (file downloads)
        if (contentType?.includes("application/octet-stream") || contentType?.includes("application/zip")) {
          return response.blob() as unknown as T;
        }
        // For text responses
        return response.text() as unknown as T;
      }

      return response.json();
    } catch (error) {
      // Re-throw ApiError as-is
      if (error && typeof error === "object" && "status" in error) {
        throw error;
      }

      // Handle network errors
      throw {
        message: error instanceof Error ? error.message : "Network error",
        status: 0,
        data: error,
      } as ApiError;
    }
  }

  // Convenience methods
  get<T>(url: string, config?: Omit<ApiRequestConfig, "method" | "body">) {
    return this.request<T>(url, { ...config, method: "GET" });
  }

  post<T>(url: string, data?: unknown, config?: Omit<ApiRequestConfig, "method">) {
    return this.request<T>(url, { ...config, method: "POST", body: data as BodyInit });
  }

  put<T>(url: string, data?: unknown, config?: Omit<ApiRequestConfig, "method">) {
    return this.request<T>(url, { ...config, method: "PUT", body: data as BodyInit });
  }

  patch<T>(url: string, data?: unknown, config?: Omit<ApiRequestConfig, "method">) {
    return this.request<T>(url, { ...config, method: "PATCH", body: data as BodyInit });
  }

  delete<T>(url: string, config?: Omit<ApiRequestConfig, "method" | "body">) {
    return this.request<T>(url, { ...config, method: "DELETE" });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
