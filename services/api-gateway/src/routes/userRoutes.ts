import express, { Request, Response } from 'express';

const router = express.Router();
const USER_SERVICE_URL = `${process.env.USER_SERVICE_BASE_URL}/api/v1/users`;
const USER_SERVICE_CLIENT_URL = `${
  process.env.USER_SERVICE_CLIENT_URL || process.env.USER_SERVICE_BASE_URL
}/api/v1/users`;

async function forwardRequest(
  req: Request,
  res: Response,
  path: string,
  method: string,
) {
  try {
    const response = await fetch(`${USER_SERVICE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization
          ? { Authorization: req.headers.authorization }
          : {}),
      },
      body:
        method !== 'GET' && method !== 'DELETE'
          ? JSON.stringify(req.body)
          : null,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error(`Error forwarding request to user service: ${error}`);
    res.status(502).json({
      error: 'Bad Gateway',
      message: 'Failed to communicate with User Service',
    });
  }
}

/**
 * Auth Routes
 */
router.post('/register', (req, res) =>
  forwardRequest(req, res, '/register', 'POST'),
);
router.post('/login', (req, res) => forwardRequest(req, res, '/login', 'POST'));
router.post('/logout', (req, res) =>
  forwardRequest(req, res, '/logout', 'POST'),
);
router.post('/forgot-password', (req, res) =>
  forwardRequest(req, res, '/forgot-password', 'POST'),
);
router.post('/reset-password', (req, res) =>
  forwardRequest(req, res, '/reset-password', 'POST'),
);

/**
 * Profile Routes
 */
router.get('/profile', (req, res) =>
  forwardRequest(req, res, '/profile', 'GET'),
);
router.get('/preferences', (req, res) =>
  forwardRequest(req, res, '/preferences', 'GET'),
);
router.patch('/profile', (req, res) =>
  forwardRequest(req, res, '/profile', 'PATCH'),
);
router.patch('/preferences', (req, res) =>
  forwardRequest(req, res, '/preferences', 'PATCH'),
);
router.delete('/profile', (req, res) =>
  forwardRequest(req, res, '/profile', 'DELETE'),
);

/**
 * Notification Routes
 */
router.get('/notifications', (req, res) => {
  const queryString = new URLSearchParams(req.query as any).toString();
  const path = `/notifications${queryString ? `?${queryString}` : ''}`;
  forwardRequest(req, res, path, 'GET');
});
router.get('/notifications/unread-count', (req, res) =>
  forwardRequest(req, res, '/notifications/unread-count', 'GET'),
);
router.get('/notifications/:id', (req, res) =>
  forwardRequest(req, res, `/notifications/${req.params.id}`, 'GET'),
);
router.patch('/notifications/:id/read', (req, res) =>
  forwardRequest(req, res, `/notifications/${req.params.id}/read`, 'PATCH'),
);
router.patch('/notifications/read-multiple', (req, res) =>
  forwardRequest(req, res, '/notifications/read-multiple', 'PATCH'),
);
router.patch('/notifications/read-all', (req, res) =>
  forwardRequest(req, res, '/notifications/read-all', 'PATCH'),
);
router.delete('/notifications/:id', (req, res) =>
  forwardRequest(req, res, `/notifications/${req.params.id}`, 'DELETE'),
);
router.post('/notifications/delete-multiple', (req, res) =>
  forwardRequest(req, res, '/notifications/delete-multiple', 'POST'),
);
router.delete('/notifications/delete-all', (req, res) =>
  forwardRequest(req, res, '/notifications/delete-all', 'DELETE'),
);
router.get('/notifications/preferences', (req, res) =>
  forwardRequest(req, res, '/notifications/preferences', 'GET'),
);
router.patch('/notifications/preferences', (req, res) =>
  forwardRequest(req, res, '/notifications/preferences', 'PATCH'),
);
router.post('/notifications/test', (req, res) =>
  forwardRequest(req, res, '/notifications/test', 'POST'),
);

/**
 * OAuth Routes
 * These redirect the browser, so they need to use the CLIENT URL
 */
router.get('/auth/google', (_req, res) => {
  const userServiceAuthUrl = `${USER_SERVICE_CLIENT_URL}/auth/google`;
  res.redirect(userServiceAuthUrl);
});
router.get('/auth/github', (_req, res) => {
  const userServiceAuthUrl = `${USER_SERVICE_CLIENT_URL}/auth/github`;
  res.redirect(userServiceAuthUrl);
});

export default router;
