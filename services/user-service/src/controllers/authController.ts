import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { emailService } from '../services/emailService';
import { notificationService } from '../services/notificationService';
import {
  AuthErrorCodes,
  CreateUserData,
  LoginCredentials,
  UserProfileUpdateData,
} from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { validateEmail, validatePassword } from '../utils/validationHandler';
import { UserPreferences } from '../entities/UserPreferences';

/**
 * POST /register
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName }: CreateUserData = req.body;

  if (!email || !password) {
    throw {
      message: 'Email and password are required',
      code: AuthErrorCodes.MISSING_FIELDS,
      statusCode: 400,
    };
  }

  if (!validateEmail(email)) {
    throw {
      message: 'Please provide a valid email address',
      code: AuthErrorCodes.INVALID_EMAIL,
      statusCode: 400,
    };
  }

  if (!validatePassword(password)) {
    throw {
      message:
        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number',
      code: AuthErrorCodes.INVALID_PASSWORD,
      statusCode: 400,
    };
  }

  const result = await authService.registerUser({
    email,
    password,
    firstName,
    lastName,
  });

  await notificationService.createWelcomeNotification(result.user.id);

  res.status(201).json({
    message: 'User registered successfully',
    user: result.user,
    tokens: result.tokens,
    isNewUser: result.isNewUser,
  });
});

/**
 * POST /login
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password }: LoginCredentials = req.body;

  if (!email || !password) {
    throw {
      message: 'Email and password are required',
      code: AuthErrorCodes.MISSING_FIELDS,
      statusCode: 400,
    };
  }

  const result = await authService.loginUser({ email, password });

  res.json({
    message: 'Login successful',
    user: result.user,
    tokens: result.tokens,
    isNewUser: result.isNewUser,
  });
});

/**
 * OAuth Success Handler
 */
export const handleOAuthSuccess = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw {
        message: 'OAuth authentication failed',
        code: AuthErrorCodes.UNAUTHORIZED,
        statusCode: 401,
      };
    }

    const result = await authService.completeOAuthAuthentication(req.user.id);

    res.redirect(
      `${process.env.FRONTEND_URL}/?oauth=success&token=${result.tokens.accessToken}`,
    );
  },
);

/**
 * POST /refresh
 */
export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw {
        message: 'Refresh token is required',
        code: AuthErrorCodes.MISSING_REFRESH_TOKEN,
        statusCode: 400,
      };
    }

    const tokens = await authService.refreshAccessToken(refreshToken);

    res.json({
      message: 'Token refreshed successfully',
      tokens,
    });
  },
);

/**
 * POST /logout
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  // If we have a refresh token, logout from this specific device
  if (refreshToken) {
    await authService.logoutUser(refreshToken);
  }

  // Always return success, even if no refresh token was provided
  // This prevents information leakage about valid tokens
  res.json({ message: 'Logout successful' });
});

/**
 * POST /logout-all
 */
export const logoutAll = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw {
      message: 'Authentication required',
      code: AuthErrorCodes.UNAUTHORIZED,
      statusCode: 401,
    };
  }

  await authService.logoutAllDevices(req.user.id);

  res.json({ message: 'Logged out from all devices successfully' });
});

/**
 * POST /forgot-password
 */
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      throw {
        message: 'Email is required',
        code: AuthErrorCodes.MISSING_EMAIL,
        statusCode: 400,
      };
    }

    if (!validateEmail(email)) {
      throw {
        message: 'Please provide a valid email address',
        code: AuthErrorCodes.INVALID_EMAIL,
        statusCode: 400,
      };
    }

    const user = await authService.findUserByEmail(email);
    if (!user) {
      // Even if user doesn't exist, return success to prevent email enumeration (dictionary attack)
      res.json({
        message: 'Password reset instructions sent to your email',
      });
      return;
    }

    // Check if user has a password (OAuth users can't reset passwords)
    if (!user.password || user.authProvider !== 'email') {
      res.json({
        message: 'Password reset instructions sent to your email',
      });
      return;
    }

    const resetToken = await authService.generatePasswordResetToken(email);

    await emailService.sendPasswordResetEmail(
      email,
      user.firstName,
      resetToken,
    );

    res.json({ message: 'Password reset instructions sent to your email' });
  },
);

/**
 * POST /reset-password
 */
export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      throw {
        message: 'Reset token and new password are required',
        code: AuthErrorCodes.MISSING_FIELDS,
        statusCode: 400,
      };
    }

    if (!validatePassword(newPassword)) {
      throw {
        message:
          'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number',
        code: AuthErrorCodes.INVALID_PASSWORD,
        statusCode: 400,
      };
    }

    await authService.resetPassword(token, newPassword);

    res.json({ message: 'Password reset successfully' });
  },
);

/**
 * POST /change-password
 */
