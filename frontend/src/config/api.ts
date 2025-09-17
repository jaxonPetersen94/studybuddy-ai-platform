export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3001';

const API_PREFIX = '/api';
const API_VERSION = '/v1';
const API_BASE_PATH = `${API_PREFIX}${API_VERSION}`;

const buildPath = (resource: string, action?: string): string =>
  `${API_BASE_PATH}/${resource}${action ? `/${action}` : ''}`;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: buildPath('users', 'login'),
    LOGOUT: buildPath('users', 'logout'),
    REFRESH: buildPath('users', 'refresh'),
    REGISTER: buildPath('users', 'register'),
    RESEND_VERIFICATION: buildPath('users', 'resend-verification'),
    FORGOT_PASSWORD: buildPath('users', 'forgot-password'),
    RESET_PASSWORD: buildPath('users', 'reset-password'),
    DELETE_ACCOUNT: buildPath('users', 'account'),
  },
  USER: {
    PROFILE: buildPath('users', 'profile'),
    PREFERENCES: buildPath('users', 'preferences'),
    CHANGE_PASSWORD: buildPath('users', 'change-password'),
  },
} as const;

export const buildApiUrl = (endpoint: string): string =>
  `${API_BASE_URL}${endpoint}`;

export type ApiEndpoints = typeof API_ENDPOINTS;
export type AuthEndpoints = typeof API_ENDPOINTS.AUTH;
export type UserEndpoints = typeof API_ENDPOINTS.USER;
