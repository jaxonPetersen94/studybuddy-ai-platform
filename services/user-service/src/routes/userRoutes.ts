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
import {
  deleteAllNotifications,
  deleteMultipleNotifications,
  deleteNotification,
  getNotification,
  getNotifications,
  getNotificationPreferences,
  getUnreadCount,
  markAllAsRead,
  markMultipleAsRead,
  markNotificationAsRead,
  sendTestNotification,
  updateNotificationPreferences,
} from '../controllers/notificationController';
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

// Notification routes (protected)
router.get('/notifications', authenticate, asyncHandler(getNotifications));
router.get(
  '/notifications/unread-count',
  authenticate,
  asyncHandler(getUnreadCount),
);
router.get(
  '/notifications/preferences',
  authenticate,
  asyncHandler(getNotificationPreferences),
);
router.patch(
  '/notifications/preferences',
  authenticate,
  asyncHandler(updateNotificationPreferences),
);
router.get('/notifications/:id', authenticate, asyncHandler(getNotification));
router.patch(
  '/notifications/:id/read',
  authenticate,
  asyncHandler(markNotificationAsRead),
);
router.patch(
  '/notifications/read-multiple',
  authenticate,
  asyncHandler(markMultipleAsRead),
);
router.patch(
  '/notifications/read-all',
  authenticate,
  asyncHandler(markAllAsRead),
);
router.delete(
  '/notifications/:id',
  authenticate,
  asyncHandler(deleteNotification),
);
router.post(
  '/notifications/delete-multiple',
  authenticate,
  asyncHandler(deleteMultipleNotifications),
);
router.delete(
  '/notifications/delete-all',
  authenticate,
  asyncHandler(deleteAllNotifications),
);
router.post(
  '/notifications/test',
  authenticate,
  asyncHandler(sendTestNotification),
);

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
