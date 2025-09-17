import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { authService } from '../services/authService';

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// Define expected JWT payload structure
interface UserJwtPayload extends JwtPayload {
  id: string;
  email: string;
  role?: string;
  permissions?: string[];
}

// Type guard to check if decoded token has required user fields
const isUserPayload = (payload: any): payload is UserJwtPayload => {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    typeof payload.id === 'string' &&
    typeof payload.email === 'string'
  );
};

/**
 * Extract token from various sources (header, cookie, query)
 */
const extractToken = (req: Request): string | null => {
  // Check Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookies (for web applications)
  if (req.cookies && req.cookies.accessToken) {
    return req.cookies.accessToken;
  }

  // Check query parameter (less secure, use sparingly)
  if (req.query['token'] && typeof req.query['token'] === 'string') {
    return req.query['token'];
  }

  return null;
};

/**
 * Enhanced authentication middleware with database validation
 * This is the primary authentication middleware for most routes
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      res.status(401).json({
        error: 'Authorization token missing',
        code: 'MISSING_TOKEN',
      });
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!isUserPayload(decoded)) {
      res.status(401).json({
        error: 'Invalid token payload',
        code: 'INVALID_PAYLOAD',
      });
      return;
    }

    // Additional database validation to ensure user still exists and is active
    try {
      const user = await authService.getUserProfile(decoded.id);

      // Check if user account is active
      if (!user.isActive) {
        res.status(401).json({
          error: 'User account is not active',
          code: 'USER_INACTIVE',
        });
        return;
      }

      // Override role/permissions from token if they exist
      if (decoded.role && decoded.role !== user.role) {
        user.role = decoded.role;
      }
      if (decoded.permissions && decoded.permissions !== user.permissions) {
        user.permissions = decoded.permissions;
      }

      req.user = user;
      next();
    } catch (dbError) {
      console.error('User validation failed:', dbError);
      res.status(401).json({
        error: 'User account not found or inactive',
        code: 'USER_NOT_FOUND',
      });
    }
  } catch (err) {
    console.error('JWT verification failed:', err);

    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        error: 'Token has expired',
        code: 'TOKEN_EXPIRED',
      });
    } else if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        error: 'Invalid token',
        code: 'INVALID_TOKEN',
      });
    } else {
      res.status(401).json({
        error: 'Authentication failed',
        code: 'AUTH_FAILED',
      });
    }
  }
};

/**
 * Lightweight authentication for high-performance routes
 * Skips database validation - use only when performance is critical
 */
export const authenticateFast = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const token = extractToken(req);

    if (!token) {
      res.status(401).json({
        error: 'Authorization token missing',
        code: 'MISSING_TOKEN',
      });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (isUserPayload(decoded)) {
      // For fast auth, create a minimal User-like object
      // Note: This won't have all User entity methods/getters
      const minimalUser = Object.assign(
        Object.create(Object.getPrototypeOf({})),
        {
          id: decoded.id,
          email: decoded.email,
          firstName: '',
          lastName: '',
          isActive: true,
          authProvider: 'email',
          createdAt: new Date(),
          updatedAt: new Date(),
          refreshTokens: [],
          passwordResets: [],
          role: decoded.role || 'user',
          permissions: decoded.permissions || [],
          password: undefined, // Add password property to match User entity
          // Add the getter methods manually
          get fullName() {
            return `${this.firstName} ${this.lastName}`.trim();
          },
          toJSON() {
            const { password, ...userWithoutPassword } = this;
            return userWithoutPassword;
          },
        },
      );

      req.user = minimalUser;
      next();
    } else {
      res.status(401).json({
        error: 'Invalid token payload',
        code: 'INVALID_PAYLOAD',
      });
    }
  } catch (err) {
    console.error('JWT verification failed:', err);

    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        error: 'Token has expired',
        code: 'TOKEN_EXPIRED',
      });
    } else {
      res.status(401).json({
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN',
      });
    }
  }
};

