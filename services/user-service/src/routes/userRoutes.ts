import express from 'express';
import passport from 'passport';
import {
  deleteProfile,
  forgotPassword,
  getProfile,
  handleOAuthSuccess,
  login,
  logout,
  register,
  resetPassword,
  updateProfile,
} from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = express.Router();

// Public routes
router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/forgot-password', asyncHandler(forgotPassword));
router.post('/reset-password', asyncHandler(resetPassword));

// Protected routes
router.post('/logout', authenticate, asyncHandler(logout));
router.get('/profile', authenticate, asyncHandler(getProfile));
router.put('/profile', authenticate, asyncHandler(updateProfile));
router.delete('/profile', authenticate, asyncHandler(deleteProfile));

// OAuth routes
router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);
router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`,
  }),
  asyncHandler(handleOAuthSuccess),
);
router.get(
  '/auth/github',
  passport.authenticate('github', { scope: ['user:email'] }),
);
router.get(
  '/auth/github/callback',
  passport.authenticate('github', {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`,
  }),
  asyncHandler(handleOAuthSuccess),
);

export default router;
