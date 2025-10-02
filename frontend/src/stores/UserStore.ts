import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';
import { tokenUtils } from '../utils/tokens';
import type { AuthTokens, LoginData, RegisterData } from '../types/authTypes';
import { User } from '../types/userTypes';
import { jwtDecode } from 'jwt-decode';

interface UserStore {
  // Core authentication state
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;

  // Loading states
  isLoading: boolean;
  isLoggingOut: boolean;

  // Error state
  error: string | null;

  // Authentication actions
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  handleOAuthSuccess: (accessToken: string) => Promise<void>;

  // Profile management actions
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;

  // State management utilities
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Authentication utilities
  getAuthHeaders: () => Record<string, string>;
  isTokenExpired: () => boolean;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      isLoggingOut: false,
      error: null,

      // Authentication actions
      login: async (data: LoginData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authService.login(data);

          const tokens = tokenUtils.createTokens(
            response.tokens.accessToken,
            response.tokens.refreshToken,
            response.tokens.expiresIn,
          );

          set({
            user: response.user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });

          // Determine message based on firstLogin property
          const message = response.user.firstLogin
            ? `Welcome to StudyBuddy, ${response.user.firstName || 'User'}!`
            : `Welcome back, ${response.user.firstName || 'User'}!`;
          const title = response.user.firstLogin
            ? 'Account Created'
            : 'Login Successful';

          // Show success toast
          const { useToastStore } = await import('../stores/ToastStore');
          useToastStore.getState().success(message, { title });
        } catch (error: any) {
          const errorMessage = error.message || 'Login failed';
          set({
            error: errorMessage,
            isLoading: false,
          });

          // Show error toast
          const { useToastStore } = await import('../stores/ToastStore');
          useToastStore
            .getState()
            .error(errorMessage, { title: 'Login Failed' });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authService.register(data);

          const tokens = tokenUtils.createTokens(
            response.tokens.accessToken,
            response.tokens.refreshToken,
            response.tokens.expiresIn,
          );

          set({
            user: response.user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });

          // Registration is always a new user, so always show welcome message
          const { useToastStore } = await import('../stores/ToastStore');
          useToastStore
            .getState()
            .success(
              `Welcome to StudyBuddy, ${response.user.firstName || 'User'}!`,
              { title: 'Account Created' },
            );
        } catch (error: any) {
          const errorMessage = error.message || 'Registration failed';
          set({
            error: errorMessage,
            isLoading: false,
          });

          // Show error toast
          const { useToastStore } = await import('../stores/ToastStore');
          useToastStore
            .getState()
            .error(errorMessage, { title: 'Registration Failed' });
          throw error;
        }
      },

      logout: async () => {
        const { tokens } = get();
        set({ isLoggingOut: true });

        try {
          if (tokens?.accessToken) {
            await authService.logout(tokens.accessToken);
          }

          // Clear any existing toasts before showing logout message
          const { useToastStore } = await import('../stores/ToastStore');
          const toastStore = useToastStore.getState();
          toastStore.clearAll();

          // Show logout success toast
          toastStore.info('You have been logged out successfully', {
            title: 'Logged Out',
          });
        } catch (error) {
          console.warn('Logout API call failed:', error);
        } finally {
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoggingOut: false,
            error: null,
          });
        }
      },

      refreshAuth: async () => {
        const { tokens } = get();

        if (!tokens?.refreshToken) {
          await get().logout();
          return;
        }

        try {
          const response = await authService.refreshToken(tokens.refreshToken);
          const newTokens = tokenUtils.createTokens(
            response.tokens.accessToken,
            response.tokens.refreshToken,
            response.tokens.expiresIn,
          );

          set({ tokens: newTokens });

          // Update user data if provided in refresh response
          if (response.user) {
            set({ user: response.user });
          }
        } catch (error) {
          // Show session expired toast
          const { useToastStore } = await import('../stores/ToastStore');
          useToastStore
            .getState()
            .warning('Your session has expired. Please log in again.', {
              title: 'Session Expired',
            });
          await get().logout();
        }
      },

      // Handle OAuth success callback
      handleOAuthSuccess: async (accessToken: string) => {
        set({ isLoading: true, error: null });

        try {
          // Decode JWT to get isFirstLogin
          const decodedToken = jwtDecode<{ isFirstLogin?: boolean }>(
            accessToken,
          );
          const isFirstLogin = decodedToken.isFirstLogin || false;

          // Get user profile from backend
          const user = await authService.getCurrentUser(accessToken);

          const tokens: AuthTokens = {
            accessToken,
            refreshToken: '',
            expiresAt: Date.now() + 60 * 60 * 1000,
          };

          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });

          // Use isFirstLogin from JWT token instead of user object
          const message = isFirstLogin
            ? `Welcome to StudyBuddy, ${user.firstName || 'User'}!`
            : `Welcome back, ${user.firstName || 'User'}!`;
          const title = isFirstLogin ? 'Account Created' : 'Welcome Back';

          const { useToastStore } = await import('../stores/ToastStore');
          useToastStore.getState().success(message, { title, duration: 4000 });
        } catch (error: any) {
          const errorMessage = error.message || 'OAuth authentication failed';
          set({ error: errorMessage, isLoading: false });

          const { useToastStore } = await import('../stores/ToastStore');
          useToastStore
            .getState()
            .error(errorMessage, { title: 'OAuth Login Failed' });
          throw error;
        }
      },

      // Profile management actions
      updateProfile: async (data: Partial<User>) => {
        const { tokens } = get();
        if (!tokens?.accessToken) throw new Error('Not authenticated');

        set({ isLoading: true, error: null });

        try {
          const updatedUser = await authService.updateProfile(
            data,
            tokens.accessToken,
          );
          set({
            user: updatedUser,
            isLoading: false,
          });

          // Show profile update success toast
          const { useToastStore } = await import('../stores/ToastStore');
          useToastStore
            .getState()
            .success('Your profile has been updated successfully', {
              title: 'Profile Updated',
            });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Profile update failed';
          set({
            error: errorMessage,
            isLoading: false,
          });

          // Show profile update error toast
          const { useToastStore } = await import('../stores/ToastStore');
          useToastStore
            .getState()
            .error(errorMessage, { title: 'Profile Update Failed' });
          throw error;
        }
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        const { tokens } = get();
        if (!tokens?.accessToken) throw new Error('Not authenticated');

        set({ isLoading: true, error: null });

        try {
          await authService.changePassword(
            { currentPassword, newPassword },
            tokens.accessToken,
          );
          set({ isLoading: false });

          // Show password change success toast
          const { useToastStore } = await import('../stores/ToastStore');
          useToastStore
            .getState()
            .success('Your password has been changed successfully', {
              title: 'Password Updated',
            });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Password change failed';
          set({
            error: errorMessage,
            isLoading: false,
          });

          // Show password change error toast
          const { useToastStore } = await import('../stores/ToastStore');
          useToastStore
            .getState()
            .error(errorMessage, { title: 'Password Change Failed' });
          throw error;
        }
      },

      // State management utilities
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),

      // Authentication utilities
      getAuthHeaders: () => tokenUtils.getAuthHeaders(get().tokens),
      isTokenExpired: () => tokenUtils.isExpired(get().tokens),
    }),
    {
      name: 'StudyBuddy-User-Store',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
