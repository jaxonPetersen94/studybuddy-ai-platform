import express, { Request, Response } from 'express';

const router = express.Router();
const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL || 'http://localhost:5001/api/v1/users';

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
 * Routes (forwarded to User Service)
 */
router.post('/register', (req, res) =>
  forwardRequest(req, res, '/register', 'POST'),
);
router.post('/login', (req, res) => forwardRequest(req, res, '/login', 'POST'));
router.post('/forgot-password', (req, res) =>
  forwardRequest(req, res, '/forgot-password', 'POST'),
);
router.get('/profile', (req, res) =>
  forwardRequest(req, res, '/profile', 'GET'),
);
router.put('/profile', (req, res) =>
  forwardRequest(req, res, '/profile', 'PUT'),
);
router.delete('/profile', (req, res) =>
  forwardRequest(req, res, '/profile', 'DELETE'),
);

export default router;
