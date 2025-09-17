import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { PasswordReset } from '../entities/PasswordReset';
import { RefreshToken } from '../entities/RefreshToken';
import { User } from '../entities/User';
import {
  AuthTokens,
  CreateUserData,
  DecodedToken,
  LoginCredentials,
  OAuthProfile,
  UserProfileUpdateData,
  AuthErrorCodes,
} from '../types';

const JWT_SECRET = process.env.JWT_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN!;
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN!;

class AuthService {
  private userRepository = AppDataSource.getRepository(User);
  private refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
  private passwordResetRepository = AppDataSource.getRepository(PasswordReset);

  /**
   * Register a new user
   */
  async registerUser(
    userData: CreateUserData,
  ): Promise<{ user: User; tokens: AuthTokens; isNewUser: boolean }> {
    const { email, password, firstName, lastName } = userData;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      const error = new Error('User with this email already exists') as any;
      error.code = AuthErrorCodes.EMAIL_EXISTS;
      error.statusCode = 409;
      throw error;
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      authProvider: 'email',
      firstLogin: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedUser = await this.userRepository.save(user);

    // Registration is always for new users
    const isNewUser = true;

    // Mark first login as complete since registration automatically logs them in
    savedUser.firstLogin = false;
    savedUser.lastLoginAt = new Date();
    await this.userRepository.save(savedUser);

    // Generate tokens
    const tokens = await this.generateTokens(savedUser);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = savedUser;

    return {
      user: userWithoutPassword as User,
      tokens,
      isNewUser,
    };
  }

  /**
   * Login user with email and password
   */
  async loginUser(
    credentials: LoginCredentials,
  ): Promise<{ user: User; tokens: AuthTokens; isNewUser: boolean }> {
    const { email, password } = credentials;

    // Find user by email
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      const error = new Error('Invalid credentials') as any;
      error.code = AuthErrorCodes.INVALID_CREDENTIALS;
      error.statusCode = 401;
      throw error;
    }

    // Check if account is active
    if (!user.isActive) {
      const error = new Error('Account has been deactivated') as any;
      error.code = AuthErrorCodes.ACCOUNT_DEACTIVATED;
      error.statusCode = 403;
      throw error;
    }

    // Check if user has a password (OAuth users won't)
    if (!user.password) {
      const error = new Error(
        'This account uses OAuth login. Please use Google or GitHub to sign in.',
      ) as any;
      error.code = AuthErrorCodes.INVALID_CREDENTIALS;
      error.statusCode = 401;
      throw error;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error('Invalid credentials') as any;
      error.code = AuthErrorCodes.INVALID_CREDENTIALS;
      error.statusCode = 401;
      throw error;
    }

    // Check if this is the user's first login
    const isNewUser = user.firstLogin;