export const changePassword = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw {
        message: 'Authentication required',
        code: AuthErrorCodes.UNAUTHORIZED,
        statusCode: 401,
      };
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw {
        message: 'Current password and new password are required',
        code: AuthErrorCodes.MISSING_FIELDS,
        statusCode: 400,
      };
    }

    if (!validatePassword(newPassword)) {
      throw {
        message:
          'New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number',
        code: AuthErrorCodes.INVALID_PASSWORD,
        statusCode: 400,
      };
    }

    // Check if user is OAuth user (handled in service, but provide better error message here)
    try {
      await authService.changePassword(
        req.user.id,
        currentPassword,
        newPassword,
      );
      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Cannot change password for OAuth account'
      ) {
        throw {
          message:
            'Password cannot be changed for OAuth accounts. Please manage your password through your OAuth provider.',
          code: AuthErrorCodes.INVALID_PASSWORD,
          statusCode: 400,
        };
      }
      throw error;
    }
  },
);

/**
 * GET /profile
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw {
      message: 'Authentication required',
      code: AuthErrorCodes.UNAUTHORIZED,
      statusCode: 401,
    };
  }

  const user = await authService.getUserProfile(req.user.id);
  res.json(user);
});

/**
 * PATCH /profile
 */
export const updateProfile = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw {
        message: 'Authentication required',
        code: AuthErrorCodes.UNAUTHORIZED,
        statusCode: 401,
      };
    }

    const { firstName, lastName, profilePicture }: UserProfileUpdateData =
      req.body;

    const updateData: UserProfileUpdateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (profilePicture !== undefined)
      updateData.profilePicture = profilePicture;

    if (Object.keys(updateData).length === 0) {
      throw {
        message: 'No valid fields to update',
        code: AuthErrorCodes.NO_UPDATE_FIELDS,
        statusCode: 400,
      };
    }

    const updatedUser = await authService.updateUserProfile(
      req.user.id,
      updateData,
    );
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  },
);

/**
 * DELETE /profile
 */
export const deleteProfile = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw {
        message: 'Authentication required',
        code: AuthErrorCodes.UNAUTHORIZED,
        statusCode: 401,
      };
    }

    // Get user details to check auth provider
    const user = await authService.getUserProfile(req.user.id);

    // For OAuth users, skip password verification
    if (user.authProvider !== 'email') {
      await authService.deactivateAccount(req.user.id);
      res.json({ message: 'Account has been deactivated successfully' });
      return;
    }

    // For email users, require password confirmation
    const { password } = req.body;
    if (!password) {
      throw {
        message: 'Password confirmation is required to delete account',
        code: AuthErrorCodes.PASSWORD_REQUIRED,
        statusCode: 400,
      };
    }

    try {
      const isValidPassword = await authService.verifyUserPassword(
        req.user.id,
        password,
      );
      if (!isValidPassword) {
        throw {
          message: 'Invalid password',
          code: AuthErrorCodes.INVALID_PASSWORD,
          statusCode: 401,
        };
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'User does not have a password (OAuth account)'
      ) {
        // This shouldn't happen due to the check above, but handle it gracefully
        await authService.deactivateAccount(req.user.id);
        res.json({ message: 'Account has been deactivated successfully' });
        return;
      }
      throw error;
    }

    await authService.deactivateAccount(req.user.id);
    res.json({ message: 'Account has been deactivated successfully' });
  },
);

/**
 * GET /preferences
 */
export const getPreferences = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw {
        message: 'Authentication required',
        code: AuthErrorCodes.UNAUTHORIZED,
        statusCode: 401,
      };
    }

    const preferences = await authService.getUserPreferences(req.user.id);
    res.json(preferences);
  },
);

/**
 * PATCH /preferences
 */
export const updatePreferences = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw {
        message: 'Authentication required',
        code: AuthErrorCodes.UNAUTHORIZED,
        statusCode: 401,
      };
    }

    const { appearance, timezone, location, learningLevel, bio, studyGoal } =
      req.body;

    const updateData: Partial<UserPreferences> = {};
    if (appearance !== undefined) updateData.appearance = appearance;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (location !== undefined) updateData.location = location;
    if (learningLevel !== undefined) updateData.learningLevel = learningLevel;
    if (bio !== undefined) updateData.bio = bio;
    if (studyGoal !== undefined) updateData.studyGoal = studyGoal;

    if (Object.keys(updateData).length === 0) {
      throw {
        message: 'No valid fields to update',
        code: AuthErrorCodes.NO_UPDATE_FIELDS,
        statusCode: 400,
      };
    }

    const updatedPreferences = await authService.updateUserPreferences(
      req.user.id,
      updateData,
    );

    res.json({
      message: 'Preferences updated successfully',
      preferences: updatedPreferences,
    });
  },
);
