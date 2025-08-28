import type { AuthTokens } from '../types/authTypes';

export const tokenUtils = {
  isExpired(tokens: AuthTokens | null): boolean {
    return !tokens || Date.now() >= tokens.expiresAt;
  },

  getAuthHeaders(tokens: AuthTokens | null): Record<string, string> {
    return tokens?.accessToken
      ? { Authorization: `Bearer ${tokens.accessToken}` }
      : {};
  },

  createTokens(
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
  ): AuthTokens {
    return {
      accessToken,
      refreshToken,
      expiresAt: Date.now() + expiresIn * 1000,
    };
  },
};
