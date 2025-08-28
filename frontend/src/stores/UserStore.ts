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
