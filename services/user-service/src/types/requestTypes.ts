import { Request } from 'express';
import { AuthenticatedUser } from './authTypes';

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