    // Update last login and mark first login as complete
    user.lastLoginAt = new Date();
    if (user.firstLogin) {
      user.firstLogin = false;
    }
    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as User,
      tokens,
      isNewUser,
    };
  }

  /**
   * Find or create user from OAuth profile
   */
  async findOrCreateUserFromOAuth(
    profile: OAuthProfile,
    provider: 'google' | 'github',
  ): Promise<User> {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      const error = new Error('No email provided by OAuth provider') as any;
      error.code = AuthErrorCodes.MISSING_EMAIL;
      error.statusCode = 400;
      throw error;
    }

    // Check if user exists with OAuth provider ID
    const providerIdField = provider === 'google' ? 'googleId' : 'githubId';
    let user = await this.userRepository.findOne({
      where: { [providerIdField]: profile.id },
    });

    if (user) {
      // Update last login
      user.lastLoginAt = new Date();
      await this.userRepository.save(user);
      return user;
    }

    // Check if user exists with same email (account linking)
    user = await this.userRepository.findOne({ where: { email } });

    if (user) {
      // Link OAuth account to existing user
      (user as any)[providerIdField] = profile.id;
      user.authProvider = provider;
      user.lastLoginAt = new Date();
      user.updatedAt = new Date();
      await this.userRepository.save(user);
      return user;
    }

    // Create new OAuth user
    const newUser = this.userRepository.create({
      email,
      [providerIdField]: profile.id,
      firstName:
        profile.name?.firstName || profile.displayName?.split(' ')[0] || '',
      lastName:
        profile.name?.lastName ||
        profile.displayName?.split(' ').slice(1).join(' ') ||
        '',
      authProvider: provider,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
    });

    return await this.userRepository.save(newUser);
  }

  /**
   * Handle complete OAuth flow
   */
  async authenticateWithOAuth(
    profile: OAuthProfile,
    provider: 'google' | 'github',
  ): Promise<{ user: User; tokens: AuthTokens }> {
    const user = await this.findOrCreateUserFromOAuth(profile, provider);

    if (!user.isActive) {
      const error = new Error('Account has been deactivated') as any;
      error.code = AuthErrorCodes.ACCOUNT_DEACTIVATED;
      error.statusCode = 403;
      throw error;
    }

    const tokens = await this.generateTokens(user);
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as User,
      tokens,
    };
  }

  /**
   * Handle OAuth success and generate response (public method)
   */
  async completeOAuthAuthentication(
    userId: string,
  ): Promise<{ user: User; tokens: AuthTokens }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      const error = new Error('User not found') as any;
      error.code = AuthErrorCodes.USER_NOT_FOUND;
      error.statusCode = 404;
      throw error;
    }

    if (!user.isActive) {
      const error = new Error('Account has been deactivated') as any;
      error.code = AuthErrorCodes.ACCOUNT_DEACTIVATED;
      error.statusCode = 403;
      throw error;
    }

    const isNewUser = user.firstLogin;

    user.lastLoginAt = new Date();
    user.firstLogin = false;

    await this.userRepository.save(user);

    const tokens = await this.generateTokens(user, { isFirstLogin: isNewUser });
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as User,
      tokens,
    };
  }

  /**
   * Verify user's password
   */
  async verifyUserPassword(userId: string, password: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      const error = new Error('User not found') as any;
      error.code = AuthErrorCodes.USER_NOT_FOUND;
      error.statusCode = 404;
      throw error;
    }

    // Check if user has a password (OAuth users won't)
    if (!user.password) {
      const error = new Error(
        'User does not have a password (OAuth account)',
      ) as any;
      error.code = AuthErrorCodes.PASSWORD_REQUIRED;
      error.statusCode = 400;
      throw error;
    }

    return bcrypt.compare(password, user.password);
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        REFRESH_TOKEN_SECRET,
      ) as DecodedToken;

      // Find refresh token in database
      const storedToken = await this.refreshTokenRepository.findOne({
        where: { token: refreshToken, userId: decoded.id },
        relations: ['user'],
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        const error = new Error('Invalid refresh token') as any;
        error.code = AuthErrorCodes.INVALID_REFRESH_TOKEN;
        error.statusCode = 401;
        throw error;
      }

      // Check if user still exists and is active
      if (!storedToken.user.isActive) {
        const error = new Error('User account is deactivated') as any;
        error.code = AuthErrorCodes.ACCOUNT_DEACTIVATED;
        error.statusCode = 403;
        throw error;
      }

      // Generate new tokens
      const tokens = await this.generateTokens(storedToken.user);

      // Remove old refresh token
      await this.refreshTokenRepository.remove(storedToken);

      return tokens;
    } catch (error: any) {
      if (error.code) {
        throw error;
      }
      const newError = new Error('Invalid refresh token') as any;
      newError.code = AuthErrorCodes.INVALID_REFRESH_TOKEN;
      newError.statusCode = 401;
      throw newError;
    }
  }

  /**
   * Logout user by invalidating refresh token
   */
  async logoutUser(refreshToken: string): Promise<void> {
    const storedToken = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
    });

    if (storedToken) {
      await this.refreshTokenRepository.remove(storedToken);
    }
  }

  /**
   * Logout user from all devices
   */
  async logoutAllDevices(userId: string): Promise<void> {
    await this.refreshTokenRepository.delete({ userId });
  }

  /**
   * Generate password reset token
   */
  async generatePasswordResetToken(email: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      const error = new Error('User not found') as any;
      error.code = AuthErrorCodes.USER_NOT_FOUND;
      error.statusCode = 404;
      throw error;
    }

    // Check if user has a password (OAuth users can't reset passwords)
    if (!user.password) {
      const error = new Error('Cannot reset password for OAuth account') as any;
      error.code = AuthErrorCodes.PASSWORD_REQUIRED;
      error.statusCode = 400;
      throw error;
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    // Remove any existing reset tokens for this user
    await this.passwordResetRepository.delete({ userId: user.id });

    // Create new reset token
    const passwordReset = this.passwordResetRepository.create({
      userId: user.id,
      token: resetToken,
      expiresAt,
      createdAt: new Date(),
    });

    await this.passwordResetRepository.save(passwordReset);

    return resetToken;
  }

  /**
   * Reset password using reset token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const passwordReset = await this.passwordResetRepository.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!passwordReset || passwordReset.expiresAt < new Date()) {
      const error = new Error('Invalid or expired reset token') as any;
      error.code = AuthErrorCodes.INVALID_RESET_TOKEN;
      error.statusCode = 400;
      throw error;
    }

    // Ensure user can have their password reset (not OAuth)
    if (
      !passwordReset.user.password &&
      passwordReset.user.authProvider !== 'email'
    ) {
      const error = new Error('Cannot reset password for OAuth account') as any;
      error.code = AuthErrorCodes.PASSWORD_REQUIRED;
      error.statusCode = 400;
      throw error;
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password
    passwordReset.user.password = hashedPassword;
    passwordReset.user.updatedAt = new Date();
    await this.userRepository.save(passwordReset.user);

    // Remove used reset token
    await this.passwordResetRepository.remove(passwordReset);

    // Logout user from all devices for security
    await this.logoutAllDevices(passwordReset.user.id);
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      const error = new Error('User not found') as any;
      error.code = AuthErrorCodes.USER_NOT_FOUND;
      error.statusCode = 404;
      throw error;
    }

    // Check if user has a password (OAuth users won't)
    if (!user.password) {
      const error = new Error(
        'Cannot change password for OAuth account',
      ) as any;
      error.code = AuthErrorCodes.PASSWORD_REQUIRED;
      error.statusCode = 400;
      throw error;
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      const error = new Error('Current password is incorrect') as any;
      error.code = AuthErrorCodes.INVALID_CURRENT_PASSWORD;
      error.statusCode = 400;
      throw error;
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    user.password = hashedPassword;
    user.updatedAt = new Date();
    await this.userRepository.save(user);

    // Logout from all other devices for security
    await this.logoutAllDevices(userId);
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      const error = new Error('User not found') as any;
      error.code = AuthErrorCodes.USER_NOT_FOUND;
      error.statusCode = 404;
      throw error;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    updateData: UserProfileUpdateData,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      const error = new Error('User not found') as any;
      error.code = AuthErrorCodes.USER_NOT_FOUND;
      error.statusCode = 404;
      throw error;
    }

    // Only update allowed fields
    Object.assign(user, updateData);
    user.updatedAt = new Date();

    const updatedUser = await this.userRepository.save(user);
    const { password: _, ...userWithoutPassword } = updatedUser;

    return userWithoutPassword as User;
  }

  /**
   * Deactivate user account
   */
  async deactivateAccount(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      const error = new Error('User not found') as any;
      error.code = AuthErrorCodes.USER_NOT_FOUND;
      error.statusCode = 404;
      throw error;
    }

    user.isActive = false;
    user.updatedAt = new Date();
    await this.userRepository.save(user);

    // Logout from all devices
    await this.logoutAllDevices(userId);
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token: string): Promise<DecodedToken> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

      // Check if user still exists and is active
      const user = await this.userRepository.findOne({
        where: { id: decoded.id },
      });
      if (!user || !user.isActive) {
        const error = new Error('Invalid token') as any;
        error.code = AuthErrorCodes.UNAUTHORIZED;
        error.statusCode = 401;
        throw error;
      }

      return decoded;
    } catch (error: any) {
      if (error.code) {
        throw error;
      }
      const newError = new Error('Invalid token') as any;
      newError.code = AuthErrorCodes.UNAUTHORIZED;
      newError.statusCode = 401;
      throw newError;
    }
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(
    user: User,
    additionalClaims?: any,
  ): Promise<AuthTokens> {
    const payload = {
      id: user.id,
      email: user.email,
      ...additionalClaims,
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    } as jwt.SignOptions);

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const refreshTokenEntity = this.refreshTokenRepository.create({
      userId: user.id,
      token: refreshToken,
      expiresAt,
      createdAt: new Date(),
    });

    await this.refreshTokenRepository.save(refreshTokenEntity);

    // Convert duration string to seconds
    const expiresInSeconds = this.parseJwtDurationToSeconds(JWT_EXPIRES_IN);

    return {
      accessToken,
      refreshToken,
      expiresIn: expiresInSeconds, // Now returns number of seconds
    };
  }

  /**
   * Convert JWT duration string to seconds
   */
  private parseJwtDurationToSeconds(duration: string): number {
    const match = duration.match(/^(\d+)([dhms])$/);
    if (!match) {
      throw new Error(`Invalid JWT duration format: ${duration}`);
    }

    const [, value, unit] = match;

    // Type guard: value and unit are guaranteed to exist due to the regex match above
    if (!value || !unit) {
      throw new Error(`Invalid JWT duration format: ${duration}`);
    }

    const num = parseInt(value, 10);

    if (isNaN(num)) {
      throw new Error(`Invalid numeric value in duration: ${value}`);
    }

    switch (unit) {
      case 'd':
        return num * 24 * 60 * 60;
      case 'h':
        return num * 60 * 60;
      case 'm':
        return num * 60;
      case 's':
        return num;
      default:
        throw new Error(`Unsupported duration unit: ${unit}`);
    }
  }

  /**
   * Clean up expired tokens (should be called periodically)
   */
  async cleanupExpiredTokens(): Promise<void> {
    const now = new Date();

    // Remove expired refresh tokens
    await this.refreshTokenRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now })
      .execute();

    // Remove expired password reset tokens
    await this.passwordResetRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now })
      .execute();
  }
}

export const authService = new AuthService();
