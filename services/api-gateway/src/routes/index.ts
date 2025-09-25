import express, { Request, Response } from 'express';
import userRoutes from './userRoutes';
import chatRoutes from './chatRoutes';

const router = express.Router();

// Health check for the gateway itself
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    service: 'StudyBuddy API Gateway',
    status: 'running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Gateway info endpoint
router.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Welcome to StudyBuddy API Gateway',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      users: '/api/v1/users/*',
      chats: '/api/v1/chats/*',
    },
    documentation: 'https://github.com/jaxonPetersen94/studybuddy-ai-platform',
  });
});

// User service routes
router.use('/api/v1/users', userRoutes);

// Chat service routes
router.use('/api/v1/chats', chatRoutes);

// Catch-all for undefined routes - using .use() without a path
router.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    availableEndpoints: [
      'GET /health',
      'POST /api/v1/users/register',
      'POST /api/v1/users/login',
      'POST /api/v1/users/logout',
      'GET /api/v1/users/profile',
      'PUT /api/v1/users/profile',
      'DELETE /api/v1/users/profile',
      'GET /api/v1/chats/sessions',
      'POST /api/v1/chats/sessions',
      'POST /api/v1/chats/messages',
      'POST /api/v1/chats/messages/stream',
      'GET /api/v1/chats/sessions/:sessionId/messages',
    ],
  });
});

export default router;
