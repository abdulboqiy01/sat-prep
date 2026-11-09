/**
 * Application Error Hierarchy & Sanitization Utilities
 */

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR',
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_REQUIRED');
    this.name = 'AuthenticationError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied: insufficient permissions or unverified resource ownership') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded. Please wait before making further requests.') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}

export class QuotaExceededError extends AppError {
  constructor(message: string = 'Daily AI usage quota reached for this account tier.') {
    super(message, 429, 'QUOTA_EXCEEDED');
    this.name = 'QuotaExceededError';
  }
}

/**
 * Sanitizes errors before transmitting to client applications to prevent leaking
 * credentials, database column names, internal server paths, or stack traces.
 */
export function sanitizeError(error: unknown): { error: string; code: string; statusCode: number; details?: unknown } {
  if (error instanceof AppError) {
    return {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    // Check for known Supabase / PostgREST message patterns
    const msg = error.message;
    if (msg.includes('JWT') || msg.includes('token')) {
      return { error: 'Invalid or expired session. Please log in again.', code: 'INVALID_TOKEN', statusCode: 401 };
    }
    if (msg.includes('row-level security') || msg.includes('violates row-level security policy')) {
      return { error: 'Permission denied for requested record.', code: 'RLS_VIOLATION', statusCode: 403 };
    }
  }

  // Default opaque safe error
  return {
    error: 'An unexpected server error occurred. Please try again later.',
    code: 'INTERNAL_SERVER_ERROR',
    statusCode: 500,
  };
}
