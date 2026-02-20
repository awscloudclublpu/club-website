export interface AuthResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string | string[]>;
}

export interface AuthError {
  code: string;
  message: string;
  field?: string;
}

export interface ApiErrorResponse {
  status: number;
  message: string;
  retryAfter?: number;
  isRateLimited?: boolean;
}

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: {
    code: "INVALID_CREDENTIALS",
    message: "Invalid email or password",
  },
  EMAIL_EXISTS: {
    code: "EMAIL_EXISTS",
    message: "Email already registered",
  },
  NETWORK_ERROR: {
    code: "NETWORK_ERROR",
    message: "Network error. Please check your connection and try again.",
  },
  VALIDATION_ERROR: {
    code: "VALIDATION_ERROR",
    message: "Please check your input and try again.",
  },
  SERVER_ERROR: {
    code: "SERVER_ERROR",
    message: "Server error. Please try again later.",
  },
  RATE_LIMITED: {
    code: "RATE_LIMITED",
    message: "Too many requests. Please wait before trying again.",
  },
  BAD_REQUEST: {
    code: "BAD_REQUEST",
    message: "Invalid request. Please check your information and try again.",
  },
} as const;

/**
 * HTTP Status Code to Error Message Mapping
 * Provides production-grade error handling for all common HTTP errors
 */
export const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: "Invalid request data. Please check your information and try again.",
  401: "Authentication failed. Please log in again.",
  403: "Access denied. You don't have permission to perform this action.",
  404: "Resource not found. Please try again later.",
  409: "This action conflicts with existing data. Please try a different email or username.",
  429: "Too many requests. Please wait a few moments before trying again.",
  500: "Server error. Our team has been notified. Please try again later.",
  502: "Service temporarily unavailable. Please try again in a few moments.",
  503: "Service maintenance in progress. Please try again later.",
  504: "Request timeout. Please try again.",
} as const;

export function parseAuthError(
  error: unknown | AuthResponse
): string {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    if (error.name === "AbortError") {
      return "";
    }
    return error.message;
  }

  if (error && typeof error === "object") {
    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }
  }

  return AUTH_ERRORS.SERVER_ERROR.message;
}

/**
 * Parse HTTP error response with production-grade handling
 * Handles validation errors, rate limiting, and server errors
 */
export function parseHttpError(
  status: number,
  responseData: any
): ApiErrorResponse {
  const baseMessage = HTTP_STATUS_MESSAGES[status] || HTTP_STATUS_MESSAGES[500];

  // Extract retry-after for rate limiting
  const retryAfter = responseData?.retryAfter || 
                     (status === 429 ? 60 : undefined);

  // Detect rate limiting (429 or custom backend indicators)
  const isRateLimited = status === 429 || 
                       responseData?.code === "RATE_LIMITED" ||
                       responseData?.code === "TOO_MANY_REQUESTS";

  // Use custom message if provided by backend
  let message = baseMessage;
  if (responseData?.message && typeof responseData.message === "string") {
    // Only use backend message if it's concise and not HTML
    if (!responseData.message.includes("<") && responseData.message.length < 200) {
      message = responseData.message;
    }
  }

  return {
    status,
    message,
    retryAfter,
    isRateLimited,
  };
}

/**
 * Get user-friendly error message with additional context
 * Includes retry suggestions and helpful information
 */
export function getUserFriendlyErrorMessage(
  status: number,
  responseData: any
): { message: string; suggestion?: string } {
  const error = parseHttpError(status, responseData);

  let suggestion: string | undefined;

  if (error.isRateLimited) {
    const seconds = error.retryAfter || 60;
    suggestion = `Please wait ${Math.ceil(seconds / 60)} minute(s) before trying again.`;
  } else if (status === 400) {
    suggestion = "Please review the highlighted fields and ensure all information is correct.";
  } else if (status >= 500) {
    suggestion = "Our team has been notified. Please try again in a few moments.";
  }

  return {
    message: error.message,
    suggestion,
  };
}

export function getFieldErrors(
  response: AuthResponse
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  if (response.errors && typeof response.errors === "object") {
    Object.entries(response.errors).forEach(([field, error]) => {
      if (Array.isArray(error)) {
        fieldErrors[field] = error[0] || "Invalid value";
      } else if (typeof error === "string") {
        fieldErrors[field] = error;
      }
    });
  }

  return fieldErrors;
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.slice(0, 10);
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhoneNumber(phone: string): boolean {
  return /^\d{10}$/.test(formatPhoneNumber(phone));
}

export function validatePassword(password: string): boolean {
  return password.length >= 8;
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
