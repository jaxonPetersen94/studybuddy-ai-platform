export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, any>;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_ALREADY_EXISTS'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_INVALID'
  | 'USER_NOT_FOUND'
  | 'PASSWORD_TOO_WEAK'
  | 'RATE_LIMIT_EXCEEDED'
  | 'ACCOUNT_LOCKED';

export interface ErrorResponse {
  success: false;
  error: ApiError;
  message?: string;
  timestamp?: string;
}
