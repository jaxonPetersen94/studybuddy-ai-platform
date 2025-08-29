import express from 'express';
import {
  register,
  login,
  forgotPassword,
  getProfile,
  updateProfile,
  deleteProfile,
  resetPassword,
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
router.get('/profile', authenticate, asyncHandler(getProfile));
router.put('/profile', authenticate, asyncHandler(updateProfile));
router.delete('/profile', authenticate, asyncHandler(deleteProfile));

export default router;
