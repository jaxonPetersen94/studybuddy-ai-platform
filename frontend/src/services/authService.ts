import { apiClient } from './api';
import { API_ENDPOINTS } from '../config/api';
import type {
  AuthResponse,
  LoginData,
  RegisterData,
  ForgotPasswordData,
  ForgotPasswordResponse,
} from '../types/authTypes';
import { User, UserPreferences } from '../types/userTypes';
import { ApiError, AuthErrorCode } from '../types/errorTypes';

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      return await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, data);
    } catch (error: any) {
      if (error.status === 401) {
        const apiError: ApiError = {
          code: 'INVALID_CREDENTIALS' as AuthErrorCode,
          message: 'Invalid email or password. Please try again.',
          details: { status: 401 },
        };
        throw apiError;
      }

      if (error.status === 429) {
        const apiError: ApiError = {
          code: 'RATE_LIMIT_EXCEEDED' as AuthErrorCode,
          message: 'Too many login attempts. Please try again later.',
          details: { status: 429 },
        };
        throw apiError;
      }

      const apiError: ApiError = {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'An unexpected error occurred',
        details: { status: error.status, originalError: error },
      };
      throw apiError;
    }
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      return await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.REGISTER,
        data,
      );
    } catch (error: any) {
      if (error.status === 409) {
        const apiError: ApiError = {
          code: 'EMAIL_ALREADY_EXISTS' as AuthErrorCode,
          message: 'An account with this email already exists.',
          details: { status: 409 },
        };
        throw apiError;
      }

      if (error.status === 400) {
        const apiError: ApiError = {
          code: 'INVALID_REGISTRATION_DATA' as AuthErrorCode,
          message:
            error.message ||
            'Invalid registration data. Please check your information.',
          details: { status: 400 },
        };
        throw apiError;
      }

      if (error.status === 429) {
        const apiError: ApiError = {
          code: 'RATE_LIMIT_EXCEEDED' as AuthErrorCode,
          message: 'Too many registration attempts. Please try again later.',
          details: { status: 429 },
        };
        throw apiError;
      }

      const apiError: ApiError = {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Registration failed. Please try again.',
        details: { status: error.status, originalError: error },
      };
      throw apiError;
    }
  },

  async forgotPassword(
    data: ForgotPasswordData,
  ): Promise<ForgotPasswordResponse> {
    return apiClient.post<ForgotPasswordResponse>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      data,
    );
  },

  async resetPassword(data: {
    token: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<void> {
    return apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH, {
      refreshToken,
    });
  },

  async logout(token: string): Promise<void> {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {}, token);
  },

  async getCurrentUser(token: string): Promise<User> {
    return apiClient.get<User>(API_ENDPOINTS.USER.PROFILE, token);
  },

  async updateProfile(data: Partial<User>, token: string): Promise<User> {
    return apiClient.patch<User>(API_ENDPOINTS.USER.PROFILE, data, token);
  },

  async changePassword(
    data: { currentPassword: string; newPassword: string },
    token: string,
  ): Promise<void> {
    return apiClient.post(API_ENDPOINTS.USER.CHANGE_PASSWORD, data, token);
  },

  async deleteAccount(token: string): Promise<void> {
    return apiClient.delete(API_ENDPOINTS.AUTH.DELETE_ACCOUNT, token);
  },

  async getUserPreferences(token: string): Promise<UserPreferences> {
    return apiClient.get<UserPreferences>(
      API_ENDPOINTS.USER.PREFERENCES,
      token,
    );
  },

  async updateUserPreferences(
    data: Partial<UserPreferences>,
    token: string,
  ): Promise<UserPreferences> {
    return apiClient.patch<UserPreferences>(
      API_ENDPOINTS.USER.PREFERENCES,
      data,
      token,
    );
  },
};
