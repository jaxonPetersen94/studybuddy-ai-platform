import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number;
  maxAttempts: number;
  message?: string;
  code?: string;
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
    firstAttempt: number;
  };
}

const memoryStore: RateLimitStore = {};

/**
 * Clean up expired entries from memory store
 */
const cleanupMemoryStore = (): void => {
  const now = Date.now();
  Object.keys(memoryStore).forEach((key) => {
    const entry = memoryStore[key];
    if (entry && entry.resetTime < now) {
      delete memoryStore[key];
    }
  });
};

/**
 * Get rate limit data from memory
 */
const getRateLimitData = async (
  key: string,
): Promise<{
  count: number;
  resetTime: number;
  firstAttempt: number;
} | null> => {
  return memoryStore[key] || null;
};

/**
 * Set rate limit data in memory
 */
const setRateLimitData = async (
  key: string,
  data: { count: number; resetTime: number; firstAttempt: number },
): Promise<void> => {
  memoryStore[key] = data;
};

/**
 * Default key generator using IP address
 */
const defaultKeyGenerator = (req: Request): string => {
  return req.ip || req.socket.remoteAddress || 'unknown';
};

/**
 * Enhanced rate limiting middleware
 */
export const createRateLimit = (options: RateLimitOptions) => {
  const {
    windowMs,
    maxAttempts,
    message = 'Too many requests',
    code = 'RATE_LIMIT_EXCEEDED',
    keyGenerator = defaultKeyGenerator,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  // Clean up memory store periodically
  setInterval(cleanupMemoryStore, 60000); // Clean every minute

  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const key = `rate_limit:${keyGenerator(req)}`;
      const now = Date.now();

      let rateLimitData = await getRateLimitData(key);

      // Initialize or reset if window expired
      if (!rateLimitData || rateLimitData.resetTime < now) {
        rateLimitData = {
          count: 0,
          resetTime: now + windowMs,
          firstAttempt: now,
        };
      }

      // Check if limit exceeded
      if (rateLimitData.count >= maxAttempts) {
        const remainingTime = Math.ceil((rateLimitData.resetTime - now) / 1000);

        res.status(429).json({
          error: message,
          code,
          retryAfter: remainingTime,
          limit: maxAttempts,
          remaining: 0,
          resetTime: new Date(rateLimitData.resetTime).toISOString(),
        });
        return;
      }

      // Store original end method to intercept response
      const originalEnd = res.end;
      let responseIntercepted = false;

      res.end = function (this: Response, ...args: any[]): Response {
        if (!responseIntercepted) {
          responseIntercepted = true;

          const shouldCount = !(
            (skipSuccessfulRequests && res.statusCode < 400) ||
            (skipFailedRequests && res.statusCode >= 400)
          );

          if (shouldCount) {
            rateLimitData!.count++;
            setRateLimitData(key, rateLimitData!).catch(console.error);
          }
        }

        return originalEnd.apply(this, args as any);
      };

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', maxAttempts);
      res.setHeader(
        'X-RateLimit-Remaining',
        Math.max(0, maxAttempts - rateLimitData.count - 1),
      );
      res.setHeader(
        'X-RateLimit-Reset',
        new Date(rateLimitData.resetTime).toISOString(),
      );

      next();
    } catch (error) {
      console.error('Rate limiting error:', error);
      next();
    }
  };
};

/**
 * Key generators
 */
export const userKeyGenerator = (req: Request): string => {
  const userId = (req as any).user?.id;
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  return userId ? `user:${userId}` : `ip:${ip}`;
};

export const emailKeyGenerator = (req: Request): string => {
  const email = req.body?.email;
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  return email ? `email:${email}` : `ip:${ip}`;
};

/**
 * Predefined rate limiters
 */
export const loginRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,
  maxAttempts: 5,
  message: 'Too many login attempts',
  code: 'LOGIN_RATE_LIMIT_EXCEEDED',
  keyGenerator: emailKeyGenerator,
  skipSuccessfulRequests: true,
});

export const registerRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000,
  maxAttempts: 3,
  message: 'Too many registration attempts',
  code: 'REGISTER_RATE_LIMIT_EXCEEDED',
  keyGenerator: emailKeyGenerator,
});

export const passwordResetRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000,
  maxAttempts: 3,
  message: 'Too many password reset attempts',
  code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
  keyGenerator: emailKeyGenerator,
});

export const profileUpdateRateLimit = createRateLimit({
  windowMs: 5 * 60 * 1000,
  maxAttempts: 10,
  message: 'Too many profile update attempts',
  code: 'PROFILE_UPDATE_RATE_LIMIT_EXCEEDED',
  keyGenerator: userKeyGenerator,
});

export const apiRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,
  maxAttempts: 1000,
  message: 'API rate limit exceeded',
  code: 'API_RATE_LIMIT_EXCEEDED',
  keyGenerator: userKeyGenerator,
});

/**
 * Middleware to reset rate limit
 */
export const resetRateLimit = (keyGenerator: (req: Request) => string) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const key = `rate_limit:${keyGenerator(req)}`;
      delete memoryStore[key];
    } catch (error) {
      console.error('Rate limit reset error:', error);
    }
    next();
  };
};

/**
 * Utility to get current rate limit status
 */
export const getRateLimitStatus = async (
  keyGenerator: (req: Request) => string,
  req: Request,
) => {
  try {
    const key = `rate_limit:${keyGenerator(req)}`;
    return await getRateLimitData(key);
  } catch (error) {
    console.error('Get rate limit status error:', error);
    return null;
  }
};
