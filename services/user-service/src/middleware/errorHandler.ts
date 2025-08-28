import { Request, Response } from 'express';
import { AuthErrorCodes } from '../types';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
): Response => {
  console.error(err);

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
