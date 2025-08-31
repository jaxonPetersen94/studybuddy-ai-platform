import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';
import { tokenUtils } from '../utils/tokens';
import type { AuthTokens, LoginData, RegisterData } from '../types/authTypes';
import { User } from '../types/userTypes';

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
            response.accessToken,
            response.refreshToken,
            response.expiresIn,
          );

          set({
            user: response.user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage = error.message || 'Login failed';
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authService.register(data);
          const tokens = tokenUtils.createTokens(
            response.accessToken,
            response.refreshToken,
            response.expiresIn,
          );

          set({
            user: response.user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage = error.message || 'Registration failed';
          set({
            error: errorMessage,
            isLoading: false,
          });
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
            response.accessToken,
            response.refreshToken,
            response.expiresIn,
          );

          set({ tokens: newTokens });

          // Update user data if provided in refresh response
          if (response.user) {
            set({ user: response.user });
          }
        } catch (error) {
          await get().logout();
        }
      },

      // Handle OAuth success callback
      handleOAuthSuccess: async (accessToken: string) => {
        set({ isLoading: true, error: null });

        try {
          // Get user profile using the OAuth access token
          const user = await authService.getCurrentUser(accessToken);

          // Create token structure - for OAuth, we only have access token initially
          // The backend should provide refresh token through a different endpoint if needed
          const tokens: AuthTokens = {
            accessToken,
            refreshToken: '',
            expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour from now
          };

          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });

          // Optionally, try to get refresh token through a separate API call
          // This depends on your backend implementation
          try {
            const refreshResponse = await authService.refreshToken(accessToken);
            const updatedTokens = tokenUtils.createTokens(
              refreshResponse.accessToken,
              refreshResponse.refreshToken,
              refreshResponse.expiresIn,
            );
            set({ tokens: updatedTokens });
          } catch (refreshError) {
            // If refresh token exchange fails, continue with access token only
            console.warn('Could not exchange for refresh token:', refreshError);
          }
        } catch (error: any) {
          const errorMessage = error.message || 'OAuth authentication failed';
          set({
            error: errorMessage,
            isLoading: false,
          });
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
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Profile update failed';
          set({
            error: errorMessage,
            isLoading: false,
          });
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
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Password change failed';
          set({
            error: errorMessage,
            isLoading: false,
          });
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
