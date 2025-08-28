import { Response } from 'express';
import { authService } from '../services/authService';
import { emailService } from '../services/emailService';
import {
  AuthenticatedRequest,
  AuthErrorCodes,
  CreateUserData,
  LoginCredentials,
  UserProfileUpdateData,
} from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { validateEmail, validatePassword } from '../utils/validationHandler';

/**
 * POST /register
 */
export const register = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
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

    res.status(201).json({
      message: 'User registered successfully',
      user: result.user,
      tokens: result.tokens,
    });
  },
);

/**
 * POST /login
 */
export const login = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
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
    });
  },
);

/**
 * POST /refresh
 */
export const refreshToken = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
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
export const logout = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await authService.logoutUser(refreshToken);
    }

    res.json({ message: 'Logout successful' });
  },
);

/**
 * POST /logout-all
 */
export const logoutAll = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw {
        message: 'Authentication required',
        code: AuthErrorCodes.UNAUTHORIZED,
        statusCode: 401,
      };
    }

    await authService.logoutAllDevices(req.user.id);

    res.json({ message: 'Logged out from all devices successfully' });
  },
);

/**
 * POST /forgot-password
 */
export const forgotPassword = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
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
  async (req: AuthenticatedRequest, res: Response) => {
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
  async (req: AuthenticatedRequest, res: Response) => {
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

    await authService.changePassword(req.user.id, currentPassword, newPassword);

    res.json({ message: 'Password changed successfully' });
  },
);

/**
 * GET /profile
 */
export const getProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw {
        message: 'Authentication required',
        code: AuthErrorCodes.UNAUTHORIZED,
        statusCode: 401,
      };
    }

    const user = await authService.getUserProfile(req.user.id);
    res.json({ user });
  },
);

/**
 * PUT /profile
 */
export const updateProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
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
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw {
        message: 'Authentication required',
        code: AuthErrorCodes.UNAUTHORIZED,
        statusCode: 401,
      };
    }

    const { password } = req.body;
    if (!password) {
      throw {
        message: 'Password confirmation is required to delete account',
        code: AuthErrorCodes.PASSWORD_REQUIRED,
        statusCode: 400,
      };
    }

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

    await authService.deactivateAccount(req.user.id);
    res.json({ message: 'Account has been deactivated successfully' });
  },
);
