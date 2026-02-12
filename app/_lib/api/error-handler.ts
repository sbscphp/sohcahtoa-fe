/**
 * Error handling utilities
 * Integrates with Mantine notifications for user-friendly error messages
 */

import { notifications } from "@mantine/notifications";
import type { ApiError } from "./client";

/**
 * Map HTTP status codes to user-friendly messages
 */
const ERROR_MESSAGES: Record<number, string> = {
  400: "Bad Request: Please check your input.",
  401: "Unauthorized: Please log in again.",
  403: "Forbidden: You do not have access to this resource.",
  404: "Not Found: The resource was not found.",
  422: "Validation Error: Please check your input.",
  429: "Too many requests. Please try again later.",
  500: "Internal Server Error: Please try again later.",
  502: "Service temporarily unavailable. Please try again later.",
  503: "Service unavailable. Please try again later.",
};

/**
 * Handle API errors and show notifications
 */
export function handleApiError(error: unknown, options?: { showNotification?: boolean; customMessage?: string }) {
  const { showNotification = true, customMessage } = options || {};

  let message = customMessage || "An unexpected error occurred.";
  let status = 0;

  if (error && typeof error === "object" && "status" in error) {
    const apiError = error as ApiError;
    status = apiError.status;
    if (!customMessage) {
      message = apiError.message || ERROR_MESSAGES[status] || message;
    }
  } else if (error instanceof Error && !customMessage) {
    message = error.message;
  }

  if (showNotification) {
    notifications.show({
      title: "Error",
      message,
      color: "red",
      autoClose: 5000,
    });
  }

  return { message, status };
}

/**
 * Handle 401 errors (unauthorized) - typically redirect to login
 */
export function handleUnauthorized(onLogout?: () => void) {
  if (onLogout) {
    onLogout();
  } else {
    // Default: redirect to login
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
  }
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error && typeof error === "object" && "status" in error) {
    return (error as ApiError).status === 0;
  }
  return false;
}

/**
 * Check if error is a validation error (422)
 */
export function isValidationError(error: unknown): boolean {
  if (error && typeof error === "object" && "status" in error) {
    return (error as ApiError).status === 422;
  }
  return false;
}
