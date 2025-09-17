import { User } from '../entities/User';
import { AuthTokens } from './authTypes';

export interface ApiError {
  error: string;
  code: string;
}

export interface ApiSuccessResponse<T = any> {
  message: string;
  data?: T;
}

export interface AuthResponse {
  message: string;
  user: User;
  tokens: AuthTokens;
}

export interface TokenRefreshResponse {
  message: string;
  tokens: AuthTokens;
}

export enum AuthErrorCodes {
  MISSING_FIELDS = 'MISSING_FIELDS',
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_PASSWORD = 'INVALID_PASSWORD',
  EMAIL_EXISTS = 'EMAIL_EXISTS',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_DEACTIVATED = 'ACCOUNT_DEACTIVATED',
  MISSING_REFRESH_TOKEN = 'MISSING_REFRESH_TOKEN',
  INVALID_REFRESH_TOKEN = 'INVALID_REFRESH_TOKEN',
  UNAUTHORIZED = 'UNAUTHORIZED',
  MISSING_EMAIL = 'MISSING_EMAIL',
  INVALID_RESET_TOKEN = 'INVALID_RESET_TOKEN',
  INVALID_CURRENT_PASSWORD = 'INVALID_CURRENT_PASSWORD',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  NO_UPDATE_FIELDS = 'NO_UPDATE_FIELDS',
  PASSWORD_REQUIRED = 'PASSWORD_REQUIRED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}
