import passport from 'passport';
import {
  Strategy as GoogleStrategy,
  Profile as GoogleProfile,
} from 'passport-google-oauth20';
import {
  Strategy as GitHubStrategy,
  Profile as GitHubProfile,
} from 'passport-github2';
import { authService } from '../services/authService';

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await authService.getUserProfile(id);
    done(null, user);
  } catch (error) {
    done(error, false);
  }
});

// Helper function to convert passport profiles to our OAuthProfile format
const convertToOAuthProfile = (profile: GoogleProfile | GitHubProfile) => {
  return {
    id: profile.id,
    emails: profile.emails || [{ value: '' }], // Provide fallback
    displayName: profile.displayName || '',
    name: {
      firstName: profile.name?.givenName || '', // Convert givenName to firstName
      lastName: profile.name?.familyName || '', // Convert familyName to lastName
    },
  };
};

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: '/api/v1/users/auth/google/callback',
    },
    async (
      _accessToken: string,
      _refreshToken: string | undefined,
      profile: GoogleProfile,
      done: (error: any, user?: any) => void,
    ) => {
      try {
        const oauthProfile = convertToOAuthProfile(profile);
        const result = await authService.authenticateWithOAuth(
          oauthProfile,
          'google',
        );
        return done(null, result.user);
      } catch (error) {
        return done(error as Error, false);
      }
    },
  ),
);

// GitHub OAuth Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: '/api/v1/users/auth/github/callback',
      scope: ['user:email'],
    },
    async (
      _accessToken: string,
      _refreshToken: string | undefined,
      profile: GitHubProfile,
      done: (error: any, user?: any) => void,
    ) => {
      try {
        const oauthProfile = convertToOAuthProfile(profile);
        const result = await authService.authenticateWithOAuth(
          oauthProfile,
          'github',
        );
        return done(null, result.user);
      } catch (error) {
        return done(error as Error, false);
      }
    },
  ),
);

export default passport;
