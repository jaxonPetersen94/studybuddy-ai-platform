export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface CreateOAuthUserData {
  email: string;
  firstName: string;
  lastName: string;
  googleId?: string;
  githubId?: string;
  authProvider: 'google' | 'github';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface DecodedToken {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
}

export interface UserProfileUpdateData {
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
}

export interface OAuthProfile {
  id: string;
  emails: { value: string }[];
  displayName: string;
  name?: {
    firstName?: string;
    lastName?: string;
  };
}
