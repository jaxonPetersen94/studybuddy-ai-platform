import { User, UserRole } from './userTypes';

// ============================================
// AUTHENTICATION REQUEST DATA
// ============================================

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RefreshTokenData {
  refreshToken: string;
}

// ============================================
// TOKEN INTERFACES
// ============================================

export interface AuthResponseTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// ============================================
// API RESPONSE INTERFACES
// ============================================

export interface AuthResponse {
  user: User;
  tokens: AuthResponseTokens;
  message?: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

// ============================================
// FORM DATA INTERFACES
// ============================================

export interface LoginFormData extends LoginData {
  rememberMe?: boolean;
}

export interface RegisterFormData extends RegisterData {
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface PasswordState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export type PasswordField = keyof PasswordState;

// ============================================
// STATE MANAGEMENT
// ============================================

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: AuthResponse }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_TOKEN_SUCCESS'; payload: AuthTokens }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'CLEAR_ERROR' };

// ============================================
// COMPONENT INTERFACES
// ============================================

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallback?: React.ComponentType;
}
