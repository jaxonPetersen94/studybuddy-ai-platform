import { Request, Response } from 'express';
import { ProxyError, ServiceUnavailableError } from '../types';

interface ErrorResponse {
  error: string;
  message: string;
  timestamp: string;
  requestId: string;
  details?: any;
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
): void => {
  console.error(`[ERROR] ${error.name}: ${error.message}`);
  console.error(error.stack);

  const timestamp = new Date().toISOString();
  const requestId = req.requestId;

  let statusCode = 500;
  let errorResponse: ErrorResponse = {
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    timestamp,
    requestId,
  };

  if (error instanceof ProxyError) {
    statusCode = error.status;
    errorResponse = {
      error: 'Proxy Error',
      message: error.message,
      timestamp,
      requestId,
      details: error.data,
    };
  } else if (error instanceof ServiceUnavailableError) {
    statusCode = error.status;
    errorResponse = {
      error: 'Service Unavailable',
      message: error.message,
      timestamp,
      requestId,
    };
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    errorResponse = {
      error: 'Validation Error',
      message: error.message,
      timestamp,
      requestId,
    };
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorResponse = {
      error: 'Authentication Error',
      message: 'Invalid token',
      timestamp,
      requestId,
    };
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    errorResponse = {
      error: 'Authentication Error',
      message: 'Token expired',
      timestamp,
      requestId,
    };
  }

  res.status(statusCode).json(errorResponse);
};
