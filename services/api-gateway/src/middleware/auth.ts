import { Request, Response, NextFunction } from 'express';
import { AuthenticatedUser } from '../types';

const USER_SERVICE_URL = process.env.USER_SERVICE_BASE_URL;

export async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing authorization header',
      });
      return;
    }

    // Validate token with User-Service
    const response = await fetch(`${USER_SERVICE_URL}/api/v1/users/me`, {
      headers: {
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token',
      });
      return;
    }

    const userData = (await response.json()) as any;

    // Basic validation
    if (!userData.id || !userData.email) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid user data received',
      });
      return;
    }

    const user: AuthenticatedUser = userData as AuthenticatedUser;
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed',
    });
    return;
  }
}