/**
 * Optional authentication middleware
 * Adds user info if token is valid, but continues without authentication if no token
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);

        if (isUserPayload(decoded)) {
          // Try to get fresh user data, but don't fail if unavailable
          try {
            const user = await authService.getUserProfile(decoded.id);

            // Override role/permissions from token if they exist
            if (decoded.role && decoded.role !== user.role) {
              user.role = decoded.role;
            }
            if (
              decoded.permissions &&
              decoded.permissions !== user.permissions
            ) {
              user.permissions = decoded.permissions;
            }

            req.user = user;
          } catch {
            // Fall back to minimal token data if database lookup fails
            const minimalUser = Object.assign(
              Object.create(Object.getPrototypeOf({})),
              {
                id: decoded.id,
                email: decoded.email,
                firstName: '',
                lastName: '',
                isActive: true,
                authProvider: 'email',
                createdAt: new Date(),
                updatedAt: new Date(),
                refreshTokens: [],
                passwordResets: [],
                role: decoded.role || 'user',
                permissions: decoded.permissions || [],
                password: undefined, // Add password property to match User entity
                // Add the getter methods manually
                get fullName() {
                  return `${this.firstName} ${this.lastName}`.trim();
                },
                toJSON() {
                  const { password, ...userWithoutPassword } = this;
                  return userWithoutPassword;
                },
              },
            );

            req.user = minimalUser;
          }
        }
      } catch (error) {
        // Token invalid, but we continue without user info
        console.warn('Optional auth failed:', error);
      }
    }

    next();
  } catch (error) {
    // Continue without authentication on any error
    next();
  }
};

/**
 * Role-based authorization middleware
 */
export const requireRole = (requiredRoles: string | string[]) => {
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    if (!req.user.role || !roles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: roles,
        current: req.user.role,
      });
      return;
    }

    next();
  };
};

/**
 * Permission-based authorization middleware
 */
export const requirePermission = (requiredPermissions: string | string[]) => {
  const permissions = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions];

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    const userPermissions = req.user.permissions || [];
    const hasPermission = permissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      res.status(403).json({
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: permissions,
        current: userPermissions,
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to ensure user can only access their own resources
 */
export const requireOwnership = (userIdParam: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    const resourceUserId = req.params[userIdParam] || req.body[userIdParam];

    if (req.user.id !== resourceUserId) {
      res.status(403).json({
        error: 'Access denied - can only access your own resources',
        code: 'OWNERSHIP_REQUIRED',
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to validate request body for auth endpoints
 */
export const validateAuthRequest = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missingFields = requiredFields.filter((field) => {
      const value = req.body[field];
      return !value || (typeof value === 'string' && value.trim() === '');
    });

    if (missingFields.length > 0) {
      res.status(400).json({
        error: `Missing required fields: ${missingFields.join(', ')}`,
        code: 'MISSING_FIELDS',
        missingFields,
      });
      return;
    }

    // Additional validation for email format
    if (requiredFields.includes('email') && req.body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(req.body.email)) {
        res.status(400).json({
          error: 'Invalid email format',
          code: 'INVALID_EMAIL',
        });
        return;
      }
    }

    // Additional validation for password strength
    if (requiredFields.includes('password') && req.body.password) {
      const password = req.body.password;
      if (password.length < 8) {
        res.status(400).json({
          error: 'Password must be at least 8 characters long',
          code: 'WEAK_PASSWORD',
        });
        return;
      }
    }

    next();
  };
};

/**
 * Enhanced security headers middleware
 */
export const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Basic security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self'; frame-ancestors 'none';",
  );

  // Remove potentially revealing headers
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');

  // HSTS for production with HTTPS
  if (process.env.NODE_ENV === 'production' && req.secure) {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload',
    );
  }

  next();
};

/**
 * Middleware to refresh access token if it's about to expire
 */
export const refreshTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (token && REFRESH_TOKEN_SECRET) {
      const decoded = jwt.decode(token) as JwtPayload;

      if (decoded && decoded.exp) {
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = decoded.exp - now;

        // If token expires in less than 5 minutes, try to refresh
        if (timeUntilExpiry < 300 && timeUntilExpiry > 0) {
          try {
            const refreshToken = req.cookies?.refreshToken;
            if (refreshToken) {
              const newTokens = await authService.refreshAccessToken(
                refreshToken,
              );

              // Set new tokens in response headers/cookies
              res.setHeader('X-New-Access-Token', newTokens.accessToken);
              if (req.cookies) {
                res.cookie('accessToken', newTokens.accessToken, {
                  httpOnly: true,
                  secure: process.env.NODE_ENV === 'production',
                  sameSite: 'strict',
                  maxAge: 15 * 60 * 1000, // 15 minutes
                });

                if (newTokens.refreshToken) {
                  res.cookie('refreshToken', newTokens.refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                  });
                }
              }
            }
          } catch (error) {
            // Refresh failed, but continue with existing token
            console.warn('Token refresh failed:', error);
          }
        }
      }
    }

    next();
  } catch (error) {
    // Don't fail the request on refresh errors
    console.warn('Token refresh middleware error:', error);
    next();
  }
};
