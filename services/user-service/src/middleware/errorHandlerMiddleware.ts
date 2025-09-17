import { Request, Response, NextFunction } from 'express'; // Add NextFunction import
import { AuthErrorCodes } from '../types';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response => {
  console.error('❌ Error handler called:');
  console.error('Error message:', err.message);
  console.error('Error code:', err.code);
  console.error('Error statusCode:', err.statusCode);
  console.error('Full error:', err);

  if (err.statusCode && err.code) {
    return res
      .status(err.statusCode)
      .json({ error: err.message, code: err.code });
  }

  return res.status(500).json({
    error: 'Internal Server Error',
    code: AuthErrorCodes.INTERNAL_ERROR,
  });
};
