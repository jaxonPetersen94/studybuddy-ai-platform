import express, { Request, Response } from 'express';
import userRoutes from './userRoutes';

const router = express.Router();

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    service: 'StudyBuddy User Service',
    status: 'running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// User-related routes
router.use('/api/v1/users', userRoutes);

// Catch-all for undefined routes
router.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    availableEndpoints: [
      'GET /health',
      'POST /api/v1/users/register',
      'POST /api/v1/users/login',
      'GET /api/v1/users/profile',
      'PUT /api/v1/users/profile',
      'DELETE /api/v1/users/profile',
    ],
  });
});

export default router;
